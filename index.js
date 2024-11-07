// index.js
import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3000;

// Configuração do OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware para processar JSON
app.use(express.json());

/**
 * Rota para gerar uma dieta personalizada
 */
app.post('/gerar-dieta', async (req, res) => {
    try {
        const { dados } = req.body;

        // Configuração do prompt para geração da dieta
        const prompt = `
            Crie uma dieta personalizada com base nas seguintes informações:

            - TDEE: ${dados.tdee || 'não calculado'}
            - Calorias Objetivo:
                - Bulking: ${dados.caloriasObjetivo.bulking} kcal
                - Cutting: ${dados.caloriasObjetivo.cutting} kcal
                - Manutenção: ${dados.caloriasObjetivo.manutencao} kcal

            - Distribuição de Macronutrientes:
                - Bulking:
                    - Carboidratos: ${dados.macronutrientes.bulking.carboidratosGramas}g (${dados.macronutrientes.bulking.carboidratosCalorias} kcal)
                    - Gorduras: ${dados.macronutrientes.bulking.gorduraGramas}g (${dados.macronutrientes.bulking.gorduraCalorias} kcal)
                    - Proteínas: ${dados.macronutrientes.bulking.proteinaGramas}g (${dados.macronutrientes.bulking.proteinaCalorias} kcal)
                - Cutting:
                    - Carboidratos: ${dados.macronutrientes.cutting.carboidratosGramas}g (${dados.macronutrientes.cutting.carboidratosCalorias} kcal)
                    - Gorduras: ${dados.macronutrientes.cutting.gorduraGramas}g (${dados.macronutrientes.cutting.gorduraCalorias} kcal)
                    - Proteínas: ${dados.macronutrientes.cutting.proteinaGramas}g (${dados.macronutrientes.cutting.proteinaCalorias} kcal)
                - Manutenção:
                    - Carboidratos: ${dados.macronutrientes.manutencao.carboidratosGramas}g (${dados.macronutrientes.manutencao.carboidratosCalorias} kcal)
                    - Gorduras: ${dados.macronutrientes.manutencao.gorduraGramas}g (${dados.macronutrientes.manutencao.gorduraCalorias} kcal)
                    - Proteínas: ${dados.macronutrientes.manutencao.proteinaGramas}g (${dados.macronutrientes.manutencao.proteinaCalorias} kcal)

            - Objetivo: ${dados.objetivo}
            - Quantidade de refeições diárias: ${dados.quantidadeRefeicoes}
            - Alimentos a evitar: ${dados.alimentosIndesejados.join(', ')}

            Forneça um plano alimentar que siga essas diretrizes com refeições equilibradas e saudáveis para cada período do dia. Estruture a resposta em um texto simples, não Markdown.
        `;

        // Chamada para o OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente especializado em nutrição que cria dietas personalizadas."
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        // Envio da resposta da API com a dieta gerada
        res.json({ dieta: response.choices[0].message.content.trim() });

    } catch (error) {
        console.error('Erro ao gerar a dieta:', error);
        res.status(500).json({ error: 'Erro ao gerar a dieta' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em https://ezynutri-api.vercel.app/:${port}`);
});
