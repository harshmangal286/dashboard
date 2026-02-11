
import React, { useState } from 'react';
import { Shield, Link, UserPlus, Trash2, CheckCircle, Zap, Loader2, Key } from 'lucide-react';
import { runBotTask } from '../services/backend';

const Settings: React.FC = () => {
  const [accounts, setAccounts] = useState([
    { id: '1', username: 'vinted_pro_uk', region: 'UK', status: 'connected' }
  ]);

  const [newAccount, setNewAccount] = useState({ username: '', password: '', region: 'UK' });
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const addAccount = () => {
    if (!newAccount.username || !newAccount.password) {
      alert("Username and password required for Bridge sync.");
      return;
    }
    setAccounts([...accounts, { ...newAccount, id: Date.now().toString(), status: 'pending' }]);
    setNewAccount({ username: '', password: '', region: 'UK' });
  };

  const syncAccount = async (acc: any) => {
    setIsSyncing(acc.id);
    try {
      await runBotTask({
        account_id: acc.id,
        username: acc.username,
        password: acc.password || 'stored_locally',
        mode: 'login'
      });
      setAccounts(accounts.map(a => a.id === acc.id ? {...a, status: 'connected'} : a));
      alert("Session synchronized successfully!");
    } catch (err) {
      alert("Authentication failed. Check your credentials or logs.");
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-1">Configure your real Vinted accounts and Bridge session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Link size={18} className="mr-2 text-teal-600" />
                Vinted Accounts (Real Access)
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Shield size={20} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-bold text-slate-900">@{acc.username}</p>
                      <p className="text-xs text-slate-500">Region: {acc.region} • {acc.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => syncAccount(acc)}
                      disabled={isSyncing === acc.id}
                      className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-100 flex items-center"
                    >
                      {isSyncing === acc.id ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Zap size={14} className="mr-2" />}
                      Sync Session
                    </button>
                    <button 
                      onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Link New Real Account</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Email / Username" 
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                />
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="password" placeholder="Vinted Password" 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <select 
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                  value={newAccount.region}
                  onChange={(e) => setNewAccount({...newAccount, region: e.target.value})}
                >
                  <option value="UK">UK (vinted.co.uk)</option>
                  <option value="FR">FR (vinted.fr)</option>
                  <option value="DE">DE (vinted.de)</option>
                </select>
                <button 
                  onClick={addAccount}
                  className="flex-1 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md shadow-teal-500/20 flex items-center justify-center"
                >
                  <UserPlus size={18} className="mr-2" />
                  Add to Bridge
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
            <h4 className="font-bold mb-2 flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              Session Sync Active
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              When syncing, the Bridge will open a browser window. If Vinted asks for a code or CAPTCHA, solve it in that window to save the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
