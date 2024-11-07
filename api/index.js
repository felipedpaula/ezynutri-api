import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

// Configuração do OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {

    // Lista de origens permitidas
    const allowedOrigins = ['https://ezynutri.vercel.app', 'http://localhost:3000'];
    const origin = req.headers.origin;

    // Configura os cabeçalhos de CORS dinamicamente
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Lida com a requisição OPTIONS (preflight) para CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Implementação do endpoint
    if (req.method === 'POST') {
        const { dados } = req.body;
     
        try {
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
    
                Forneça um plano alimentar que siga essas diretrizes com refeições equilibradas e saudáveis para cada período do dia. Estruture a resposta em um texto simples.
            `;
    
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
    
            res.status(200).json({ dieta: response.choices[0].message.content.trim() });
        } catch (error) {
            console.error('Erro ao gerar a dieta:', error);
            res.status(500).json({ error: 'Erro ao gerar a dieta' });
        }
        
    } else {
        res.status(405).json({ error: 'Método não permitido' });
    }
}
