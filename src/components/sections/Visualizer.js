import React, { useEffect, useRef, useContext } from 'react';
import * as Tone from 'tone';
import { AudioContext } from '../../context/AudioContext';

const Visualizer = () => {
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const { isAudioInitialized } = useContext(AudioContext);

  useEffect(() => {
    if (!isAudioInitialized) return;

    const analyzer = new Tone.Analyser('waveform', 256);
    Tone.Destination.connect(analyzer);
    analyzerRef.current = analyzer;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      const waveform = analyzerRef.current.getValue();
      
      ctx.fillStyle = '#303030';
      ctx.fillRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ff0033';
      
      ctx.moveTo(0, height / 2);
      waveform.forEach((value, i) => {
        const x = (i / waveform.length) * width;
        const y = ((value + 1) / 2) * height;
        ctx.lineTo(x, y);
      });
      
      ctx.stroke();
    };

    draw();

    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
      }
    };
  }, [isAudioInitialized]);

  return (
    <div className="visualizer">
      <canvas ref={canvasRef} width="600" height="100" />
    </div>
  );
};

export default Visualizer;