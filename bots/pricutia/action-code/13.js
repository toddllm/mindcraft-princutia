import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const centerX = 21; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const centerY = 71; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const centerZ = -138; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    const radius = 5; // Blackhole radius
    
    // Clear space for the black hole effect
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
    
    // Create black hole effect
    for (let i = 0; i < 3; i++) {
        // First layer
        await skills.placeBlock(bot, 'black_concrete', centerX + i, centerY, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'black_concrete', centerX - i, centerY, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'black_concrete', centerX, centerY + i, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'black_concrete', centerX, centerY - i, centerZ); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        // Second layer
        await skills.placeBlock(bot, 'black_concrete', centerX + i, centerY, centerZ + 1); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'black_concrete', centerX - i, centerY, centerZ + 1); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'black_concrete', centerX, centerY + i, centerZ + 1); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await skills.placeBlock(bot, 'black_concrete', centerX, centerY - i, centerZ + 1); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    }
    // Ensure all blocks stay in place for the effect
    await skills.placeBlock(bot, 'obsidian', centerX, centerY - 1, centerZ, 'bottom');

    log(bot, 'Code finished.');
}
