// Create an embed message with the connection message
const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'connectionCreate',
  execute(queue) {
    console.log(`[${queue.guild.name}] Connected to ${queue.connection.channel.name}!`);
    const embed = new EmbedBuilder()
      .setTitle('Connected')
      .setDescription(`Connected to ${queue.connection.channel.name}!`)
      .setColor('#00ff00');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
