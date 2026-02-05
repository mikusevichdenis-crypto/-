import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Settings, 
  Zap, 
  FileText, 
  Layout, 
  BarChart3, 
  ShieldCheck, 
  Database, 
  Clock 
} from 'lucide-react';

const CONTENT = {
  title: "SpeedRead",
  hero: {
    heading: "Керуйте бізнесом швидше та ефективніше!",
    subheading: "Bimp — це розумна система для виробництва та e-commerce, яка автоматизує все: від техкарт до фінансових звітів.",
    cta: "Спробувати безкоштовно"
  },
  bimpDetails: {
    title: "Що таке Bimp?",
    description: "Управлінський облік та склад для Виробництва і E-commerce. Масштабуйте бізнес правильно: автоматичний розрахунок собівартості, планування запасів та P&L в одній системі.",
    features: [
      {
        icon: <Settings className="w-6 h-6 text-blue-500" />,
        title: "Специфікації та техкарти",
        text: "Автоматичне списання матеріалів за рецептурами в момент готовності продукції."
      },
      {
        icon: <BarChart3 className="w-6 h-6 text-green-500" />,
        title: "Реальна собівартість",
        text: "Враховуйте вартість роботи, доставки та накладні витрати в кожній одиниці товару."
      },
      {
        icon: <Database className="w-6 h-6 text-purple-500" />,
        title: "Планування закупівель",
        text: "Запобігайте дефіциту та не заморожуйте гроші в зайвому товарі завдяки розумним алгоритмам."
      },
      {
        icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
        title: "Повний контроль фінансів",
        text: "Заборгованість, рентабельність, P&L та Cashflow завжди під рукою для власників."
      }
    ]
  },
  demo: {
    title: "Демо-плеєр",
    stats: "450+ активних компаній",
    speed: "x3 пришвидшення процесів"
  },
  footer: "© 2026 SpeedRead & Bimp. Всі права захищені."
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600 fill-blue-600" />
            <span className="text-2xl font-bold text-blue-800 tracking-tight">{CONTENT.title}</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Можливості</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Ціни</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Про нас</a>
          </nav>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
            Увійти
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            {CONTENT.hero.heading}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            {CONTENT.hero.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              {CONTENT.hero.cta}
              <Zap className="w-5 h-5" />
            </button>
            <button className="bg-white border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors">
              Дивитися демо
            </button>
          </div>
        </section>

        {/* Bimp Features Grid */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{CONTENT.bimpDetails.title}</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              {CONTENT.bimpDetails.description}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTENT.bimpDetails.features.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="mb-4 bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Box */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Clock className="w-3 h-3" /> LIVE DEMO
            </div>
            <h2 className="text-3xl font-bold mb-4">{CONTENT.demo.title}</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                <span className="text-slate-700 font-medium">{CONTENT.demo.stats}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">⚡</div>
                <span className="text-slate-700 font-medium">{CONTENT.demo.speed}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
             <button className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
               <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
             </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          {CONTENT.footer}
        </div>
      </footer>
    </div>
  );
};

export default App;
