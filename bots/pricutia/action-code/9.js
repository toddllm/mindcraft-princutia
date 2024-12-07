import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const massiveRadius = 50; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    async function createMassiveLavaPit(radius) {
        let startPosition = world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                let distance = Math.sqrt(x * x + z * z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                if (distance <= radius) {
                    await skills.placeBlock(bot, "lava", startPosition.x + x, startPosition.y - 1, startPosition.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                }
            }
        }
    }
    
    await createMassiveLavaPit(massiveRadius);

    log(bot, 'Code finished.');
}
