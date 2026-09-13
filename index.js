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
            .setDescription(
`*💙 Seja bem-vindo(a)!*

*Para manter nossa comunidade organizada, segura e agradável para todos, pedimos que leia e respeite as regras abaixo. A convivência fica muito melhor quando todos fazem sua parte!* ✨

## 🛡️ Regras Gerais

**1.** 🤝 Respeite todos os membros do servidor.

**2.** 🚫 Não é permitido utilizar linguagem *ofensiva, racista, sexista ou discriminatória.*

**3.** 📢 Não é permitido realizar *spam ou flood* de mensagens.

**4.** 📚 Utilize corretamente cada canal de acordo com sua finalidade.

**5.** 🔔 Evite realizar marcações sem motivo ou necessidade.

**6.** 🖼️ Mantenha sua foto de perfil apropriada, sem conteúdo *explícito* ou *excessivamente sugestivas (+18)*

## 🎨 Regras de Conteúdo

**1.** 🔞 Não é permitido compartilhar *conteúdo explícito ou adulto.*

**2.** 🦠 Não é permitido compartilhar *links maliciosos, vírus ou qualquer conteúdo que possa prejudicar outros membros.*

**3.** ©️ Não é permitido compartilhar conteúdo que viole *direitos autorais.*

## 🤝 Regras de Conduta

**1.** 💖 Seja respeitoso, educado e cortês com os outros membros.

**2.** 🚫 Não é permitido *assediar, intimidar ou perseguir* outros membros.

**3.** 👤 Não é permitido utilizar nicknames ou avatares *ofensivos, inadequados ou impróprios.*

**4.** 💰 Não é permitido realizar trocas de contas ou dinheiro através deste servidor. Em caso de golpes ou negociações realizadas entre membros, **a equipe não se responsabiliza por perdas ou prejuízos.**

## ⚖️ Punições

*As punições podem variar de acordo com a gravidade da situação:*

⚠️ **Advertência**

🔇 **Mute temporário**

⏳ **Banimento temporário**

🔨 **Banimento permanente**

> 💙 *Nosso objetivo não é punir, mas manter o servidor um lugar seguro, divertido e agradável para todos.*

🌟 *Esperamos que você aproveite o servidor, faça novas amizades e tenha uma ótima experiência por aqui!*

✨ *Obrigado por fazer parte da nossa comunidade!* 💙`
            );

        message.channel.send({
            embeds: [regras]
        });
    }
});

client.login(process.env.TOKEN);
