'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Github,
  Info,
  Code2,
  Zap,
  Lightbulb,
  GitBranch,
  ArrowUp
} from 'lucide-react';

// --- Types ---
type SortState = 'heapify' | 'swap' | 'sorted' | 'init' | 'complete';

interface SortingStep {
  array: number[];
  indices: number[]; // Working indices
  type: SortState;
  description: string;
  codeLine?: number;
}

// --- Constants ---
const ARRAY_SIZE = 10;
const INITIAL_SPEED = 800;

const CODE_PYTHON = [
  "def heap_sort(arr):",
  "    n = len(arr)",
  "    for i in range(n // 2 - 1, -1, -1):",
  "        heapify(arr, n, i)",
  "    for i in range(n - 1, 0, -1):",
  "        arr[i], arr[0] = arr[0], arr[i]",
  "        heapify(arr, i, 0)",
  "",
  "def heapify(arr, n, i):",
  "    largest = i",
  "    l = 2 * i + 1",
  "    r = 2 * i + 2",
  "    if l < n and arr[l] > arr[largest]:",
  "        largest = l",
  "    if r < n and arr[r] > arr[largest]:",
  "        largest = r",
  "    if largest != i:",
  "        arr[i], arr[largest] = arr[largest], arr[i]",
  "        heapify(arr, n, largest)"
];

// --- Algorithm Logic ---
const generateSteps = (initialArray: number[]): SortingStep[] => {
  const steps: SortingStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  const pushStep = (type: SortState, desc: string, line: number, indices: number[]) => {
    steps.push({
      array: [...arr],
      indices,
      type,
      description: desc,
      codeLine: line
    });
  };

  const heapify = (n: number, i: number) => {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    pushStep('heapify', `ノード ${i} (${arr[i]}) を中心にヒープ構造を整えます。`, 9, [i]);

    if (l < n) {
      pushStep('heapify', `左の子ノード ${l} (${arr[l]}) と比較します。`, 12, [i, l]);
      if (arr[l] > arr[largest]) {
        largest = l;
      }
    }

    if (r < n) {
      pushStep('heapify', `右の子ノード ${r} (${arr[r]}) と比較します。`, 14, [largest, r]);
      if (arr[r] > arr[largest]) {
        largest = r;
      }
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      pushStep('swap', `親より大きいノードが見つかったため、${arr[i]} と ${arr[largest]} を入れ替えます。`, 18, [i, largest]);
      heapify(n, largest);
    }
  };

  pushStep('init', 'ヒープソートを開始します。まずは「最大ヒープ」を構築します。', 0, []);

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    pushStep('swap', `現在の最大値 ${arr[i]} を末尾に移動し、ソート済みとして確定させます。`, 5, [0, i]);
    pushStep('sorted', `${arr[i]} が確定しました。`, 6, [i]);
    heapify(i, 0);
  }

  pushStep('complete', 'すべての要素がヒープから取り出され、整列が完了しました！', 0, Array.from({ length: n }, (_, k) => k));

  return steps;
};

// --- Tree Geometry ---
const getTreePos = (idx: number, width: number, height: number) => {
  const level = Math.floor(Math.log2(idx + 1));
  const posInLevel = idx - (Math.pow(2, level) - 1);
  const nodesInLevel = Math.pow(2, level);
  const x = (posInLevel + 0.5) * (width / nodesInLevel);
  const y = (level + 1) * (height / 5);
  return { x, y };
};


