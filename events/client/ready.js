require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag}' is ready!`);
        // Get guild ids of all guilds the bot is in
        const guildIds = client.guilds.cache.map(guild => guild.id);
        // Read all the commands from the commands folder
        const commands = [];
        const commandFiles = fs.readdirSync(path.join(process.cwd(), 'commands')).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../../commands/${file}`);
            commands.push(command.data.toJSON());
        }
        // Register the commands to the Discord API for all guilds the bot is in
        try {
            for (const guildId of guildIds) {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                    { body: commands },
                );
                console.log(`Successfully registered application commands for guild ${guildId}`);
                // Find the customSettings.json file for the guild
                const customSettingsPath = path.join(process.cwd(), 'custom_settings', `${guildId}.json`);
                // If the file doesn't exist, create it
                if (!fs.existsSync(customSettingsPath)) {
                    // get name of guild
                    const guildName = client.guilds.cache.get(guildId).name;
                    const defaultSettings = {
                        name: guildName,
                    };
                    fs.writeFileSync(customSettingsPath, JSON.stringify(defaultSettings, null, 4));
                }
            }
            console.log(`Successfully registered application commands to ${guildIds.length} guilds.`);
        } catch (error) {
            console.error(error);
        }
    },
}
