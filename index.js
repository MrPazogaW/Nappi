require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AuditLogEvent,
    Partials
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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
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

async function enviarLog(guild, embeds, arquivos = []) {
    try {

        const canalLogs = guild.channels.cache.get(
            process.env.LOG_CHANNEL_ID
        );

        if (!canalLogs) {
            console.log('Canal de logs não encontrado.');
            return;
        }

        await canalLogs.send({
            embeds: embeds,
            files: arquivos
        });

    } catch (error) {

        console.error(
            'Erro ao enviar log:',
            error
        );

    }
}

// ==============================
// MENSAGEM EDITADA
// ==============================

client.on('messageUpdate', async (mensagemAntiga, mensagemNova) => {

    try {

        if (!mensagemNova.guild) return;

        if (
            mensagemNova.author &&
            mensagemNova.author.bot
        ) {
            return;
        }

        if (
            mensagemAntiga.content ===
            mensagemNova.content
        ) {
            return;
        }

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
                text:
                    `🕐 ${horarioBrasil()}\n` +
                    `ID: ${mensagemNova.id}`
            });

        await enviarLog(
            mensagemNova.guild,
            [embed]
        );

    } catch (error) {

        console.error(
            'Erro ao registrar mensagem editada:',
            error
        );

    }
});

// ==============================
// MENSAGEM EXCLUÍDA
// ==============================

client.on('messageDelete', async (message) => {

    try {

        if (!message.guild) return;

        if (
            message.author &&
            message.author.bot
        ) {
            return;
        }

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

            const logs =
                await message.guild.fetchAuditLogs({
                    type: AuditLogEvent.MessageDelete,
                    limit: 10
                });

            const entrada =
                logs.entries.find(entry => {

                    if (!entry.target) {
                        return false;
                    }

                    const mesmoUsuario =
                        entry.target.id ===
                        message.author?.id;

                    const mesmoCanal =
                        entry.extra?.channel?.id ===
                        message.channel?.id;

                    const recente =
                        Date.now() -
                        entry.createdTimestamp <
                        10000;

                    return (
                        mesmoUsuario &&
                        mesmoCanal &&
                        recente
                    );

                });

            if (
                entrada &&
                entrada.executor &&
                message.author &&
                entrada.executor.id !==
                message.author.id
            ) {

                excluidaPor =
                    `${entrada.executor}`;

            }

        } catch (error) {

            console.error(
                'Erro ao verificar quem excluiu a mensagem:',
                error
            );

        }

        // ==============================
        // DESCRIÇÃO
        // ==============================

        let descricao = `
👤 **Usuário:** ${usuario}
📍 **Canal:** ${canal}`;

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
        // COPIAR IMAGENS E GIFS
        // ==============================

        const arquivos = [];

        const anexos =
            [...message.attachments.values()];

        for (
            let i = 0;
            i < anexos.length;
            i++
        ) {

            const anexo = anexos[i];

            const nomeOriginal =
                anexo.name ||
                `arquivo-${i + 1}`;

            try {

                const resposta =
                    await fetch(anexo.url);

                if (!resposta.ok) {

                    console.log(
                        `Não foi possível baixar o anexo: ${nomeOriginal}`
                    );

                    continue;
                }

                const buffer =
                    Buffer.from(
                        await resposta.arrayBuffer()
                    );

                arquivos.push({
                    attachment: buffer,
                    name: nomeOriginal
                });

            } catch (error) {

                console.error(
                    `Erro ao salvar o anexo ${nomeOriginal}:`,
                    error
                );

            }
        }

        // ==============================
        // EMBED PRINCIPAL
        // ==============================

        const embeds = [];

        const embedPrincipal =
            new EmbedBuilder()
                .setColor('#9B111E')
                .setAuthor({
                    name: message.author
                        ? message.author.username
                        : 'Usuário desconhecido',

                    iconURL: message.author
                        ? message.author.displayAvatarURL()
                        : undefined
                })
                .setTitle(
                    '🗑️ Mensagem excluída'
                )
                .setDescription(descricao)
                .setFooter({
                    text:
                        `🕐 ${horarioBrasil()}\n` +
                        `ID: ${message.id}`
                });

        embeds.push(embedPrincipal);

        // ==============================
        // MOSTRAR TODAS AS IMAGENS/GIFS
        // ==============================

        for (
            let i = 0;
            i < arquivos.length;
            i++
        ) {

            const arquivo = arquivos[i];

            const ehImagem =
                /\.(png|jpe?g|webp|gif)$/i
                    .test(arquivo.name);

            if (!ehImagem) {
                continue;
            }

            if (i === 0) {

                embedPrincipal.setImage(
                    `attachment://${arquivo.name}`
                );

            } else {

                const embedImagem =
                    new EmbedBuilder()
                        .setColor('#9B111E')
                        .setImage(
                            `attachment://${arquivo.name}`
                        );

                embeds.push(embedImagem);
            }
        }

        // ==============================
        // ENVIAR LOG
        // ==============================

        await enviarLog(
            message.guild,
            embeds,
            arquivos
        );

    } catch (error) {

        console.error(
            'Erro ao registrar mensagem excluída:',
            error
        );

    }
});

