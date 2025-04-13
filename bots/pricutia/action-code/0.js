export async function main(bot) {
    // Star Slash functionality has been disabled

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
