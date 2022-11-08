// use slashcommandbuilder to make a command that shows the now playing song 

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Shows the current song playing'),
    inVoiceChannel: false,
    inSameVoiceChannel: false,
    inAssignedTextChannel: true,
    detailedDescription: 'Shows the current song playing in the music player',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Now playing command executed');
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue || !queue.playing) {
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
        const currentTrack = queue.current;
        const embed = new EmbedBuilder()
            .setTitle('Now Playing')
            .setDescription(`[${currentTrack.title}](${currentTrack.url})`)
            .setImage(currentTrack.thumbnail)
            .setFooter({
                text: `${queue.createProgressBar()}`,
                iconURL: interaction.user.displayAvatarURL()
            });
        return void interaction.followUp({ embeds: [embed] });
    }
};