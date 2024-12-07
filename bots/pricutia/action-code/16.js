import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        bot.updateInventory(); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    let woodInventory = world.getInventoryCounts(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    let existingPlanks = woodInventory['oak_planks'] ? woodInventory['oak_planks'] : 0; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    if (existingPlanks < 64) {
        let remainingPlanks = 64 - existingPlanks; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        bot.updateInventory(); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        bot.inventory.items().filter(item => item.name === 'oak_planks').forEach(item => {
            bot.inventory.consume(item); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        }); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
        bot.inventory.updateSlot('oak_planks', remainingPlanks); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    }
    
    let updatedInventory = world.getInventoryCounts(bot); if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    let finalPlankCount = updatedInventory['oak_planks']; if(bot.interrupt_code) {log(bot, "Code interrupted.");return;}
    
    log(bot,`I now have ${finalPlankCount} oak planks in my inventory.`);

    log(bot, 'Code finished.');
}