// ==============================
// REAÇÃO REMOVIDA
// ==============================

client.on(
    'messageReactionRemove',
    async (reaction, user) => {

        try {

            // Ignorar bots
            if (user.bot) return;

            // ==============================
            // BUSCAR REAÇÃO
            // ==============================

            if (reaction.partial) {

                try {

                    await reaction.fetch();

                } catch (error) {

                    console.error(
                        'Não foi possível buscar a reação:',
                        error
                    );

                    return;
                }
            }

            // ==============================
            // BUSCAR MENSAGEM
            // ==============================

            if (reaction.message.partial) {

                try {

                    await reaction.message.fetch();

                } catch (error) {

                    console.error(
                        'Não foi possível buscar a mensagem da reação:',
                        error
                    );

                    return;
                }
            }

            const message =
                reaction.message;

            if (!message.guild) {
                return;
            }

            // ==============================
            // INFORMAÇÕES
            // ==============================

            const emoji =
                reaction.emoji;

            const nomeEmoji =
                emoji.name ||
                emoji.toString();

            // ==============================
            // CANAL
            // ==============================

            const canalMarcado =
                message.channel
                    ? `<#${message.channel.id}>`
                    : 'Canal desconhecido';

            const nomeCanal =
                message.channel
                    ? `#${message.channel.name}`
                    : 'Canal desconhecido';

            // ==============================
            // EMBED
            // ==============================

            const embed =
                new EmbedBuilder()
                    .setColor('#8A00C4')

                    // FOTO + NOME + ID
                    .setAuthor({
                        name:
                            `${user.username}\n${user.id}`,

                        iconURL:
                            user.displayAvatarURL()
                    })

                    .setDescription(
`
**Canal:**
${canalMarcado}

**Emoji:** ${nomeEmoji}
`
                    )

                    .setFooter({
                        text:
                            `🔴 Reaction Removed • ${nomeCanal}\n` +
                            `${horarioBrasil()}`
                    });

            // ==============================
            // EMOJI NO CANTO SUPERIOR DIREITO
            // ==============================

            if (
                emoji.id &&
                emoji.url
            ) {

                // Emoji personalizado
                embed.setThumbnail(
                    emoji.url
                );

            } else {

                // ==============================
                // EMOJI NORMAL
                // ==============================

                const codigoEmoji =
                    emoji.toString()
                        .codePointAt(0)
                        .toString(16);

                const urlEmoji =
                    `https://cdn.jsdelivr.net/gh/` +
                    `twitter/twemoji@latest/assets/72x72/` +
                    `${codigoEmoji}.png`;

                // Também fica no canto superior direito
                embed.setThumbnail(
                    urlEmoji
                );
            }

            // ==============================
            // ENVIAR LOG
            // ==============================

            await enviarLog(
                message.guild,
                [embed]
            );

        } catch (error) {

            console.error(
                'Erro ao registrar reação removida:',
                error
            );

        }
    }
);

// ==============================
// ERROS DO BOT
// ==============================

client.on(
    'error',
    error => {

        console.error(
            'Erro no cliente Discord:',
            error
        );

    }
);

process.on(
    'unhandledRejection',
    error => {

        console.error(
            'Erro não tratado:',
            error
        );

    }
);

process.on(
    'uncaughtException',
    error => {

        console.error(
            'Exceção não tratada:',
            error
        );

    }
);

// ==============================
// LOGIN
// ==============================

client.login(
    process.env.TOKEN
);
