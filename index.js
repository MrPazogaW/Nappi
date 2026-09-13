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

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!regras') {

        const regras = new EmbedBuilder()
            .setColor('#5B9FFF')
            .setTitle('💙 Seja bem-vindo(a)!')
            .setDescription(
                'Para manter nossa comunidade organizada, segura e agradável para todos, pedimos que leia e respeite as regras abaixo. A convivência fica muito melhor quando todos fazem sua parte! ✨'
            )

            .addFields(
                {
                    name: '🛡️ Regras Gerais',
                    value:
                        '**1.** 🤝 Respeite todos os membros do servidor.\n\n' +
                        '**2.** 🚫 Não é permitido utilizar linguagem *ofensiva, racista, sexista ou discriminatória.*\n\n' +
                        '**3.** 📢 Não é permitido realizar *spam ou flood* de mensagens.\n\n' +
                        '**4.** 📚 Utilize corretamente cada canal de acordo com sua finalidade.\n\n' +
                        '**5.** 🔔 Evite realizar marcações sem motivo ou necessidade.\n\n' +
                        '**6.** 🖼️ Mantenha sua foto de perfil apropriada, sem conteúdo *explícito* ou *excessivamente sugestivo (+18).*'
                },
                {
                    name: '🎨 Regras de Conteúdo',
                    value:
                        '**1.** 🔞 Não é permitido compartilhar *conteúdo explícito ou adulto.*\n\n' +
                        '**2.** 🦠 Não é permitido compartilhar *links maliciosos, vírus ou qualquer conteúdo que possa prejudicar outros membros.*\n\n' +
                        '**3.** ©️ Não é permitido compartilhar conteúdo que viole *direitos autorais.*'
                },
                {
                    name: '🤝 Regras de Conduta',
                    value:
                        '**1.** 💖 Seja respeitoso, educado e cortês com os outros membros.\n\n' +
                        '**2.** 🚫 Não é permitido *assediar, intimidar ou perseguir* outros membros.\n\n' +
                        '**3.** 👤 Não é permitido utilizar nicknames ou avatares *ofensivos, inadequados ou impróprios.*\n\n' +
                        '**4.** 💰 Não é permitido realizar trocas de contas ou dinheiro através deste servidor. Em caso de golpes ou negociações realizadas entre membros, **a equipe não se responsabiliza por perdas ou prejuízos.**'
                },
                {
                    name: '⚖️ Punições',
                    value:
                        'As punições podem variar de acordo com a gravidade da situação:\n\n' +
                        '⚠️ **Advertência**\n\n' +
                        '🔇 **Mute temporário**\n\n' +
                        '⏳ **Banimento temporário**\n\n' +
                        '🔨 **Banimento permanente**'
                }
            )

            .setFooter({
                text: '💙 Nosso objetivo é manter o servidor seguro, divertido e agradável!'
            });

        message.channel.send({
            embeds: [regras]
        });
    }
});

// ==============================
// LOGIN DO BOT
// ==============================

client.login(process.env.TOKEN);
