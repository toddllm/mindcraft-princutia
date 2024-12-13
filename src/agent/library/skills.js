import * as mc from "../../utils/mcdata.js";
import * as world from "./world.js";
import pf from "mineflayer-pathfinder";
import { Vec3 } from "vec3";

// Utility function to log messages
export function log(bot, message, chat = false) {
    bot.output += message + '\n';
    if (chat) bot.chat(message);
}

async function autoLight(bot) {
    if (world.shouldPlaceTorch(bot)) {
        try {
            const pos = world.getPosition(bot);
            return await placeBlock(bot, 'torch', pos.x, pos.y, pos.z, 'bottom', true);
        } catch (err) { return false; }
    }
    return false;
}

async function equipHighestAttack(bot) {
    let weapons = bot.inventory.items().filter(item => item.name.includes('sword') || (item.name.includes('axe') && !item.name.includes('pickaxe')));
    if (weapons.length === 0)
        weapons = bot.inventory.items().filter(item => item.name.includes('pickaxe') || item.name.includes('shovel'));
    if (weapons.length === 0) return;
    // Sort by attackDamage if available; if not, just pick the first item
    weapons.sort((a, b) => (b.attackDamage || 0) - (a.attackDamage || 0));
    let weapon = weapons[0];
    if (weapon) await bot.equip(weapon, 'hand');
}

// Exported helper functions added to address the error:
export function getNearbyEnemies(bot, range = 5) {
    const entities = world.getNearbyEntities(bot, range);
    return entities.filter(entity => mc.isHostile(entity));
}

export async function mainAttack(bot, enemy) {
    await attackEntity(bot, enemy, false);
}

export async function craftRecipe(bot, itemName, num = 1) {
    let placedTable = false;
    let recipes = bot.recipesFor(mc.getItemId(itemName), null, 1, null);
    let craftingTable = null;
    const craftingTableRange = 32;
    placeTable: if (!recipes || recipes.length === 0) {
        recipes = bot.recipesFor(mc.getItemId(itemName), null, 1, true);
        if (!recipes || recipes.length === 0) break placeTable;

        craftingTable = world.getNearestBlock(bot, 'crafting_table', craftingTableRange);
        if (craftingTable === null) {
            let hasTable = world.getInventoryCounts(bot)['crafting_table'] > 0;
            if (hasTable) {
                let pos = world.getNearestFreeSpace(bot, 1, 6);
                await placeBlock(bot, 'crafting_table', pos.x, pos.y, pos.z);
                craftingTable = world.getNearestBlock(bot, 'crafting_table', craftingTableRange);
                if (craftingTable) {
                    recipes = bot.recipesFor(mc.getItemId(itemName), null, 1, craftingTable);
                    placedTable = true;
                }
            } else {
                log(bot, `Crafting ${itemName} requires a crafting table.`);
                return false;
            }
        } else {
            recipes = bot.recipesFor(mc.getItemId(itemName), null, 1, craftingTable);
        }
    }
    if (!recipes || recipes.length === 0) {
        log(bot, `You do not have the resources to craft a ${itemName}.`);
        if (placedTable) {
            await collectBlock(bot, 'crafting_table', 1);
        }
        return false;
    }

    if (craftingTable && bot.entity.position.distanceTo(craftingTable.position) > 4) {
        await goToNearestBlock(bot, 'crafting_table', 4, craftingTableRange);
    }

    const recipe = recipes[0];
    console.log('crafting...');
    const inventory = world.getInventoryCounts(bot);
    const requiredIngredients = mc.ingredientsFromPrismarineRecipe(recipe);
    const craftLimit = mc.calculateLimitingResource(inventory, requiredIngredients);

    await bot.craft(recipe, Math.min(craftLimit.num, num), craftingTable);
    if (craftLimit.num < num) log(bot, `Not enough ${craftLimit.limitingResource} to craft ${num}, crafted ${craftLimit.num}. You now have ${world.getInventoryCounts(bot)[itemName]} ${itemName}.`);
    else log(bot, `Successfully crafted ${itemName}, you now have ${world.getInventoryCounts(bot)[itemName]} ${itemName}.`);
    if (placedTable) {
        await collectBlock(bot, 'crafting_table', 1);
    }

    bot.armorManager.equipAll();
    return true;
}

