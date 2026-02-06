import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  ChevronLeft, 
  Sun, 
  Moon,
  Plus,
  Minus,
  RotateCcw,
  FileText,
  Type,
  Palette,
  X,
  Zap,
  ArrowRight,
  BookOpen,
  Layout
} from 'lucide-react';

const PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const STORAGE_KEY = 'rsvp_reader_pro_v28';

const BRAND_COLOR = '#0269DC';
const DARK_BG_COLOR = '#636363'; 

const getORPIndex = (word) => {
  const length = word.length;
  if (length <= 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
};

const DEMO_TEXT = "Секретна операція «Вечеря». Твоє ім’я з’явилося у списку запрошених на закриту зустріч. Щоб агент 007 міг розрахувати ресурси, підтвердь свою участь протягом 24 годин.".split(/\s+/);

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
      <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase ml-1">
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
      }, 250);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const word = DEMO_TEXT[index];
  const orp = getORPIndex(word);

  return (
    <div className="w-full max-w-sm mx-auto p-4 md:p-6 rounded-[32px] border shadow-xl bg-white border-slate-100">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Demo Player</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        </div>
      </div>
      
      <div className="h-20 md:h-24 flex items-center justify-center mb-6 relative overflow-hidden bg-slate-50/50 rounded-2xl text-xl md:text-2xl">
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-500/20"></div>
        <div className="flex font-mono font-bold tracking-tighter">
          <span className="text-slate-300">{word.substring(0, orp)}</span>
          <span style={{ color: BRAND_COLOR }}>{word.substring(orp, orp + 1)}</span>
          <span className="text-slate-300">{word.substring(orp + 1)}</span>
        </div>
      </div>

      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ 
          backgroundColor: isPlaying ? 'transparent' : BRAND_COLOR, 
          color: isPlaying ? BRAND_COLOR : 'white', 
          border: isPlaying ? `1px solid ${BRAND_COLOR}` : 'none' 
        }}
      >
        {isPlaying ? <><Pause size={16} /> Зупинити</> : <><Play size={16} fill="white" /> Запустити приклад</>}
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
  const [fontSize, setFontSize] = useState(60); // Трохи менше дефолтне для мобайлу
  const [focusColor, setFocusColor] = useState('custom-brand');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const engine = useRef({
    isPlaying: false,
    currentIndex: 0,
    lastTick: 0,
    words: [],
    wps: 7,
    rafId: null
  });

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

  useEffect(() => {
    engine.current.wps = wps;
  }, [wps]);

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
      } else { text = await file.text(); }
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
    engine.current.isPlaying = false;
    setCurrentBook(book);
    setView('reader');
    setTimeout(() => updateWordDOM(book.progress || 0), 0);
  };

  const closeReader = () => {
    engine.current.isPlaying = false;
    const updated = library.map(b => b.id === currentBook.id ? { ...b, progress: engine.current.currentIndex } : b);
    setLibrary(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setView('library');
  };

  const skip = (n) => {
    engine.current.isPlaying = false;
    setIsPlayingUI(false);
    engine.current.currentIndex = Math.max(0, Math.min(engine.current.words.length - 1, engine.current.currentIndex + n));
    updateWordDOM(engine.current.currentIndex);
  };

  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.floor(percentage * (engine.current.words.length - 1));
    
    engine.current.isPlaying = false;
    setIsPlayingUI(false);
    engine.current.currentIndex = newIndex;
    updateWordDOM(newIndex);
  };

  const getFocusStyle = () => {
    if (focusColor === 'custom-brand') return { color: darkMode ? '#FFFFFF' : activeAccentColor };
    return {};
  };

  if (view === 'landing') return (
    <div className="min-h-screen font-sans bg-white text-[#0F172A] overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex justify-between items-center">
        <Logo forceLight={true} />
        <button 
          onClick={() => setView('library')}
          style={{ backgroundColor: BRAND_COLOR }}
          className="px-4 py-2 md:px-6 md:py-3 rounded-full text-white font-bold text-xs md:text-sm shadow-lg active:scale-95 transition-all"
        >
          Бібліотека
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-20 text-center md:text-left grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
        <div>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
          >
            <Zap size={14} fill="currentColor" /> Революція у читанні
          </div>
          <h2 className="text-4xl md:text-7xl font-black leading-tight mb-6">
            Читай швидше з <span style={{ color: BRAND_COLOR }}>SpeedRead</span>
          </h2>
          <p className="text-base md:text-lg mb-8 max-w-lg text-slate-500 mx-auto md:mx-0">
            Навчіться сприймати текст цілими образами. Наш RSVP-плеєр дозволяє читати сотні сторінок за вечір.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12">
            <button 
              onClick={() => setView('library')}
              style={{ backgroundColor: BRAND_COLOR }}
              className="group px-8 py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              Спробувати <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-center">
          <DemoPlayer />
        </div>
      </main>
    </div>
  );

  if (view === 'library') return (
    <div 
      className="min-h-screen p-4 md:p-16 font-sans transition-colors duration-500"
      style={{ backgroundColor: darkMode ? DARK_BG_COLOR : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#0F172A' }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => setView('landing')} className="p-2 hover:bg-slate-200/20 rounded-lg">
               <ChevronLeft size={24} />
            </button>
            <Logo darkMode={darkMode} />
          </div>
          <div className="flex gap-3 w-full md:w-auto justify-center">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="w-12 h-12 rounded-xl border flex items-center justify-center bg-white dark:bg-white/10"
            >
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <label 
              style={{ backgroundColor: darkMode ? '#FFFFFF' : BRAND_COLOR, color: darkMode ? DARK_BG_COLOR : '#FFFFFF' }}
              className="flex-1 md:flex-none px-6 h-12 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <input type="file" className="hidden" onChange={handleFileUpload} />
              {isExtracting ? <RotateCcw className="animate-spin" size={18}/> : <Plus size={18}/>}
              <span>Додати книгу</span>
            </label>
          </div>
        </header>

        {library.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-[40px] opacity-20">
             <BookOpen size={48} className="mx-auto mb-4" />
             <p className="font-black uppercase">Бібліотека порожня</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {library.map(book => (
              <div 
                key={book.id} 
                onClick={() => openBook(book)} 
                className="group border p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all relative bg-white/5"
              >
                <div className="flex justify-between mb-4">
                   <FileText size={18} style={{ color: BRAND_COLOR }}/>
                   <button onClick={(e) => {e.stopPropagation(); setLibrary(library.filter(b => b.id !== book.id))}} className="text-red-400 p-1">
                      <Trash2 size={16}/>
                   </button>
                </div>
                <h3 className="font-bold mb-4 line-clamp-1">{book.title}</h3>
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${(book.progress/book.words.length)*100}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center font-sans transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: darkMode ? DARK_BG_COLOR : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#0F172A' }}
    >
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-inherit/80 backdrop-blur-md">
        <button 
          onClick={closeReader} 
          className="flex items-center gap-1 font-bold uppercase text-[10px] tracking-widest" 
          style={{ color: activeAccentColor }}
        >
          <ChevronLeft size={16}/> Бібліотека
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px] opacity-50">
          {currentBook.title}
        </div>
        <div className="w-8"></div>
      </div>

      {/* Reader Area */}
      <div className="relative w-full h-[40vh] flex justify-center items-center select-none" 
           style={{ fontSize: `clamp(30px, ${fontSize}px, 15vw)` }}>
        <div className="absolute h-24 md:h-32 w-[2px] left-1/2 -translate-x-1/2 flex flex-col justify-between py-1">
          <div className="w-4 md:w-6 h-1 -translate-x-1/2 rounded-full bg-blue-500/30"></div>
          <div className="w-4 md:w-6 h-1 -translate-x-1/2 rounded-full bg-blue-500/30"></div>
        </div>
        <div className="flex relative font-mono font-bold tracking-tighter">
          <div ref={wordBeforeRef} className="absolute right-full text-right whitespace-nowrap opacity-30"></div>
          <div ref={wordTargetRef} className={focusColor === 'custom-brand' ? '' : focusColor} style={getFocusStyle()}></div>
          <div ref={wordAfterRef} className="absolute left-full text-left whitespace-nowrap opacity-30"></div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-4 md:bottom-8 inset-x-4 md:inset-x-6 max-w-3xl mx-auto">
        <div 
          className={`relative border rounded-[24px] md:rounded-[32px] shadow-2xl p-4 flex flex-col gap-4 transition-all ${isPlayingUI ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}
          style={{ 
            backgroundColor: darkMode ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Main Control Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Speed Control (Adaptive width) */}
            <div className="flex flex-col gap-1 w-full md:w-32 order-3 md:order-1">
              <span className="text-[9px] font-black uppercase opacity-50">Швидкість</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="1" max="25" value={wps} 
                  onChange={e => setWps(parseInt(e.target.value))} 
                  className="flex-1 h-1 rounded-full appearance-none bg-blue-100"
                  style={{ accentColor: activeAccentColor }}
                />
                <span className="text-[10px] font-bold min-w-[35px]">{wps} WPS</span>
              </div>
            </div>

            {/* Play/Pause Buttons */}
            <div className="flex items-center justify-center gap-4 flex-1 order-1 md:order-2">
              <button onClick={() => skip(-10)} className="p-2 opacity-50 hover:opacity-100 active:scale-90 transition-all">
                <RotateCcw size={20} className="scale-x-[-1]" />
              </button>
              <button 
                onClick={togglePlay}
                style={{ backgroundColor: activeAccentColor }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
              >
                {isPlayingUI ? <Pause size={24} fill="white"/> : <Play size={24} fill="white" className="ml-1"/>}
              </button>
              <button onClick={() => skip(10)} className="p-2 opacity-50 hover:opacity-100 active:scale-90 transition-all">
                <RotateCcw size={20} />
              </button>
            </div>

            {/* Settings Buttons */}
            <div className="flex items-center gap-2 order-2 md:order-3">
              <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-white/5 border border-transparent">
                <button onClick={() => setFontSize(Math.max(20, fontSize - 5))} className="w-8 h-8 flex items-center justify-center active:scale-90"><Minus size={14}/></button>
                <span className="text-[10px] font-bold px-1">{fontSize}</span>
                <button onClick={() => setFontSize(Math.min(150, fontSize + 5))} className="w-8 h-8 flex items-center justify-center active:scale-90"><Plus size={14}/></button>
              </div>

              <div className="relative flex items-center">
                <button 
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  style={{ backgroundColor: activeAccentColor }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md active:scale-90"
                >
                  <Palette size={16} />
                </button>
                
                {isColorPickerOpen && (
                  <div className="absolute bottom-full mb-4 right-0 flex gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in">
                    {colors.map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => {setFocusColor(c.class); setIsColorPickerOpen(false);}}
                        style={{ backgroundColor: c.hex }}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar Area */}
          <div className="flex items-center gap-3">
            <div className="flex-1 px-1">
              <div 
                ref={progressBarRef}
                onClick={handleProgressBarClick}
                className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden cursor-pointer relative"
              >
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{ backgroundColor: activeAccentColor, width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right min-w-[30px]">
              <span className="text-[10px] font-black block" style={{ color: activeAccentColor }}>{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
