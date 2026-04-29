import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, BookOpen, Share2, Medal, Users } from 'lucide-react';

const ResultScreen = ({ players, mode, onHome, onHistory }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.results.disqualified && !b.results.disqualified) return 1;
    if (!a.results.disqualified && b.results.disqualified) return -1;
    return b.results.score - a.results.score;
  });

  const winner = sortedPlayers[0].results.disqualified ? null : sortedPlayers[0];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-isa-gold rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.3)]"
        >
          <Trophy className="w-12 h-12 text-isa-deep" />
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-2">FINAL RESULTS</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">ISA Official Performance Ranking</p>
      </div>

      {/* Winner Highlight */}
      {winner && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-10 rounded-[48px] mb-12 border border-isa-gold/30 relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-isa-gold/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-isa-gold text-isa-deep text-[10px] font-black uppercase tracking-widest mb-4">The Winner</span>
            <h3 className="text-6xl font-black text-white mb-2 tracking-tighter">{winner.name}</h3>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-4xl font-black text-isa-gold">{winner.results.score}</span>
              <span className="text-xl font-bold text-white/40">PTS</span>
            </div>
            
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto py-6 border-t border-white/5">
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Time</div>
                <div className="text-lg font-bold text-white">{winner.results.duration.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Stability</div>
                <div className="text-lg font-bold text-white">{winner.results.stability.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Penalty</div>
                <div className="text-lg font-bold text-rose-400">{winner.results.wipeOuts}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-4 mb-12">
        <h4 className="text-xs font-black text-white/40 uppercase tracking-widest px-6 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Full Standings
        </h4>
        {sortedPlayers.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className={`glass-card p-6 rounded-3xl flex items-center gap-6 ${player.id === winner?.id ? 'border-isa-gold/30' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${idx === 0 ? 'bg-isa-gold text-isa-deep' : 'bg-white/5 text-white/40'}`}>
              {idx + 1}
            </div>
            
            <div className="flex-1">
              <h5 className="text-xl font-bold text-white">{player.name}</h5>
              {player.team && <span className="text-[10px] font-bold text-isa-sky uppercase tracking-widest">Team {player.team}</span>}
            </div>

            <div className="text-right">
              <div className={`text-2xl font-black ${player.results.disqualified ? 'text-rose-500' : 'text-white'}`}>
                {player.results.disqualified ? 'DQ' : player.results.score}
              </div>
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Points</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onHome}
          className="flex items-center justify-center gap-3 glass-card text-white font-bold py-5 px-8 rounded-3xl border border-white/10 hover:border-isa-sky/30 transition-all"
        >
          <Home className="w-5 h-5" />
          <span>메인으로 돌아가기</span>
        </button>
        <button
          onClick={onHistory}
          className="flex items-center justify-center gap-3 bg-white text-isa-deep font-black py-5 px-8 rounded-3xl hover:bg-isa-sky transition-all shadow-2xl"
        >
          <BookOpen className="w-5 h-5" />
          <span>전체 히스토리 분석</span>
        </button>
      </div>

      <div className="mt-12 text-center">
        <button className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
          <Share2 className="w-4 h-4" />
          Share Results
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