export async function smeltItem(bot, itemName, num = 1) {
    const foods = ['beef', 'chicken', 'cod', 'mutton', 'porkchop', 'rabbit', 'salmon', 'tropical_fish'];
    if (!itemName.includes('raw') && !foods.includes(itemName)) {
        log(bot, `Cannot smelt ${itemName}, must be a "raw" item.`);
        return false;
    }

    let placedFurnace = false;
    let furnaceBlock = world.getNearestBlock(bot, 'furnace', 32);
    if (!furnaceBlock) {
        let hasFurnace = world.getInventoryCounts(bot)['furnace'] > 0;
        if (hasFurnace) {
            let pos = world.getNearestFreeSpace(bot, 1, 32);
            await placeBlock(bot, 'furnace', pos.x, pos.y, pos.z);
            furnaceBlock = world.getNearestBlock(bot, 'furnace', 32);
            placedFurnace = true;
        }
    }
    if (!furnaceBlock) {
        log(bot, `There is no furnace nearby and you have no furnace.`);
        return false;
    }
    if (bot.entity.position.distanceTo(furnaceBlock.position) > 4) {
        await goToNearestBlock(bot, 'furnace', 4, 32);
    }
    bot.modes.pause('unstuck');
    await bot.lookAt(furnaceBlock.position);

    console.log('smelting...');
    const furnace = await bot.openFurnace(furnaceBlock);
    let input_item = furnace.inputItem();
    if (input_item && input_item.type !== mc.getItemId(itemName) && input_item.count > 0) {
        log(bot, `The furnace is currently smelting ${mc.getItemName(input_item.type)}.`);
        if (placedFurnace) await collectBlock(bot, 'furnace', 1);
        return false;
    }
    let inv_counts = world.getInventoryCounts(bot);
    if (!inv_counts[itemName] || inv_counts[itemName] < num) {
        log(bot, `You do not have enough ${itemName} to smelt.`);
        if (placedFurnace) await collectBlock(bot, 'furnace', 1);
        return false;
    }

    if (!furnace.fuelItem()) {
        let fuel = bot.inventory.items().find(item => item.name === 'coal' || item.name === 'charcoal');
        let put_fuel = Math.ceil(num / 8);
        if (!fuel || fuel.count < put_fuel) {
            log(bot, `You do not have enough coal or charcoal to smelt ${num} ${itemName}`);
            if (placedFurnace) await collectBlock(bot, 'furnace', 1);
            return false;
        }
        await furnace.putFuel(fuel.type, null, put_fuel);
        log(bot, `Added ${put_fuel} ${mc.getItemName(fuel.type)} to furnace fuel.`);
        console.log(`Added ${put_fuel} ${mc.getItemName(fuel.type)} to furnace fuel.`);
    }

    await furnace.putInput(mc.getItemId(itemName), null, num);
    let total = 0;
    let collected_last = true;
    let smelted_item = null;
    await new Promise(resolve => setTimeout(resolve, 200));
    while (total < num) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('checking...');
        let collected = false;
        if (furnace.outputItem()) {
            smelted_item = await furnace.takeOutput();
            if (smelted_item) {
                total += smelted_item.count;
                collected = true;
            }
        }
        if (!collected && !collected_last) {
            break;
        }
        collected_last = collected;
        if (bot.interrupt_code) {
            break;
        }
    }
    await bot.closeWindow(furnace);

    if (placedFurnace) {
        await collectBlock(bot, 'furnace', 1);
    }
    if (total === 0) {
        log(bot, `Failed to smelt ${itemName}.`);
        return false;
    }
    if (total < num) {
        log(bot, `Only smelted ${total} ${mc.getItemName(smelted_item.type)}.`);
        return false;
    }
    log(bot, `Successfully smelted ${itemName}, got ${total} ${mc.getItemName(smelted_item.type)}.`);
    return true;
}

export async function clearNearestFurnace(bot) {
    let furnaceBlock = world.getNearestBlock(bot, 'furnace', 32);
    if (!furnaceBlock) {
        log(bot, `No furnace nearby to clear.`);
        return false;
    }
    if (bot.entity.position.distanceTo(furnaceBlock.position) > 4) {
        await goToNearestBlock(bot, 'furnace', 4, 32);
    }

    console.log('clearing furnace...');
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log('opened furnace...');
    let smelted_item, intput_item, fuel_item;
    if (furnace.outputItem())
        smelted_item = await furnace.takeOutput();
    if (furnace.inputItem())
        intput_item = await furnace.takeInput();
    if (furnace.fuelItem())
        fuel_item = await furnace.takeFuel();
    console.log(smelted_item, intput_item, fuel_item);
    let smelted_name = smelted_item ? `${smelted_item.count} ${smelted_item.name}` : `0 smelted items`;
    let input_name = intput_item ? `${intput_item.count} ${intput_item.name}` : `0 input items`;
    let fuel_name = fuel_item ? `${fuel_item.count} ${fuel_item.name}` : `0 fuel items`;
    log(bot, `Cleared furnace, recieved ${smelted_name}, ${input_name}, and ${fuel_name}.`);
    await furnace.close();
    return true;
}

