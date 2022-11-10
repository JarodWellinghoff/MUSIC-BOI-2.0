// Use SlashCommandBuilder to build a command that calculates and returns the latency of the bot in milliseconds in an embed message
// Export the command data and execute function

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns the current latency of the bot in ms'),
    inVoiceChannel: false,
    inSameVoiceChannel: false,
    inAssignedTextChannel: false,
    detailedDescription: 'Returns the current latency of the bot in ms',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Ping command executed');
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(`Latency is ${Date.now() - interaction.createdTimestamp}ms`)
            .setColor('#0099ff');
        return void interaction.followUp({ embeds: [embed] });
    },
};
