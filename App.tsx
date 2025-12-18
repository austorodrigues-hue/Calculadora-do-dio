
import React, { useState, useCallback, useEffect } from 'react';
import { CalcButton, Display } from './components/CalculatorUI';
import { HistoryItem, CalcMode } from './types';

const App: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mode, setMode] = useState<CalcMode>('basic');

  // Carregar histórico do localStorage no início
  useEffect(() => {
    const saved = localStorage.getItem('novacalc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico");
      }
    }
  }, []);

  // Salvar histórico sempre que mudar
  useEffect(() => {
    localStorage.setItem('novacalc_history', JSON.stringify(history));
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

      const calculatedResult = eval(sanitized);
      const resultStr = Number.isInteger(calculatedResult) 
        ? calculatedResult.toString() 
        : parseFloat(calculatedResult.toFixed(8)).toString();
      
      setResult(resultStr);
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression,
        result: resultStr,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 30));
    } catch (err) {
      setResult('Erro');
    }
  }, [expression]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('novacalc_history');
  };

  // Suporte a teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (e.key === '.') handleInput('.');
      if (e.key === '+') handleInput('+');
      if (e.key === '-') handleInput('-');
      if (e.key === '*') handleInput('×');
      if (e.key === '/') handleInput('÷');
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') handleClear();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Lado Esquerdo: Calculadora */}
        <div className="flex-1 flex flex-col max-w-lg mx-auto lg:mx-0">
          <header className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">N</span>
              NovaCalc Pro
            </h1>
            <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
              <button 
                onClick={() => setMode('basic')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'basic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Básico
              </button>
              <button 
                onClick={() => setMode('scientific')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'scientific' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Científico
              </button>
            </div>
          </header>

          <Display expression={expression} result={result} />

          <div className="grid grid-cols-4 gap-3 bg-slate-900/30 p-4 rounded-[2.5rem] border border-white/5 shadow-2xl">
            {mode === 'scientific' && (
              <React.Fragment>
                <CalcButton label="sin" onClick={() => handleInput('sin(')} variant="scientific" />
                <CalcButton label="cos" onClick={() => handleInput('cos(')} variant="scientific" />
                <CalcButton label="tan" onClick={() => handleInput('tan(')} variant="scientific" />
                <CalcButton label="√" onClick={() => handleInput('√(')} variant="scientific" />
                <CalcButton label="log" onClick={() => handleInput('log(')} variant="scientific" />
                <CalcButton label="ln" onClick={() => handleInput('ln(')} variant="scientific" />
                <CalcButton label="π" onClick={() => handleInput('π')} variant="scientific" />
                <CalcButton label="^" onClick={() => handleInput('^')} variant="scientific" />
              </React.Fragment>
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

            <CalcButton label="0" onClick={() => handleInput('0')} className="col-span-1" />
            <CalcButton label="." onClick={() => handleInput('.')} />
            <CalcButton label="⌫" onClick={handleDelete} variant="action" />
            <CalcButton label="=" onClick={calculate} variant="operator" className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20" />
          </div>
        </div>

        {/* Lado Direito: Histórico */}
        <div className="flex-1 flex flex-col min-w-[300px]">
          <div className="glass rounded-[2rem] p-6 flex flex-col h-full max-h-[600px] border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-slate-200 font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico Recente
              </h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
                >
                  Limpar
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-8">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="italic">Nada por aqui ainda.</p>
                  <p className="text-xs mt-2">Seus cálculos aparecerão aqui.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer active:scale-[0.98]"
                    onClick={() => {
                      setExpression(item.expression);
                      setResult(item.result);
                    }}
                  >
                    <div className="text-xs text-slate-500 mb-1 font-mono">{item.expression} =</div>
                    <div className="text-slate-100 font-mono font-bold text-lg group-hover:text-indigo-400 transition-colors">
                      {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-6 flex gap-4 text-slate-500 text-xs justify-center lg:justify-start">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-white/10 text-[10px]">Enter</kbd> Calcular
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-white/10 text-[10px]">Esc</kbd> Limpar
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-slate-600 text-sm flex flex-col items-center gap-1">
        <p>© 2024 NovaCalc Pro • Estático & Rápido</p>
        <p className="text-[10px] opacity-50 uppercase tracking-tighter">Pronto para GitHub Pages</p>
      </footer>
    </div>
  );
};

export default App;
