import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const massiveLavaRadius = 100; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Function to flood the area with lava, avoiding water blocks
    async function floodAreaWithLava(radius) {
        const startPosition = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const distance = Math.sqrt(x * x + z * z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                if (distance <= radius) {
                    const block = world.getNearestBlockByPosition(bot, { x: startPosition.x + x, y: startPosition.y - 1, z: startPosition.z + z }); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    // Check if block is not water
                    if (block && block.name !== 'water') {
                        await skills.placeBlock(bot, "lava", startPosition.x + x, startPosition.y - 1, startPosition.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    }
                }
            }
        }
    }
    
    await floodAreaWithLava(massiveLavaRadius);

    log(bot, 'Code finished.');
}
