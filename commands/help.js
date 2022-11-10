// use slashcommandbuilder to create a help command that returns a list of all commands in an embed message with their descriptions
// Add an optional argument to the command that takes in a command name and returns the detailed description of that command
//
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Returns a list of all commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The name of the command to get the detailed description of')),
    inVoiceChannel: false,
    inSameVoiceChannel: false,
    inAssignedTextChannel: false,
    detailedDescription: 'Returns a list of all commands',
    async execute(interaction) {
        await interaction.deferReply();
        console.log('Help command executed');
        const commandName = interaction.options.getString('command');
        if (commandName) {
            const command = interaction.client.commands.get(commandName);
            if (!command) {
                const embed = new EmbedBuilder()
                    .setTitle('Error!')
                    .setDescription(`Command \`/${commandName}\` does not exist!`)
                    .setColor('#ff0000');
                return void interaction.followUp({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setTitle(`Detailed description of \`/${commandName}\``)
                .setDescription(`${command.detailedDescription}`)
                .setColor('#0099ff');
            return void interaction.followUp({ embeds: [embed] });
        }
        const embed = new EmbedBuilder()
            .setTitle('List of commands:')
            .setColor('#0099ff');
        // Read this directory and get all the files in it
        const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            // Ignore this file
            const command = require(`./${file}`);
            embed.addFields({ name: `\`/${command.data.name}\``, value: command.data.description, inline: false });
        }
        return void interaction.followUp({ embeds: [embed] });
    },
};
