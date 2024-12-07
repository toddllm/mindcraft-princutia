import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    async function jumpRepeatedly(bot, times) {
      for (let i = 0; i < times; i++) {
        bot.setControlState('jump', true); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await new Promise(resolve => setTimeout(resolve, 200)); // Jump duration
        bot.setControlState('jump', false); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        await new Promise(resolve => setTimeout(resolve, 300)); // Cooldown between jumps
      }
    }
    
    await jumpRepeatedly(bot, 5);

    log(bot, 'Code finished.');
}
