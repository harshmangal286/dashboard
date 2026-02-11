
import React, { useState } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  Eye, 
  Loader2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  MoreVertical,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Account, Listing } from '../types';
import { runBotTask } from '../services/backend';

const mockListings: Record<string, Listing[]> = {
  'acc_1': [
    { id: '1', title: 'Nike Dunk Low Panda Retro', description: 'Classic B&W Dunks, deadstock condition.', price: 95.00, category: 'Shoes', brand: 'Nike', color: 'Black/White', size: 'UK 9', condition: 'Brand New', status: 'active', repostCount: 2, lastReposted: '2023-10-01', hashtags: ['#nike', '#dunk'] },
    { id: '2', title: 'Vintage Carhartt Detroit Jacket', description: 'Perfect workwear patina, rare find.', price: 185.00, category: 'Jackets', brand: 'Carhartt', color: 'Brown', size: 'L', condition: 'Very good', status: 'active', repostCount: 12, lastReposted: '2023-09-25', hashtags: ['#carhartt', '#vintage'] },
  ],
  'acc_2': [
    { id: '3', title: 'Arc\'teryx Beta LT Shell', description: 'Gore-Tex Pro, lightweight shell.', price: 340.00, category: 'Outerwear', brand: 'Arc\'teryx', color: 'Black', size: 'S', condition: 'New with tags', status: 'sold', repostCount: 1, lastReposted: '2023-09-30', hashtags: ['#arcteryx', '#techwear'] },
  ]
};

interface InventoryProps {
  account: Account;
}

const Inventory: React.FC<InventoryProps> = ({ account }) => {
  const [repostingId, setRepostingId] = useState<string | null>(null);
  const listings = mockListings[account.id] || [];

  const handleRepost = async (id: string) => {
    setRepostingId(id);
    try {
      // Security Check: Waiting Between Posts (Simulated)
      const lastPostMinutesAgo = 5; 
      if (lastPostMinutesAgo < account.settings.minDelayBetweenPosts) {
        alert(
          `Bridge Security Protocol: The minimum delay of ${account.settings.minDelayBetweenPosts}min for @${account.username} has not elapsed.\n\n` +
          `Time remaining: ${account.settings.minDelayBetweenPosts - lastPostMinutesAgo} minutes.`
        );
        setRepostingId(null);
        return;
      }

      await runBotTask({
        account_id: account.id,
        username: account.username,
        mode: 'repost_specific',
        item_id: id
      });
      alert(`Asset ${id} successfully pushed to the top of Vinted listings.`);
    } catch (err) {
      console.error(err);
      alert("Bridge failed the repost command. Verify session status in logs.");
    } finally {
      setRepostingId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Search and Cockpit Filters */}
      <div className="flex items-end justify-between bg-[#0A0A0A] p-10 rounded-[56px] border border-[#1A1A1A] shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Active Inventory</h1>
          <p className="text-slate-500 font-medium">Managing real-time stock orchestration for <span className="text-[#A3E635] font-black">@{account.username}</span></p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#A3E635] transition-colors" size={18} />
            <input 
              type="text" placeholder="Filter by title..." 
              className="bg-[#111111] border border-[#1A1A1A] rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white focus:border-[#A3E635] outline-none transition-all w-72" 
            />
          </div>
          <button className="bg-[#111111] border border-[#1A1A1A] p-3.5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-[#1A1A1A]">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Account Listings Grid */}
      <div className="grid grid-cols-1 gap-5">
        {listings.length === 0 ? (
          <div className="text-center py-28 bg-[#0A0A0A] rounded-[56px] border border-[#1A1A1A] shadow-inner">
            <Package size={80} className="mx-auto text-slate-900 mb-6 animate-pulse" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em]">No listings identified for this profile</p>
          </div>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="bg-[#0A0A0A] hover:bg-[#0E0E0E] p-6 rounded-[40px] border border-[#1A1A1A] transition-all flex items-center group relative overflow-hidden shadow-lg border-l-4 border-l-transparent hover:border-l-[#A3E635]">
              <div className="w-24 h-24 rounded-3xl bg-[#111111] border border-[#1A1A1A] shrink-0 overflow-hidden relative shadow-2xl">
                 <img src={`https://picsum.photos/seed/${item.id}/300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                 {item.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest border-2 border-white/20 px-2 py-0.5 rounded-lg">Sold</span>
                    </div>
                 )}
              </div>
              
              <div className="ml-8 flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-black text-white truncate uppercase tracking-tight">{item.title}</p>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${item.status === 'active' ? 'bg-[#A3E635]/10 text-[#A3E635]' : 'bg-slate-900 text-slate-600'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center space-x-6 mt-3">
                   <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-widest bg-[#111111] px-2.5 py-1 rounded-lg">
                      <span className="text-slate-700 mr-2">BRAND:</span> {item.brand}
                   </div>
                   <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-widest bg-[#111111] px-2.5 py-1 rounded-lg">
                      <span className="text-slate-700 mr-2">SIZE:</span> {item.size}
                   </div>
                   <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight flex items-center">
                     <RefreshCw size={12} className="mr-2 opacity-30" /> Reposted {item.repostCount} times
                   </p>
                </div>
              </div>

              <div className="px-10 border-x border-[#1A1A1A] h-12 flex items-center mx-6">
                 <span className="text-3xl font-black text-white leading-none">£{item.price.toFixed(0)}</span>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button 
                  onClick={() => handleRepost(item.id)}
                  disabled={repostingId === item.id || item.status === 'sold'}
                  className={`px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center space-x-3 ${
                    repostingId === item.id 
                    ? 'bg-[#A3E635] text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]' 
                    : 'bg-[#111111] text-slate-500 hover:text-[#A3E635] hover:bg-[#A3E635]/5 border border-[#1A1A1A]'
                  }`}
                >
                  {repostingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  <span>Push Asset</span>
                </button>
                <button className="p-4 bg-[#111111] text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-[#1A1A1A]">
                  <Trash2 size={24} />
                </button>
              </div>
              
              {/* Tooltip for performance (Example) */}
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ExternalLink size={14} className="text-slate-700 hover:text-[#A3E635] cursor-pointer" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safety Protocol Active Status */}
      <div className="bg-[#111111]/50 border border-[#1A1A1A] p-8 rounded-[40px] flex items-start space-x-5 shadow-inner">
         <div className="p-3 bg-yellow-500/10 rounded-2xl">
           <AlertTriangle size={24} className="text-yellow-500" />
         </div>
         <div>
            <h4 className="text-base font-black text-white uppercase tracking-tight leading-none">Bridge Safety Protocol Active</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl font-medium">
              Manual and automated push commands respect your global safety delay of <span className="text-[#A3E635] font-black">{account.settings.minDelayBetweenPosts} minutes</span>. 
              This behavior pattern prevents shadowbans and behavioral flags on your Vinted profiles.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Inventory;
