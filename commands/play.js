// Use discord-player to play music in a voice channel and export it

const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song in the voice channel')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song to play')
                .setRequired(true)),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    detailedDescription: 'Plays a song in the voice channel, if there is a song playing it will add the song to the queue. YouTube and SoundCloud links are supported. Playlists are also supported.',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Play command executed');

        const song = interaction.options.getString('song');
        console.log(`Song: ${song}`);
        const queue = interaction.client.player.createQueue(interaction.guild, {
            metadata: interaction.channel
        });

        const searchResult = await interaction.client.player
            .search(song, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

        if (!searchResult || !searchResult.tracks.length) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('No results were found!')
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
        // Follow up with an embed message that the song or playlist is loading
        const embed = new EmbedBuilder()
            .setTitle('Loading...')
            .setDescription(`Loading ${searchResult.playlist ? 'playlist' : 'track'} [${song}](${searchResult.tracks[0].url})`)
            .setColor('#0099ff');
        await interaction.followUp({ embeds: [embed] });

        if (searchResult.playlist) {
            queue.addTracks(searchResult.tracks);
            if (!queue.playing) await queue.play();
        } else {
            queue.addTrack(searchResult.tracks[0]);
            if (!queue.playing) await queue.play();
        }
    },
};
