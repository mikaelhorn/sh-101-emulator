import React, { useContext } from 'react';
import { AudioContext } from './context/AudioContext';
import SH101Emulator from './components/SH101Emulator';
import AudioInitializer from './components/AudioInitializer';
import './App.css';


const App = () => {
  const { isAudioInitialized, setIsAudioInitialized } = useContext(AudioContext);

  const handleAudioInit = () => {
    setIsAudioInitialized(true);
  };

  return (
    <div className="App">
      {!isAudioInitialized ? (
        <AudioInitializer onInitialized={handleAudioInit} />
      ) : (
        <SH101Emulator />
      )}
    </div>
  );
};

export default App;
