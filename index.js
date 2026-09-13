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
// FUNÇÃO PARA ENVIAR LOG
// ==============================

async function enviarLog(guild, embed) {
    try {
        const canalLogs = guild.channels.cache.get(
            process.env.LOG_CHANNEL_ID
        );

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
// LOG DE MENSAGEM EDITADA
// ==============================

client.on('messageUpdate', async (mensagemAntiga, mensagemNova) => {

    if (!mensagemNova.guild) return;
    if (mensagemNova.author?.bot) return;

    // Ignora alterações que não mudaram o texto
    if (mensagemAntiga.content === mensagemNova.content) return;

    const usuario = mensagemNova.author
        ? `${mensagemNova.author}`
        : 'Usuário desconhecido';

    const idUsuario = mensagemNova.author
        ? mensagemNova.author.id
        : 'Desconhecido';

    const canal = `${mensagemNova.channel}`;

    const antes = mensagemAntiga.content
        ? mensagemAntiga.content.substring(0, 1000)
        : '*Conteúdo não disponível*';

    const depois = mensagemNova.content
        ? mensagemNova.content.substring(0, 1000)
        : '*Sem texto*';

    const embed = new EmbedBuilder()
        .setColor('#FFDE21')
        .setDescription(
`✏️ **Mensagem editada**

👤 **Usuário:** ${usuario}
📍 **Canal:** ${canal}

**Antes:**
\`\`\`
${antes}
\`\`\`

**Depois:**
\`\`\`
${depois}
\`\`\`

🕐 **Horário:** <t:${Math.floor(Date.now() / 1000)}:F>

-# ID: \`${idUsuario}\``
        );

    await enviarLog(mensagemNova.guild, embed);
});

// ==============================
// LOG DE MENSAGEM EXCLUÍDA
// ==============================

client.on('messageDelete', async (message) => {

    if (!message.guild) return;
    if (message.author?.bot) return;

    const usuario = message.author
        ? `${message.author}`
        : 'Usuário desconhecido';

    const idUsuario = message.author
        ? message.author.id
        : 'Desconhecido';

    const canal = `${message.channel}`;

    const conteudo = message.content
        ? message.content.substring(0, 1000)
        : '*Conteúdo não disponível*';

    const embed = new EmbedBuilder()
        .setColor('#9B111E')
        .setDescription(
`🗑️ **Mensagem excluída**

👤 **Usuário:** ${usuario}
📍 **Canal:** ${canal}

**Mensagem:**
\`\`\`
${conteudo}
\`\`\`

🕐 **Horário:** <t:${Math.floor(Date.now() / 1000)}:F>

-# ID: \`${idUsuario}\``
        );

    await enviarLog(message.guild, embed);
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);
