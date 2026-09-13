require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AuditLogEvent
} = require('discord.js');

const express = require('express');

// ==============================
// SERVIDOR DO RENDER
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
// BOT
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
// HORÁRIO DE BRASÍLIA
// ==============================

function horarioBrasil() {
    return new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// ==============================
// ENVIAR LOG
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
// MENSAGEM EDITADA
// ==============================

client.on('messageUpdate', async (mensagemAntiga, mensagemNova) => {

    if (!mensagemNova.guild) return;
    if (mensagemNova.author && mensagemNova.author.bot) return;

    if (mensagemAntiga.content === mensagemNova.content) return;

    const usuario = mensagemNova.author
        ? `${mensagemNova.author}`
        : 'Usuário desconhecido';

    const canal = `${mensagemNova.channel}`;

    const antes = mensagemAntiga.content
        ? mensagemAntiga.content.substring(0, 1000)
        : '*Conteúdo não disponível*';

    const depois = mensagemNova.content
        ? mensagemNova.content.substring(0, 1000)
        : '*Sem texto*';

    const embed = new EmbedBuilder()
        .setColor('#FFC222')
        .setAuthor({
            name: mensagemNova.author
                ? mensagemNova.author.username
                : 'Usuário desconhecido',
            iconURL: mensagemNova.author
                ? mensagemNova.author.displayAvatarURL()
                : undefined
        })
        .setTitle('✏️ Mensagem editada')
        .setDescription(
`
👤 **Usuário:** ${usuario}
📍 **Canal:** ${canal}

**Antes:**
\`\`\`
${antes}
\`\`\`
**Depois:**
\`\`\`
${depois}
\`\`\``
        )
        .setFooter({
            text: `🕐 ${horarioBrasil()}\nID: ${mensagemNova.id}`
        });

    await enviarLog(mensagemNova.guild, embed);
});

// ==============================
// MENSAGEM EXCLUÍDA
// ==============================

client.on('messageDelete', async (message) => {

    if (!message.guild) return;
    if (message.author && message.author.bot) return;

    const usuario = message.author
        ? `${message.author}`
        : 'Usuário desconhecido';

    const canal = `${message.channel}`;

    const conteudo = message.content
        ? message.content.substring(0, 1000)
        : '*Conteúdo não disponível*';

    // ==============================
    // VERIFICAR QUEM EXCLUIU
    // ==============================

    let excluidaPor = null;

    try {
        const logs = await message.guild.fetchAuditLogs({
            type: AuditLogEvent.MessageDelete,
            limit: 10
        });

        const entrada = logs.entries.find(entry => {

            if (!entry.target) return false;

            // A entrada precisa ser do mesmo autor da mensagem
            const mesmoUsuario =
                entry.target.id === message.author?.id;

            // Precisa ser uma exclusão recente
            const recente =
                Date.now() - entry.createdTimestamp < 10000;

            return mesmoUsuario && recente;
        });

        // Só considera como "outra pessoa"
        // se o executor for diferente do autor
        if (
            entrada &&
            entrada.executor &&
            message.author &&
            entrada.executor.id !== message.author.id
        ) {
            excluidaPor = `${entrada.executor}`;
        }

    } catch (error) {
        console.error(
            'Erro ao verificar quem excluiu a mensagem:',
            error
        );
    }

    // ==============================
    // DESCRIÇÃO DO LOG
    // ==============================

    let descricao = `
👤 **Usuário:** ${usuario}
📍 **Canal:** ${canal}`;

    // Só adiciona "Excluída por"
    // quando realmente foi outra pessoa
    if (excluidaPor) {
        descricao += `
👮 **Excluída por:** ${excluidaPor}`;
    }

    descricao += `

**Mensagem:**
\`\`\`
${conteudo}
\`\`\``;

    // ==============================
    // EMBED
    // ==============================

    const embed = new EmbedBuilder()
        .setColor('#9B111E')
        .setAuthor({
            name: message.author
                ? message.author.username
                : 'Usuário desconhecido',
            iconURL: message.author
                ? message.author.displayAvatarURL()
                : undefined
        })
        .setTitle('🗑️ Mensagem excluída')
        .setDescription(descricao)
        .setFooter({
            text: `🕐 ${horarioBrasil()}\nID: ${message.id}`
        });

    await enviarLog(message.guild, embed);
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);
