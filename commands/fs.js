// Use slashCommandBuilder to build a command that force skips the current song if the user is an Admin, Owner or a DJ
// Export the command data and execute function

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fs')
        .setDescription('Force skips the current song'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Force skips the current song if the user is an Admin, Owner, or a DJ',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Force skip command executed');
        const queue = interaction.client.player.getQueue(interaction.guild);
        // Check if the user is an Admin, Owner or a DJ
        const isAdmin = interaction.member.roles.cache.some((role) => role.name === 'ADMINISTRATOR');;
        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const isDJ = interaction.member.roles.cache.some((role) => role.name === 'DJ');
        if (!isAdmin && !isOwner && !isDJ) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('You need to be an Admin, Owner, or a DJ to use this command!')
                .setColor('#ff0000')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        }
        if (!queue) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music in the queue!')
                .setColor('#ff0000')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        }

        if (!queue.playing) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music playing!')
                .setColor('#ff0000')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        }

        const success = queue.skip();
        // Create a new embed message with the success message or error message if the music is already playing
        const embed = new EmbedBuilder()
            .setTitle(success ? 'Skipped!' : 'Error!')
            .setDescription(success ? 'Skipped the song!' : 'There is no song to skip!')
            .setColor(success ? '#00ff00' : '#ff0000')
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });
        return void interaction.followUp({ embeds: [embed] });
    }
};