export async function attackNearest(bot, mobType, kill = true) {
    bot.modes.pause('cowardice');
    if (mobType === 'drowned' || mobType === 'cod' || mobType === 'salmon' || mobType === 'tropical_fish' || mobType === 'squid')
        bot.modes.pause('self_preservation');
    const mob = world.getNearbyEntities(bot, 24).find(entity => entity.name === mobType);
    if (mob) {
        return await attackEntity(bot, mob, kill);
    }
    log(bot, 'Could not find any ' + mobType + ' to attack.');
    return false;
}

export async function attackEntity(bot, entity, kill = true) {
    let pos = entity.position;
    await equipHighestAttack(bot);

    if (!kill) {
        if (bot.entity.position.distanceTo(pos) > 5) {
            await goToPosition(bot, pos.x, pos.y, pos.z);
        }
        await bot.attack(entity);
        return true;
    } else {
        bot.pvp.attack(entity);
        while (world.getNearbyEntities(bot, 24).includes(entity)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (bot.interrupt_code) {
                bot.pvp.stop();
                return false;
            }
        }
        log(bot, `Successfully killed ${entity.name}.`);
        await pickupNearbyItems(bot);
        return true;
    }
}

export async function defendSelf(bot, range = 9) {
    bot.modes.pause('self_defense');
    bot.modes.pause('cowardice');
    let attacked = false;
    let enemy = world.getNearestEntityWhere(bot, entity => mc.isHostile(entity), range);
    while (enemy) {
        await equipHighestAttack(bot);
        if (bot.entity.position.distanceTo(enemy.position) >= 4 && enemy.name !== 'creeper' && enemy.name !== 'phantom') {
            try {
                bot.pathfinder.setMovements(new pf.Movements(bot));
                await bot.pathfinder.goto(new pf.goals.GoalFollow(enemy, 3.5), true);
            } catch (err) { }
        }
        if (bot.entity.position.distanceTo(enemy.position) <= 2) {
            try {
                bot.pathfinder.setMovements(new pf.Movements(bot));
                let inverted_goal = new pf.goals.GoalInvert(new pf.goals.GoalFollow(enemy, 2));
                await bot.pathfinder.goto(inverted_goal, true);
            } catch (err) { }
        }
        bot.pvp.attack(enemy);
        attacked = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        enemy = world.getNearestEntityWhere(bot, entity => mc.isHostile(entity), range);
        if (bot.interrupt_code) {
            bot.pvp.stop();
            return false;
        }
    }
    bot.pvp.stop();
    if (attacked)
        log(bot, `Successfully defended self.`);
    else
        log(bot, `No enemies nearby to defend self from.`);
    return attacked;
}

export async function collectBlock(bot, blockType, num = 1, exclude = null) {
    if (num < 1) {
        log(bot, `Invalid number of blocks to collect: ${num}.`);
        return false;
    }
    let blocktypes = [blockType];
    if (['coal', 'diamond', 'emerald', 'iron', 'gold', 'lapis_lazuli', 'redstone'].includes(blockType))
        blocktypes.push(blockType + '_ore');
    if (blockType.endsWith('ore'))
        blocktypes.push('deepslate_' + blockType);
    if (blockType === 'dirt')
        blocktypes.push('grass_block');

    let collected = 0;

    for (let i = 0; i < num; i++) {
        let blocks = world.getNearestBlocks(bot, blocktypes, 64);
        if (exclude) {
            for (let position of exclude) {
                blocks = blocks.filter(
                    block => block.position.x !== position.x || block.position.y !== position.y || block.position.z !== position.z
                );
            }
        }
        const movements = new pf.Movements(bot);
        movements.dontMineUnderFallingBlock = false;
        blocks = blocks.filter(block => movements.safeToBreak(block));

        if (blocks.length === 0) {
            if (collected === 0)
                log(bot, `No ${blockType} nearby to collect.`);
            else
                log(bot, `No more ${blockType} nearby to collect.`);
            break;
        }
        const block = blocks[0];
        await bot.tool.equipForBlock(block);
        const itemId = bot.heldItem ? bot.heldItem.type : null;
        if (!block.canHarvest(itemId)) {
            log(bot, `Don't have right tools to harvest ${blockType}.`);
            return false;
        }
        try {
            await bot.collectBlock.collect(block);
            collected++;
            await autoLight(bot);
        }
        catch (err) {
            if (err.name === 'NoChests') {
                log(bot, `Failed to collect ${blockType}: Inventory full, no place to deposit.`);
                break;
            } else {
                log(bot, `Failed to collect ${blockType}: ${err}.`);
                continue;
            }
        }

        if (bot.interrupt_code)
            break;
    }
    log(bot, `Collected ${collected} ${blockType}.`);
    return collected > 0;
}

