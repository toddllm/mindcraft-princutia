import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const massiveLavaRadius = 100; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Function to flood the area with lava while avoiding water
    async function floodWithLava(radius) {
        let startPosition = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                let distance = Math.sqrt(x * x + z * z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                if (distance <= radius) {
                    // Check nearby blocks to ensure not placing lava directly on water
                    let nearbyBlocks = await world.getNearbyBlockTypes(bot, 5); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    if (!nearbyBlocks.includes('water')) {
                        await skills.placeBlock(bot, "lava", startPosition.x + x, startPosition.y - 1, startPosition.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    }
                }
            }
        }
    }
    
    await floodWithLava(massiveLavaRadius);

    log(bot, 'Code finished.');
}
