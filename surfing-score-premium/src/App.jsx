import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSurfingApp } from './hooks/useSurfingApp';

// Screens
import LandingScreen from './screens/LandingScreen';
import ModeScreen from './screens/ModeScreen';
import PlayerSetup from './screens/PlayerSetup';
import VideoInput from './screens/VideoInput';
import AnalysisScreen from './screens/AnalysisScreen';
import ReviewScreen from './screens/ReviewScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';

// Components
import PaymentModule from './components/PaymentModule';
import CopyrightModal from './components/CopyrightModal';

function App() {
  const { 
    screen, mode, goTo, selectMode, players, updatePlayer, 
    currentPlayerIdx, setCurrentPlayerIdx,
    currentVideo, setCurrentVideo,
    currentAnalysis, setCurrentAnalysis,
    saveHistory, reset 
  } = useSurfingApp();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleVideoComplete = (blob) => {
    setCurrentVideo(blob);
    goTo('analysis');
  };

  const handleAnalysisComplete = (results) => {
    setCurrentAnalysis(results);
    goTo('review');
  };

  const handleReviewComplete = (finalResults) => {
    updatePlayer(currentPlayerIdx, { results: finalResults });
    
    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(currentPlayerIdx + 1);
      setCurrentVideo(null);
      setCurrentAnalysis(null);
      goTo('video');
    } else {
      // Game Over - Save and Show Results
      const finalPlayers = [...players];
      finalPlayers[currentPlayerIdx].results = finalResults;
      saveHistory(finalPlayers);
      goTo('result');
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-isa-sky selection:text-isa-deep">
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingScreen onStart={() => goTo('mode')} onViewHistory={() => goTo('history')} />
          </motion.div>
        )}

        {screen === 'mode' && (
          <motion.div key="mode" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <ModeScreen onSelect={selectMode} onBack={reset} />
          </motion.div>
        )}

        {screen === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <PlayerSetup players={players} onUpdatePlayer={updatePlayer} onNext={() => setIsPaymentOpen(true)} onBack={() => goTo('mode')} />
          </motion.div>
        )}

        {screen === 'video' && (
          <motion.div key="video" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}>
            <VideoInput player={players[currentPlayerIdx]} onComplete={handleVideoComplete} onBack={() => goTo('setup')} />
          </motion.div>
        )}

        {screen === 'analysis' && (
          <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnalysisScreen player={players[currentPlayerIdx]} videoBlob={currentVideo} onComplete={handleAnalysisComplete} />
          </motion.div>
        )}

        {screen === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <ReviewScreen player={players[currentPlayerIdx]} initialResults={currentAnalysis} onComplete={handleReviewComplete} />
          </motion.div>
        )}

        {screen === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ResultScreen players={players} mode={mode} onHome={reset} onHistory={() => goTo('history')} />
          </motion.div>
        )}

        {screen === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HistoryScreen onBack={reset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <CopyrightModal />
      <AnimatePresence>
        {isPaymentOpen && (
          <PaymentModule 
            isOpen={isPaymentOpen}
            amount={15000}
            onComplete={() => { setIsPaymentOpen(false); goTo('video'); }}
            onCancel={() => setIsPaymentOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
