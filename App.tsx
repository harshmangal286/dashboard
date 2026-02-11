
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  TrendingUp, 
  Terminal, 
  Settings as SettingsIcon, 
  ChevronDown,
  MessageSquare,
  Sparkles,
  HelpCircle,
  User,
  Zap,
  PlusCircle,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { View, Account } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ListingForm from './components/ListingForm';
import Trends from './components/Trends';
import Logs from './components/Logs';
import Settings from './components/Settings';
import { checkBackendHealth } from './services/backend';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  
  // Scalency Cockpit Multi-Account State
  const [accounts, setAccounts] = useState<Account[]>([
    { 
      id: 'acc_1', 
      username: 'vinted_pro_uk', 
      region: 'UK', 
      status: 'connected', 
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      settings: { minDelayBetweenPosts: 15 }
    },
    { 
      id: 'acc_2', 
      username: 'resell_fr_master', 
      region: 'FR', 
      status: 'connected', 
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
      settings: { minDelayBetweenPosts: 20 }
    }
  ]);
  const [activeAccountId, setActiveAccountId] = useState<string>(accounts[0].id);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  useEffect(() => {
    const check = async () => {
      const isOnline = await checkBackendHealth();
      setIsBackendOnline(isOnline);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccountSwitch = (id: string) => {
    setActiveAccountId(id);
    setIsAccountDropdownOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#E5E7EB] overflow-hidden font-sans">
      {/* Sidebar Cockpit - Refined UI */}
      <aside className="w-72 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col z-30 shrink-0">
        <div className="p-6 space-y-6">
          {/* Account Profile Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-[#111111] hover:bg-[#1A1A1A] rounded-2xl transition-all border border-[#1A1A1A]"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex-shrink-0 overflow-hidden border border-[#2A2A2A]">
                  <img src={activeAccount.avatarUrl} alt="Avatar" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{activeAccount.username}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">Context: {activeAccount.region}</p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAccountDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#1A1A1A] rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Switch Account</p>
                {accounts.map(acc => (
                  <button 
                    key={acc.id}
                    onClick={() => handleAccountSwitch(acc.id)}
                    className={`w-full flex items-center space-x-3 p-3 hover:bg-[#1A1A1A] transition-colors ${acc.id === activeAccountId ? 'bg-[#1A1A1A]/50' : ''}`}
                  >
                    <img src={acc.avatarUrl} className="w-8 h-8 rounded-lg" alt="" />
                    <div className="text-left">
                       <span className="text-sm font-medium block leading-none">{acc.username}</span>
                       <span className="text-[9px] text-slate-500">{acc.region}</span>
                    </div>
                  </button>
                ))}
                <div className="h-px bg-[#1A1A1A] my-2" />
                <button 
                  onClick={() => { setCurrentView(View.SETTINGS); setIsAccountDropdownOpen(false); }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-[#1A1A1A] text-[#A3E635] transition-colors"
                >
                  <PlusCircle size={18} />
                  <span className="text-sm font-bold">Import Account</span>
                </button>
              </div>
            )}
          </div>

          {/* New Publication - Hero Button */}
          <button 
            onClick={() => setCurrentView(View.LISTING_NEW)}
            className="w-full bg-[#A3E635] hover:bg-[#BEF264] text-black font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-[#A3E635]/10 transition-all transform active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span className="text-sm uppercase tracking-tight font-black">New Publication</span>
          </button>
        </div>

        {/* Cockpit Navigation Categories */}
        <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto scrollbar-hide">
          <div>
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Dashboard</p>
            <div className="space-y-1">
              {[
                { name: 'Home', view: View.DASHBOARD, icon: LayoutDashboard },
                { name: 'Listings', view: View.INVENTORY, icon: Package },
                { name: 'AI Messages', view: View.CHAT, icon: MessageSquare },
                { name: 'Market Trends', view: View.TRENDS, icon: TrendingUp },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                    currentView === item.view 
                    ? 'bg-[#A3E635]/10 text-[#A3E635] font-bold' 
                    : 'text-slate-500 hover:bg-[#111111] hover:text-white'
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Settings</p>
            <div className="space-y-1">
              {[
                { name: 'Account & Plan', view: View.SETTINGS, icon: User },
                { name: 'AI Personalization', view: View.IMAGE_IA, icon: Sparkles },
                { name: 'Support & Logs', view: View.LOGS, icon: HelpCircle },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                    currentView === item.view 
                    ? 'bg-white/5 text-white font-bold' 
                    : 'text-slate-600 hover:bg-[#111111] hover:text-white'
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  <span className="text-sm">{item.name}</span>
                  {item.view === View.LOGS && <ChevronDown size={14} className="ml-auto opacity-30 group-hover:opacity-100" />}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Bridge Health Footer */}
        <div className="p-6 border-t border-[#1A1A1A] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
               <div className={`w-2 h-2 rounded-full mr-2 ${isBackendOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Bridge Status: {isBackendOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button className="text-slate-600 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Orchestrator Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        <header className="h-16 border-b border-[#1A1A1A] px-8 flex items-center justify-between shrink-0 bg-[#080808]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center space-x-4">
             <h2 className="text-lg font-black text-white tracking-tight uppercase">
               {currentView.replace('_', ' ')}
             </h2>
             <div className="h-4 w-px bg-[#1A1A1A]"></div>
             <p className="text-xs font-bold text-slate-500">Active Profile: <span className="text-[#A3E635]">@{activeAccount.username}</span></p>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="relative group px-2">
                <Search size={18} className="text-slate-500 group-hover:text-white cursor-pointer transition-colors" />
             </div>
             <div className="relative">
                <Bell size={20} className="text-slate-500 hover:text-white cursor-pointer" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#A3E635] rounded-full ring-2 ring-[#050505]"></div>
             </div>
             <div className="flex -space-x-2">
                {accounts.map(acc => (
                  <div key={acc.id} className={`w-8 h-8 rounded-lg border-2 border-[#050505] overflow-hidden ring-1 ${acc.id === activeAccountId ? 'ring-[#A3E635]' : 'ring-transparent opacity-100'}`}>
                    <img src={acc.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#050505] scrollbar-thin scrollbar-thumb-[#1A1A1A]">
          <div className="max-w-6xl mx-auto">
            {currentView === View.DASHBOARD && <Dashboard account={activeAccount} />}
            {currentView === View.INVENTORY && <Inventory account={activeAccount} />}
            {currentView === View.LISTING_NEW && <ListingForm account={activeAccount} onSuccess={() => setCurrentView(View.INVENTORY)} />}
            {currentView === View.TRENDS && <Trends />}
            {currentView === View.LOGS && <Logs />}
            {currentView === View.SETTINGS && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
