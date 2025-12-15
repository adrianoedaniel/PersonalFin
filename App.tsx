import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, FinancialSummary, AppTab } from './types';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import AIAdvisor from './components/AIAdvisor';
import { LayoutDashboard, List, BrainCircuit, Wallet, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('financas-ai-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('financas-ai-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: AppTab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full sm:w-auto ${
        activeTab === tab 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Wallet size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Finanças AI
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden sm:flex items-center gap-2">
              <NavItem tab={AppTab.DASHBOARD} icon={LayoutDashboard} label="Visão Geral" />
              <NavItem tab={AppTab.TRANSACTIONS} icon={List} label="Transações" />
              <NavItem tab={AppTab.ADVISOR} icon={BrainCircuit} label="Consultor AI" />
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white p-4 space-y-2 shadow-lg animate-in slide-in-from-top-4 duration-200 absolute w-full z-40">
            <NavItem tab={AppTab.DASHBOARD} icon={LayoutDashboard} label="Visão Geral" />
            <NavItem tab={AppTab.TRANSACTIONS} icon={List} label="Transações" />
            <NavItem tab={AppTab.ADVISOR} icon={BrainCircuit} label="Consultor AI" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === AppTab.DASHBOARD && (
          <Dashboard transactions={transactions} summary={summary} />
        )}
        {activeTab === AppTab.TRANSACTIONS && (
          <TransactionManager 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
        {activeTab === AppTab.ADVISOR && (
          <AIAdvisor transactions={transactions} />
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Finanças AI. Powered by Google Gemini.
         </div>
      </footer>
    </div>
  );
};

export default App;