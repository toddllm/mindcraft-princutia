import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const radius = 50; // Ocean dimensions
    const length = 100; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const width = 75; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    async function replaceWaterWithLava(radius, length, width) {
        let position = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        let offsetX, offsetZ; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
        for (let x = -length / 2; x <= length / 2; x++) {
            for (let z = -width / 2; z <= width / 2; z++) {
                offsetX = Math.floor(position.x + x); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                offsetZ = Math.floor(position.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                let distance = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                if (distance < radius) {
                    // Attempt to break the block first, if necessary
                    await skills.breakBlockAt(bot, offsetX, position.y - 1, offsetZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    // Replace with lava
                    await skills.placeBlock(bot, "lava", offsetX, position.y - 1, offsetZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                }
            }
        }
    }
    
    await replaceWaterWithLava(radius, length, width);

    log(bot, 'Code finished.');
}
