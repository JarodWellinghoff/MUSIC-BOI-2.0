// Export the function

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

function refreshFilterButtons(interaction) {
    // get the guilds queue
    const queue = interaction.client.player.getQueue(interaction.guildId);
    const disabledFilters = queue.getFiltersDisabled();
    const enabledFilters = queue.getFiltersEnabled();
    // create an array of arrays with 5 filters in each array
    const availableFitlers = disabledFilters.concat(enabledFilters);
    // alphabetically sort availablefilters
    availableFitlers.sort();
    const filters = [];
    let k = 5;
    for (let i = 0; i < availableFitlers.length; i += 5) {
        const current = availableFitlers.slice(i, k);
        k += 5;
        filters.push(current);
    }
    // Create a new embed message with the available filters
    const embed = new EmbedBuilder()
        .setTitle('Available filters')
        .setDescription('Click on the button to toggle the filter to the music player')
        .setColor('#00ff00');
    if (enabledFilters.length > 0) {
        embed.addFields(
            { name: 'Enabled filters', value: enabledFilters.join('\n') }
        );
    }
    // Create a new page of action rows with the available filters
    const filterActionRows = [];
    const pageControlActionRows = [];
    const secondaryControlActionRows = [];
    for (let i = 0; i < filters.length; i++) {
        const filterActionRow = new ActionRowBuilder();
        const secondaryControlActionRow = new ActionRowBuilder();
        const pageControlActionRow = new ActionRowBuilder();
        for (let j = 0; j < filters[i].length; j++) {
            // create a new button for each filter
            const filterButton = new ButtonBuilder()
                .setLabel(filters[i][j])
            // if the filter is enabled, set the button style to success
            if (enabledFilters.includes(filters[i][j])) {
                filterButton.setCustomId(`filters-${filters[i][j]}-+`)
                filterButton.setStyle(ButtonStyle.Success);
            } else {
                filterButton.setCustomId(`filters-${filters[i][j]}--`)
                filterButton.setStyle(ButtonStyle.Primary);
            }
            filterActionRow.addComponents(filterButton);
        }
        secondaryControlActionRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`filters-done`)
                .setLabel('Done')
                .setStyle(ButtonStyle.Danger)
        );
        if (i > 0) {
            pageControlActionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`filters-back`)
                    .setLabel('Back')
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        if (i < availableFitlers.length - 1) {
            pageControlActionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`filters-next`)
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        if (enabledFilters.length > 0) {
            secondaryControlActionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`filters-clear`)
                    .setLabel('Clear')
                    .setStyle(ButtonStyle.Danger)
            );
        }
        secondaryControlActionRows.push(secondaryControlActionRow);
        filterActionRows.push(filterActionRow);
        pageControlActionRows.push(pageControlActionRow);
    }
    // retrun the embed message and the filter action rows and the control action rows
    return [embed, filterActionRows, pageControlActionRows, secondaryControlActionRows];
}

module.exports = { refreshFilterButtons };