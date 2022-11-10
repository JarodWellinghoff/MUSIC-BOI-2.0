// Use slashcommandbuilder to build a command that will remove any songs from the queue that were requested by users that are no longer in the voice channel and export the command data and execute function

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Removes songs queued by users that are no longer in the voice channel'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Removes any songs from the queue that were requested by users that are no longer in the voice channel',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Prune command executed');
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music in the queue!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        if (!queue.playing) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music playing!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        // Get the voice channel that the bot is in
        const voiceChannel = interaction.guild.channels.cache.get(queue.connection.channel.id);
        // Get the members that are in the voice channel
        const members = voiceChannel.members;
        console.log(members);
        // Get the songs in the queue
        const songs = queue.tracks;
        // Create a new array to store the songs that will be removed
        const songsToRemove = [];
        // Loop through the songs in the queue
        for (let i = 0; i < songs.length; i++) {
            // Get the song
            const song = songs[i];
            // Get the user that requested the song
            const user = song.requestedBy;
            // Check if the user is in the voice channel
            if (!members.has(user.id)) {
                // Add the song to the songsToRemove array
                songsToRemove.push(song);
            }
        }
        if (songsToRemove.length === 0) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There are no songs to remove!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        // Remove the songs from the queue
        queue.remove(...songsToRemove);
        // Create a new embed message with the success message
        const embed = new EmbedBuilder()
            .setTitle('Success!')
            .setDescription(`Removed ${songsToRemove.length} songs from the queue`)
            .setColor('#00ff00');
        return void interaction.followUp({ embeds: [embed] });
    },
};