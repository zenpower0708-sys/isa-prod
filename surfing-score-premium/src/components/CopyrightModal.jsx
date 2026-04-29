import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CopyrightModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal shortly after component mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  ⚖️
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight">지식재산권 보호 안내</h2>
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.2em]">Intellectual Property Protection</p>
                </div>
              </div>

              <div className="space-y-6 text-slate-600">
                <p className="text-lg font-bold text-slate-800 leading-snug">
                  본 애플리케이션의 모든 서비스, 기술, 콘텐츠 및 브랜드에 대한 권리는 관련 법령에 의해 엄격히 보호받고 있습니다.
                </p>
                
                <div className="grid gap-5">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                      <span>1. 저작권 보호 (Copyright)</span>
                    </h3>
                    <p className="text-sm leading-relaxed">소스코드, UI/UX 디자인, 그래픽 등 모든 결과물은 저작권법의 보호를 받습니다. 무단 복제, 배포, 수정 행위를 엄격히 금지합니다.</p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                      <span>2. 특허 및 아이디어 보호</span>
                    </h3>
                    <p className="text-sm leading-relaxed">기술 측정 알고리즘 및 핵심 실행 방법은 특허법 및 부정경쟁방지법에 의해 보호됩니다. 기술 도용 및 리버스 엔지니어링을 일절 금합니다.</p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                      <span>3. 상표권 보호</span>
                    </h3>
                    <p className="text-sm leading-relaxed">공식 로고 및 브랜드 자산의 무단 도용 및 상업적 이용을 금합니다.</p>
                  </div>
                </div>

                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-rose-700 shadow-sm">
                  <h3 className="font-bold mb-2 text-base flex items-center gap-2">
                    <span className="text-xl">⚠️</span> 위반 시 법적 조치
                  </h3>
                  <p className="text-sm leading-relaxed">침해 행위 발생 시 사전 경고 없는 즉각적인 형사 고발 및 강력한 민사상 손해배상 청구를 진행할 것임을 알려드립니다.</p>
                </div>
                
                <p className="text-right text-xs text-slate-400 font-bold tracking-wider italic">by ISA Kwak seyoung</p>
              </div>

              <button 
                onClick={handleClose} 
                className="w-full mt-10 bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-lg"
              >
                동의하고 계속하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CopyrightModal;
