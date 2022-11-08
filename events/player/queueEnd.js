// Create an embed message with the queue end message
const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'queueEnd',
  execute(queue) {
    console.log(`[${queue.guild.name}] Queue ended.`);
    const embed = new EmbedBuilder()
      .setTitle('Queue Ended')
      .setDescription('The queue has ended.')
      .setColor('#ff0000');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
