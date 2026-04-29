import { useState, useCallback } from 'react';

export const useSurfingApp = () => {
  const [screen, setScreen] = useState('landing');
  const [mode, setMode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const goTo = useCallback((target) => {
    setScreen(target);
    window.scrollTo(0, 0);
  }, []);

  const selectMode = (selectedMode, count) => {
    setMode(selectedMode);
    setPlayers(Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Rider ${i + 1}`,
      video: null,
      results: null,
      team: selectedMode === 'team22' ? (i < 2 ? 'A' : 'B') : null
    })));
    goTo('setup');
  };

  const updatePlayer = (idx, data) => {
    setPlayers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...data };
      return next;
    });
  };

  const saveHistory = (finalPlayers) => {
    const game = {
      date: new Date().toISOString(),
      mode: mode,
      players: finalPlayers.map(p => ({ name: p.name, results: p.results }))
    };
    const existing = JSON.parse(localStorage.getItem('surfing_history') || '[]');
    localStorage.setItem('surfing_history', JSON.stringify([game, ...existing]));
  };

  const reset = () => {
    setScreen('landing');
    setMode(null);
    setPlayers([]);
    setCurrentPlayerIdx(0);
    setCurrentVideo(null);
    setCurrentAnalysis(null);
  };

  return {
    screen,
    mode,
    players,
    currentPlayerIdx,
    currentVideo,
    currentAnalysis,
    goTo,
    selectMode,
    updatePlayer,
    setCurrentPlayerIdx,
    setCurrentVideo,
    setCurrentAnalysis,
    saveHistory,
    reset
  };
};
