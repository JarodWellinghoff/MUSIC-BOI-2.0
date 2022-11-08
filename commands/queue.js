// Use slashCommandBuilder to show the current queue of songs in the music player with a maximum of 10 songs per page and export the command data and execute function
// Also, add a left arrow and right arrow to the embed message to navigate through the pages

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current queue of songs'),
    inVoiceChannel: true,
    inSameVoiceChannel: false,
    inAssignedTextChannel: true,
    detailedDescription: 'Shows the current queue of songs in the music player with a maximum of 10 songs per page and a left arrow and right arrow to navigate through the pages',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Queue command executed');
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
        const currentTrack = queue.current;
        console.log(currentTrack);
        const tracks = queue.tracks;
        const embeds = [];
        const maxPerPage = 10;
        const titleEmbed = new EmbedBuilder()
            .setTitle('Queue')
            .setDescription(`Current track: [${currentTrack.title}](${currentTrack.url})`)
            .setColor('#00ff00');
        embeds.push(titleEmbed);

        for (let i = 0; i < tracks.length; i += maxPerPage) {
            const current = tracks.slice(i, i + maxPerPage);
            const description = current.map((track, index) => `${index + 1 + i}. [${track.title}](${track.url})`).join('\n');
            const embed = new EmbedBuilder()
                .setDescription(description)
                .setColor('#00ff00');
            embeds.push(embed);
        }
        console.log(queue.length)
        if (queue.tracks.length !== 0) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                );


            let page = 0;
            const embed = embeds[page];
            const message = await interaction.followUp({ embeds: [embed], components: [row] });
            const filter = (interaction) => interaction.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });
            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'previous') {
                    page = page > 0 ? --page : embeds.length - 1;
                } else {
                    page = page + 1 < embeds.length ? ++page : 0;
                }
                await interaction.update({ embeds: [embeds[page]], components: [row] });
            }
            );
        } else {
            return void interaction.followUp({ embeds: [embeds[0]] });
        }
    }
};
