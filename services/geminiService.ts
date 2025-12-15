import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
    try {
        const prompt = `Analise as seguintes transações financeiras e forneça insights sobre os hábitos de gastos, sugestões de economia e um resumo da saúde financeira.
        
Dados:
${JSON.stringify(transactions.map(t => ({
    date: t.date,
    desc: t.description,
    amount: t.amount,
    type: t.type,
    cat: t.category
})))}

Responda com um texto formatado em Markdown, de forma clara e objetiva.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Não foi possível gerar insights.";
    } catch (e) {
        console.error("Erro ao gerar insights:", e);
        return "Erro ao conectar com o serviço de IA.";
    }
}