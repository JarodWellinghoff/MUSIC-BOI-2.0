// Use slashCommandBuilder to build a command that skips the current song and export the command data and execute function
// add a button that allows users to vote to skip the current song
// the button will be disabled if the user has already voted to skip the current song
// the button will be disabled if the user is not in the same voice channel as the bot
// if the user is the user that requested the song, the song will be skipped
// the amount of votes needed to skip the song will be 50% of the amount of users in the voice channel, rounded up, with a minimum of 2 votes, minus 1 for the bot
// if the amount of votes is reached, the song will be skipped
// if the amount of votes is not reached in 10 seconds, the button will be disabled and the amount of votes needed will be displayed

const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');
const fs = require('fs');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Skips the current song if there is a song playing',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Skip command executed');
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue || !queue.playing) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music playing!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }
        const currentTrack = queue.current;
        const requester = currentTrack.requestedBy;
        const requesterId = requester.id;
        const userId = interaction.user.id;
        const voiceChannel = interaction.member.voice.channel;
        const members = voiceChannel.members;
        const memberCount = members.size - 1;
        console.log(`Member count: ${memberCount}`);
        const votesNeeded = Math.ceil(memberCount / 2);

        const votesNeededEmbed = new EmbedBuilder()
            .setTitle('Votes Needed')
            .setDescription(`(1/${votesNeeded}) votes needed to skip the song`)
            .setColor('#ffff00');
        const skipEmbed = new EmbedBuilder()
            .setTitle('Skipped')
            .setDescription('Skipped the song')
            .setColor('#00ff00');
        const skipButton = new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('Skip')
            .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder()
            .addComponents(skipButton);
        if (userId === requesterId) {
            // Skip the song if the user is the user that requested the song
            queue.skip();
            return void interaction.followUp({ embeds: [skipEmbed] });
        }
        // Check in the guilds json file if the user has already voted to skip the song
        const guildSettings = JSON.parse(fs.readFileSync(`./custom_settings/${interaction.guild.id}.json`));
        // add skipVotes to the guilds json file if it does not exist
        if (!guildSettings.skipVotes) {
            guildSettings.skipVotes = [];
            fs.writeFileSync(`./custom_settings/${interaction.guild.id}.json`, JSON.stringify(guildSettings, null, 4));
        }
        // add the interaction user id to the skipVotes array
        guildSettings.skipVotes.push(userId);
        // Create a new embed message with the amount of votes needed
        await interaction.followUp({ embeds: [votesNeededEmbed], components: [row] });
        const collector = interaction.channel.createMessageComponentCollector({ ComponentType: ComponentType.Button, time: 10000 });
        collector.on('collect', async i => {
            if (i.user.id === userId) {
                i.reply({ content: 'You have already voted to skip the song', ephemeral: true });
            } else {
                // add the interaction user id to the skipVotes array
                guildSettings.skipVotes.push(i.user.id);
                // check if the amount of votes is equal to or greater than the amount of votes needed
                if (guildSettings.skipVotes.length >= votesNeeded) {
                    // Skip the song if the amount of votes is equal to or greater than the amount of votes needed
                    queue.skip();
                    // delete the skipVotes array
                    delete guildSettings.skipVotes;
                    fs.writeFileSync(`./custom_settings/${interaction.guild.id}.json`, JSON.stringify(guildSettings, null, 4));
                    collector.stop('votes reached');
                } else {
                    // Create a new embed message with the amount of votes needed
                    const votesNeededEmbed = new EmbedBuilder()
                        .setTitle('Votes Needed')
                        .setDescription(`(${guildSettings.skipVotes.length}/${votesNeeded}) votes needed to skip the song`)
                        .setColor('#ffff00');
                    await i.update({ embeds: [votesNeededEmbed] });
                }
            }
        });
        collector.on('end', async (_, reason) => {
            if (reason === 'votes reached') {
                // Create a new embed message with the skipped message
                await interaction.update({ embeds: [skipEmbed] });
            } else {
                // Create a embed message for when the amount of votes is not reached in 10 seconds
                const votesNotReachedEmbed = new EmbedBuilder()
                    .setTitle('Votes Not Reached')
                    .setDescription(`The amount of votes needed to skip the song was not reached in 10 seconds`)
                    .setColor('#ff0000');
                await interaction.update({ embeds: [votesNotReachedEmbed] });
            }
        });
    }
};
