import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        // Gather wood
    const treesToChop = world.getNearestBlocks(bot, ['oak_log', 'birch_log', 'spruce_log'], 64, 20); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    for (const tree of treesToChop) {
      await skills.goToPosition(bot, tree.position.x, tree.position.y, tree.position.z, 1); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
      await skills.breakBlockAt(bot, tree.position.x, tree.position.y, tree.position.z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    }
    
    // Craft wooden planks
    const logCount = world.getInventoryCounts(bot)['oak_log'] || 0; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    await skills.craftRecipe(bot, 'oak_planks', Math.floor(logCount / 4)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Find a flat area to build
    const buildSpot = world.getNearestFreeSpace(bot, 7, 32); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Build the house frame
    const width = 7; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const depth = 5; 
    const height = 4; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    for (let x = buildSpot.x; x < buildSpot.x + width; x++) {
      for (let y = buildSpot.y; y < buildSpot.y + height; y++) {
        for (let z = buildSpot.z; z < buildSpot.z + depth; z++) {
          if (x === buildSpot.x || x === buildSpot.x + width - 1 || 
              y === buildSpot.y || y === buildSpot.y + height - 1 ||
              z === buildSpot.z || z === buildSpot.z + depth - 1) {
            await skills.placeBlock(bot, 'oak_planks', x, y, z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
          }
        }
      }
    }
    
    // Add a door
    const doorX = buildSpot.x + Math.floor(width / 2); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const doorZ = buildSpot.z; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    await skills.placeBlock(bot, 'oak_door', doorX, buildSpot.y + 1, doorZ, 'side'); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    await skills.placeBlock(bot, 'oak_door', doorX, buildSpot.y + 2, doorZ, 'side'); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Add windows
    const windowY = buildSpot.y + 2; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    await skills.placeBlock(bot, 'glass_pane', buildSpot.x + 1, windowY, buildSpot.z + 2, 'side');  
    await skills.placeBlock(bot, 'glass_pane', buildSpot.x + width - 2, windowY, buildSpot.z + 2, 'side');

    log(bot, 'Code finished.');
}
