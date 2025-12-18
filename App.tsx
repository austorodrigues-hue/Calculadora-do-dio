
import React, { useState, useCallback, useEffect } from 'react';

// --- Tipos ---
interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

type CalcMode = 'basic' | 'scientific';

// --- Componentes UI Internos ---
const CalcButton = ({ label, onClick, variant = 'number', className = '' }: any) => {
  const baseStyles = "calc-button h-14 md:h-16 rounded-2xl font-semibold text-lg flex items-center justify-center shadow-sm";
  const variantStyles: any = {
    number: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    operator: "bg-indigo-600 text-white hover:bg-indigo-500",
    action: "bg-slate-700 text-amber-400 hover:bg-slate-600",
    scientific: "bg-slate-900 text-indigo-400 hover:bg-slate-800 text-sm"
  };
  return (
    <button onClick={onClick} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {label}
    </button>
  );
};

const Display = ({ expression, result }: { expression: string; result: string }) => (
  <div className="glass rounded-3xl p-6 mb-4 flex flex-col items-end justify-end overflow-hidden min-h-[140px] border border-white/10 shadow-inner">
    <div className="text-slate-400 text-lg font-mono mb-2 truncate w-full text-right h-7 opacity-70">
      {expression || ' '}
    </div>
    <div className="text-white text-4xl md:text-5xl font-bold font-mono truncate w-full text-right tracking-tighter">
      {result || '0'}
    </div>
  </div>
);

// --- Componente Principal ---
const App: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mode, setMode] = useState<CalcMode>('basic');

  useEffect(() => {
    const saved = localStorage.getItem('novacalc_history_v2');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('novacalc_history_v2', JSON.stringify(history));
  }, [history]);

  const handleClear = () => {
    setExpression('');
    setResult('');
  };

  const handleDelete = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const handleInput = (val: string) => {
    setExpression(prev => prev + val);
  };

  const calculate = useCallback(() => {
    if (!expression) return;
    try {
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // Eval seguro para fins de calculadora estática simples
      const calculatedResult = eval(sanitized);
      const resultStr = Number.isInteger(calculatedResult) 
        ? calculatedResult.toString() 
        : parseFloat(calculatedResult.toFixed(8)).toString();
      
      setResult(resultStr);
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 11),
        expression,
        result: resultStr,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 30));
    } catch (err) {
      setResult('Erro');
    }
  }, [expression]);

  // Suporte a teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (e.key === '.') handleInput('.');
      if (e.key === '+') handleInput('+');
      if (e.key === '-') handleInput('-');
      if (e.key === '*') handleInput('×');
      if (e.key === '/') handleInput('÷');
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') handleClear();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-[#0f172a] selection:bg-indigo-500/30">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Calculadora */}
        <div className="flex-1 flex flex-col max-w-lg mx-auto lg:mx-0">
          <header className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">N</span>
              NovaCalc Pro
            </h1>
            <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/5 backdrop-blur-md">
              <button onClick={() => setMode('basic')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === 'basic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Básico</button>
              <button onClick={() => setMode('scientific')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === 'scientific' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Científico</button>
            </div>
          </header>

          <Display expression={expression} result={result} />

          <div className="grid grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl">
            {mode === 'scientific' && (
              <>
                <CalcButton label="sin" onClick={() => handleInput('sin(')} variant="scientific" />
                <CalcButton label="cos" onClick={() => handleInput('cos(')} variant="scientific" />
                <CalcButton label="tan" onClick={() => handleInput('tan(')} variant="scientific" />
                <CalcButton label="√" onClick={() => handleInput('√(')} variant="scientific" />
                <CalcButton label="log" onClick={() => handleInput('log(')} variant="scientific" />
                <CalcButton label="ln" onClick={() => handleInput('ln(')} variant="scientific" />
                <CalcButton label="π" onClick={() => handleInput('π')} variant="scientific" />
                <CalcButton label="^" onClick={() => handleInput('^')} variant="scientific" />
              </>
            )}
            <CalcButton label="C" onClick={handleClear} variant="action" />
            <CalcButton label="(" onClick={() => handleInput('(')} variant="action" />
            <CalcButton label=")" onClick={() => handleInput(')')} variant="action" />
            <CalcButton label="÷" onClick={() => handleInput('÷')} variant="operator" />
            <CalcButton label="7" onClick={() => handleInput('7')} />
            <CalcButton label="8" onClick={() => handleInput('8')} />
            <CalcButton label="9" onClick={() => handleInput('9')} />
            <CalcButton label="×" onClick={() => handleInput('×')} variant="operator" />
            <CalcButton label="4" onClick={() => handleInput('4')} />
            <CalcButton label="5" onClick={() => handleInput('5')} />
            <CalcButton label="6" onClick={() => handleInput('6')} />
            <CalcButton label="-" onClick={() => handleInput('-')} variant="operator" />
            <CalcButton label="1" onClick={() => handleInput('1')} />
            <CalcButton label="2" onClick={() => handleInput('2')} />
            <CalcButton label="3" onClick={() => handleInput('3')} />
            <CalcButton label="+" onClick={() => handleInput('+')} variant="operator" />
            <CalcButton label="0" onClick={() => handleInput('0')} />
            <CalcButton label="." onClick={() => handleInput('.')} />
            <CalcButton label="⌫" onClick={handleDelete} variant="action" />
            <CalcButton label="=" onClick={calculate} variant="operator" className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" />
          </div>
        </div>

        {/* Histórico */}
        <div className="flex-1 flex flex-col min-w-[320px]">
          <div className="glass rounded-[2.5rem] p-6 flex flex-col h-full max-h-[620px] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-slate-200 font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Histórico
              </h2>
              {history.length > 0 && (
                <button onClick={() => { setHistory([]); localStorage.removeItem('novacalc_history_v2'); }} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-black">Limpar</button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-8 opacity-40">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="text-sm font-medium">Histórico vazio</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all group cursor-pointer active:scale-[0.98]" onClick={() => { setExpression(item.expression); setResult(item.result); }}>
                    <div className="text-xs text-slate-500 mb-1 font-mono group-hover:text-indigo-300 transition-colors">{item.expression} =</div>
                    <div className="text-slate-100 font-mono font-bold text-lg">{item.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-6 flex gap-4 text-slate-500 text-[10px] justify-center lg:justify-start font-bold uppercase tracking-widest opacity-60">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-white/10">Enter</kbd> Calcular</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-white/10">Esc</kbd> Limpar</span>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">
        NovaCalc Pro • GitHub Pages Ready
      </footer>
    </div>
  );
};

export default App;
