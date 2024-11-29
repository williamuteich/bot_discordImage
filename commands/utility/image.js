const { SlashCommandBuilder } = require('discord.js'); // Importa o construtor de Slash Commands
const dotenv = require('dotenv'); // Importa o módulo dotenv
const fetch = require('node-fetch'); // Importa o fetch para fazer as requisições HTTP

dotenv.config(); // Carrega as variáveis de ambiente
const { TOKEN_PRODIA } = process.env; // Carrega o token da API do Prodia

module.exports = {
    data: new SlashCommandBuilder() // Define o comando como um Slash Command
        .setName('imagem') // Define o nome do comando
        .setDescription('Responde com um ID de trabalho para a geração de uma imagem a partir de um prompt') // Define a descrição do comando
        .addStringOption(option => // Define a opção de texto
            option.setName('prompt')  // Define o nome da opção
                .setDescription('Texto que será usado para gerar a imagem') // Define a descrição da opção
                .setRequired(true) // Define que a opção é obrigatória
        ),
    async execute(interaction) {
        try {
            const prompt = interaction.options.getString('prompt'); // Obtém o texto do prompt

            // Inicia a geração da imagem com o prompt
            await interaction.reply("Gerando imagem..."); // Envia uma mensagem de confirmação para o usuário

            // Realiza a requisição para gerar a imagem
            const response = await fetch('https://api.prodia.com/v1/sd/generate', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'X-Prodia-Key': TOKEN_PRODIA // Passa a chave da API como cabeçalho
                },
                body: JSON.stringify({
                    model: 'v1-5-pruned-emaonly.safetensors [d7049739]',
                    prompt: prompt,
                    negative_prompt: 'badly drawn',
                    style_preset: 'cinematic',
                    steps: 20,
                    cfg_scale: 7,
                    seed: -1,
                    upscale: true,
                    sampler: 'DPM++ 2M Karras',
                    width: 512,
                    height: 512
                })
            });

            // Verifica se a resposta da API foi bem-sucedida
            if (!response.ok) {
                console.error('Erro na resposta da API:', response.statusText);
                return await interaction.editReply('Ocorreu um erro ao tentar gerar a imagem.');
            }

            // Obtém o JSON da resposta
            const data = await response.json(); 
            console.log("Resposta da API:", data.job); // Para depuração, pode remover depois

            // Envia o job ID como resposta
            await interaction.editReply(`O ID do trabalho é: ${data.job}`);

        } catch (error) {
            console.error("Erro ao executar o comando Prodia:", error); // Log de erro
            await interaction.editReply('Ocorreu um erro ao tentar gerar a imagem.'); // Envia uma mensagem de erro para o usuário
        }
    }
};
