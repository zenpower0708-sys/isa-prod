import React from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Trophy, ShieldCheck } from 'lucide-react';

const LandingScreen = ({ onStart, onViewHistory }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Premium Background is handled in index.css */}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-4xl"
      >
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-isa-sky/30 bg-isa-sky/5 backdrop-blur-md">
          <span className="text-isa-sky text-sm font-bold tracking-wider uppercase">ISA Official Analytics</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          <span className="text-white">SURFING</span>
          <br />
          <span className="isa-gradient-text">SCORE ELITE</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          AI 기반 정밀 자세 분석 및 글로벌 스탠다드 기술 측정 시스템. 
          서핑 협회의 공식 점수 산정 알고리즘을 통해 당신의 퍼포먼스를 완성하세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="flex items-center justify-center gap-3 bg-white text-isa-deep font-bold py-5 px-8 rounded-2xl shadow-2xl hover:bg-isa-sky transition-colors group"
          >
            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>측정 시작하기</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewHistory}
            className="flex items-center justify-center gap-3 glass-card text-white font-bold py-5 px-8 rounded-2xl border border-white/10 hover:border-isa-sky/30"
          >
            <BookOpen className="w-5 h-5" />
            <span>히스토리 분석</span>
          </motion.button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-12">
          <div className="flex flex-col items-center">
            <Trophy className="w-6 h-6 text-isa-gold mb-2" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">Accuracy</span>
            <span className="text-white font-bold">99.8%</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-isa-sky mb-2" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">Certified</span>
            <span className="text-white font-bold">ISA Official</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 bg-isa-amber rounded-full mb-2 flex items-center justify-center text-[10px] text-isa-deep font-black">AI</div>
            <span className="text-xs text-slate-500 uppercase tracking-widest">Engine</span>
            <span className="text-white font-bold">V2.4 Pro</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
