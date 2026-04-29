import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Smartphone, CheckCircle, X } from 'lucide-react';

const RealNameAuth = ({ isOpen, onComplete, onCancel }) => {
  const [step, setStep] = useState('choice'); // choice, processing, success
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-isa-deep/80 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-md glass-panel p-8 rounded-[32px] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-isa-sky" />
            <span className="text-sm font-bold text-white/60 tracking-wider">ISA SAFE-AUTH</span>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-2xl font-bold text-white mb-2">실명 인증이 필요합니다</h3>
              <p className="text-slate-400 text-sm mb-8">공정한 경기 측정을 위해 국가 표준 실명 인증을 진행해 주세요.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setStep('processing')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-white hover:bg-isa-sky transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-isa-deep flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-isa-deep font-bold">휴대폰 본인 확인</div>
                      <div className="text-isa-deep/60 text-xs">SKT, KT, LG U+, 알뜰폰</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-isa-deep/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-isa-deep group-hover:bg-white" />
                  </div>
                </button>

                <button 
                  onClick={() => setStep('processing')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl glass-card hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="font-black text-xs text-isa-sky">PASS</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold">간편인증 (PASS)</div>
                      <div className="text-white/40 text-xs">PASS 앱을 통한 빠른 인증</div>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-isa-sky/20 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-t-isa-sky rounded-full" 
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">인증 대기 중...</h3>
              <p className="text-slate-400 text-sm">휴대폰에서 전송된 인증 요청을 확인해 주세요.</p>
              
              <button 
                onClick={() => setStep('success')}
                className="mt-8 text-isa-sky text-sm font-bold underline"
              >
                (데모용) 인증 완료 시뮬레이션
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">인증이 완료되었습니다</h3>
              <p className="text-slate-400 text-sm mb-8">홍길동 (010-****-5678)</p>
              
              <button 
                onClick={onComplete}
                className="w-full bg-white text-isa-deep font-black py-4 rounded-2xl hover:bg-isa-sky transition-colors"
              >
                경기장 입장하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RealNameAuth;
