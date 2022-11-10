// Allow a Admin, Owner, or DJ to connect the bot to a voice channel

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Connect the bot to a voice channel'),
    inVoiceChannel: true,
    inSameVoiceChannel: false,
    inAssignedTextChannel: true,
    detailedDescription: 'Allows a user that is an Admin, Owner, or DJ to connect the bot to a voice channel',
    async execute(interaction) {
        await interaction.deferReply();
        // Check if the user has the role Admin, Owner, or DJ
        const member = interaction.member;
        const roles = member.roles.cache;
        const isAdmin = roles.some((role) => role.name === 'ADMINISTRATOR');
        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const isDJ = roles.some((role) => role.name === 'DJ');
        if (!isAdmin && !isOwner && !isDJ) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('You need to be an Admin, Owner, or a DJ to use this command!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        // Check if the user is in a voice channel
        if (!interaction.member.voice.channelId) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('You need to be in a voice channel to use this command!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        // Check if the bot is already connected to a voice channel
        const queue = interaction.client.player.createQueue(interaction.guild, {
            metadata: interaction.channel
        });
        const connection = interaction.client.voice.adapters.get(interaction.guild.id);
        if (connection) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('The bot is already connected to a voice channel!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        try {
            if (!queue.connection)
                await queue.connect(interaction.member.voice.channel);
        } catch {
            queue.destroy();
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('Could not join your voice channel!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        // Create a new embed message with the success message
        const embed = new EmbedBuilder()
            .setTitle('Success!')
            .setDescription('Connected to the voice channel!')
            .setColor('#00ff00');
        return void interaction.followUp({ embeds: [embed] });
    }
};