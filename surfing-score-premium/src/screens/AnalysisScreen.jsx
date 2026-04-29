import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const AnalysisScreen = ({ player, videoBlob, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('인공지능 모델 로딩 중...');
  const [metrics, setMetrics] = useState({ duration: 0, wipeOuts: 0, stability: 0 });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const videoUrl = URL.createObjectURL(videoBlob);
      
      video.src = videoUrl;

      // Initialize MediaPipe Pose
      if (!poseRef.current) {
        poseRef.current = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      }

      const poses = [];
      
      poseRef.current.onResults((results) => {
        if (!isMounted) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.poseLandmarks) {
          // Draw connectors and landmarks
          window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#86E5FF', lineWidth: 2 });
          window.drawLandmarks(ctx, results.poseLandmarks, { color: '#FFD700', lineWidth: 1, radius: 3 });
          
          const lm = results.poseLandmarks;
          const hipY = (lm[23].y + lm[24].y) / 2;
          const hipX = (lm[23].x + lm[24].x) / 2;
          const shoulderY = (lm[11].y + lm[12].y) / 2;
          const torsoVertical = Math.abs(hipY - shoulderY);
          
          poses.push({ t: video.currentTime, hipX, torsoVertical, detected: true });
        } else {
          poses.push({ t: video.currentTime, detected: false });
        }
      });

      video.onloadedmetadata = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;
        setStatus(`프레임 분석 중... (${duration.toFixed(1)}초 영상)`);

        const FPS = 8;
        const frameCount = Math.floor(duration * FPS);
        const interval = duration / frameCount;

        for (let i = 0; i < frameCount; i++) {
          if (!isMounted) break;
          
          video.currentTime = i * interval;
          await new Promise(r => video.onseeked = r);
          await poseRef.current.send({ image: video });
          
          const pct = Math.floor(((i + 1) / frameCount) * 100);
          setProgress(pct);
          
          // Partial Metrics Update
          const currentMetrics = computeMetrics(poses);
          setMetrics(currentMetrics);
        }

        if (isMounted) {
          const finalMetrics = computeMetrics(poses);
          setMetrics(finalMetrics);
          setStatus('분석 완료!');
          setTimeout(() => onComplete(finalMetrics), 1000);
        }
        
        URL.revokeObjectURL(videoUrl);
      };
    };

    runAnalysis();

    return () => {
      isMounted = false;
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, [videoBlob]);

  const computeMetrics = (poses) => {
    const detectedPoses = poses.filter(p => p.detected);
    if (detectedPoses.length === 0) return { duration: 0, wipeOuts: 0, stability: 0 };

    let startT = null, endT = null;
    for (const p of detectedPoses) {
      if (p.torsoVertical > 0.15) {
        if (startT === null) startT = p.t;
        endT = p.t;
      }
    }
    const duration = startT !== null ? Math.max(0, endT - startT) : 0;

    // Wipeout detection
    let wipeOuts = 0, wasUp = false, lastUpT = -1;
    for (const p of poses) {
      if (p.detected && p.torsoVertical > 0.15) {
        if (!wasUp && lastUpT > 0 && (p.t - lastUpT) > 0.8) wipeOuts++;
        wasUp = true; lastUpT = p.t;
      } else if (p.detected && p.torsoVertical < 0.08 && wasUp) {
        wipeOuts++; wasUp = false;
      } else if (!p.detected) { wasUp = false; }
    }

    // Stability (variance of X)
    const upPoses = detectedPoses.filter(p => p.torsoVertical > 0.15);
    let stability = 5;
    if (upPoses.length > 5) {
      const xs = upPoses.map(p => p.hipX);
      const mean = xs.reduce((a,b) => a+b, 0) / xs.length;
      const variance = xs.reduce((a,b) => a + (b-mean)**2, 0) / xs.length;
      stability = Math.max(0, Math.min(10, 10 - (Math.sqrt(variance) - 0.02) * 75));
    }

    return { duration, wipeOuts: Math.min(wipeOuts, 2), stability };
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
          >
            <Search className="w-10 h-10 text-isa-sky" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2">기술 데이터 추출 중</h2>
          <p className="text-slate-400">{player.name} 선수의 움직임을 정밀 분석하고 있습니다.</p>
        </div>

        <div className="glass-panel rounded-[40px] overflow-hidden mb-8 relative aspect-video bg-black">
          <video ref={videoRef} className="hidden" muted />
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-transparent to-transparent">
             <div className="flex justify-between items-center mb-3">
               <span className="text-xs font-black text-isa-sky uppercase tracking-widest">{status}</span>
               <span className="text-xl font-black text-white">{progress}%</span>
             </div>
             <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-gradient-to-r from-isa-sky to-isa-gold"
               />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-6 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Riding Time</div>
            <div className="text-2xl font-black text-white">{metrics.duration.toFixed(1)}s</div>
          </div>
          <div className="glass-card p-6 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Wipe Outs</div>
            <div className="text-2xl font-black text-rose-500">{metrics.wipeOuts}</div>
          </div>
          <div className="glass-card p-6 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Stability</div>
            <div className="text-2xl font-black text-emerald-400">{metrics.stability.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;
