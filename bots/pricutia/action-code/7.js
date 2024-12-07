import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const biggerRadius = 75; // Larger ocean dimensions
    const largerLength = 200; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const largerWidth = 150; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    async function createLargerLavaOcean(radius, length, width) {
        let startPosition = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
        async function replaceWaterInSection(startX, startZ) {
            for (let x = 0; x <= length; x++) {
                for (let z = 0; z <= width; z++) {
                    let offsetX = Math.floor(startX + x - (length / 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    let offsetZ = Math.floor(startZ + z - (width / 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                    let distance = Math.sqrt(Math.pow((x - length / 2), 2) + Math.pow((z - width / 2), 2)); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                    if (distance < radius) {
                        // Clear water and place lava
                        await skills.breakBlockAt(bot, offsetX, startPosition.y - 1, offsetZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        await skills.placeBlock(bot, "lava", offsetX, startPosition.y - 1, offsetZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    }
                }
            }
        }
    
        // Create multiple lava oceans
        let separations = [0, 150, -150, 300, -300]; // Separate the lakes
        for (const sep of separations) {
            await replaceWaterInSection(startPosition.x + sep, startPosition.z + sep); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        }
    }
    
    await createLargerLavaOcean(biggerRadius, largerLength, largerWidth);

    log(bot, 'Code finished.');
}
