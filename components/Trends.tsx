
import React, { useState } from 'react';
import { Search, Globe, TrendingUp, Info, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { getMarketTrends } from '../services/gemini';

const Trends: React.FC = () => {
  const [region, setRegion] = useState('UK');
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<{text: string, sources: any[]} | null>(null);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const data = await getMarketTrends(region);
      setTrends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Market Insights</h1>
          <p className="text-slate-500 mt-1">AI-powered trend analysis for Vinted using Google Search.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center">
            <Globe size={16} className="mr-2 text-blue-500" />
            Target Region
          </label>
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          >
            <option value="UK">United Kingdom</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Poland">Poland</option>
            <option value="USA">United States</option>
          </select>
        </div>
        <button 
          onClick={fetchTrends}
          disabled={loading}
          className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <Sparkles size={18} className="mr-2" />
          )}
          Analyze Trends
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
        </div>
      ) : trends ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center mb-6">
                <TrendingUp size={24} className="text-teal-600 mr-3" />
                <h3 className="text-xl font-bold text-slate-900">Trending Analysis for {region}</h3>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {trends.text}
              </div>
            </div>

            {trends.sources.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <Info size={16} className="mr-2 text-slate-500" />
                  Sources & Further Reading
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trends.sources.map((source, i) => (
                    <a 
                      key={i}
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all flex items-center group"
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{source.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{source.uri}</p>
                      </div>
                      <ExternalLink size={14} className="ml-2 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h4 className="font-bold text-emerald-800 mb-2">Power Seller Tip</h4>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Trends change weekly. Consider listing items from these brands on Thursday evenings when user traffic peaks before the weekend.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4">Trending Tags</h4>
              <div className="flex flex-wrap gap-2">
                {['#vintage', '#y2k', '#minimalist', '#streetwear', '#gorpcore', '#coquette', '#oldmoney'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-2xl border border-slate-200 shadow-sm text-center">
          <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Analysis Found</h3>
          <p className="text-slate-500 mt-2">Select a region and click "Analyze Trends" to see what's hot on Vinted right now.</p>
        </div>
      )}
    </div>
  );
};

export default Trends;
