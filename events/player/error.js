// Create an embed message with the error message
const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'error',
    execute(queue, error) {
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
        const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription(`Error emitted from the queue: ${error.message}`)
            .setColor('#ff0000');
        return void queue.metadata.send({ embeds: [embed] });
    },
};
