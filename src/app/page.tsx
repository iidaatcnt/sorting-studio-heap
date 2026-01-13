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
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <GitBranch className="text-slate-900 w-5 h-5" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase tracking-widest text-amber-500">Heap_Sort_Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] mono uppercase text-slate-500 font-black tracking-widest">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'}`} />
                {isPlaying ? 'Rebuilding' : 'Waiting'}
              </div>
              <span className="opacity-20">|</span>
              <span>Step: {currentStep} / {steps.length - 1}</span>
            </div>
            <a href="https://github.com/iidaatcnt/sorting-studio-heap" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <div className="relative aspect-video lg:aspect-[4/3] bg-[#031121] rounded-[3rem] border border-white/5 p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-8 left-12 flex items-center gap-3 mono text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] z-10">
              <ArrowUp size={14} className="text-amber-500" />
              Binary Tree Representation // Max Heap
            </div>

            {/* SVG Lines for Tree */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              {step.array.map((_, i) => {
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                const start = getTreePos(i, 800, 600); // Dummy dimensions, will be scaled

                return (
                  <React.Fragment key={i}>
                    {left < ARRAY_SIZE && (
                      <line
                        x1={`${(getTreePos(i, 100, 100).x)}%`}
                        y1={`${(getTreePos(i, 100, 100).y)}%`}
                        x2={`${(getTreePos(left, 100, 100).x)}%`}
                        y2={`${(getTreePos(left, 100, 100).y)}%`}
                        stroke="white" strokeWidth="1"
                      />
                    )}
                    {right < ARRAY_SIZE && (
                      <line
                        x1={`${(getTreePos(i, 100, 100).x)}%`}
                        y1={`${(getTreePos(i, 100, 100).y)}%`}
                        x2={`${(getTreePos(right, 100, 100).x)}%`}
                        y2={`${(getTreePos(right, 100, 100).y)}%`}
                        stroke="white" strokeWidth="1"
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
                let colorClass = "bg-slate-800 border-white/10";

                if (isSelected) {
                  if (step.type === 'heapify') colorClass = "bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] border-cyan-400";
                  if (step.type === 'swap') colorClass = "bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-400 z-20";
                }

                if (step.type === 'sorted' && idx >= step.array.length - (currentStep > 0 ? 1 : 0)) {
                  // Logic to show confirmed elements might need more state, just a placeholder
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
                    className={`absolute w-14 h-14 rounded-2xl flex items-center justify-center border-2 mono font-black text-lg transition-all duration-300 ${colorClass}`}
                  >
                    {val}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Array representation at bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 p-2 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
              {step.array.map((val, idx) => (
                <div key={idx} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] mono font-bold border ${step.indices.includes(idx) ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {val}
                </div>
              ))}
            </div>
          </div>

          <div className="px-10 py-8 bg-slate-900/50 rounded-[2.5rem] border border-white/10 flex flex-col gap-8 shadow-inner">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex items-center gap-2">
                <button onClick={stepBackward} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"><StepBack size={20} /></button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-amber-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/20"
                >
                  {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                </button>
                <button onClick={stepForward} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"><StepForward size={20} /></button>
                <button onClick={reset} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400 ml-4"><RotateCcw size={20} /></button>
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mono text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">
                  <span>Tick Latency</span>
                  <span className="text-amber-500">{speed}ms</span>
                </div>
                <input type="range" min="100" max="980" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full appearance-none bg-slate-800 h-1.5 rounded-full accent-amber-500 cursor-pointer" />
              </div>
            </div>

            <div className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex gap-4">
              <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="text-amber-500 w-5 h-5" />
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Logic_Brief</h2>
            </div>
            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 mb-8">
              <h3 className="text-amber-500 font-black mb-3 text-sm">Heap Sort</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                配列を完全二分木（ヒープ）として扱い、まず全ての親が子より大きくなるよう整えます（最大ヒープ）。その後、根の最大値を取り出し末尾と入れ替えることを繰り返します。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mono text-[9px] font-black uppercase tracking-tighter">
              <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5 hover:border-amber-500/20 transition-colors">
                <span className="text-slate-600 block mb-1">Complexity</span>
                <span className="text-white">O(N log N)</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5 hover:border-amber-500/20 transition-colors">
                <span className="text-slate-600 block mb-1">Type</span>
                <span className="text-white">Tree-Based</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-black border border-white/5 rounded-[2.5rem] flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-500 w-5 h-5" />
                <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-600">Kernel_Exec</h2>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>

            <div className="flex-1 bg-zinc-950/30 p-8 rounded-2xl mono text-[10px] leading-loose overflow-auto border border-white/5 whitespace-nowrap scrollbar-hide">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-all duration-300 ${step.codeLine === i ? 'text-amber-400 bg-amber-400/10 -mx-8 px-8 border-l-2 border-amber-400 font-bold' : 'text-slate-800'}`}
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

      <footer className="mt-20 border-t border-white/5 py-16 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <GitBranch className="text-slate-900 w-8 h-8 opacity-20" />
          <p className="text-[8px] mono text-slate-700 uppercase tracking-[0.8em]">Interactive_Learning_Series // Informatics_I</p>
        </div>
      </footer>
    </div>
  );
}
