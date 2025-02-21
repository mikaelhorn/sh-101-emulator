// Initialize audio context and Tone.js on demand
let audioContext = null;

export const initializeAudioContext = async () => {
  if (audioContext) {
    return audioContext;
  }

  try {
    // Create new audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Wait for context to be running
    if (audioContext.state !== 'running') {
      await audioContext.resume();
      
      // Double check state
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Audio context failed to start')), 2000);
        
        const checkState = () => {
          if (audioContext.state === 'running') {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkState, 100);
          }
        };
        checkState();
      });
    }

    return audioContext;
  } catch (error) {
    console.error('Failed to initialize audio context:', error);
    throw error;
  }
};

export const getAudioContext = () => audioContext;

export const closeAudioContext = async () => {
  if (audioContext) {
    try {
      await audioContext.close();
      audioContext = null;
    } catch (error) {
      console.error('Error closing audio context:', error);
    }
  }
};

export default {
  initializeAudioContext,
  getAudioContext,
  closeAudioContext
};