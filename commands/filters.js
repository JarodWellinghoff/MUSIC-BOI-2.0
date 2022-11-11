// command to add filters to the guilds player

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { refreshFilterButtons } = require('.././utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('Toggles the music player\'s filters'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: true,
    detailedDescription: 'Toggles the music player\'s filters',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('filter command executed');
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue || !queue.playing) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('There is no music playing!')
                .setColor('#ff0000');
            return void interaction.followUp({ embeds: [embed] });
        }

        let [embed, filterActionRows, pageControlActionRows, secondaryControlActionRows] = refreshFilterButtons(interaction);
        // create a new message with the embed and action rows
        await interaction.followUp({ embeds: [embed], components: [filterActionRows[0], pageControlActionRows[0], secondaryControlActionRows[0]] });
        // create a new collector for the buttons
        const filter = m => m.customId.startsWith('filters-') && m.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        let currentPage = 0;
        try {
            collector.on('collect', async i => {
                const queue = interaction.client.player.getQueue(interaction.guildId);
                if (!queue || !queue.playing) {
                    // Create a new embed message with the error message
                    collector.stop('no music playing');
                }
                [embed, filterActionRows, pageControlActionRows, secondaryControlActionRows] = refreshFilterButtons(interaction);
                if (i.customId === 'filters-done') {
                    collector.stop('done');
                } else if (i.customId === 'filters-next') {
                    currentPage += 1;
                    await i.update({ embeds: [embed], components: [filterActionRows[currentPage], pageControlActionRows[currentPage], secondaryControlActionRows[currentPage]] });
                } else if (i.customId === 'filters-back') {
                    currentPage -= 1;
                    await i.update({ embeds: [embed], components: [filterActionRows[currentPage], pageControlActionRows[currentPage], secondaryControlActionRows[currentPage]] });
                } else if (i.customId === 'filters-clear') {
                    const queue = interaction.client.player.getQueue(interaction.guildId);
                    if (!queue || !queue.playing) {
                        // Create a new embed message with the error message
                        collector.stop('no music playing');
                    }
                    let enabledFilters = queue.getFiltersEnabled();
                    let disabledFilters = queue.getFiltersDisabled();
                    const filterJSON = {};
                    enabledFilters.forEach(filter => {
                        filterJSON[filter] = false;
                    });
                    // add the disabled filters to the filterJSON abnd set them to false
                    disabledFilters.forEach(filter => {
                        filterJSON[filter] = false;
                    });
                    // set the filters
                    await queue.setFilters(filterJSON);
                    [embed, filterActionRows, pageControlActionRows, secondaryControlActionRows] = refreshFilterButtons(interaction);
                    await i.update({ embeds: [embed], components: [filterActionRows[currentPage], pageControlActionRows[currentPage], secondaryControlActionRows[currentPage]] });
                } else if (i.customId.startsWith('filters-')) {
                    const queue = interaction.client.player.getQueue(interaction.guildId);
                    if (!queue || !queue.playing) {
                        // Create a new embed message with the error message
                        collector.stop('no music playing');
                    }

                    const filter = i.customId.split('-')[1];
                    let enabled = false;

                    if (i.customId.endsWith('+')) {
                        enabled = true;
                    }

                    let enabledFilters = queue.getFiltersEnabled();
                    let disabledFilters = queue.getFiltersDisabled();
                    const filterJSON = {};
                    // add the enabled filters to the filterJSON abnd set them to true
                    enabledFilters.forEach(filter => {
                        filterJSON[filter] = true;
                    });
                    // add the disabled filters to the filterJSON abnd set them to false
                    disabledFilters.forEach(filter => {
                        filterJSON[filter] = false;
                    });
                    // set the filter to the enabled value
                    filterJSON[filter] = !enabled;
                    // set the filters
                    await queue.setFilters(filterJSON);
                    [embed, filterActionRows, pageControlActionRows, secondaryControlActionRows] = refreshFilterButtons(interaction);
                    await i.update({ embeds: [embed], components: [filterActionRows[currentPage], pageControlActionRows[currentPage], secondaryControlActionRows[currentPage]] });
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
                } else if (reason === 'no music playing') {
                    // Create a new embed message with the error message that the search timed out
                    const embed = new EmbedBuilder()
                        .setTitle('Error!')
                        .setDescription('There is no music playing!')
                        .setColor('#ff0000');
                    await interaction.editReply({ embeds: [embed], components: [] });
                } else if (reason === 'done') {
                    // Create a new embed message with 
                    const queue = interaction.client.player.getQueue(interaction.guildId);
                    let enabledFilters = queue.getFiltersEnabled();
                    const embed = new EmbedBuilder()
                        .setTitle('Available filters')
                        .setColor('#00ff00');
                    if (enabledFilters.length > 0) {
                        embed.addFields(
                            { name: 'Enabled filters', value: enabledFilters.join('\n') }
                        );
                    }
                } else {
                    await interaction.editReply({ components: [] });
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
};