// Create an embed message with the connection error message
const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'connectionError',
  execute(queue, error) {
    console.log(`[${queue.guild.name}] Error emitted from the queue:`, error.stack,);
    const embed = new EmbedBuilder()
      .setTitle('Connection Error')
      .setDescription(`Something went wrong with the connection, bot may not work properly.`)
      .setColor('#ff0000');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
