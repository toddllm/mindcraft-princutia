import { getNearbyEnemies, mainAttack } from '../agent/library/skills.js';
import { getNearbyFriends } from '../agent/library/world.js';
import { performSupportMove } from '../utils/friend-communication.js';

export async function starSlash(mainAgent) {
    const enemies = getNearbyEnemies(mainAgent, 5); // Detects nearby enemies
    if (enemies.length === 0) return;

    console.log(`${mainAgent.username} is initiating Star Slash!`);

    for (const enemy of enemies) {
        await mainAttack(mainAgent, enemy); // Executes main attack

        // Find and command friends to perform support moves
        const friends = getNearbyFriends(mainAgent, 10);
        for (const friendEntity of friends) {
            await performSupportMove(mainAgent, friendEntity, enemy);
        }
    }
}
