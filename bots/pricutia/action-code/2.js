import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    let pos = await world.getPosition(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Create a minion structure using wool
    const height = 5; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const width = 2; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    // Place yellow wool for the minion body
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < width; z++) {
                await skills.placeBlock(bot, 'yellow_wool', pos.x + x, pos.y + y, pos.z + z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
            }
        }
    }
    
    // Add some details like goggles with black wool
    await skills.placeBlock(bot, 'black_wool', pos.x, pos.y + 2, pos.z + 1);     // Left eye
    await skills.placeBlock(bot, 'black_wool', pos.x + 1, pos.y + 2, pos.z + 1); // Right eye
    await skills.placeBlock(bot, 'black_wool', pos.x + 1, pos.y + 1, pos.z + 0); // Mouth

    log(bot, 'Code finished.');
}
