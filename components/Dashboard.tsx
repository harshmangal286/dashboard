
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, Package, DollarSign, RefreshCw, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Info, BrainCircuit, Zap, ExternalLink } from 'lucide-react';
import { getDashboardTrendData } from '../services/gemini';
import { Account } from '../types';

const revenueData = [
  { name: 'Mon', sales: 120, revenue: 450 },
  { name: 'Tue', sales: 150, revenue: 520 },
  { name: 'Wed', sales: 110, revenue: 380 },
  { name: 'Thu', sales: 180, revenue: 690 },
  { name: 'Fri', sales: 220, revenue: 840 },
  { name: 'Sat', sales: 310, revenue: 1150 },
  { name: 'Sun', sales: 280, revenue: 980 },
];

const stats = [
  { label: 'Cumulative Revenue', value: '£4,620', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Active Inventory', value: '142', change: '+5', icon: Package, color: 'text-[#A3E635]', bg: 'bg-[#A3E635]/10' },
  { label: 'Avg. Profit Margin', value: '18.4%', change: '-2.1%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Auto Reposts', value: '12/day', change: 'Stable', icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

interface DashboardProps {
  account: Account;
}

const Dashboard: React.FC<DashboardProps> = ({ account }) => {
  const [trendData, setTrendData] = useState<any>(null);
  const [isTrendsLoading, setIsTrendsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await getDashboardTrendData(account.region);
        setTrendData(data);
      } catch (err) {
        console.error("Dashboard Intelligence Error:", err);
      } finally {
        setIsTrendsLoading(false);
      }
    };
    fetchTrends();
  }, [account]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Hero Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Cockpit Overview</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time performance analytics for <span className="text-[#A3E635]">@{account.username}</span>.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-5 py-2.5 bg-[#111111] border border-[#1A1A1A] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-xl">
            Export Analytics
          </button>
          <button className="px-5 py-2.5 bg-[#A3E635] rounded-2xl text-xs font-black uppercase tracking-widest text-black hover:bg-[#BEF264] transition-all shadow-lg shadow-[#A3E635]/20">
            Sync Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0A0A0A] p-7 rounded-[32px] border border-[#1A1A1A] shadow-xl hover:border-[#A3E635]/30 transition-all group">
            <div className="flex items-center justify-between mb-5">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center tracking-tighter ${
                stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 
                stat.change === 'Stable' ? 'bg-slate-500/10 text-slate-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={12} className="mr-1" /> : 
                 stat.change.startsWith('-') ? <ArrowDownRight size={12} className="mr-1" /> : null}
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-white mt-1.5 leading-none">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0A0A0A] p-8 rounded-[48px] border border-[#1A1A1A] shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Revenue Trajectory</h3>
            <div className="bg-[#111111] p-1 rounded-xl border border-[#1A1A1A] flex space-x-1">
              <button className="px-3 py-1 bg-[#1A1A1A] text-[10px] font-black text-white rounded-lg">7D</button>
              <button className="px-3 py-1 text-[10px] font-black text-slate-500 rounded-lg">30D</button>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3E635" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#A3E635" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #1A1A1A', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'}}
                  itemStyle={{color: '#A3E635', fontWeight: 900, fontSize: '12px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#A3E635" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-8 rounded-[48px] border border-[#1A1A1A] flex flex-col shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Real-time Feed</h3>
          <div className="flex-1 space-y-7 overflow-y-auto scrollbar-hide pr-2">
            {[
              { type: 'sale', title: 'Asset Sold: Vintage Nike Jacket', time: '12m ago', amount: '+£65.00' },
              { type: 'repost', title: 'Injected Repost: Adidas Gazelle', time: '45m ago', amount: 'Live' },
              { type: 'listing', title: 'New Asset: Carhartt Beanie', time: '2h ago', amount: 'Draft' },
              { type: 'sale', title: 'Asset Sold: Stussy Tee Grey', time: '4h ago', amount: '+£25.00' },
              { type: 'repost', title: 'Injected Repost: Levi\'s 501', time: '6h ago', amount: 'Live' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start justify-between border-b border-[#111111] pb-4 group cursor-default">
                <div className="flex items-start">
                  <div className={`mt-1.5 w-2 h-2 rounded-full ring-4 ring-black ${
                    activity.type === 'sale' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : activity.type === 'repost' ? 'bg-[#A3E635]' : 'bg-blue-500'
                  }`}></div>
                  <div className="ml-4">
                    <p className="text-sm font-black text-white leading-none group-hover:text-[#A3E635] transition-colors">{activity.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-[#111111] px-2 py-1 rounded-lg uppercase tracking-tighter">{activity.amount}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-[#111111] border border-[#1A1A1A] rounded-2xl text-[10px] font-black text-slate-500 hover:text-[#A3E635] hover:border-[#A3E635]/30 transition-all uppercase tracking-[0.2em]">
            View Complete Logs
          </button>
        </div>
      </div>

      <div className="mt-16 space-y-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-[#A3E635] rounded-2xl text-black shadow-lg shadow-[#A3E635]/20">
            <BrainCircuit size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Market Intelligence</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Demand Trajectory */}
          <div className="lg:col-span-8 bg-[#0A0A0A] p-10 rounded-[56px] border border-[#1A1A1A] shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp size={240} className="text-[#A3E635]" />
            </div>
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Demand Trajectory</h3>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">Domain-specific demand index for <span className="text-white">region_{account.region}</span>.</p>
              </div>
              {isTrendsLoading && <Loader2 size={24} className="text-[#A3E635] animate-spin" />}
            </div>

            <div className="h-[340px] w-full relative z-10">
              {isTrendsLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="relative">
                     <Loader2 size={64} className="text-[#A3E635] animate-spin opacity-20" />
                     {/* Added missing Zap icon usage */}
                     <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#A3E635] animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Aggregating Market Points...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData?.popularityHistory || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#4B5563', fontSize: 13, fontWeight: 900}} 
                      dy={15}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 13, fontWeight: 900}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #1A1A1A', padding: '15px'}}
                      labelStyle={{color: '#9CA3AF', fontWeight: 900, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="popularity" 
                      stroke="#A3E635" 
                      strokeWidth={6} 
                      dot={{ r: 8, fill: '#A3E635', strokeWidth: 4, stroke: '#050505' }}
                      activeDot={{ r: 12, strokeWidth: 0, fill: '#BEF264' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Strategy Forecast */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#111111] p-10 rounded-[56px] border border-[#1A1A1A] shadow-2xl relative overflow-hidden h-full flex flex-col group">
              <div className="absolute top-0 right-0 p-8 text-[#A3E635]/10 group-hover:scale-125 transition-transform duration-700">
                <Sparkles size={80} />
              </div>
              <div className="relative z-10 flex-1">
                <div className="bg-[#A3E635]/20 p-3 rounded-2xl w-fit mb-8 border border-[#A3E635]/10">
                  <Sparkles size={28} className="text-[#A3E635]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Scalency Forecast</h3>
                <div className="space-y-6">
                  {isTrendsLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-[#1A1A1A] animate-pulse rounded-[10px] w-full"></div>
                      <div className="h-4 bg-[#1A1A1A] animate-pulse rounded-[10px] w-11/12"></div>
                      <div className="h-4 bg-[#1A1A1A] animate-pulse rounded-[10px] w-4/5"></div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-right-10 duration-1000">
                      <p className="text-sm text-slate-400 leading-relaxed font-medium mb-10 italic">
                        "{trendData?.marketSummary}"
                      </p>
                      
                      <div className="pt-8 border-t border-[#1A1A1A]">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5">Strategic Opportunity</p>
                         <div className="flex items-center justify-between bg-[#0A0A0A] p-6 rounded-[28px] border border-[#1A1A1A] hover:border-[#A3E635]/40 transition-all cursor-default shadow-lg">
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-black text-white truncate uppercase tracking-tight">{trendData?.nextHotCategory || "Aggregating..."}</p>
                              <div className="flex items-center mt-2">
                                <ArrowUpRight size={14} className="text-[#A3E635] mr-2" />
                                <p className="text-[9px] text-[#A3E635] font-black uppercase tracking-widest">High Conversions</p>
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-slate-700 ml-4 group-hover:text-[#A3E635] transition-colors">
                               <Package size={24} />
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Dominance Map */}
        <div className="bg-[#0A0A0A] p-10 rounded-[56px] border border-[#1A1A1A] shadow-2xl group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Brand Dominance Map</h3>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">Market sentiment and sales velocity by keyword brand identity.</p>
            </div>
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <div className="w-3 h-3 rounded-full bg-[#A3E635] shadow-[0_0_8px_rgba(163,230,53,0.3)]"></div>
                  <span>Velocity +</span>
               </div>
               <div className="flex items-center space-x-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <div className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]"></div>
                  <span>Market Stable</span>
               </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isTrendsLoading ? (
              <div className="grid grid-cols-1 gap-5">
                 {[1, 2, 3, 4, 5].map(i => (
                   <div key={i} className="w-full h-10 bg-[#111111] animate-pulse rounded-2xl"></div>
                 ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData?.brandTrends || []} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1A1A1A" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="brand" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 900}} 
                    width={100}
                  />
                  <Tooltip 
                    cursor={{fill: '#111111'}}
                    contentStyle={{backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #1A1A1A'}}
                    itemStyle={{color: '#A3E635', fontWeight: 900}}
                  />
                  <Bar dataKey="score" radius={[0, 12, 12, 0]} barSize={28}>
                    {(trendData?.brandTrends || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.growth > 0 ? '#A3E635' : '#1F2937'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Display Market Intelligence Sources as required by Gemini Search Grounding guidelines */}
        {!isTrendsLoading && trendData?.sources?.length > 0 && (
          <div className="p-6 bg-[#0A0A0A] rounded-[32px] border border-[#1A1A1A] shadow-inner">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Verification Sources</h4>
            <div className="flex flex-wrap gap-4">
              {trendData.sources.map((source: any, i: number) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 hover:text-[#A3E635] transition-colors bg-[#111111] px-4 py-2 rounded-xl border border-[#1A1A1A]"
                >
                  <ExternalLink size={12} />
                  <span>{source.title || 'Market Source'}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
