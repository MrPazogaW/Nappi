require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require('discord.js');

const express = require('express');

// ==============================
// SERVIDOR PARA O RENDER
// ==============================

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('🐾 Bot Discord está online!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

// ==============================
// BOT DO DISCORD
// ==============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ==============================
// BOT ONLINE
// ==============================

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}!`);
});

// ==============================
// FUNÇÃO DE LOG
// ==============================

async function enviarLog(guild, embed) {
    try {
        const canalLogs = guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

        if (!canalLogs) {
            console.log('Canal de logs não encontrado.');
            return;
        }

        await canalLogs.send({
            embeds: [embed]
        });

    } catch (error) {
        console.error('Erro ao enviar log:', error);
    }
}

// ==============================
// LOG DE MENSAGEM ENVIADA
// ==============================

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    const embed = new EmbedBuilder()
        .setColor('#5B9FFF')
        .setTitle('💬 Mensagem enviada')
        .addFields(
            {
                name: '👤 Usuário',
                value: `${message.author} (\`${message.author.id}\`)`
            },
            {
                name: '📍 Canal',
                value: `${message.channel}`
            },
            {
                name: '📝 Mensagem',
                value: message.content
                    ? message.content.substring(0, 1024)
                    : '*Sem texto*'
            }
        )
        .setTimestamp();

    await enviarLog(message.guild, embed);
});

// ==============================
// LOG DE MENSAGEM EDITADA
// ==============================

client.on('messageUpdate', async (mensagemAntiga, mensagemNova) => {

    if (!mensagemNova.guild) return;
    if (mensagemNova.author?.bot) return;

    // Se o conteúdo não mudou, ignora
    if (mensagemAntiga.content === mensagemNova.content) return;

    const embed = new EmbedBuilder()
        .setColor('#FFD166')
        .setTitle('✏️ Mensagem editada')
        .addFields(
            {
                name: '👤 Usuário',
                value: mensagemNova.author
                    ? `${mensagemNova.author} (\`${mensagemNova.author.id}\`)`
                    : 'Usuário desconhecido'
            },
            {
                name: '📍 Canal',
                value: `${mensagemNova.channel}`
            },
            {
                name: '📝 Antes',
                value: mensagemAntiga.content
                    ? mensagemAntiga.content.substring(0, 1024)
                    : '*Conteúdo não disponível*'
            },
            {
                name: '✏️ Depois',
                value: mensagemNova.content
                    ? mensagemNova.content.substring(0, 1024)
                    : '*Sem texto*'
            }
        )
        .setTimestamp();

    await enviarLog(mensagemNova.guild, embed);
});

// ==============================
// LOG DE MENSAGEM EXCLUÍDA
// ==============================

client.on('messageDelete', async (message) => {

    if (!message.guild) return;
    if (message.author?.bot) return;

    const embed = new EmbedBuilder()
        .setColor('#FF5B5B')
        .setTitle('🗑️ Mensagem excluída')
        .addFields(
            {
                name: '👤 Usuário',
                value: message.author
                    ? `${message.author} (\`${message.author.id}\`)`
                    : 'Usuário desconhecido'
            },
            {
                name: '📍 Canal',
                value: `${message.channel}`
            },
            {
                name: '📝 Mensagem',
                value: message.content
                    ? message.content.substring(0, 1024)
                    : '*Conteúdo não disponível*'
            }
        )
        .setTimestamp();

    await enviarLog(message.guild, embed);
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);
