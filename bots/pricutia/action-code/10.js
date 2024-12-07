import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const massiveOverflow = 100; // Increase the radius to cover more area with lava
    
    async function floodWithLava(radius) {
        let startPosition = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                let distance = Math.sqrt(x * x + z * z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                if (distance <= radius) {
                    let aboveWater = true; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    for (let y = 61; y >= startPosition.y - 5; y--) {
                        let blockType = world.getBlockNameAt(bot, startPosition.x + x, y, startPosition.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        if (blockType === 'water') {
                            aboveWater = false; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                            break; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        }
                    }
                    if (aboveWater) {
                        await skills.placeBlock(bot, "lava", startPosition.x + x, startPosition.y - 1, startPosition.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    }
                }
            }
        }
    }
    
    await floodWithLava(massiveOverflow);

    log(bot, 'Code finished.');
}
