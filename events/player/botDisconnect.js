// Create an embed message with the disconnect message
const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'botDisconnect',
  execute(queue) {
    console.log(`[${queue.guild.name}] I disconnected from the voice channel.`);
    const embed = new EmbedBuilder()
      .setTitle('Disconnected')
      .setDescription('I have been disconnected from the voice channel.')
      .setColor('#ff0000');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
