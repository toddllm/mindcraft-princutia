import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    // Get the current position of the bot
    let pos = await world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Create a 5x5 lava pit near the bot's position
    for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
            await skills.placeBlock(bot, "lava", pos.x + x, pos.y - 1, pos.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        }
    }

    log(bot, 'Code finished.');
}