export async function pickupNearbyItems(bot) {
    const distance = 8;
    const getNearestItem = bot => bot.nearestEntity(entity => entity.name === 'item' && bot.entity.position.distanceTo(entity.position) < distance);
    let nearestItem = getNearestItem(bot);
    let pickedUp = 0;
    while (nearestItem) {
        bot.pathfinder.setMovements(new pf.Movements(bot));
        await bot.pathfinder.goto(new pf.goals.GoalFollow(nearestItem, 0.8), true);
        await new Promise(resolve => setTimeout(resolve, 200));
        let prev = nearestItem;
        nearestItem = getNearestItem(bot);
        if (prev === nearestItem) {
            break;
        }
        pickedUp++;
    }
    log(bot, `Picked up ${pickedUp} items.`);
    return true;
}

export async function breakBlockAt(bot, x, y, z) {
    if (x == null || y == null || z == null) throw new Error('Invalid position to break block at.');
    let block = new bot.blockAt(new Vec3(x, y, z));
    if (block.name !== 'air' && block.name !== 'water' && block.name !== 'lava') {
        if (bot.modes.isOn('cheat')) {
            let msg = '/setblock ' + Math.floor(x) + ' ' + Math.floor(y) + ' ' + Math.floor(z) + ' air';
            bot.chat(msg);
            log(bot, `Used /setblock to break block at ${x}, ${y}, ${z}.`);
            return true;
        }

        if (bot.entity.position.distanceTo(block.position) > 4.5) {
            let pos = block.position;
            let movements = new pf.Movements(bot);
            movements.canPlaceOn = false;
            movements.allow1by1towers = false;
            bot.pathfinder.setMovements(movements);
            await bot.pathfinder.goto(new pf.goals.GoalNear(pos.x, pos.y, pos.z, 4));
        }
        if (bot.game.gameMode !== 'creative') {
            await bot.tool.equipForBlock(block);
            const itemId = bot.heldItem ? bot.heldItem.type : null;
            if (!block.canHarvest(itemId)) {
                log(bot, `Don't have right tools to break ${block.name}.`);
                return false;
            }
        }
        await bot.dig(block, true);
        log(bot, `Broke ${block.name} at x:${x.toFixed(1)}, y:${y.toFixed(1)}, z:${z.toFixed(1)}.`);
    } else {
        log(bot, `Skipping block at x:${x.toFixed(1)}, y:${y.toFixed(1)}, z:${z.toFixed(1)} because it is ${block.name}.`);
        return false;
    }
    return true;
}

