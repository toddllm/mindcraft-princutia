import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        const logs = world.getInventoryCounts(bot)['oak_log']; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    log(bot,`I have ${logs} oak logs in my inventory.`);

    log(bot, 'Code finished.');
}
