const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();  // Carrega as variáveis de ambiente do arquivo .env
const fs = require('node:fs');
const path = require('node:path');

// Acessando as variáveis de ambiente diretamente do .env
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN_DISCORD;

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[AVISO] O comando em ${filePath} está faltando as propriedades "data" ou "execute".`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Iniciando a atualização de ${commands.length} comandos (/).`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Comandos (/), totalizando ${data.length}, foram atualizados com sucesso.`);
  } catch (error) {
    console.error(error);
  }
})();
