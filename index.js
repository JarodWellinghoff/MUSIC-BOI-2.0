require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
    ],
});

// Create a new Player (you don't need any API Key)
const player = new Player(client, {
    ytdlOptions: {
        filter: 'audioonly',
        opusEncoded: 'true',
        quality: 'highestaudio',
        highWaterMark: 1 << 30,
    },
});

// To easily access the player
client.player = player;

// Dynamically add all commands to the client.commands Collection from the commands folder
const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

// Dynamically add all client events to the client.events Collection from the events/client folder
const eventFiles = fs.readdirSync('./events/client').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/client/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, commands));
    } else {
        client.on(event.name, (...args) => event.execute(...args, commands));
    }
}

// Dynamically add all player events to the player.events Collection from the events/player folder
const playerEventFiles = fs.readdirSync('./events/player').filter(file => file.endsWith('.js'));

for (const file of playerEventFiles) {
    const event = require(`./events/player/${file}`);

    if (event.once) {
        player.once(event.name, (...args) => event.execute(...args, commands));
    } else {
        player.on(event.name, (...args) => event.execute(...args, commands));
    }
}

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);