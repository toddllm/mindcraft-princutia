import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const centerX = 21; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const centerY = 71; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const centerZ = -138; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const radius = 5; // Blackhole radius
    
    // Clear initial area for new blackhole effect
    for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let z = centerZ - radius; z <= centerZ + radius; z++) {
                const dx = x - centerX; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                const dy = y - centerY; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                const dz = z - centerZ; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                if (distance <= radius) {
                    await skills.breakBlockAt(bot, x, y, z); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
                }
            }
        }
    }
    
    // Create enhanced black hole effect using obsidian and end_portal_frames for depth
    for (let i = 1; i <= radius; i++) {
        await skills.placeBlock(bot, 'obsidian', centerX + i, centerY, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'obsidian', centerX - i, centerY, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'obsidian', centerX, centerY + i, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'obsidian', centerX, centerY - i, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
       
        await skills.placeBlock(bot, 'end_portal_frame', centerX, centerY, centerZ + i); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'end_portal_frame', centerX, centerY, centerZ - i); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    }
    
    // Add a particle effect to simulate swirling
    // Please note: Minecraft might not natively have a function to render particles with the given skills. 
    // This step might require commands or is conceptual if within vanilla API limitations
    
    log(bot,'The enhanced blackhole effect has been created.');

    log(bot, 'Code finished.');
}
