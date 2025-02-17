// Polyfill process for Tone.js
if (typeof process === 'undefined') {
  window.process = {
    env: { 
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };
}

// Additional browser polyfills if needed
window.AudioContext = window.AudioContext || window.webkitAudioContext;