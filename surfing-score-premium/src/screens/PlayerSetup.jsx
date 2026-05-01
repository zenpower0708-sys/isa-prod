import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const PlayerSetup = ({ players, onUpdatePlayer, onNext, onBack }) => {
  const handleNameChange = (idx, name) => {
    onUpdatePlayer(idx, { name });
  };

  const allNamed = players.every(p => p.name.trim() !== '');

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={onBack} className="p-3 rounded-full glass-card">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white">참가자 설정</h2>
          <p className="text-slate-400">선수들의 이름을 입력해 주세요.</p>
        </div>
      </div>

      <div className="space-y-6">
        {players.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              {player.team ? (
                <span className={`text-xl font-black ${player.team === 'A' ? 'text-rose-500' : 'text-blue-500'}`}>{player.team}</span>
              ) : (
                <UserPlus className="w-6 h-6 text-isa-sky" />
              )}
            </div>

            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Rider Name</label>
              <input
                type="text"
                value={player.name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                placeholder="선수 이름 입력"
                className="w-full bg-transparent text-xl font-bold text-white border-b border-white/10 focus:border-isa-sky outline-none py-2 transition-colors"
              />
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold">
                <ShieldCheck className="w-4 h-4" />
                준비 완료
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <button
          onClick={onNext}
          disabled={!allNamed}
          className={`w-full py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-3 transition-all
            ${allNamed 
              ? 'bg-white text-isa-deep shadow-2xl hover:bg-isa-sky' 
              : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
        >
          <span>영상 입력 단계로 이동</span>
          <ArrowRight className="w-6 h-6" />
        </button>
        {!allNamed && (
          <p className="text-center text-rose-400 text-xs mt-4 font-bold uppercase tracking-widest">
            Please enter names for all riders
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerSetup;
