import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import Vec3 from 'vec3';

const log = skills.log;

export async function main(bot) {
        
    const mineflayer = require('mineflayer')
    const Vec3 = require('vec3').Vec3
    
    // Create a bot
    const bot = mineflayer.createBot({
      host: 'localhost', // minecraft server ip
      username: 'Player' // minecraft username
    })
    
    bot.once('spawn', () => {
      // When teleporting, create void effect
      bot.on('calcedMotionPosition', (current, next) => {
        // If the bot has teleported more than 10 blocks
        if (current.distanceTo(next) > 10) {
          // Spawn falling obsidian blocks around the teleport location
          for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
              const pos = new Vec3(next.x + x, next.y + 3, next.z + z)
              bot.setBlock(pos, 'falling_obsidian')
              
              // Remove the blocks after 5 seconds
              setTimeout(() => {
                bot.setBlock(pos, 'air')
              }, 5000)
            }
          }
        }
      })
    })

    log(bot, 'Code finished.');
}