// --- Main App ---
export default function HeapSortStudio() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 80) + 15);
    const newSteps = generateSteps(newArray);
    setArray(newArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1001 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep] || { array: [], indices: [], type: 'init', description: '' };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GitBranch className="text-white w-5 h-5" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase tracking-widest text-indigo-600">Heap_Sort_Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] mono uppercase text-slate-400 font-black tracking-widest">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'}`} />
                {isPlaying ? '構築中' : '停止中'}
              </div>
              <span className="opacity-20">|</span>
              <span>Step: {currentStep} / {steps.length - 1}</span>
            </div>
            <a href="https://github.com/iidaatcnt/sorting-studio-heap" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <div className="relative aspect-video lg:aspect-[4/3] bg-white rounded-[3rem] border border-slate-200 p-12 overflow-hidden shadow-xl">
            <div className="absolute top-8 left-12 flex items-center gap-3 mono text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] z-10">
              <ArrowUp size={14} className="text-indigo-600" />
              ヒープ構造（二分木）の可視化
            </div>

            {/* SVG Lines for Tree */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.1]">
              {step.array.map((_, i) => {
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                // Since this is in %, we use 100 as the reference
                return (
                  <React.Fragment key={i}>
                    {left < ARRAY_SIZE && (
                      <line
                        x1={`${(getTreePos(i, 100, 100).x)}%`}
                        y1={`${(getTreePos(i, 100, 100).y)}%`}
                        x2={`${(getTreePos(left, 100, 100).x)}%`}
                        y2={`${(getTreePos(left, 100, 100).y)}%`}
                        stroke="black" strokeWidth="1"
                      />
                    )}
                    {right < ARRAY_SIZE && (
                      <line
                        x1={`${(getTreePos(i, 100, 100).x)}%`}
                        y1={`${(getTreePos(i, 100, 100).y)}%`}
                        x2={`${(getTreePos(right, 100, 100).x)}%`}
                        y2={`${(getTreePos(right, 100, 100).y)}%`}
                        stroke="black" strokeWidth="1"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </svg>

            <AnimatePresence mode="popLayout" initial={false}>
              {step.array.map((val, idx) => {
                const pos = getTreePos(idx, 100, 100);
                const isSelected = step.indices.includes(idx);
                let colorClass = "bg-slate-50 border-slate-200";

                if (isSelected) {
                  if (step.type === 'heapify') colorClass = "bg-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.5)] border-indigo-300 text-white";
                  if (step.type === 'swap') colorClass = "bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] border-rose-400 z-20 text-white";
                }

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute w-14 h-14 rounded-2xl flex items-center justify-center border-2 text-sm font-black transition-all duration-300 ${colorClass}`}
                  >
                    {val}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Array representation at bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 backdrop-blur-sm shadow-inner">
              {step.array.map((val, idx) => (
                <div key={idx} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border ${step.indices.includes(idx) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                  {val}
                </div>
              ))}
            </div>
          </div>

          <div className="px-10 py-8 bg-white rounded-[2.5rem] border border-slate-200 flex flex-col gap-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex items-center gap-2">
                <button onClick={stepBackward} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"><StepBack size={20} /></button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                >
                  {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                </button>
                <button onClick={stepForward} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"><StepForward size={20} /></button>
                <button onClick={reset} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors text-slate-400 ml-4"><RotateCcw size={20} /></button>
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mono text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3 font-bold">
                  <span>再生スピード</span>
                  <span className="text-indigo-600">{speed}ms</span>
                </div>
                <input type="range" min="100" max="980" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full appearance-none bg-slate-100 h-1.5 rounded-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
              <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="text-amber-500 w-5 h-5" />
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">学習ガイド</h2>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
              <h3 className="text-indigo-600 font-black mb-3 text-sm">Heap Sort</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                配列を完全二分木（ヒープ）として扱い、まず全ての親が子より大きくなるよう整えます（最大ヒープ）。その後、根の最大値を取り出し末尾と入れ替えることを繰り返します。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mono text-[9px] font-black uppercase tracking-tighter">
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 transition-colors">
                <span className="text-slate-400 block mb-1">Complexity</span>
                <span className="text-indigo-600 font-black">O(N log N)</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 transition-colors">
                <span className="text-slate-400 block mb-1">Type</span>
                <span className="text-slate-700 font-black">Tree-Based</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#0f172a] border border-slate-800 rounded-[2.5rem] flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-400 w-5 h-5" />
                <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-500">Python 実装例</h2>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            </div>

            <div className="flex-1 bg-black/20 p-8 rounded-2xl mono text-[10px] leading-loose overflow-auto border border-slate-800 scrollbar-hide text-slate-300">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-all duration-300 ${step.codeLine === i ? 'text-indigo-400 bg-indigo-500/10 -mx-8 px-8 border-l-2 border-indigo-400 font-bold' : 'text-slate-800'}`}
                >
                  <span className="text-slate-900 tabular-nums w-4 select-none opacity-50">{i + 1}</span>
                  <pre className="whitespace-pre">{line}</pre>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between items-center opacity-30">
              <span className="text-[8px] mono text-slate-500 uppercase tracking-[0.5em]">priority_queue_core</span>
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-16 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <GitBranch className="text-slate-200 w-8 h-8 opacity-20" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Fundamental Wisdom for the AI Era // Algorithm Literacy // しろいプログラミング教室</p>
        </div>
      </footer>
    </div>
  );
}
