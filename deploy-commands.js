// deploy-commands.js
//
// This script deploys all slash commands to the Discord API for all guilds the bot is in.
//
// Import the discord.js module
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

// Import the dotenv module
require('dotenv').config();

const testGuildId = process.env.TEST_GUILD_ID;

// Check if any arguments in the script are '-deploy' or '-delete', if yes, check if the second argument is '-global' or 'test'
var deploy = true;
var global = false;
const args = process.argv.slice(2);
// skip if no arguments
if (args.length > 0) {
    if (args[0] == '-deploy') {
        deploy = true;
        if (args[1] == '-global') {
            global = true;
        }
    } else if (args[0] == '-delete') {
        deploy = false;
        if (args[1] == '-global') {
            global = true;
        }
    } else {
        console.log('Invalid arguments. Use -deploy or -delete followed by -global if you want to deploy or delete global commands.');
        console.log('Or no arguments to deploy to test guild.');
        process.exit();
    }
}

// Create a new REST object
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

// Read all the commands from the commands folder
const commands = [];
if (deploy) {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }
}

// Register the commands to the Discord API
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        if (global) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, testGuildId),
                { body: commands },
            );
            if (deploy) {
                console.log('Successfully registered application (/) commands globally.');
            } else {
                console.log('Successfully deleted application (/) commands globally.');
            }
        } else {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, testGuildId),
                { body: commands },
            );
            if (deploy) {
                console.log('Successfully registered application (/) commands in the test guild.');
            } else {
                console.log('Successfully deleted application (/) commands in the test guild.');
            }
        }

    } catch (error) {
        console.error(error);
    }
})();
