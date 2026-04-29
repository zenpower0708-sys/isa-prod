import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, Swords, Trophy, Users2, ArrowLeft } from 'lucide-react';

const modes = [
  { id: 'solo', title: '1인 솔로', desc: '개인 기록 측정 모드', icon: User, count: 1, needs: '영상 1개' },
  { id: 'duel2', title: '2인 대결', desc: '1:1 점수 비교 대결', icon: Swords, count: 2, needs: '영상 2개' },
  { id: 'duel3', title: '3인 대결', desc: '3명 라이더 랭킹', icon: Users, count: 3, needs: '영상 3개' },
  { id: 'duel4', title: '4인 대결', desc: '4명 라이더 랭킹', icon: Trophy, count: 4, needs: '영상 4개' },
  { id: 'team22', title: '2:2 팀전', desc: '2명씩 팀 합산 점수 대결', icon: Users2, count: 4, needs: '영상 4개' },
];

const ModeScreen = ({ onSelect, onBack }) => {
  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="p-3 rounded-full glass-card hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white">측정 모드 선택</h2>
          <p className="text-slate-400">진행할 경기 방식을 선택하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modes.map((mode, idx) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect(mode.id, mode.count)}
            className="glass-card group cursor-pointer p-8 rounded-3xl relative overflow-hidden"
          >
            {/* Hover Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-isa-sky/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-isa-sky/20 transition-colors">
                <mode.icon className="w-7 h-7 text-isa-sky group-hover:scale-110 transition-transform" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{mode.title}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{mode.desc}</p>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-isa-sky bg-isa-sky/10 px-2 py-1 rounded">Requirements</span>
                <span className="text-xs text-white/60">{mode.needs}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ModeScreen;
