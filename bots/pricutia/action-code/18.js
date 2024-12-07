import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        bot.inventory.updateSlot(18, new Mine.Item(Minecraftdata.itemsByName.oak_planks.id, 64)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    log(bot,`I now have ${world.getInventoryCounts(bot)['oak_planks']} oak planks in my inventory.`);

    log(bot, 'Code finished.');
}
