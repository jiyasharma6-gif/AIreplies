import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Store, 
  Settings2,
  Sparkles,
  ArrowRight,
  Info,
  PenLine,
  Share2,
  BarChart3,
  Target
} from 'lucide-react';
import { generateWhatsAppReply, ReplyTone, ReplyRequest, AppMode } from './services/geminiService';

const TONES: { id: ReplyTone; label: string; emoji: string }[] = [
  { id: 'polite', label: 'Polite', emoji: '🙏' },
  { id: 'friendly', label: 'Friendly', emoji: '😊' },
  { id: 'sales-focused', label: 'Sales', emoji: '💰' },
  { id: 'urgent', label: 'Urgent', emoji: '⏰' },
  { id: 'short-reply', label: 'Short', emoji: '⚡' },
  { id: 'hindi', label: 'Hindi', emoji: '🇮🇳' },
  { id: 'hinglish', label: 'Hinglish', emoji: '🗣️' },
];

const BUSINESS_TYPES = [
  'General Shop',
  'Clinic',
  'Coaching/Tution',
  'Online Store',
  'Real Estate',
  'Restaurant/Cafe',
  'Beauty Parlor',
  'Fitness/Gym',
  'Interior Design',
  'Event Planner',
];

export default function App() {
  const [mode, setMode] = useState<AppMode>('reply');
  const [customerMessage, setCustomerMessage] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [tone, setTone] = useState<ReplyTone>('polite');
  const [businessType, setBusinessType] = useState('General Shop');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!customerMessage.trim()) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const finalBusinessType = businessType === 'Other' ? customBusinessType : businessType;
      const request: ReplyRequest = {
        customerMessage,
        tone,
        businessType: finalBusinessType || 'Small Business',
        mode,
        productContext: productDetails,
      };

      const reply = await generateWhatsAppReply(request);
      setGeneratedReply(reply);
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!generatedReply) return;
    if (navigator.share) {
      try {
        await navigator.share({
          text: generatedReply,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-gray-900 pb-12">
      {/* Header */}
      <header className="bg-[#00A884] text-white py-6 px-4 shadow-md sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight">QuickReply AI</h1>
              <p className="text-xs opacity-90 font-medium uppercase tracking-wider">AI Business Assistant</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-80">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 pb-24">
        {/* Mode Selector */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-gray-100 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <button 
            onClick={() => setMode('reply')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${mode === 'reply' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Reply
          </button>
          <button 
            onClick={() => setMode('improve')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${mode === 'improve' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <PenLine className="w-4 h-4" />
            Improve
          </button>
          <button 
            onClick={() => setMode('analyze')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${mode === 'analyze' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Analyze
          </button>
        </div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6"
        >
          <div className="p-6 space-y-6">
            {/* Business Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-600">
                <Store className="w-4 h-4" />
                Business Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={`text-[13px] py-2 px-3 rounded-xl border transition-all text-left ${
                      businessType === type 
                        ? 'border-[#008069] bg-emerald-50 text-[#008069] font-semibold shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                <div className="relative col-span-2">
                  <input
                    type="text"
                    placeholder="Other Business Type..."
                    className={`w-full text-sm py-2.5 px-4 rounded-xl border transition-all focus:outline-none ${
                        !BUSINESS_TYPES.includes(businessType)
                        ? 'border-[#008069] bg-emerald-50 text-[#008069] font-medium'
                        : 'border-gray-200 focus:border-[#00A884]'
                    }`}
                    value={customBusinessType}
                    onChange={(e) => {
                      setCustomBusinessType(e.target.value);
                      setBusinessType(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-600">
                {mode === 'reply' ? <MessageSquare className="w-4 h-4" /> : <PenLine className="w-4 h-4" />}
                {mode === 'reply' ? "Customer's Message" : "Your Message Draft"}
              </label>
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder={mode === 'reply' ? "Paste what the customer said..." : "Type what you want to say to the customer..."}
                className="w-full h-28 p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-[#008069] focus:ring-4 focus:ring-emerald-50 outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* Product Details (Optional) */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4 opacity-70" />
                Product/Offer Context
              </label>
              <input
                type="text"
                value={productDetails}
                onChange={(e) => setProductDetails(e.target.value)}
                placeholder="e.g. 20% discount, Wedding Photography Package"
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#008069] outline-none transition-all text-sm"
              />
            </div>

            {/* Tone Picker */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4" />
                Message Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-full border text-sm transition-all ${
                      tone === t.id 
                        ? 'border-[#008069] bg-emerald-600 text-white shadow-md' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !customerMessage.trim()}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                isLoading || !customerMessage.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#00A884] text-white hover:bg-[#008069] hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {mode === 'reply' ? 'Generate Reply' : mode === 'improve' ? 'Improve Message' : 'Analyze Lead'}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3"
            >
              <Info className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence>
          {generatedReply && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#D1FAE5]"
            >
              <div className="bg-[#E7FFDB] px-6 py-4 flex items-center justify-between border-b border-[#D1FAE5]">
                <div className="flex items-center gap-2 text-emerald-800">
                  {mode === 'analyze' ? <Target className="w-4 h-4" /> : <Check className="w-4 h-4 font-bold" />}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {mode === 'reply' ? 'Suggested Reply' : mode === 'improve' ? 'Improved Draft' : 'Lead Analysis'}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {mode === 'analyze' ? (
                  <div className="space-y-4">
                    {generatedReply.split('\n').filter(line => line.trim()).map((line, i) => {
                      const [label, ...val] = line.split(':');
                      if (!val.length) return null;
                      return (
                        <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label.trim()}</p>
                          <p className={`text-sm ${label.toLowerCase().includes('category') ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
                            {val.join(':').trim()}
                          </p>
                        </div>
                      );
                    })}
                    <div className="flex justify-end pt-2">
                       <button 
                        onClick={() => {
                          const suggestion = generatedReply.split('\n').find(l => l.toLowerCase().includes('reply:'))?.split(':')[1]?.trim();
                          if (suggestion) {
                            navigator.clipboard.writeText(suggestion);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 hover:underline"
                       >
                         <Copy className="w-3 h-3" />
                         Copy Suggestion Only
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#fcfdf2] p-5 rounded-2xl border-l-[6px] border-[#00A884] relative">
                    <div className="absolute top-0 -left-1 w-0 h-0 border-t-[10px] border-t-[#00A884] border-l-[10px] border-l-transparent"></div>
                    <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap select-all">
                      {generatedReply}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (mode === 'analyze') {
                        navigator.clipboard.writeText(generatedReply);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } else {
                        handleCopy();
                      }
                    }}
                    className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      copied 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> {mode === 'analyze' ? 'Copy All' : 'Copy Text'}</>}
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-6 text-gray-400 text-[10px] font-medium tracking-[0.2em] uppercase">
        Designed for Growth • Powered by AI
      </footer>
    </div>
  );
}
