import { starSlash } from '../../src/actions/star-slash.js';
import { checkStarSlashTrigger } from '../../src/conditions/trigger-check.js';

export async function main(bot) {
    // Periodic check for Star Slash trigger
    setInterval(async () => {
        if (checkStarSlashTrigger(bot)) {
            await starSlash(bot); // Initiates Star Slash autonomously
        }
    }, 5000); // Checks every 5 seconds

    // Listen for whispers to assist in attacks
    bot.on('whisper', async (username, message) => {
        if (username === bot.username) return; // Ignore own messages

        const args = message.split(' ');
        if (args[0] === 'AssistAttack') {
            const targetId = parseInt(args[1]);
            const targetEntity = bot.entities[targetId];
            if (targetEntity) {
                await bot.attack(targetEntity);
                console.log(`${bot.username} is assisting in attack on ${targetEntity.name}`);
            }
        }
    });
}
