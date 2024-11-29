const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();
const { TOKEN_PRODIA } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagem')
        .setDescription('Responde com uma imagem gerada a partir de um prompt')
        .addStringOption(option => 
            option.setName('prompt')
                .setDescription('Texto que será usado para gerar a imagem')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const prompt = interaction.options.getString('prompt');

            await interaction.reply("Gerando imagem...");

            const response = await fetch('https://api.prodia.com/v1/sd/generate', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'X-Prodia-Key': TOKEN_PRODIA
                },
                body: JSON.stringify({
                    model: 'absolutereality_v181.safetensors [3d9d4d2b]',
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

            const data = await response.json();

            if (!response.ok) {
                console.error('Erro na resposta da API:', response.statusText);
                return await interaction.editReply('Ocorreu um erro ao tentar gerar a imagem.');
            }

            if (data.status === "queued" || data.status === "generating") {
                const url = `https://api.prodia.com/v1/job/${data.job}`;
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'X-Prodia-Key': TOKEN_PRODIA
                    }
                };

                const checkJobStatus = async () => {
                    const jobResponse = await fetch(url, options);
                    const jobData = await jobResponse.json();
                    console.log('Status do Job:', jobData);

                    if (jobData.status === 'succeeded' && jobData.imageUrl) {
                        await interaction.editReply(`Aqui está a imagem gerada: ${jobData.imageUrl}`);
                    } 
                    else if (jobData.status !== 'queued' && jobData.status !== 'generating') {
                        await interaction.editReply('Ocorreu um erro ao gerar a imagem.');
                    } 
                    else {
                        setTimeout(checkJobStatus, 5000);
                    }
                };

                await checkJobStatus();
            } else {
                await interaction.editReply('A imagem não pôde ser gerada devido a um erro desconhecido.');
            }

        } catch (error) {
            console.error("Erro ao executar o comando Prodia:", error);
            await interaction.editReply('Ocorreu um erro ao tentar gerar a imagem.');
        }
    }
};
