import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const bigRadius = 100; // Even larger ocean dimensions
    const newLength = 240; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const newWidth = 180; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    async function initiateLavaOcean(radius, length, width) {
        let startPosition = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
        async function replaceWithLava(startX, startZ) {
            for (let x = 0; x <= length; x++) {
                for (let z = 0; z <= width; z++) {
                    let offsetX = Math.floor(startX + x - (length / 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    let offsetZ = Math.floor(startZ + z - (width / 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                    let distance = Math.sqrt(Math.pow((x - length / 2), 2) + Math.pow((z - width / 2), 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                    // Check if distance is within the radius for placement
                    if (distance < radius) {
                        // Remove any existing block and place lava
                        await skills.placeBlock(bot, "lava", offsetX, startPosition.y - 1, offsetZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    }
                }
            }
        }
    
        // Generate multiple lava oceans
        let spacing = [0, 200, -200, 400, -400]; // Spacing between the oceans
        for (const space of spacing) {
            await replaceWithLava(startPosition.x + space, startPosition.z + space); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        }
    }
    
    await initiateLavaOcean(bigRadius, newLength, newWidth);

    log(bot, 'Code finished.');
}
