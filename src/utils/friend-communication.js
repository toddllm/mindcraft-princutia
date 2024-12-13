export async function performSupportMove(bot, friendEntity, targetEnemy) {
    const friendName = friendEntity.username;
    // Use chat command to tell the friend entity to assist.
    bot.chat(`/tell ${friendName} AssistAttack ${targetEnemy.id}`);
    console.log(`${bot.username} is requesting ${friendName} to assist with the Star Slash on ${targetEnemy.name}`);
}
