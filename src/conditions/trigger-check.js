import { getNearbyEnemies } from '../agent/library/skills.js';

export function checkStarSlashTrigger(agent) {
    const enemiesNearby = getNearbyEnemies(agent, 5).length > 0;
    const healthLow = agent.health < 15; // Condition based on health status
    return enemiesNearby && healthLow;
}
