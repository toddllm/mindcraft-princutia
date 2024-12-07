import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    let pos = await world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Create ice golem structures
    const golemHeight = 3; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const golemWidth = 2; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Place ice blocks for the golem body
    for (let y = 0; y < golemHeight; y++) {
        for (let x = 0; x < golemWidth; x++) {
            for (let z = 0; z < golemWidth; z++) {
                await skills.placeBlock(bot, 'packed_ice', pos.x + x, pos.y + y, pos.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
            }
        }
    }
    
    // Add a pumpkin as the head for a classic golem look
    await skills.placeBlock(bot, 'carved_pumpkin', pos.x + 1, pos.y + golemHeight, pos.z + 1);

    log(bot, 'Code finished.');
}
