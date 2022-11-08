// Handle interactionCreate event (slash commands) and export it
const fs = require('fs');
const path = require('path');
module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // If the interaction is not a command, return
        if (!interaction.isCommand()) return;

        // Get the command from the client's commands collection
        const command = interaction.client.commands.get(interaction.commandName);

        // If the command does not exist, return
        if (!command) return;

        // Check if the guild has a queue
        const queue = interaction.client.player.getQueue(interaction.guildId);
        // If the command is a music command and the guild does not have a queue, return


        // Check if the guild has a set text channel for the bot to listen for commands in and send messages to in the custom_settings folder
        // If the guild does not have a set text channel, continue
        // If the guild has a set text channel, check if the interaction was executed in that text channel
        // If the interaction was not executed in the set text channel, return
        // If the interaction was executed in the set text channel, continue
        if (command.inAssignedTextChannel) {
            const guildSettings = JSON.parse(fs.readFileSync(`./custom_settings/${interaction.guild.id}.json`));
            if (guildSettings.textChannelId) {
                if (guildSettings.textChannelId !== "" && guildSettings.textChannelId !== interaction.channelId)
                    return void interaction.reply({ content: `You can only use this command in <#${guildSettings.textChannelId}>!`, ephemeral: true });
            }
        }

        const botInVoiceChannel = interaction.client.player.getQueue(interaction.guildId) ? true : false;
        console.log(botInVoiceChannel);
        const botVoiceChannelId = botInVoiceChannel ? interaction.client.player.getQueue(interaction.guildId).connection.channel.id : null;

        if (command.inVoiceChannel && !interaction.member.voice.channel) {
            return void interaction.reply({
                content: 'You must be in a voice channel to use this command!',
                ephemeral: true
            });
        }
        if (botInVoiceChannel && interaction.member.voice.channelId !== botVoiceChannelId) {
            return void interaction.reply({
                content: 'You must be in the same voice channel as the bot to use this command!',
                ephemeral: true
            });
        }

        // If the command is found, try to execute it
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    },
};