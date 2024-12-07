import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const centerX = 21; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const centerY = 71; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const centerZ = -138; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const pullRadius = 10; // Effective pulling radius for the blackhole
    
    async function pullEntitiesTowardsBlackhole() {
        while (true) {
            const entities = world.getNearbyEntityTypes(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
            
            for (let entity of entities) {
                let entityPosition = entity.position; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                let dx = centerX - entityPosition.x; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                let dy = centerY - entityPosition.y; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                let dz = centerZ - entityPosition.z; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
                if (distance <= pullRadius) {
                    // Calculate more movement steps towards the center to create a pulling effect
                    let steps = 5; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    let stepX = dx / steps; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    let stepY = dy / steps; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    let stepZ = dz / steps; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                    
                    // Move the entity gradually
                    for (let step = 0; step < steps; step++) {
                        entityPosition.x += stepX; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        entityPosition.y += stepY; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        entityPosition.z += stepZ; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        await world.updateEntityPosition(entity, entityPosition.x, entityPosition.y, entityPosition.z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to simulate pulling
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // Check entities every second
        }
    }
    
    pullEntitiesTowardsBlackhole();

    log(bot, 'Code finished.');
}
