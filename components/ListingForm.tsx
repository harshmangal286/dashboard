
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  Upload, 
  Loader2, 
  CheckCircle, 
  RefreshCw, 
  Trash2, 
  DollarSign, 
  Hash, 
  ChevronRight,
  Info,
  Ruler,
  AlertCircle,
  Zap,
  Image as ImageIcon,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { analyzeListingImage } from '../services/gemini';
import { ingestListing, publishListing, getPublishStatus } from '../services/backend';
import { Account } from '../types';

interface ListingFormProps {
  onSuccess: () => void;
  account: Account;
}

const ListingForm: React.FC<ListingFormProps> = ({ onSuccess, account }) => {
  const [step, setStep] = useState<'upload' | 'analysis' | 'draft' | 'publishing'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [publishTaskId, setPublishTaskId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceRange: { min: 0, max: 0 },
    category: '',
    brand: '',
    size: '',
    color: '',
    condition: 'Good condition',
    material: '',
    shoulder: '',
    length: '',
    hashtags: [] as string[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for logs during publishing to fulfill the "Observer" role
  useEffect(() => {
    let interval: any;
    if (step === 'publishing' && publishTaskId) {
      interval = setInterval(async () => {
        try {
          const status = await getPublishStatus(publishTaskId);
          if (status?.progress?.state) {
            const state = status.progress.state;
            const action = status.progress.current_action || 'Working';
            setLiveLogs(prev => [...prev, `[STATE] ${state} — ${action}`].slice(-10));
            const progressMap: Record<string, number> = {
              INIT: 5,
              AUTH: 15,
              MEDIA_UPLOAD: 30,
              TEXT_FIELDS: 40,
              CATEGORY_RESOLUTION: 55,
              ATTRIBUTE_RESOLUTION: 70,
              PRICING: 80,
              PUBLISH: 90,
              CONFIRMATION: 100
            };
            if (progressMap[state] && progressMap[state] > publishProgress) {
              setPublishProgress(progressMap[state]);
            }
          }

          if (status.status === 'SUCCESS') {
            setPublishProgress(100);
            setLiveLogs(prev => [...prev, "[SUCCESS] Asset deployed to Vinted Catalog."]);
            clearInterval(interval);
            setTimeout(onSuccess, 1500);
          } else if (status.status === 'FAILURE') {
            clearInterval(interval);
            setLiveLogs(prev => [...prev, `[ERROR] ${status.error || 'Publish failed'}`]);
            alert("Publish failed. Check logs.");
            setStep('draft');
          }
        } catch (err) {
          // Ignore transient polling errors
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [step, publishTaskId, publishProgress, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        setStep('analysis');
        
        try {
          processWithAI(base64);
        } catch (err) {
          processWithAI(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processWithAI = async (base64: string) => {
    setIsProcessing(true);
    try {
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const analysis = await analyzeListingImage(base64Data);
      
      const suggestedPrice = analysis.priceSuggestion || 25;
      const min = Math.max(suggestedPrice * 0.8, 1);
      const max = suggestedPrice * 1.25;

      const brandSlug = analysis.brand?.toLowerCase().replace(/\s+/g, '') || 'resell';
      const catSlug = analysis.category?.split('/').pop()?.toLowerCase().replace(/\s+/g, '') || 'vinted';
      
      const strategicTags = [
        `#${brandSlug}${catSlug}`,
        `#${brandSlug}vintage`,
        `#technique${catSlug}`,
        `#scalencyai`
      ];

      setFormData(prev => ({
        ...prev,
        title: analysis.title || '',
        description: analysis.description || '',
        price: Math.round(suggestedPrice).toString(),
        priceRange: { min, max },
        category: analysis.category || '',
        brand: analysis.brand || '',
        size: analysis.size || '',
        color: analysis.color || '',
        condition: analysis.condition || 'Very good condition',
        material: analysis.material || '',
        shoulder: analysis.shoulderWidth?.toString() || '',
        length: analysis.length?.toString() || '',
        hashtags: strategicTags
      }));
      
      setStep('draft');
    } catch (error) {
      alert("AI analysis failed. Please fill manually.");
      setStep('draft');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setStep('publishing');
    setPublishProgress(0);
    setLiveLogs(["[SYSTEM] Initiating Performer Agent...", "[SYSTEM] Establishing encrypted Bridge tunnel..."]);
    setPublishTaskId(null);

    try {
      const ingestResult = await ingestListing({
        title: formData.title,
        description: `${formData.description}\n\n${formData.hashtags.join(' ')}`,
        price: parseFloat(formData.price),
        image_base64: image.includes(',') ? image.split(',')[1] : image,
        category: formData.category,
        brand: formData.brand,
        size: formData.size,
        condition: formData.condition,
        material: formData.material,
        color: formData.color,
        hashtags: formData.hashtags
      });

      const listingId = ingestResult.listing_id;
      const publishResult = await publishListing(listingId);
      setPublishTaskId(publishResult.task_id);
    } catch (err) {
      alert("Publish start failed.");
      setStep('draft');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {step === 'upload' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Autonomous Listing</h1>
            <p className="text-slate-500 font-medium">Inject product visuals to trigger the agent's marketplace analysis.</p>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xl aspect-video bg-[#0A0A0A] border-2 border-dashed border-[#1A1A1A] hover:border-[#A3E635] hover:bg-[#A3E635]/5 rounded-[48px] cursor-pointer transition-all flex flex-col items-center justify-center group relative overflow-hidden"
          >
            <div className="p-6 bg-[#111111] rounded-2xl mb-4 group-hover:scale-110 transition-transform relative z-10 shadow-2xl">
              <Camera size={48} className="text-slate-500 group-hover:text-[#A3E635]" />
            </div>
            <p className="text-lg font-bold text-slate-300 relative z-10">Deploy Media</p>
            <p className="text-sm text-slate-500 mt-1 relative z-10">AI analysis starts immediately after injection.</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
      )}

      {step === 'analysis' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 rounded-[40px] border-4 border-[#A3E635]/20 animate-pulse"></div>
            <img src={image!} className="w-full h-full object-cover rounded-[40px] grayscale brightness-50" alt="Scanning" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-[40px]">
              <Loader2 className="text-[#A3E635] animate-spin mb-4" size={56} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Market Scrutiny Active</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">Aggregating Intelligence</h3>
            <p className="text-slate-500 text-sm">Determining brand authority and competitive pricing corridors...</p>
          </div>
        </div>
      )}

      {step === 'draft' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0A0A0A] p-5 rounded-[40px] border border-[#1A1A1A] sticky top-24 shadow-2xl">
              <img src={image!} className="w-full aspect-square object-cover rounded-3xl mb-8" alt="Asset" />
              <div className="p-6 bg-[#111111] rounded-[28px] border border-[#1A1A1A] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-[#A3E635]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Forecast</span>
                  </div>
                  <span className="text-[#A3E635] text-[10px] font-black uppercase">{formData.brand || 'No Brand'}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">Target Value</p>
                  <span className="text-4xl font-black text-white">£{formData.price}</span>
                </div>
                <div className="h-px bg-[#1A1A1A]" />
                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold text-teal-400 bg-teal-400/5 px-2 py-1 rounded-lg uppercase">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 bg-[#0A0A0A] p-12 rounded-[56px] border border-[#1A1A1A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-10">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Asset Editor</h2>
              <button type="button" onClick={() => setStep('upload')} className="p-4 bg-[#111111] text-slate-500 hover:text-red-500 rounded-2xl border border-[#1A1A1A]">
                <Trash2 size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111111] border border-[#1A1A1A] rounded-[24px] p-6 text-white font-black text-xl focus:border-[#A3E635] outline-none" placeholder="Title" />
              <textarea rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#111111] border border-[#1A1A1A] rounded-[24px] p-6 text-white text-sm focus:border-[#A3E635] outline-none resize-none" placeholder="Description" />
              <div className="grid grid-cols-3 gap-6">
                <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 text-white text-sm" placeholder="Brand" />
                <input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 text-white text-sm" placeholder="Size" />
                <input value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 text-white text-sm" placeholder="Condition" />
              </div>
            </div>
            <div className="pt-12 flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-500 font-medium">
                <Activity size={16} className="mr-3 text-[#A3E635]" />
                Post as: <span className="text-[#A3E635] ml-1 font-black">@{account.username}</span>
              </div>
              <button type="submit" className="bg-[#A3E635] hover:bg-[#BEF264] text-black font-black px-12 py-6 rounded-[32px] shadow-2xl transition-all flex items-center space-x-4">
                <span>START AUTOMATION</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 'publishing' && (
        <div className="fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
          <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Visual Progress */}
            <div className="text-center space-y-10">
              <div className="relative mx-auto w-56 h-56">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="112" cy="112" r="106" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#1A1A1A]" />
                  <circle cx="112" cy="112" r="106" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={666} strokeDashoffset={666 - (666 * publishProgress) / 100} className="text-[#A3E635] transition-all duration-700 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Zap className="text-[#A3E635] animate-pulse mb-2" size={64} fill="currentColor" />
                  <span className="text-2xl font-black text-white">{publishProgress}%</span>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Performer Agent Active</h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Scalency is currently performing the listing transaction via the Vinted Bridge.</p>
              </div>
            </div>

            {/* Live Observer Terminal */}
            <div className="bg-[#0A0A0A] rounded-[48px] border border-[#1A1A1A] p-8 shadow-2xl h-[500px] flex flex-col">
              <div className="flex items-center space-x-3 mb-6 border-b border-[#1A1A1A] pb-4">
                <Terminal size={20} className="text-[#A3E635]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Observer Stream</span>
                <div className="flex-1"></div>
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
                </div>
              </div>
              <div className="flex-1 font-mono text-xs overflow-y-auto space-y-3 scrollbar-hide">
                {liveLogs.map((log, i) => (
                  <div key={i} className="flex space-x-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[#A3E635] opacity-50 select-none">❯</span>
                    <span className={log.includes('[SUCCESS]') ? 'text-[#A3E635] font-black' : log.includes('[ERROR]') ? 'text-red-500' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
                <div className="flex items-center text-[#A3E635] animate-pulse">
                  <span className="mr-2">❯</span>
                  <span className="w-2 h-4 bg-[#A3E635]"></span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1A1A1A] flex items-center justify-between">
                <div className="flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <Activity size={12} className="mr-2 animate-pulse" /> Agent ID: performance_v4.2
                </div>
                <span className="text-[10px] text-slate-800 font-bold italic">Bypassing security...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingForm;
