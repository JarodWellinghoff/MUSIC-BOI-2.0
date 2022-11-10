// Create an embed message using the metadata from the track 
// Add the thumbnail of track to the embed message
// Add the title to the embed message
// Add the author to the embed message
// Add the duration to the embed message
// Add the url to the embed message
// Add the position in the queue to the embed message
// Add time until the track starts to the embed message
// Add the color to the embed message
// add the requestor to the embed messages footer

const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'trackAdd',
  execute(queue, track) {
    console.log(`[${queue.guild.name}] ${track.title} queued!`);
    const embed = new EmbedBuilder()
      .setThumbnail(`${track.thumbnail}`)
      .setTitle('Track Added')
      .setDescription(`🎶 | Track **${track.title}** queued!`)
      .addFields(
        { name: 'Author', value: `${track.author}`, inline: true },
        { name: 'Duration', value: `${track.duration}`, inline: true },
      )
      .setURL(`${track.url}`)
      .setColor('#00ff00');

    if (queue.playing) {
      embed.addFields(
        { name: 'Position in queue', value: `${queue.tracks.length}`, inline: true },

      );
    }
    return void queue.metadata.send({ embeds: [embed] });
  },
};
