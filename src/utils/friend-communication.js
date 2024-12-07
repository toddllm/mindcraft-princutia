export async function performSupportMove(agent, friendEntity, targetEnemy) {
    const friendName = friendEntity.username;
    agent.whisper(friendName, `AssistAttack ${targetEnemy.id}`);
    console.log(`${agent.username} is requesting ${friendName} to assist with the Star Slash on ${targetEnemy.name}`);
}
