// Use slashcommanbuilder to create a commmand that allows a user that is an Admin, Owner, or DJ to disconnect the bot from the voice channel
// An embeded error message is sent if the user does not have the role Admin, Owner, or DJ
// Send an embeded message with a 'yes' and 'no' button asking if they want the queue to be cleared
// If the user selects 'yes' then the bot will clear the queue and disconnect from the voice channel
// If the user selects 'no' then the bot will disconnect from the voice channel
// If the user does not select a button within 5 seconds then the bot will diconnect from the voice channel without clearing the queue
// Export the command data and execute function

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dc')
        .setDescription('Disconnect the bot from the voice channel'),
    inVoiceChannel: true,
    inSameVoiceChannel: true,
    inAssignedTextChannel: false,
    detailedDescription: 'Allows a user that is an Admin, Owner, or DJ to disconnect the bot from the voice channel',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Disconnect command executed');
        // Get the voice connection
        const connection = getVoiceConnection(interaction.guild.id);
        // Check if the user is an Admin, Owner, or DJ
        if (interaction.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Owner' || role.name === 'DJ')) {
            // Create a row with a 'yes' and 'no' button
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('yes')
                        .setLabel('Yes')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('no')
                        .setLabel('No')
                        .setStyle('DANGER'),
                );
            // Send an embeded message with a 'yes' and 'no' button asking if they want the queue to be cleared
            const embed = new EmbedBuilder()
                .setTitle('Disconnect')
                .setDescription('Do you want to clear the queue?')
                .setColor(0xff0000);
            const message = await interaction.followUp({ embeds: [embed], components: [row] });
            // Create a filter to filter out messages that are not from the user that sent the command
            const filter = i => i.user.id === interaction.user.id;
            // Wait for the user to select a button
            const collector = message.createMessageComponentCollector({ filter, time: 5000 });
            // If the user selects a button within 5 seconds then run this code
            collector.on('collect', async i => {
                // If the user selects 'yes' then the bot will clear the queue and disconnect from the voice channel
                if (i.customId === 'yes') {
                    // Clear the queue
                    connection.queue.clear();
                    // Disconnect from the voice channel
                    connection.destroy();
                    // Send an embeded message saying that the bot has disconnected from the voice channel
                    const embed = new EmbedBuilder()
                        .setTitle('Success!')
                        .setDescription('The bot has disconnected from the voice channel')
                        .setColor(0x00ff00);
                    return void interaction.followUp({ embeds: [embed] });
                } else if (i.customId === 'no') {
                    // If the user selects 'no' then the bot will disconnect from the voice channel
                    // Disconnect from the voice channel
                    connection.destroy();
                    // Send an embeded message saying that the bot has disconnected from the voice channel
                    const embed = new EmbedBuilder()
                        .setTitle('Success!')
                        .setDescription('The bot has disconnected from the voice channel')
                        .setColor(0x00ff00);
                    return void interaction.followUp({ embeds: [embed] });
                }
            });
            // If the user does not select a button within 5 seconds then the bot will diconnect from the voice channel without clearing the queue
            collector.on('end', async collected => {
                // Disconnect from the voice channel
                connection.destroy();
                // Send an embeded message saying that the bot has disconnected from the voice channel
                const embed = new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription('The bot has disconnected from the voice channel')
                    .setColor(0x00ff00);
                return void interaction.followUp({ embeds: [embed] });
            });
        } else {
            // If the user does not have the role Admin, Owner, or DJ then send an embeded error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('You do not have permission to use this command')
                .setColor(0xff0000);
            return void interaction.followUp({ embeds: [embed] });
        }
    },
};
