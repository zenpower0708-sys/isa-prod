import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Globe, Landmark, ShieldCheck, X } from 'lucide-react';

const PaymentModule = ({ isOpen, amount, onComplete, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-isa-deep/90 backdrop-blur-xl" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg glass-panel overflow-hidden rounded-[40px]"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-white">결제 시스템</h3>
            <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full">
              <X className="w-6 h-6 text-white/40" />
            </button>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Amount</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-isa-sky">{amount.toLocaleString()}</span>
              <span className="text-lg font-bold text-white/60">KRW</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold text-white/40 px-2 uppercase tracking-tighter">국내 결제 (Domestic)</div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-3 p-6 rounded-3xl glass-card hover:bg-white/10 transition-colors">
                <CreditCard className="w-6 h-6 text-isa-sky" />
                <span className="text-sm font-bold text-white">신용카드</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 rounded-3xl glass-card hover:bg-white/10 transition-colors">
                <Landmark className="w-6 h-6 text-isa-sky" />
                <span className="text-sm font-bold text-white">계좌이체</span>
              </button>
            </div>

            <div className="text-xs font-bold text-white/40 px-2 uppercase tracking-tighter mt-6">해외 결제 (International)</div>
            <button className="w-full flex items-center justify-between p-6 rounded-3xl glass-card hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <Globe className="w-6 h-6 text-isa-gold" />
                <div className="text-left">
                  <div className="text-white font-bold">Global Checkout</div>
                  <div className="text-white/40 text-xs">Visa, Mastercard, PayPal</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-white/60">WORLDWIDE</div>
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-white/30">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted by ISA Pay Engine</span>
          </div>
        </div>

        <div className="bg-isa-sky/5 p-6 border-t border-white/5">
          <button 
            onClick={onComplete}
            className="w-full bg-white text-isa-deep font-black py-5 rounded-3xl shadow-2xl hover:bg-isa-sky transition-colors text-lg"
          >
            안전하게 결제하기
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModule;
