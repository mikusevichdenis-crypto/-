import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Trash2, ChevronLeft, Sun, Moon, Plus, Minus,
  RotateCcw, FileText, Type, Palette, X, Zap, ArrowRight, BookOpen, Layout
} from 'lucide-react';

const PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const STORAGE_KEY = 'rsvp_reader_pro_v28';
const BRAND_COLOR = '#0269DC';
const DARK_BG_COLOR = '#1E293B'; 

const getORPIndex = (word) => {
  const length = word.length;
  if (length <= 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
};

// Використовуємо дані про Bimp для демо-тексту
const DEMO_TEXT = "Bimp: Управлінський облік та склад для Виробництва і E-commerce. Масштабуйте бізнес правильно.".split(/\s+/);

const Logo = ({ darkMode, forceLight }) => {
  const isDark = forceLight ? false : darkMode;
  return (
    <div className="flex items-center gap-1 group cursor-default">
      <div 
        className="relative flex items-center justify-center w-8 h-8 rounded-lg rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-sm"
        style={{ backgroundColor: isDark ? '#FFFFFF' : BRAND_COLOR }}
      >
        <Zap size={18} fill={isDark ? 'transparent' : 'white'} className={isDark ? 'text-slate-700' : 'text-white'} />
      </div>
      <h1 className="text-2xl font-black tracking-tighter uppercase ml-1">
        <span style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>Speed</span>
        <span style={{ color: isDark ? '#FFFFFF' : BRAND_COLOR }}>Read</span>
      </h1>
    </div>
  );
};

const DemoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % DEMO_TEXT.length);
      }, 300);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const word = DEMO_TEXT[index];
  const orp = getORPIndex(word);

  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-[32px] border shadow-2xl bg-white border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Demo</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        </div>
      </div>
      <div className="h-24 flex items-center justify-center mb-6 relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-100">
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-500/10"></div>
        <div className="flex font-mono text-2xl font-bold tracking-tighter">
          <span className="text-slate-400">{word.substring(0, orp)}</span>
          <span style={{ color: BRAND_COLOR }}>{word.substring(orp, orp + 1)}</span>
          <span className="text-slate-400">{word.substring(orp + 1)}</span>
        </div>
      </div>
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        style={{ backgroundColor: BRAND_COLOR, color: 'white' }}
      >
        {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
        {isPlaying ? 'Зупинити' : 'Запустити приклад'}
      </button>
    </div>
  );
};