export async function placeBlock(bot, blockType, x, y, z, placeOn = 'bottom', dontCheat = false) {
    if (!mc.getBlockId(blockType)) {
        log(bot, `Invalid block type: ${blockType}.`);
        return false;
    }

    const target_dest = new Vec3(Math.floor(x), Math.floor(y), Math.floor(z));
    if (bot.modes.isOn('cheat') && !dontCheat) {
        let face = placeOn === 'north' ? 'south' : placeOn === 'south' ? 'north' : placeOn === 'east' ? 'west' : 'east';
        if (blockType.includes('torch') && placeOn !== 'bottom') {
            blockType = blockType.replace('torch', 'wall_torch');
            if (placeOn !== 'side' && placeOn !== 'top') {
                blockType += `[facing=${face}]`;
            }
        }
        if (blockType.includes('button') || blockType === 'lever') {
            if (placeOn === 'top') {
                blockType += `[face=ceiling]`;
            }
            else if (placeOn === 'bottom') {
                blockType += `[face=floor]`;
            }
            else {
                blockType += `[facing=${face}]`;
            }
        }
        if (blockType === 'ladder' || blockType === 'repeater' || blockType === 'comparator') {
            blockType += `[facing=${face}]`;
        }

        let msg = '/setblock ' + Math.floor(x) + ' ' + Math.floor(y) + ' ' + Math.floor(z) + ' ' + blockType;
        bot.chat(msg);
        if (blockType.includes('door'))
            bot.chat('/setblock ' + Math.floor(x) + ' ' + Math.floor(y + 1) + ' ' + Math.floor(z) + ' ' + blockType + '[half=upper]');
        if (blockType.includes('bed'))
            bot.chat('/setblock ' + Math.floor(x) + ' ' + Math.floor(y) + ' ' + Math.floor(z - 1) + ' ' + blockType + '[part=head]');
        log(bot, `Used /setblock to place ${blockType} at ${target_dest}.`);
        return true;
    }


    let item_name = blockType;
    if (item_name == "redstone_wire")
        item_name = "redstone";
    let block = bot.inventory.items().find(item => item.name === item_name);
    if (!block && bot.game.gameMode === 'creative') {
        await bot.creative.setInventorySlot(36, mc.makeItem(item_name, 1));
        block = bot.inventory.items().find(item => item.name === item_name);
    }
    if (!block) {
        log(bot, `Don't have any ${blockType} to place.`);
        return false;
    }

    const targetBlock = bot.blockAt(target_dest);
    const empty_blocks = ['air', 'water', 'lava', 'grass', 'short_grass', 'tall_grass', 'snow', 'dead_bush', 'fern'];
    if (!empty_blocks.includes(targetBlock.name)) {
        log(bot, `${blockType} in the way at ${targetBlock.position}.`);
        const removed = await breakBlockAt(bot, x, y, z);
        if (!removed) {
            log(bot, `Cannot place ${blockType} at ${targetBlock.position}: block in the way.`);
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    const dir_map = {
        'top': new Vec3(0, 1, 0),
        'bottom': new Vec3(0, -1, 0),
        'north': new Vec3(0, 0, -1),
        'south': new Vec3(0, 0, 1),
        'east': new Vec3(1, 0, 0),
        'west': new Vec3(-1, 0, 0),
    }
    let dirs = [];
    if (placeOn === 'side') {
        dirs.push(dir_map['north'], dir_map['south'], dir_map['east'], dir_map['west']);
    } else if (dir_map[placeOn] !== undefined) {
        dirs.push(dir_map[placeOn]);
    } else {
        dirs.push(dir_map['bottom']);
        log(bot, `Unknown placeOn value "${placeOn}". Defaulting to bottom.`);
    }
    dirs.push(...Object.values(dir_map).filter(d => !dirs.includes(d)));

    let buildOffBlock = null;
    let faceVec = null;
    for (let d of dirs) {
        const adj = bot.blockAt(target_dest.plus(d));
        if (!empty_blocks.includes(adj.name)) {
            buildOffBlock = adj;
            faceVec = new Vec3(-d.x, -d.y, -d.z);
            break;
        }
    }
    if (!buildOffBlock) {
        log(bot, `Cannot place ${blockType} at ${targetBlock.position}: nothing to place on.`);
        return false;
    }

    const pos = bot.entity.position;
    const pos_above = pos.plus( new Vec3(0, 1, 0));
    const dont_move_for = ['torch', 'redstone_torch', 'redstone_wire', 'lever', 'button', 'rail', 'detector_rail', 'powered_rail', 'activator_rail', 'tripwire_hook', 'tripwire', 'water_bucket'];
    if (!dont_move_for.includes(blockType) && (pos.distanceTo(targetBlock.position) < 1 || pos_above.distanceTo(targetBlock.position) < 1)) {
        let goal = new pf.goals.GoalNear(targetBlock.position.x, targetBlock.position.y, targetBlock.position.z, 2);
        let inverted_goal = new pf.goals.GoalInvert(goal);
        bot.pathfinder.setMovements(new pf.Movements(bot));
        await bot.pathfinder.goto(inverted_goal);
    }
    if (bot.entity.position.distanceTo(targetBlock.position) > 4.5) {
        let pos = targetBlock.position;
        bot.pathfinder.setMovements(new pf.Movements(bot));
        await bot.pathfinder.goto(new pf.goals.GoalNear(pos.x, pos.y, pos.z, 4));
    }

    await bot.equip(block, 'hand');
    await bot.lookAt(buildOffBlock.position);

    try {
        await bot.placeBlock(buildOffBlock, faceVec);
        log(bot, `Placed ${blockType} at ${target_dest}.`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return true;
    } catch (err) {
        log(bot, `Failed to place ${blockType} at ${target_dest}.`);
        return false;
    }
}

export async function equip(bot, itemName) {
    let item = bot.inventory.slots.find(slot => slot && slot.name === itemName);
    if (!item) {
        log(bot, `You do not have any ${itemName} to equip.`);
        return false;
    }
    if (itemName.includes('leggings')) {
        await bot.equip(item, 'legs');
    }
    else if (itemName.includes('boots')) {
        await bot.equip(item, 'feet');
    }
    else if (itemName.includes('helmet')) {
        await bot.equip(item, 'head');
    }
    else if (itemName.includes('chestplate') || itemName.includes('elytra')) {
        await bot.equip(item, 'torso');
    }
    else {
        await bot.equip(item, 'hand');
    }
    log(bot, `Equipped ${itemName}.`);
    return true;
}

export async function discard(bot, itemName, num = -1) {
    let discarded = 0;
    while (true) {
        let item = bot.inventory.items().find(item => item.name === itemName);
        if (!item) {
            break;
        }
        let to_discard = num === -1 ? item.count : Math.min(num - discarded, item.count);
        await bot.toss(item.type, null, to_discard);
        discarded += to_discard;
        if (num !== -1 && discarded >= num) {
            break;
        }
    }
    if (discarded === 0) {
        log(bot, `You do not have any ${itemName} to discard.`);
        return false;
    }
    log(bot, `Successfully discarded ${discarded} ${itemName}.`);
    return true;
}

export async function putInChest(bot, itemName, num = -1) {
    let chest = world.getNearestBlock(bot, 'chest', 32);
    if (!chest) {
        log(bot, `Could not find a chest nearby.`);
        return false;
    }
    let item = bot.inventory.items().find(item => item.name === itemName);
    if (!item) {
        log(bot, `You do not have any ${itemName} to put in the chest.`);
        return false;
    }
    let to_put = num === -1 ? item.count : Math.min(num, item.count);
    await goToPosition(bot, chest.position.x, chest.position.y, chest.position.z, 2);
    const chestContainer = await bot.openContainer(chest);
    await chestContainer.deposit(item.type, null, to_put);
    await chestContainer.close();
    log(bot, `Successfully put ${to_put} ${itemName} in the chest.`);
    return true;
}

export async function takeFromChest(bot, itemName, num = -1) {
    let chest = world.getNearestBlock(bot, 'chest', 32);
    if (!chest) {
        log(bot, `Could not find a chest nearby.`);
        return false;
    }
    await goToPosition(bot, chest.position.x, chest.position.y, chest.position.z, 2);
    const chestContainer = await bot.openContainer(chest);
    let item = chestContainer.containerItems().find(item => item.name === itemName);
    if (!item) {
        log(bot, `Could not find any ${itemName} in the chest.`);
        await chestContainer.close();
        return false;
    }
    let to_take = num === -1 ? item.count : Math.min(num, item.count);
    await chestContainer.withdraw(item.type, null, to_take);
    await chestContainer.close();
    log(bot, `Successfully took ${to_take} ${itemName} from the chest.`);
    return true;
}

export async function viewChest(bot) {
    let chest = world.getNearestBlock(bot, 'chest', 32);
    if (!chest) {
        log(bot, `Could not find a chest nearby.`);
        return false;
    }
    await goToPosition(bot, chest.position.x, chest.position.y, chest.position.z, 2);
    const chestContainer = await bot.openContainer(chest);
    let items = chestContainer.containerItems();
    if (items.length === 0) {
        log(bot, `The chest is empty.`);
    } else {
        log(bot, `The chest contains:`);
        for (let item of items) {
            log(bot, `${item.count} ${item.name}`);
        }
    }
    await chestContainer.close();
    return true;
}

export async function eat(bot, foodName = "") {
    let item, name;
    if (foodName) {
        item = bot.inventory.items().find(item => item.name === foodName);
        name = foodName;
    } else {
        item = bot.inventory.items().find(item => item.foodRecovery > 0);
        name = "food";
    }
    if (!item) {
        log(bot, `You do not have any ${name} to eat.`);
        return false;
    }
    await bot.equip(item, 'hand');
    await bot.consume();
    log(bot, `Successfully ate ${item.name}.`);
    return true;
}

export async function giveToPlayer(bot, itemType, username, num = 1) {
    let player = bot.players[username] ? bot.players[username].entity : null;
    if (!player) {
        log(bot, `Could not find ${username}.`);
        return false;
    }
    await goToPlayer(bot, username);
    await bot.lookAt(player.position);
    await discard(bot, itemType, num);
    return true;
}

export async function goToPosition(bot, x, y, z, min_distance = 2) {
    if (x == null || y == null || z == null) {
        log(bot, `Missing coordinates, given x:${x} y:${y} z:${z}`);
        return false;
    }
    if (bot.modes.isOn('cheat')) {
        bot.chat('/tp @s ' + x + ' ' + y + ' ' + z);
        log(bot, `Teleported to ${x}, ${y}, ${z}.`);
        return true;
    }
    bot.pathfinder.setMovements(new pf.Movements(bot));
    await bot.pathfinder.goto(new pf.goals.GoalNear(x, y, z, min_distance));
    log(bot, `You have reached ${x}, ${y}, ${z}.`);
    return true;
}

export async function goToNearestBlock(bot, blockType, min_distance = 2, range = 64) {
    const MAX_RANGE = 512;
    if (range > MAX_RANGE) {
        log(bot, `Maximum search range capped at ${MAX_RANGE}.`);
        range = MAX_RANGE;
    }
    let block = world.getNearestBlock(bot, blockType, range);
    if (!block) {
        log(bot, `Could not find any ${blockType} in ${range} blocks.`);
        return false;
    }
    log(bot, `Found ${blockType} at ${block.position}.`);
    await goToPosition(bot, block.position.x, block.position.y, block.position.z, min_distance);
    return true;
}

export async function goToPlayer(bot, username, distance = 3) {
    if (bot.modes.isOn('cheat')) {
        bot.chat('/tp @s ' + username);
        log(bot, `Teleported to ${username}.`);
        return true;
    }

    bot.modes.pause('self_defense');
    bot.modes.pause('cowardice');
    let player = bot.players[username] ? bot.players[username].entity : null;
    if (!player) {
        log(bot, `Could not find ${username}.`);
        return false;
    }

    const move = new pf.Movements(bot);
    bot.pathfinder.setMovements(move);
    await bot.pathfinder.goto(new pf.goals.GoalFollow(player, distance), true);

    log(bot, `You have reached ${username}.`);
    return true;
}

export async function followPlayer(bot, username, distance = 4) {
    let player = bot.players[username] ? bot.players[username].entity : null;
    if (!player) return false;

    const move = new pf.Movements(bot);
    bot.pathfinder.setMovements(move);
    bot.pathfinder.setGoal(new pf.goals.GoalFollow(player, distance), true);
    log(bot, `You are now actively following player ${username}.`);

    while (!bot.interrupt_code) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (bot.modes.isOn('cheat') && bot.entity.position.distanceTo(player.position) > 100 && player.isOnGround) {
            await goToPlayer(bot, username);
        }
        if (bot.modes.isOn('unstuck')) {
            const is_nearby = bot.entity.position.distanceTo(player.position) <= distance + 1;
            if (is_nearby)
                bot.modes.pause('unstuck');
            else
                bot.modes.unpause('unstuck');
        }
    }
    return true;
}

export async function moveAway(bot, distance) {
    const pos = bot.entity.position;
    let goal = new pf.goals.GoalNear(pos.x, pos.y, pos.z, distance);
    let inverted_goal = new pf.goals.GoalInvert(goal);
    bot.pathfinder.setMovements(new pf.Movements(bot));

    if (bot.modes.isOn('cheat')) {
        const move = new pf.Movements(bot);
        const path = await bot.pathfinder.getPathTo(move, inverted_goal, 10000);
        let last_move = path.path[path.path.length - 1];
        if (last_move) {
            let x = Math.floor(last_move.x);
            let y = Math.floor(last_move.y);
            let z = Math.floor(last_move.z);
            bot.chat('/tp @s ' + x + ' ' + y + ' ' + z);
            return true;
        }
    }

    await bot.pathfinder.goto(inverted_goal);
    let new_pos = bot.entity.position;
    log(bot, `Moved away to ${new_pos}.`);
    return true;
}

export async function avoidEnemies(bot, distance = 16) {
    bot.modes.pause('self_preservation');
    let enemy = world.getNearestEntityWhere(bot, entity => mc.isHostile(entity), distance);
    while (enemy) {
        const follow = new pf.goals.GoalFollow(enemy, distance + 1);
        const inverted_goal = new pf.goals.GoalInvert(follow);
        bot.pathfinder.setMovements(new pf.Movements(bot));
        bot.pathfinder.setGoal(inverted_goal, true);
        await new Promise(resolve => setTimeout(resolve, 500));
        enemy = world.getNearestEntityWhere(bot, entity => mc.isHostile(entity), distance);
        if (bot.interrupt_code) {
            break;
        }
        if (enemy && bot.entity.position.distanceTo(enemy.position) < 3) {
            await attackEntity(bot, enemy, false);
        }
    }
    bot.pathfinder.stop();
    log(bot, `Moved ${distance} away from enemies.`);
    return true;
}

export async function stay(bot) {
    bot.modes.pause('self_preservation');
    bot.modes.pause('unstuck');
    bot.modes.pause('cowardice');
    bot.modes.pause('self_defense');
    bot.modes.pause('hunting');
    bot.modes.pause('torch_placing');
    bot.modes.pause('item_collecting');
    while (!bot.interrupt_code) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    return true;
}

export async function useDoor(bot, door_pos = null) {
    if (!door_pos) {
        for (let door_type of [
            'oak_door', 'spruce_door', 'birch_door', 'jungle_door',
            'acacia_door', 'dark_oak_door', 'mangrove_door', 'cherry_door',
            'bamboo_door', 'crimson_door', 'warped_door'
        ]) {
            let d = world.getNearestBlock(bot, door_type, 16);
            if (d) {
                door_pos = d.position;
                break;
            }
        }
    } else {
        door_pos = new Vec3(door_pos.x, door_pos.y, door_pos.z);
    }
    if (!door_pos) {
        log(bot, `Could not find a door to use.`);
        return false;
    }

    bot.pathfinder.setGoal(new pf.goals.GoalNear(door_pos.x, door_pos.y, door_pos.z, 1));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    while (bot.pathfinder.isMoving()) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    let door_block = bot.blockAt(door_pos);
    await bot.lookAt(door_pos);
    if (!door_block._properties.open)
        await bot.activateBlock(door_block);

    bot.setControlState("forward", true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    bot.setControlState("forward", false);
    await bot.activateBlock(door_block);

    log(bot, `Used door at ${door_pos}.`);
    return true;
}

export async function goToBed(bot) {
    const beds = bot.findBlocks({
        matching: (block) => {
            return block.name.includes('bed');
        },
        maxDistance: 32,
        count: 1
    });
    if (beds.length === 0) {
        log(bot, `Could not find a bed to sleep in.`);
        return false;
    }
    let loc = beds[0];
    await goToPosition(bot, loc.x, loc.y, loc.z);
    const bed = bot.blockAt(loc);
    await bot.sleep(bed);
    log(bot, `You are in bed.`);
    bot.modes.pause('unstuck');
    while (bot.isSleeping) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    log(bot, `You have woken up.`);
    return true;
}

export async function tillAndSow(bot, x, y, z, seedType = null) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    let block = bot.blockAt(new Vec3(x, y, z));
    if (block.name !== 'grass_block' && block.name !== 'dirt' && block.name !== 'farmland') {
        log(bot, `Cannot till ${block.name}, must be grass_block or dirt.`);
        return false;
    }
    let above = bot.blockAt(new Vec3(x, y + 1, z));
    if (above.name !== 'air') {
        log(bot, `Cannot till, there is ${above.name} above the block.`);
        return false;
    }
    if (bot.entity.position.distanceTo(block.position) > 4.5) {
        let pos = block.position;
        bot.pathfinder.setMovements(new pf.Movements(bot));
        await bot.pathfinder.goto(new pf.goals.GoalNear(pos.x, pos.y, pos.z, 4));
    }
    if (block.name !== 'farmland') {
        let hoe = bot.inventory.items().find(item => item.name.includes('hoe'));
        if (!hoe) {
            log(bot, `Cannot till, no hoes.`);
            return false;
        }
        await bot.equip(hoe, 'hand');
        await bot.activateBlock(block);
        log(bot, `Tilled block x:${x.toFixed(1)}, y:${y.toFixed(1)}, z:${z.toFixed(1)}.`);
    }

    if (seedType) {
        if (seedType.endsWith('seed') && !seedType.endsWith('seeds'))
            seedType += 's';
        let seeds = bot.inventory.items().find(item => item.name === seedType);
        if (!seeds) {
            log(bot, `No ${seedType} to plant.`);
            return false;
        }
        await bot.equip(seeds, 'hand');
        await bot.placeBlock(block, new Vec3(0, -1, 0));
        log(bot, `Planted ${seedType} at x:${x.toFixed(1)}, y:${y.toFixed(1)}, z:${z.toFixed(1)}.`);
    }
    return true;
}

export async function activateNearestBlock(bot, type) {
    let block = world.getNearestBlock(bot, type, 16);
    if (!block) {
        log(bot, `Could not find any ${type} to activate.`);
        return false;
    }
    if (bot.entity.position.distanceTo(block.position) > 4.5) {
        let pos = block.position;
        bot.pathfinder.setMovements(new pf.Movements(bot));
        await bot.pathfinder.goto(new pf.goals.GoalNear(pos.x, pos.y, pos.z, 4));
    }
    await bot.activateBlock(block);
    log(bot, `Activated ${type} at x:${block.position.x.toFixed(1)}, y:${block.position.y.toFixed(1)}, z:${block.position.z.toFixed(1)}.`);
    return true;
}
