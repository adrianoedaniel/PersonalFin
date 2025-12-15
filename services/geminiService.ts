import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) {
    return "Ainda não há transações suficientes para gerar uma análise. Adicione algumas receitas e despesas!";
  }

  // Format transactions for the prompt to save tokens and be clear
  const transactionSummary = transactions.map(t => 
    `- ${t.date}: ${t.description} (${t.category}) - R$ ${t.amount.toFixed(2)} [${t.type === 'income' ? 'RECEITA' : 'DESPESA'}]`
  ).join('\n');

  const prompt = `
    Analise as seguintes transações financeiras pessoais:

    ${transactionSummary}

    Por favor, forneça uma análise curta e direta em Markdown (PT-BR) contendo:
    1. Um resumo breve dos hábitos de consumo.
    2. Identificação de categorias onde o gasto parece excessivo.
    3. Três dicas práticas e acionáveis para economizar dinheiro com base nesses dados específicos.
    
    Use um tom amigável, motivador e profissional. Use emojis moderadamente.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro pessoal experiente e empático. Seu objetivo é ajudar o usuário a melhorar sua saúde financeira.",
      }
    });
    
    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ocorreu um erro ao conectar com o assistente financeiro. Verifique sua conexão ou tente novamente mais tarde.";
  }
};

export const categorizeTransaction = async (description: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Categorize a transação financeira: "${description}". Responda APENAS com uma única palavra que melhor represente a categoria (ex: Alimentação, Transporte, Lazer, Saúde, Moradia, Salário, Outros).`,
        });
        return response.text?.trim() || "Outros";
    } catch (e) {
        return "Outros";
    }
}