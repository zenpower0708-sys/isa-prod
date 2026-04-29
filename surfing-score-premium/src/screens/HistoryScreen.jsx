import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Calendar, Trophy, Users, BarChart3 } from 'lucide-react';

const HistoryScreen = ({ onBack }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('surfing_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const clearHistory = () => {
    if (window.confirm('정말 모든 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('surfing_history');
      setHistory([]);
    }
  };

  const totalGames = history.length;
  const avgScore = history.length > 0 
    ? (history.reduce((acc, game) => acc + (game.players[0]?.results?.score || 0), 0) / history.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-full glass-card">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white">히스토리 분석</h2>
            <p className="text-slate-400">과거 경기 기록 및 기술 통계를 분석합니다.</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-3 rounded-full glass-card text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-8 rounded-[32px] border border-isa-sky/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-isa-sky/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-isa-sky" />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Matches</span>
          </div>
          <div className="text-4xl font-black text-white">{totalGames}</div>
        </div>

        <div className="glass-panel p-8 rounded-[32px] border border-isa-gold/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-isa-gold/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-isa-gold" />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Avg Performance</span>
          </div>
          <div className="text-4xl font-black text-white">{avgScore} <span className="text-sm font-bold text-white/40">PTS</span></div>
        </div>

        <div className="glass-panel p-8 rounded-[32px] border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Rank</span>
          </div>
          <div className="text-4xl font-black text-white">Elite <span className="text-sm font-bold text-white/40">PRO</span></div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="glass-panel p-20 rounded-[48px] text-center">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-xl font-bold text-white mb-2">기록이 없습니다</h3>
            <p className="text-slate-400 text-sm">첫 번째 경기를 시작하고 데이터를 축적하세요.</p>
          </div>
        ) : (
          history.map((game, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-[32px] flex items-center gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-white/20" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black text-isa-sky bg-isa-sky/10 px-2 py-0.5 rounded uppercase tracking-widest">
                    {game.mode}
                  </span>
                  <span className="text-xs text-white/20 font-bold">{new Date(game.date).toLocaleDateString()}</span>
                </div>
                <h5 className="text-lg font-bold text-white">
                  {game.players.map(p => p.name).join(' vs ')}
                </h5>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-white">
                  {game.players[0]?.results?.score || 0}
                </div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Winner Pts</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
