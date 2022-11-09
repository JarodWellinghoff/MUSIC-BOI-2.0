// Use slashCommandBuilder to build a command that allows users with the role Admin, or Owner to change the text channel that the bot listens for commands in and sends messages to
// An embeded error message is sent if the user does not have the role Admin or Owner
// Add the string choices of 'add', 'remove', and 'check' to the command
// If the user selects 'add' then the bot will add the current text channel to the guild's json file in the custom_settings folder as 'textChannelId'
// If the user selects 'remove' then the bot will remove the current text channel from the database
// If the user selects 'check' then the bot will check if the current text channel is in the database and send an embeded message with the result
// If the user selects 'add' and the current text channel is already in the database then the bot will send an embeded error message
// If the user selects 'remove' and the current text channel is not in the database then the bot will send an embeded error message
// Export the command data and execute function

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('textchannel')
        .setDescription('Change the text channel that the bot listens for commands in and sends messages to')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Add or remove the current text channel')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' },
                    { name: 'Check', value: 'check' }
                )
        ),
    inVoiceChannel: false,
    inSameVoiceChannel: false,
    inAssignedTextChannel: false,
    detailedDescription: 'Allows users with the role Admin, or Owner to change the text channel that the bot listens for commands in and sends messages to',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Text channel command executed');
        // Get the action string from the user's input
        const action = interaction.options.getString('action');
        // The user can use the command if action is 'check'
        if (action === 'check') {
            // Check if the current text channel is in the database
            const guildId = interaction.guild.id;
            const guildSettings = JSON.parse(fs.readFileSync(`./custom_settings/${guildId}.json`));
            const textChannelId = guildSettings.textChannelId;
            // If the current text channel is in the database then send an embeded message with the result
            if (textChannelId && textChannelId !== "") {
                const embed = new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription(`The bot is listening for commands in <#${textChannelId}> and sending messages to <#${textChannelId}>`)
                    .setColor(0x00ff00);
                return void interaction.followUp({ embeds: [embed] });
            } else {
                // Return an embeded message saying that the bot is listening for commands in every text channel
                const embed = new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription('The bot is listening for commands in every text channel')
                    .setColor(0x00ff00);
                return void interaction.followUp({ embeds: [embed] });

            }
        }
        // Check if the user is an Admin or Owner\
        let isAdmin = false;
        try {
            isAdmin = interaction.member.permissions.has('ADMINISTRATOR');
        } catch (error) {
            console.log(error);
        }
        const isOwner = interaction.guild.ownerId === interaction.user.id;
        if (!isAdmin && !isOwner) {
            // Create a new embed message with the error message
            const embed = new EmbedBuilder()
                .setTitle('Error!')
                .setDescription('You need to be an Admin or Owner to use this command!')
                .setColor('#ff0000')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        }
        // Get the guild's json file
        const guildSettings = JSON.parse(fs.readFileSync(`./custom_settings/${interaction.guild.id}.json`));
        // Check if the action is 'add'
        if (action === 'add') {
            // Check if the current text channel is already in the database
            if (guildSettings.textChannelId === interaction.channelId) {
                // Create a new embed message with the error message
                const embed = new EmbedBuilder()
                    .setTitle('Error!')
                    .setDescription('This text channel is already in the database!')
                    .setColor('#ff0000')
                    .setFooter({
                        text: `Requested by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    });
                return void interaction.followUp({ embeds: [embed] });
            }
            // Add the current text channel to the database
            guildSettings.textChannelId = interaction.channelId;
            // Write the updated guildSettings to the json file
            fs.writeFileSync(`./custom_settings/${interaction.guild.id}.json`, JSON.stringify(guildSettings, null, 4));
            // Create a new embed message with the success message
            const embed = new EmbedBuilder()
                .setTitle('Success!')
                .setDescription('Added the current text channel to the database!')
                .setColor('#00ff00')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        } else if (action === 'remove') {
            // Check if the current text channel is not in the database
            if (guildSettings.textChannelId !== interaction.channelId) {
                // Create a new embed message with the error message
                const embed = new EmbedBuilder()
                    .setTitle('Error!')
                    .setDescription('This text channel is not in the database!')
                    .setColor('#ff0000')
                    .setFooter({
                        text: `Requested by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    });
                return void interaction.followUp({ embeds: [embed] });
            }
            // Remove the current text channel from the database
            guildSettings.textChannelId = '';
            // Write the updated guildSettings to the json file
            fs.writeFileSync(`./custom_settings/${interaction.guild.id}.json`, JSON.stringify(guildSettings, null, 4));
            // Create a new embed message with the success message
            const embed = new EmbedBuilder()
                .setTitle('Success!')
                .setDescription('Removed the current text channel from the database!')
                .setColor('#00ff00')
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            return void interaction.followUp({ embeds: [embed] });
        }
    }
};