export default function App() {
  const [library, setLibrary] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [view, setView] = useState('landing');
  const [darkMode, setDarkMode] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPlayingUI, setIsPlayingUI] = useState(false);
  const [wps, setWps] = useState(7); 
  const [fontSize, setFontSize] = useState(80);
  const [focusColor, setFocusColor] = useState('custom-brand');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const engine = useRef({ isPlaying: false, currentIndex: 0, lastTick: 0, words: [], wps: 7, rafId: null });
  const wordBeforeRef = useRef(null);
  const wordTargetRef = useRef(null);
  const wordAfterRef = useRef(null);
  const progressBarRef = useRef(null);

  const colors = [
    { name: 'Brand', class: 'custom-brand', hex: BRAND_COLOR },
    { name: 'Red', class: 'text-red-500', hex: '#ef4444' },
    { name: 'Green', class: 'text-emerald-500', hex: '#10b981' },
    { name: 'Amber', class: 'text-amber-500', hex: '#f59e0b' },
    { name: 'Purple', class: 'text-purple-500', hex: '#a855f7' },
  ];

  const activeAccentColor = colors.find(c => c.class === focusColor)?.hex || BRAND_COLOR;

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setLibrary(JSON.parse(data));
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = PDF_JS_URL;
      script.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL; };
      document.head.appendChild(script);
    }
  }, []);

  const updateWordDOM = useCallback((index) => {
    const word = engine.current.words[index] || "";
    const orp = getORPIndex(word);
    if (wordBeforeRef.current) wordBeforeRef.current.textContent = word.substring(0, orp);
    if (wordTargetRef.current) wordTargetRef.current.textContent = word.substring(orp, orp + 1);
    if (wordAfterRef.current) wordAfterRef.current.textContent = word.substring(orp + 1);
    const total = engine.current.words.length;
    setProgressPercent(total > 1 ? Math.round((index / (total - 1)) * 100) : 0);
  }, []);

  const togglePlay = useCallback(() => {
    const e = engine.current;
    if (e.words.length === 0) return;
    e.isPlaying = !e.isPlaying;
    setIsPlayingUI(e.isPlaying);
    if (e.isPlaying) {
      e.lastTick = performance.now();
      const loop = (now) => {
        if (!e.isPlaying) return;
        const currentWord = e.words[e.currentIndex] || "";
        let multiplier = 1;
        if (/[.!?]$/.test(currentWord)) multiplier = 2;
        else if (/[,;:—]$/.test(currentWord)) multiplier = 1.5;
        const delay = (1000 / e.wps) * multiplier;
        if (now - e.lastTick >= delay) {
          if (e.currentIndex < e.words.length - 1) {
            e.currentIndex++;
            updateWordDOM(e.currentIndex);
            e.lastTick = now;
          } else {
            e.isPlaying = false;
            setIsPlayingUI(false);
            return;
          }
        }
        e.rafId = requestAnimationFrame(loop);
      };
      e.rafId = requestAnimationFrame(loop);
    } else {
      if (e.rafId) cancelAnimationFrame(e.rafId);
    }
  }, [updateWordDOM]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsExtracting(true);
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(" ") + " ";
        }
      } else { 
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        text = decoder.decode(arrayBuffer);
      }
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const newBook = { id: Date.now(), title: file.name, words, progress: 0 };
      const updated = [newBook, ...library];
      setLibrary(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) { console.error(err); } 
    finally { setIsExtracting(false); }
  };

  const openBook = (book) => {
    engine.current.words = book.words;
    engine.current.currentIndex = book.progress || 0;
    engine.current.wps = wps;
    setCurrentBook(book);
    setView('reader');
    setTimeout(() => updateWordDOM(book.progress || 0), 50);
  };

  if (view === 'landing') return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Logo forceLight={true} />
        <button onClick={() => setView('library')} className="px-6 py-3 bg-brand rounded-full text-white font-bold text-sm shadow-xl hover:scale-105 transition-all">Бібліотека</button>
      </nav>
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-brand text-xs font-black uppercase tracking-widest mb-6">
            <Zap size={14} fill="currentColor" /> Революція у читанні
          </div>
          <h2 className="text-6xl font-black leading-[1.1] mb-8">Читай <span className="text-brand">книги</span> у 3 рази швидше</h2>
          <p className="text-lg text-slate-500 mb-10 max-w-md">Наш RSVP-плеєр допомагає фокусуватися на кожному слові, усуваючи зайві рухи очей.</p>
          <button onClick={() => setView('library')} className="group px-10 py-5 bg-brand rounded-2xl text-white font-black text-xl flex items-center gap-3 shadow-2xl hover:-translate-y-1 transition-all">
            Почати безкоштовно <ArrowRight />
          </button>
        </div>
        <DemoPlayer />
      </main>
    </div>
  );

  if (view === 'library') return (
    <div className={`min-h-screen p-8 md:p-16 transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('landing')} className="p-2 hover:bg-slate-200 rounded-lg"><ChevronLeft /></button>
            <Logo darkMode={darkMode} />
          </div>
          <div className="flex gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-xl border bg-white/10">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
            <label className="px-6 py-3 bg-brand text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              {isExtracting ? <RotateCcw className="animate-spin" /> : <Plus />} Додати книгу
            </label>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {library.map(book => (
            <div key={book.id} onClick={() => openBook(book)} className={`p-8 rounded-[32px] border cursor-pointer hover:shadow-2xl transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <FileText className="mb-6 text-brand" size={32} />
              <h3 className="font-bold text-xl mb-4 line-clamp-1">{book.title}</h3>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand" style={{ width: `${(book.progress/book.words.length)*100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="absolute top-8 left-8">
        <button onClick={() => setView('library')} className="flex items-center gap-2 font-black uppercase text-xs tracking-widest opacity-50 hover:opacity-100 transition-opacity">
          <ChevronLeft size={16}/> Назад до книг
        </button>
      </div>
      
      <div className="relative flex justify-center items-center select-none font-mono font-bold tracking-tighter" style={{ fontSize: `${fontSize}px` }}>
        <div className="absolute h-40 w-[2px] left-1/2 -translate-x-1/2 flex flex-col justify-between py-2">
          <div className="w-8 h-1.5 -translate-x-1/2 rounded-full bg-brand/20"></div>
          <div className="w-8 h-1.5 -translate-x-1/2 rounded-full bg-brand/20"></div>
        </div>
        <div ref={wordBeforeRef} className="absolute right-full text-right opacity-20 pr-1"></div>
        <div ref={wordTargetRef} style={{ color: activeAccentColor }}></div>
        <div ref={wordAfterRef} className="absolute left-full text-left opacity-20 pl-1"></div>
      </div>

      <div className="fixed bottom-12 w-full max-w-4xl px-6">
        <div className={`p-6 rounded-[40px] border shadow-2xl backdrop-blur-xl flex flex-col gap-6 ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={togglePlay} className="w-16 h-16 rounded-3xl bg-brand text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
                 {isPlayingUI ? <Pause size={32} fill="white"/> : <Play size={32} fill="white" className="ml-1"/>}
               </button>
               <div>
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Швидкість</div>
                 <div className="flex items-center gap-3">
                   <input type="range" min="1" max="20" value={wps} onChange={(e) => {setWps(parseInt(e.target.value)); engine.current.wps = parseInt(e.target.value);}} className="w-32 accent-brand" />
                   <span className="font-bold">{wps * 60} слів/хв</span>
                 </div>
               </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFontSize(Math.max(40, fontSize - 10))} className="p-3 rounded-xl border"><Minus size={18}/></button>
              <button onClick={() => setFontSize(Math.min(150, fontSize + 10))} className="p-3 rounded-xl border"><Plus size={18}/></button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-xl border">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden cursor-pointer" ref={progressBarRef} onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newIdx = Math.floor(percent * engine.current.words.length);
            engine.current.currentIndex = newIdx;
            updateWordDOM(newIdx);
          }}>
            <div className="h-full bg-brand transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
