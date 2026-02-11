
import React, { useState, useEffect } from 'react';
import { Terminal, Download, Trash2, Search, Play, Pause, RefreshCw } from 'lucide-react';
import { getBackendLogs } from '../services/backend';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    if (isPaused) return;
    setIsLoading(true);
    const newLogs = await getBackendLogs();
    if (newLogs && newLogs.length > 0) {
      setLogs(prev => [...newLogs, ...prev].slice(0, 100));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Automation Engine Logs</h1>
          <p className="text-slate-500 mt-1">Direct stream from your Python Vintend Bot.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isPaused ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />}
            {isPaused ? 'Resume Sync' : 'Pause Sync'}
          </button>
          <button onClick={fetchLogs} className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-4 text-slate-500 text-[10px] font-bold tracking-widest uppercase">python_agent_v2.4.1</span>
          </div>
        </div>
        
        <div className="p-6 h-[500px] overflow-y-auto space-y-2 text-[11px] leading-relaxed">
          {logs.length === 0 && (
            <div className="text-slate-700 italic">Listening for engine output...</div>
          )}
          {logs.map((log, idx) => (
            <div key={idx} className="flex hover:bg-slate-900/50 p-1 rounded transition-colors group">
              <span className="text-slate-600 mr-4 shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold mr-4 w-12 shrink-0 ${
                log.level === 'info' ? 'text-blue-400' : 
                log.level === 'success' ? 'text-emerald-400' : 
                log.level === 'warn' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
          {!isPaused && (
             <div className="flex items-center">
               <span className="text-teal-500 font-bold">bridge@agent:~$</span>
               <span className="ml-2 w-1.5 h-4 bg-teal-500 animate-pulse"></span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
