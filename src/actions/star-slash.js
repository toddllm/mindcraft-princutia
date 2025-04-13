import { getNearbyEnemies, mainAttack } from "../agent/library/skills.js";
import { getNearbyFriends } from "../agent/library/world.js";
import { performSupportMove } from "../utils/friend-communication.js";


// Helper function to simulate different ally powers
async function performAllyAttack(bot, allyName, powerName, enemy) {
    // In a real implementation, each power might have different effects.
    // For now, just log that the ally is using a power.
    console.log(`${allyName} uses ${powerName} on ${enemy.name}!`);
    // You could add code here to apply effects, damage, or animations.
}

export async function starSlash(agent) {
    // Handle both agent and bot parameters for testing
    const bot = agent.bot || agent;
    const username = bot.username || 'testBot';
    
    const enemies = getNearbyEnemies(bot, 5);
    if (enemies.length === 0) return;

    console.log(`${username} initiates the Star Slash! The blade gleams with fierce energy.`);

    // Launch enemies into the air with a powerful upward slash
    // This is conceptual, as we don't have a direct API to fling entities.
    // If such a feature existed, we might modify the enemy's position or call a knockback function.
    // We'll just log that it happens.
    for (const enemy of enemies) {
        // Perform the main attack
        await mainAttack(bot, enemy);

        console.log(`A brilliant arc of energy strikes ${enemy.name}, launching it into the air!`);
        // Conceptually "enemy.position.y += 5;" or call some custom effect
        // Since we don't have a real API for it, we just log it.

        // After the main slash, summon 7 allies on the fly to assist with different unique powers
        const allies = [
            { name: 'FlameDancer', power: 'Fire Wave' },
            { name: 'FrostSinger', power: 'Ice Blast' },
            { name: 'ThunderHerald', power: 'Shock Pulse' },
            { name: 'GaleRider', power: 'Wind Gust' },
            { name: 'TerraWarden', power: 'Earth Quake' },
            { name: 'AquaCaller', power: 'Water Surge' },
            { name: 'LuminaSeer', power: 'Light Beam' }
        ];

        for (const ally of allies) {
            await performAllyAttack(bot, ally.name, ally.power, enemy);
        }

        // Existing nearby friends also join in after the initial Star Slash
        const friends = getNearbyFriends(bot, 10);
        for (const friendEntity of friends) {
            await performSupportMove(bot, friendEntity, enemy);
        }
    }

    console.log(`The Star Slash concludes, leaving enemies scattered and disoriented!`);
}
