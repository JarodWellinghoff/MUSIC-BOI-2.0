// Create an embed message using the metadata from the track 
// Add the thumbnail of track to the Image of the embed message
// Add the author icon to the thumbnail of the embed message
// Add the title to the embed message
// Add the author to the embed message
// Add the duration to the embed message
// Add the url to the embed message
// Add the color to the embed message
// add the requestor to the embed messages footer

const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'trackStart',
  execute(queue, track) {
    console.log(`[${queue.guild.name}] Started playing: ${track.title} in ${queue.connection.channel.name}`,);
    const embed = new EmbedBuilder()
      .setImage(`${track.thumbnail}`)
      .setTitle('Track Started')
      .setDescription(`🎶 | Started playing: **${track.title}** in ${queue.connection.channel.name}!`)
      .addFields(
        { name: 'Author', value: `${track.author}`, inline: true },
        { name: 'Duration', value: `${track.duration}`, inline: true },
      )
      .setURL(`${track.url}`)
      .setColor('#00ff00');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
