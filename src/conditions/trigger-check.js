import { getNearbyEnemies } from '../agent/library/skills.js';

export function checkStarSlashTrigger(agent) {
    // Handle both agent and bot parameters for testing
    const bot = agent.bot || agent;
    
    const enemiesNearby = getNearbyEnemies(bot, 5).length > 0;
    const healthLow = bot.health < 15; // Condition based on health status
    return enemiesNearby && healthLow;
}
