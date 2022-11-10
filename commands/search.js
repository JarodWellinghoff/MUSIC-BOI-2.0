// command to search for a song
// shows the first 5 results
// user can select a song to play using buttons in an action row
// add a button to cancel the search
// add a button to go back to the previous page of results
// add a button to go to the next page of results
// only the user who started the search can use the buttons
// send the choosen song to the play command

const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QueryType } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Searches for a song')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song to search for')
                .setRequired(true)),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Searches for a song and shows the first 5 results',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Search command executed');
        const song = interaction.options.getString('song');

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
        console.log(searchResult);
        // create an array of arrays with 5 songs each
        const songs = [];
        const songsPerPage = 5;
        let i = 0;
        while (i < searchResult.tracks.length) {
            songs.push(searchResult.tracks.slice(i, i + songsPerPage));
            i += songsPerPage;
        }
        console.log(songs);
        // create an array of action rows with 5 buttons each (one for each song) and a cancel button at the end and a back and next button at the beginning
        const songActionRows = [];
        const controlActionRows = [];
        for (let i = 0; i < songs.length; i++) {
            const songActionRow = new ActionRowBuilder();
            const controlActionRow = new ActionRowBuilder();
            for (let j = 0; j < songs[i].length; j++) {
                songActionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`search-${i}-${j}-`)
                        .setLabel(`${j + 1}`)
                        .setStyle(ButtonStyle.Primary)
                );
            }
            controlActionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`search-cancel`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );
            if (i > 0) {
                controlActionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`search-back`)
                        .setLabel('Back')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            if (i < songs.length - 1) {
                controlActionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`search-next`)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            songActionRows.push(songActionRow);
            controlActionRows.push(controlActionRow);
        }
        // Create an embed message for each page of results
        const embeds = [];
        for (let i = 0; i < songs.length; i++) {
            const pageOfEmbeds = [];
            for (let j = 0; j < songs[i].length; j++) {
                const embed = new EmbedBuilder()
                    .setTitle(`${j + 1}. ${songs[i][j].title}`)
                    .setURL(songs[i][j].url)
                    .setThumbnail(songs[i][j].thumbnail)
                pageOfEmbeds.push(embed);
            }
            embeds.push(pageOfEmbeds);
        }
        // Send the first page of results
        await interaction.followUp({ embeds: embeds[0], components: [songActionRows[0], controlActionRows[0]] });
        // Create a collector for the buttons
        const filter = i => i.customId.startsWith('search-') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        let currentPage = 0;
        try {
            collector.on('collect', async i => {
                // If the button is a song button, play the song and stop the collector
                if (i.customId.startsWith('search-') && i.customId.endsWith('-')) {
                    const [_, page, song] = i.customId.split('-');
                    const track = songs[page][song];
                    console.log(`${page}-${song}`);
                    collector.stop(`${page}-${song}`);
                }
                // If the button is a cancel button, stop the collector
                else if (i.customId === 'search-cancel') {
                    collector.stop('cancelled');
                }
                // If the button is a back button, go to the previous page of results
                else if (i.customId === 'search-back') {
                    currentPage--;
                    await i.update({ embeds: embeds[currentPage], components: [songActionRows[currentPage], controlActionRows[currentPage]] });
                }
                // If the button is a next button, go to the next page of results
                else if (i.customId === 'search-next') {
                    currentPage++;
                    await i.update({ embeds: embeds[currentPage], components: [songActionRows[currentPage], controlActionRows[currentPage]] });
                }
            });
            collector.on('end', async (_, reason) => {
                // Delete the buttons
                if (reason === 'time') {
                    // Create a new embed message with the error message that the search timed out
                    const embed = new EmbedBuilder()
                        .setTitle('Error!')
                        .setDescription('The search timed out!')
                        .setColor('#ff0000');
                    await interaction.editReply({ embeds: [embed], components: [] });
                } else if (reason === 'cancelled') {
                    // Create a new embed message with the error message that the search was cancelled
                    const embed = new EmbedBuilder()
                        .setTitle('Error!')
                        .setDescription('The search was cancelled!')
                        .setColor('#ff0000');
                    await interaction.editReply({ embeds: [embed], components: [] });
                } else {
                    // Get the song that was played from the reason
                    const [page, song] = reason.split('-');
                    console.log(songs);
                    const track = songs[page][song];
                    const queue = interaction.client.player.createQueue(interaction.guild, {
                        metadata: interaction.channel
                    });

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
                        await interaction.editReply({ embeds: [embed], components: [] });
                    }
                    // Follow up with an embed message that the song or playlist is loading
                    const embed = new EmbedBuilder()
                        .setTitle('Loading...')
                        .setDescription(`[${track.title}](${track.url})`)
                        .setColor('#0099ff');
                    await interaction.editReply({ embeds: [embed], components: [] });

                    queue.addTrack(track);
                    if (!queue.playing) await queue.play();

                }
            });
        } catch (error) {
            console.log(error);
        }
    }
};
