import { getNearbyEnemies } from '../agent/library/skills.js';

export function checkStarSlashTrigger(agent) {
    const enemiesNearby = getNearbyEnemies(agent.bot, 5).length > 0;
    const healthLow = agent.bot.health < 15; // Condition based on health status
    return enemiesNearby && healthLow;
}
