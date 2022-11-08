// Use SlashCommandBuilder to build a command that resumes the music player if there is a song playing and export the command data and execute function
// Add the user that executed the command to the footer of the embed message
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the music player'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Resumes the music player if there is a song playing',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Resume command executed');
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue || !queue.playing) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music paused!')
                .setColor('#ff0000')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        }
        const success = queue.setPaused(false);
        // Create a new embed message with the success message or error message if the music is already playing
        const embed = new EmbedBuilder()
            .setTitle(success ? 'Resumed!' : 'Error!')
            .setDescription(success ? 'Resumed the music!' : 'Music is already playing!')
            .setColor(success ? '#00ff00' : '#ff0000')
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });
        return void interaction.followUp({ embeds: [embed] });
    }
};