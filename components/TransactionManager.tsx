import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Plus, Trash2, Search, ArrowUpCircle, ArrowDownCircle, Sparkles, X, Filter, Calendar } from 'lucide-react';
import { categorizeTransaction } from '../services/geminiService';

interface TransactionManagerProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, onAddTransaction, onDeleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Filtro
  const [filterType, setFilterType] = useState('all'); // all, 7days, thisMonth, lastMonth, thisYear, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleAutoCategorize = async () => {
      if (!description) return;
      setIsAutoCategorizing(true);
      const suggestedCategory = await categorizeTransaction(description);
      setCategory(suggestedCategory);
      setIsAutoCategorizing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
      type,
      category: category || 'Outros',
      date
    };

    onAddTransaction(newTransaction);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const filteredTransactions = transactions.filter(t => {
    // Filtro de Texto
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de Data
    let matchesDate = true;
    if (filterType !== 'all') {
        const [tYear, tMonth, tDay] = t.date.split('-').map(Number);
        // Cria data local (00:00:00) para evitar problemas de fuso horário na comparação
        const tDate = new Date(tYear, tMonth - 1, tDay);
        tDate.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);

        if (filterType === '7days') {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            matchesDate = tDate >= sevenDaysAgo && tDate <= today;
        } else if (filterType === 'thisMonth') {
            matchesDate = tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
        } else if (filterType === 'lastMonth') {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            matchesDate = tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
        } else if (filterType === 'thisYear') {
            matchesDate = tDate.getFullYear() === today.getFullYear();
        } else if (filterType === 'custom') {
            if (customStart) {
                const [sYear, sMonth, sDay] = customStart.split('-').map(Number);
                const sDate = new Date(sYear, sMonth - 1, sDay);
                sDate.setHours(0,0,0,0);
                if (tDate < sDate) matchesDate = false;
            }
            if (customEnd) {
                const [eYear, eMonth, eDay] = customEnd.split('-').map(Number);
                const eDate = new Date(eYear, eMonth - 1, eDay);
                eDate.setHours(0,0,0,0);
                if (tDate > eDate) matchesDate = false;
            }
        }
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4">
        {/* Header e Busca */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Transações</h2>
          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Nova Transação</span><span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 text-slate-500 mr-2">
              <Filter size={18} />
              <span className="text-sm font-medium">Período:</span>
           </div>
           
           <select 
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
           >
             <option value="all">Todas as datas</option>
             <option value="7days">Últimos 7 dias</option>
             <option value="thisMonth">Este Mês</option>
             <option value="lastMonth">Mês Passado</option>
             <option value="thisYear">Este Ano</option>
             <option value="custom">Personalizado</option>
           </select>

           {filterType === 'custom' && (
             <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                   <span className="text-xs text-slate-400">De</span>
                   <input 
                      type="date" 
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-transparent text-sm text-slate-700 focus:outline-none"
                   />
                </div>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                   <span className="text-xs text-slate-400">Até</span>
                   <input 
                      type="date" 
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-transparent text-sm text-slate-700 focus:outline-none"
                   />
                </div>
             </div>
           )}
           
           {(filterType !== 'all' || searchTerm) && (
              <div className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                <span>{filteredTransactions.length} resultado(s)</span>
              </div>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-slate-100">
        {filteredTransactions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            {filterType === 'all' && !searchTerm ? (
                <Calendar size={48} className="mb-2 opacity-20" />
            ) : (
                <Search size={48} className="mb-2 opacity-20" />
            )}
            <p>Nenhuma transação encontrada</p>
            {(filterType !== 'all' || searchTerm) && (
                <button 
                  onClick={() => { setFilterType('all'); setSearchTerm(''); }}
                  className="mt-2 text-indigo-500 hover:text-indigo-700 text-sm font-medium"
                >
                    Limpar filtros
                </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
             {filteredTransactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                       {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{t.category}</span>
                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                    {/* Mobile delete button always visible or handled via swipe? Keeping it simple for now, using group-hover which works on tap on mobile mostly or just making it visible on mobile via css logic if needed, but let's leave opacity logic for desktop mouse users and simple visibility for mobile if we change opacity-0 to sm:opacity-0 */}
                    <button 
                      onClick={() => onDeleteTransaction(t.id)}
                      className="sm:hidden text-slate-300 hover:text-rose-500"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Nova Transação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Receita
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Despesa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Descrição</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Ex: Supermercado"
                    required
                  />
                  {description && (
                    <button 
                        type="button"
                        onClick={handleAutoCategorize}
                        disabled={isAutoCategorizing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:bg-indigo-50 p-1 rounded-full transition-colors"
                        title="Sugerir categoria com AI"
                    >
                        {isAutoCategorizing ? <span className="animate-spin text-xs">⌛</span> : <Sparkles size={16} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Ex: Alimentação"
                />
              </div>

              <button 
                type="submit" 
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
              >
                Salvar Transação
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;