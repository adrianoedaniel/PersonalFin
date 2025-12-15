import React, { useState } from 'react';
import { Transaction } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Actually, we'll use a simple parser or just whitespace-pre-wrap to avoid deps. Prompt requested popular libs but let's keep it robust with CSS.

interface AIAdvisorProps {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = async () => {
    setIsLoading(true);
    const result = await getFinancialInsights(transactions);
    setInsight(result);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start space-y-6 max-w-4xl mx-auto w-full">
      <div className="text-center space-y-2 mt-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4">
          <Bot size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Consultor Financeiro AI</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Utilize a inteligência artificial do Gemini para analisar seus gastos, encontrar padrões e receber dicas personalizadas.
        </p>
      </div>

      {!insight && !isLoading && (
        <button 
          onClick={generateInsight}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-900 font-lg rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
        >
          <Sparkles className="mr-2 group-hover:animate-pulse" size={20} />
          Gerar Análise Financeira
        </button>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium animate-pulse">Analisando suas finanças...</p>
        </div>
      )}

      {insight && !isLoading && (
        <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-indigo-100 flex justify-between items-center">
             <div className="flex items-center gap-2 text-indigo-800 font-semibold">
                <Sparkles size={18} />
                <span>Relatório Inteligente</span>
             </div>
             <button 
                onClick={generateInsight}
                className="text-indigo-400 hover:text-indigo-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
                title="Regerar"
             >
                <RefreshCw size={18} />
             </button>
           </div>
           <div className="p-8 prose prose-slate max-w-none text-slate-700 leading-relaxed">
             {/* Simple markdown rendering for key elements since we are avoiding complex deps if possible, but let's assume raw text is fine with whitespace */}
             <div className="whitespace-pre-line font-medium text-base">
                {insight}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;