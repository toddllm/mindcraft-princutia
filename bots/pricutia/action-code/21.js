import * as skills from '../../../src/agent/library/skills.js';

export async function main(bot) {
    async function buildHouse() {
        // House parameters
        const startX = Math.floor(bot.entity.position.x) + 3;
        const startY = Math.floor(bot.entity.position.y);
        const startZ = Math.floor(bot.entity.position.z) + 3;
        const baseWidth = 5;
        const baseDepth = 7;
        const height = 4;
        
        // Build the floor
        for (let x = startX; x < startX + baseWidth; x++) {
            for (let z = startZ; z < startZ + baseDepth; z++) {
                await skills.placeBlock(bot, 'oak_planks', x, startY, z);
            }
        }
        
        // Build the walls
        for (let y = startY + 1; y < startY + height + 1; y++) {
            // Front and back walls
            for (let x = startX; x < startX + baseWidth; x++) {
                await skills.placeBlock(bot, 'oak_planks', x, y, startZ);
                await skills.placeBlock(bot, 'oak_planks', x, y, startZ + baseDepth - 1);
            }
            
            // Side walls (excluding corners which are already built)
            for (let z = startZ + 1; z < startZ + baseDepth - 1; z++) {
                await skills.placeBlock(bot, 'oak_planks', startX, y, z);
                await skills.placeBlock(bot, 'oak_planks', startX + baseWidth - 1, y, z);
            }
        }
        
        // Add a door
        const doorX = startX + Math.floor(baseWidth / 2);
        const doorZ = startZ;
        await skills.breakBlockAt(bot, doorX, startY + 1, doorZ);
        await skills.breakBlockAt(bot, doorX, startY + 2, doorZ);
        await skills.placeBlock(bot, 'oak_door', doorX, startY + 1, doorZ);
        
        // Add windows
        const windowY = startY + 2;
        // Front windows
        await skills.breakBlockAt(bot, startX + 1, windowY, startZ);
        await skills.placeBlock(bot, 'glass', startX + 1, windowY, startZ);
        await skills.breakBlockAt(bot, startX + baseWidth - 2, windowY, startZ);
        await skills.placeBlock(bot, 'glass', startX + baseWidth - 2, windowY, startZ);
        
        // Side windows
        await skills.breakBlockAt(bot, startX, windowY, startZ + 2);
        await skills.placeBlock(bot, 'glass', startX, windowY, startZ + 2);
        await skills.breakBlockAt(bot, startX, windowY, startZ + baseDepth - 3);
        await skills.placeBlock(bot, 'glass', startX, windowY, startZ + baseDepth - 3);
        await skills.breakBlockAt(bot, startX + baseWidth - 1, windowY, startZ + 2);
        await skills.placeBlock(bot, 'glass', startX + baseWidth - 1, windowY, startZ + 2);
        await skills.breakBlockAt(bot, startX + baseWidth - 1, windowY, startZ + baseDepth - 3);
        await skills.placeBlock(bot, 'glass', startX + baseWidth - 1, windowY, startZ + baseDepth - 3);
        
        // Add a roof
        for (let x = startX; x < startX + baseWidth; x++) {
            for (let z = startZ; z < startZ + baseDepth; z++) {
                await skills.placeBlock(bot, 'oak_slab', x, startY + height + 1, z);
            }
        }
        
        skills.log(bot, 'House with roof built successfully!');
    }
    
    await buildHouse();
}
