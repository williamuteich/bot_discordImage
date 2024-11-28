const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const TOKEN_DISCORD = process.env.TOKEN_DISCORD;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);  

    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`Comando ${file} está faltando 'data' ou 'execute'`);
    }
  }
}

client.on(Events.ClientReady, () => {
  console.log(`Bot Artbreeder está online! ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Comando ${interaction.commandName} não encontrado.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
    }
  }
});

client.login(TOKEN_DISCORD);
