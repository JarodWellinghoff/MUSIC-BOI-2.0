// Use slashCommandBuilder to build a command that pauses the music player if there is a song playing and export the command data and execute function
// Add the user that executed the command to the footer of the embed message
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the music player'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Pauses the music player if there is a song playing',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Pause command executed');
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
        const success = queue.setPaused(true);
        // Create a new embed message with the paused message or error message if the music is already paused
        const embed = new EmbedBuilder()
            .setTitle(success ? 'Paused!' : 'Error!')
            .setDescription(success ? 'Paused the music!' : 'Music is already paused!')
            .setColor(success ? '#00ff00' : '#ff0000');
        return void interaction.followUp({ embeds: [embed] });
    },
};