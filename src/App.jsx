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
  Layout,
  Gauge
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
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-sm" style={{ backgroundColor: isDark ? '#FFFFFF' : BRAND_COLOR }}>
        <Zap size={18} fill={isDark ? 'transparent' : 'white'} className={isDark ? 'text-slate-700' : 'text-white'} />
      </div>
      <h1 className="text-2xl font-black tracking-tighter uppercase ml-1 transition-colors duration-500">
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
    <div className="w-full max-w-sm mx-auto p-6 rounded-[32px] border shadow-xl bg-white border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Demo Player</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        </div>
      </div>
      <div className="h-24 flex items-center justify-center mb-6 relative overflow-hidden bg-slate-50/50 rounded-2xl">
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-500/20"></div>
        {/* Центрований контейнер */}
        <div className="flex w-full font-mono text-2xl font-bold tracking-tighter">
          <div className="w-1/2 text-right text-slate-300">{word.substring(0, orp)}</div>
          <div style={{ color: BRAND_COLOR }}>{word.substring(orp, orp + 1)}</div>
          <div className="w-1/2 text-left text-slate-300">{word.substring(orp + 1)}</div>
        </div>
      </div>
      <button onClick={() => setIsPlaying(!isPlaying)} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95" style={{ backgroundColor: isPlaying ? 'transparent' : BRAND_COLOR, color: isPlaying ? BRAND_COLOR : 'white', border: isPlaying ? `1px solid ${BRAND_COLOR}` : 'none' }}>
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
  const [fontSize, setFontSize] = useState(80);
  const [focusColor, setFocusColor] = useState('custom-brand');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isWpsOpen, setIsWpsOpen] = useState(false);

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

  useEffect(() => { engine.current.wps = wps; }, [wps]);

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
            e.currentIndex++; updateWordDOM(e.currentIndex); e.lastTick = now;
          } else { e.isPlaying = false; setIsPlayingUI(false); return; }
        }
        e.rafId = requestAnimationFrame(loop);
      };
      e.rafId = requestAnimationFrame(loop);
    } else { if (e.rafId) cancelAnimationFrame(e.rafId); }
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
    } catch (err) { console.error(err); } finally { setIsExtracting(false); }
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
    engine.current.isPlaying = false; setIsPlayingUI(false);
    engine.current.currentIndex = Math.max(0, Math.min(engine.current.words.length - 1, engine.current.currentIndex + n));
    updateWordDOM(engine.current.currentIndex);
  };

  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    engine.current.isPlaying = false; setIsPlayingUI(false);
    engine.current.currentIndex = Math.floor(percentage * (engine.current.words.length - 1));
    updateWordDOM(engine.current.currentIndex);
  };

  if (view === 'landing') return (
    <div className="min-h-screen font-sans bg-white text-[#0F172A] overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Logo forceLight={true} />
        <button onClick={() => setView('library')} style={{ backgroundColor: BRAND_COLOR }} className="px-6 py-3 rounded-full text-white font-bold text-sm shadow-lg active:scale-95 transition-all">Відкрити бібліотеку</button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8 md:pt-12 pb-32 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
        <div className="text-center md:text-left order-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-widest shadow-sm" style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}>
            <Zap size={14} fill="currentColor" /> Революція у читанні
          </div>
          <h2 className="text-4xl md:text-7xl font-black leading-tight mb-8">
            Читай улюблені <span style={{ color: BRAND_COLOR }}>книги</span> швидше!
          </h2>
          <p className="text-lg mb-10 max-w-lg mx-auto md:mx-0 text-slate-500">
            Навчіться сприймати текст цілими образами. Наш RSVP-плеєр дозволяє читати сотні сторінок за вечір, не втрачаючи фокусу.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center md:justify-start">
            <button onClick={() => setView('library')} style={{ backgroundColor: BRAND_COLOR }} className="group px-8 py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              Спробувати зараз <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="p-6 rounded-3xl border bg-slate-50/30 border-dashed max-w-md mx-auto md:mx-0">
             <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-tighter opacity-40"><Layout size={12}/> Як це працює?</div>
             <p className="text-sm opacity-60">Ви фокусуєтесь на виділеній літері в центрі, а слова змінюються. Це усуває потребу в сабвокалізації.</p>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-center order-2">
          <DemoPlayer />
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-black" style={{ color: BRAND_COLOR }}>450+</div>
                <div className="text-[10px] font-bold uppercase opacity-40">Слів за хвилину</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-black" style={{ color: BRAND_COLOR }}>x3</div>
                <div className="text-[10px] font-bold uppercase opacity-40">Швидкість навчання</div>
             </div>
          </div>
        </div>
      </main>

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6"><FileText size={32}/></div>
             <h3 className="text-xl font-black mb-4 uppercase">Підтримка PDF</h3>
             <p className="opacity-60 text-sm px-6">Завантажуйте документи та читайте їх миттєво без зайвої реклами.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6"><Palette size={32}/></div>
             <h3 className="text-xl font-black mb-4 uppercase">Персоналізація</h3>
             <p className="opacity-60 text-sm px-6">Підлаштовуйте шрифт, кольори та темп під свій зір.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6"><BookOpen size={32}/></div>
             <h3 className="text-xl font-black mb-4 uppercase">Розумна бібліотека</h3>
             <p className="opacity-60 text-sm px-6">Ми пам'ятаємо, де ви зупинились. Всі дані зберігаються локально.</p>
          </div>
        </div>
      </section>
    </div>
  );

  if (view === 'library') return (
    <div className="min-h-screen p-8 md:p-16 font-sans transition-colors duration-500" style={{ backgroundColor: darkMode ? DARK_BG_COLOR : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#0F172A' }}>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('landing')} className="p-2 hover:bg-slate-200/20 rounded-lg transition-colors"><ChevronLeft size={24}/></button>
            <Logo darkMode={darkMode} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 rounded-xl border flex items-center justify-center bg-white dark:bg-white/10">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <label style={{ backgroundColor: darkMode ? '#FFFFFF' : BRAND_COLOR, color: darkMode ? DARK_BG_COLOR : '#FFFFFF' }} className="px-6 h-10 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              {isExtracting ? <RotateCcw className="animate-spin" size={18}/> : <Plus size={18}/>}
              <span className="text-sm">Додати книгу</span>
            </label>
          </div>
        </header>
        {library.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed rounded-[40px] opacity-20"><BookOpen size={64} className="mx-auto mb-6"/><p className="text-2xl font-black uppercase">Бібліотека порожня</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map(book => (
              <div key={book.id} onClick={() => openBook(book)} className="group border p-6 rounded-3xl cursor-pointer bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:shadow-xl transition-all relative">
                <div className="flex justify-between mb-6">
                   <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-white"><FileText size={18}/></div>
                   <button onClick={(e) => {e.stopPropagation(); setLibrary(library.filter(b => b.id !== book.id))}} className="text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                </div>
                <h3 className="font-bold text-lg mb-4 line-clamp-1">{book.title}</h3>
                <div className="h-1 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
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
    <div className="fixed inset-0 flex flex-col items-center justify-center font-sans transition-colors duration-500 overflow-hidden" style={{ backgroundColor: darkMode ? DARK_BG_COLOR : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#0F172A' }}>
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10">
        <button onClick={closeReader} className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest" style={{ color: darkMode ? '#FFFFFF' : activeAccentColor }}><ChevronLeft size={16}/> Бібліотека</button>
        <div className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px] opacity-40">{currentBook.title}</div>
        <div className="w-10"></div>
      </div>

      {/* Reader Canvas з фіксованим центруванням */}
      <div className="relative w-full h-[40vh] flex justify-center items-center select-none" style={{ fontSize: `${fontSize}px` }}>
        <div className="absolute h-32 w-[2px] left-1/2 -translate-x-1/2 flex flex-col justify-between py-1 pointer-events-none z-0">
          <div className="w-6 h-1 -translate-x-1/2 rounded-full" style={{ backgroundColor: `${activeAccentColor}33` }}></div>
          <div className="w-6 h-1 -translate-x-1/2 rounded-full" style={{ backgroundColor: `${activeAccentColor}33` }}></div>
        </div>
        <div className="flex w-full font-mono font-bold tracking-tighter relative z-10">
          <div ref={wordBeforeRef} className="w-1/2 text-right whitespace-nowrap opacity-20 pr-[0.1em]"></div>
          <div ref={wordTargetRef} style={{ color: focusColor === 'custom-brand' ? (darkMode ? '#FFF' : activeAccentColor) : '' }} className={focusColor !== 'custom-brand' ? focusColor : ''}></div>
          <div ref={wordAfterRef} className="w-1/2 text-left whitespace-nowrap opacity-20 pl-[0.1em]"></div>
        </div>
      </div>

      <div className="fixed bottom-8 inset-x-6 max-w-5xl mx-auto">
        <div className={`relative border rounded-[32px] p-4 flex flex-col gap-4 shadow-2xl transition-all ${isPlayingUI ? 'opacity-20 hover:opacity-100' : ''}`} style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#FFF', borderColor: darkMode ? 'rgba(255,255,255,0.2)' : '#F1F5F9', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center justify-between px-2 h-14 relative">
            
            {/* WPS */}
            <div className="relative">
              <button onClick={() => { setIsWpsOpen(!isWpsOpen); setIsColorPickerOpen(false); }} className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 active:scale-90 transition-all">
                <Gauge size={14} className="opacity-50 mb-0.5" />
                <span className="text-[10px] font-black">{wps}</span>
              </button>
              {isWpsOpen && (
                <div className="absolute bottom-full mb-4 left-0 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 w-48 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between mb-2"><span className="text-[10px] font-black opacity-50 uppercase">Швидкість</span><span className="text-xs font-bold text-blue-500">{wps}</span></div>
                  <input type="range" min="1" max="30" value={wps} onChange={e => setWps(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
              )}
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
              <button onClick={() => skip(-10)} className="opacity-40 hover:opacity-100 active:scale-75 transition-all"><RotateCcw size={20} className="scale-x-[-1]" /></button>
              <button onClick={togglePlay} style={{ backgroundColor: activeAccentColor }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-all">
                {isPlayingUI ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor" className="ml-1"/>}
              </button>
              <button onClick={() => skip(10)} className="opacity-40 hover:opacity-100 active:scale-75 transition-all"><RotateCcw size={20} /></button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl p-1 border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10">
                <button onClick={() => setFontSize(Math.max(30, fontSize - 10))} className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100"><Minus size={16}/></button>
                <div className="px-1 flex flex-col items-center min-w-[24px]"><Type size={10} className="opacity-40" /><span className="text-[10px] font-bold">{fontSize}</span></div>
                <button onClick={() => setFontSize(Math.min(200, fontSize + 10))} className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100"><Plus size={16}/></button>
              </div>
              <button onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} style={{ backgroundColor: activeAccentColor }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all"><Palette size={18} /></button>
              {isColorPickerOpen && (
                <div className="absolute bottom-full mb-4 right-0 flex gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100">
                  {colors.map(c => (
                    <button key={c.name} onClick={() => {setFocusColor(c.class); setIsColorPickerOpen(false);}} style={{ backgroundColor: c.hex }} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="px-2">
            <div ref={progressBarRef} onClick={handleProgressBarClick} className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-100 dark:bg-white/10">
              <div className="h-full transition-all duration-300" style={{ backgroundColor: activeAccentColor, width: `${progressPercent}%` }}></div>
            </div>
            <div className="flex justify-between mt-1.5"><span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">Прогрес</span><span className="text-[9px] font-black" style={{ color: activeAccentColor }}>{progressPercent}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
