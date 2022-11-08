// Create an embed message with the empty channel message
const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'channelEmpty',
  execute(queue) {
    console.log(`[${queue.guild.name}] The channel is empty, I left the voice channel.`);
    const embed = new EmbedBuilder()
      .setTitle('Disconnected')
      .setDescription('I have been disconnected from the voice channel because it is empty.')
      .setColor('#ff0000');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
