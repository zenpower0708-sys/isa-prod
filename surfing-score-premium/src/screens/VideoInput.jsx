import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Play, RefreshCw, CheckCircle, Video } from 'lucide-react';

const VideoInput = ({ player, onComplete, onBack }) => {
  const [mode, setMode] = useState('choice'); // choice, upload, record, preview
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("카메라에 접근할 수 없습니다.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleStartRecording = () => {
    chunksRef.current = [];
    const stream = videoRef.current.srcObject;
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setMode('preview');
      stopCamera();
    };
    
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRecordedBlob(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMode('preview');
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <span className="text-isa-sky font-bold text-xs uppercase tracking-widest">Stage 02</span>
          <h2 className="text-3xl font-black text-white mt-1">{player.name} 영상 입력</h2>
        </div>
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">취소</button>
      </div>

      <div className="glass-panel rounded-[40px] overflow-hidden min-h-[400px] flex flex-col">
        {mode === 'choice' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
            <button 
              onClick={() => { setMode('record'); startCamera(); }}
              className="p-12 flex flex-col items-center justify-center gap-6 hover:bg-white/5 transition-colors border-b md:border-b-0 md:border-r border-white/5 group"
            >
              <div className="w-20 h-20 rounded-3xl bg-isa-sky/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-isa-sky" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">현장 직접 촬영</h3>
                <p className="text-slate-400 text-sm">카메라를 사용하여 즉석에서 라이딩을 촬영합니다.</p>
              </div>
            </button>

            <label className="p-12 flex flex-col items-center justify-center gap-6 hover:bg-white/5 transition-colors cursor-pointer group">
              <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
              <div className="w-20 h-20 rounded-3xl bg-isa-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-isa-gold" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">영상 파일 업로드</h3>
                <p className="text-slate-400 text-sm">기존에 촬영된 라이딩 영상(MP4, MOV 등)을 불러옵니다.</p>
              </div>
            </label>
          </div>
        )}

        {mode === 'record' && (
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4">
              {isRecording && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500 text-white text-xs font-black animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span>RECORDING</span>
                </div>
              )}
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => { stopCamera(); setMode('choice'); }}
                  className="p-4 rounded-full glass-card text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-white scale-90' : 'bg-rose-500 scale-100 hover:scale-105'}`}
                >
                  {isRecording ? <div className="w-8 h-8 bg-isa-deep rounded-sm" /> : <div className="w-8 h-8 bg-white rounded-full" />}
                </button>

                <div className="w-14" /> {/* Spacer */}
              </div>
            </div>
          </div>
        )}

        {mode === 'preview' && (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video src={previewUrl} controls className="w-full h-full object-contain" />
            </div>
            <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
              <button 
                onClick={() => setMode('choice')}
                className="flex-1 py-4 rounded-2xl glass-card text-white font-bold hover:bg-white/10 transition-colors"
              >
                다시 선택하기
              </button>
              <button 
                onClick={() => onComplete(recordedBlob)}
                className="flex-[2] py-4 rounded-2xl bg-white text-isa-deep font-black hover:bg-isa-sky transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>이 영상으로 분석 시작</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5 text-isa-sky" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">촬영 팁</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              선수의 전신이 화면에 모두 나오도록 카메라를 고정해 주세요. 역광보다는 밝은 조명 환경이 분석에 유리합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoInput;
