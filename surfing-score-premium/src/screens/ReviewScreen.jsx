import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Timer, Shield, Waves } from 'lucide-react';

const ReviewScreen = ({ player, initialResults, onComplete }) => {
  const [duration, setDuration] = useState(initialResults.duration);
  const [wipeOuts, setWipeOuts] = useState(initialResults.wipeOuts);
  const [stability, setStability] = useState(initialResults.stability);
  const [scoreData, setScoreData] = useState({ total: 0, breakdown: [] });

  useEffect(() => {
    calculateScore();
  }, [duration, wipeOuts, stability]);

  const calculateScore = () => {
    if (wipeOuts >= 2) {
      setScoreData({ 
        total: 0, 
        disqualified: true, 
        breakdown: [{ label: '실격 (Wipe Out 2회)', value: 0, color: 'text-rose-500' }] 
      });
      return;
    }

    let score = 100;
    const breakdown = [{ label: '기본 점수', value: 100, color: 'text-white/60' }];

    if (duration < 40) {
      const penalty = (40 - duration) * 2;
      score -= penalty;
      breakdown.push({ label: `시간 부족 (${duration.toFixed(1)}s)`, value: -penalty.toFixed(1), color: 'text-rose-400' });
    } else if (duration > 45) {
      const penalty = (duration - 45) * 1;
      score -= penalty;
      breakdown.push({ label: `시간 초과 (${duration.toFixed(1)}s)`, value: -penalty.toFixed(1), color: 'text-rose-400' });
    } else {
      breakdown.push({ label: '목표 시간 달성 (40-45s)', value: 0, color: 'text-emerald-400' });
    }

    if (wipeOuts === 1) {
      score -= 15;
      breakdown.push({ label: 'Wipe Out 1회', value: -15, color: 'text-amber-400' });
    }

    score += stability;
    breakdown.push({ label: `자세 안정성 (${stability.toFixed(1)}/10)`, value: `+${stability.toFixed(1)}`, color: 'text-isa-sky' });

    setScoreData({ 
      total: Math.max(0, Math.round(score * 10) / 10), 
      disqualified: false, 
      breakdown 
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <div className="mb-12">
        <span className="text-isa-sky font-bold text-xs uppercase tracking-widest">Stage 03</span>
        <h2 className="text-3xl font-black text-white mt-1">분석 데이터 검토</h2>
        <p className="text-slate-400">AI가 추출한 데이터를 확인하고 필요시 수정해 주세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adjustment Controls */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[40px]">
            <div className="flex items-center gap-3 mb-8">
              <Timer className="w-5 h-5 text-isa-sky" />
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Riding Analytics</h3>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-white/60">라이딩 지속 시간 (초)</label>
                  <span className="text-2xl font-black text-white">{duration.toFixed(1)}s</span>
                </div>
                <input 
                  type="range" min="0" max="60" step="0.1" 
                  value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full accent-isa-sky h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-white/20 mt-2">
                  <span>0s</span>
                  <span>TARGET: 40-45s</span>
                  <span>60s</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-white/60 block mb-4">Wipe Out 횟수</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((n) => (
                    <button
                      key={n}
                      onClick={() => setWipeOuts(n)}
                      className={`py-4 rounded-2xl font-bold transition-all ${wipeOuts === n ? 'bg-white text-isa-deep shadow-xl' : 'glass-card text-white/40 hover:bg-white/5'}`}
                    >
                      {n}회 {n === 2 && '(DQ)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-white/60">자세 안정성 점수</label>
                  <span className="text-2xl font-black text-isa-sky">{stability.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="0.1" 
                  value={stability} onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full accent-isa-gold h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Score Preview */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-[40px] flex-1 relative overflow-hidden border border-isa-sky/20">
            <div className="absolute top-0 right-0 p-8">
              <Shield className="w-16 h-16 text-white/5" />
            </div>
            
            <h3 className="font-bold text-white/60 uppercase tracking-widest text-xs mb-8">Expected Score</h3>
            
            <div className="mb-10">
              <motion.div 
                key={scoreData.total}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-8xl font-black ${scoreData.disqualified ? 'text-rose-500' : 'text-white'}`}
              >
                {scoreData.total}
              </motion.div>
              <div className="text-sm font-bold text-isa-sky mt-2 tracking-widest uppercase">ISA Performance Points</div>
            </div>

            <div className="space-y-3 border-t border-white/5 pt-8">
              {scoreData.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-medium">{item.label}</span>
                  <span className={`font-black ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onComplete({ duration, wipeOuts, stability, score: scoreData.total, disqualified: scoreData.disqualified })}
            className="w-full py-6 rounded-[32px] bg-white text-isa-deep font-black text-xl hover:bg-isa-sky transition-all flex items-center justify-center gap-3 shadow-2xl"
          >
            <span>데이터 저장 및 다음 단계</span>
            <CheckCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p className="text-xs font-medium">AI 분석 결과가 실제와 다를 경우 슬라이더를 조절하여 직접 수정할 수 있습니다.</p>
      </div>
    </div>
  );
};

export default ReviewScreen;
