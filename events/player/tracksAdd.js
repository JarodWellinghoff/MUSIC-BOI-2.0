// Create an embed message using the metadata from the playlist
// Add the thumbnail from the playlist
// Add the title to the embed message
// Add the author to the embed message
// Add the duration to the embed message
// Add the position of the first track in the playlist to the embed message
// Add the number of tracks in the playlist to the embed message
// Add the time until the first track in the playlist starts to the embed message
// Add the url to the embed message
// Add the color to the embed message
// add the requestor to the embed messages footer

const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'tracksAdd',
  execute(queue, tracks) {
    console.log(`[${queue.guild.name}] ${tracks[0].playlist.title} queued!`);
    const embed = new EmbedBuilder()
      .setThumbnail(`${tracks[0].playlist.thumbnail}`)
      .setTitle('Playlist Added')
      .setDescription(`🎶 | Playlist **${tracks[0].playlist.title}** queued!`)
      .addFields(
        { name: 'Author', value: `${tracks[0].playlist.author}`, inline: true },
        { name: 'Duration', value: `${tracks[0].playlist.duration}`, inline: true },
        { name: 'Position in queue', value: `${queue.tracks.length - tracks.length}`, inline: true },
        { name: 'Number of tracks', value: `${tracks.length}`, inline: true },
        { name: 'Time until start', value: `${queue.duration}`, inline: true },
      )
      .setURL(`${tracks[0].playlist.url}`)
      .setColor('#00ff00');
    return void queue.metadata.send({ embeds: [embed] });
  },
};
