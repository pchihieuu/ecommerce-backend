"use strict";

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged is as  ${client.user.tag}`);
});
const token = process.env.TOKEN_DISCORD_BOT;

client.login(token);

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (msg.content.toLocaleLowerCase() === "hello") {
    msg.reply(`Hello, can I help you!`);
  }
});
