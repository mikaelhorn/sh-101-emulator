import { useEffect, useContext } from 'react';
import * as Tone from 'tone';
import { AudioContext } from '../context/AudioContext';

export const useAudioSetup = () => {
  const {
    audioComponents,
    isAudioInitialized,
    masterVolume,
    waveform,
    pulseWidth,
    attack,
    decay,
    sustain,
    release,
    portamento,
    filterCutoff,
    filterResonance,
    lfoWaveform,
    lfoFrequency,
    vcoModAmount,
    vcfModAmount,
    noiseLevel,
    subOscLevel,
    sourceMix,
    filterEnvAmount,
    delayTime,
    delayFeedback,
    delayMix,
    pitchShift,
    reverbPreDelay,
    reverbDecay,
    reverbMix,
  } = useContext(AudioContext);

  useEffect(() => {
    if (!isAudioInitialized) return;
    
    // Ensure we have a running context
    const context = Tone.getContext();
    if (context.state !== 'running') {
      console.log('Audio context not running, attempting to resume...');
      context.resume();
      return;
    }

    const setupAudioComponents = () => {
      // Clean up any existing components
      Object.values(audioComponents.current).forEach(component => {
        if (component?.dispose) {
          component.dispose();
        }
      });

      const components = audioComponents.current;
      
      // Create components in reverse order (from output to input)
      components.masterGain = new Tone.Gain(masterVolume);
      components.masterGain.toDestination();
      
      components.reverb = new Tone.Reverb({
        decay: reverbDecay,
        preDelay: reverbPreDelay,
        wet: reverbMix
      });
      components.reverb.connect(components.masterGain);

      // Create pitch shifter
      components.pitchShift = new Tone.PitchShift({
        pitch: pitchShift,
        windowSize: 0.1,
        delayTime: 0
      });
      components.pitchShift.connect(components.reverb);

      // Create tape delay effect
      components.delay = new Tone.FeedbackDelay({
        delayTime: delayTime,
        feedback: delayFeedback,
        wet: delayMix
      });
      components.delay.connect(components.pitchShift);

      // Create the dry/wet mixer for delay
      components.delayMix = new Tone.CrossFade(delayMix);
      components.delayMix.connect(components.pitchShift);
      
      // Connect delay to wet side of mixer
      components.delay.connect(components.delayMix.b);

      components.filter = new Tone.Filter({
        type: 'lowpass',
        frequency: filterCutoff,
        Q: filterResonance,
        rolloff: -24
      });
      // Connect filter to both dry path and delay
      components.filter.connect(components.delayMix.a);
      components.filter.connect(components.delay);

      // Create mixer with reduced gain
      components.mixer = new Tone.Gain(0.7);
      components.mixer.connect(components.filter);
      
      // Source gains with proper scaling
      components.mainGain = new Tone.Gain(sourceMix.main * 0.8);
      components.mainGain.connect(components.mixer);
      
      components.subGain = new Tone.Gain(sourceMix.sub * 0.5);
      components.subGain.connect(components.mixer);
      
      components.noiseGain = new Tone.Gain(sourceMix.noise * 0.5);
      components.noiseGain.connect(components.mixer);

      // Create synth
      components.synth = new Tone.MonoSynth({
        oscillator: {
          type: waveform === 'pulse' ? 'pulse' : waveform,
          width: pulseWidth
        },
        envelope: {
          attack,
          decay,
          sustain: sustain * 0.8,
          release,
        },
        filter: {
          Q: 0,
          type: "lowpass",
          rolloff: -24
        },
        portamento,
        volume: -6
      });
      components.synth.connect(components.mainGain);

      // Create filter envelope
      components.filterEnv = new Tone.Envelope({
        attack,
        decay,
        sustain,
        release,
      });

      components.filterEnvScale = new Tone.Gain(filterEnvAmount * 5000);
      components.filterEnv.connect(components.filterEnvScale);
      components.filterEnvScale.connect(components.filter.frequency);

      // Create LFO
      components.lfo = new Tone.LFO({
        type: lfoWaveform,
        frequency: lfoFrequency,
        amplitude: 1
      });

      components.vcoModScale = new Tone.Gain(vcoModAmount * 50);
      components.vcfModScale = new Tone.Gain(vcfModAmount * 5000);
      
      components.lfo.connect(components.vcoModScale);
      components.lfo.connect(components.vcfModScale);
      components.vcoModScale.connect(components.synth.frequency);
      components.vcfModScale.connect(components.filter.frequency);

      // Create sub oscillator
      components.subOsc = new Tone.Oscillator({
        type: 'square',
        volume: Math.min(-12, Math.max(-40, subOscLevel))
      });
      components.subOsc.connect(components.subGain);

      // Create noise
      components.noise = new Tone.Noise({
        type: 'white',
        volume: Math.min(-12, Math.max(-40, noiseLevel))
      });
      components.noise.connect(components.noiseGain);

      // Start continuous components
      components.lfo.start();
      components.subOsc.start();
      if (noiseLevel > -60) {
        components.noise.start();
      }

      // Set up note triggering
      const originalTriggerAttack = components.synth.triggerAttack;
      const originalTriggerRelease = components.synth.triggerRelease;

      components.synth.triggerAttack = (note, time) => {
        components.filterEnv.triggerAttack(time);
        components.subOsc.frequency.setValueAtTime(Tone.Frequency(note).toFrequency() / 2, time);
        return originalTriggerAttack.call(components.synth, note, time);
      };

      components.synth.triggerRelease = (time) => {
        components.filterEnv.triggerRelease(time);
        return originalTriggerRelease.call(components.synth, time);
      };

      console.log('Audio components setup complete');
    };

    try {
      setupAudioComponents();
    } catch (error) {
      console.error('Error setting up audio components:', error);
    }

  }, [isAudioInitialized]); // Only re-run on initialization change

  // Separate effect for parameter updates
  useEffect(() => {
    if (!isAudioInitialized) return;
    const components = audioComponents.current;
    if (!components.synth) return;

    // Update all parameters
    try {
      components.masterGain.gain.value = masterVolume;
      components.synth.set({
        oscillator: { type: waveform === 'pulse' ? 'pulse' : waveform, width: pulseWidth },
        envelope: { attack, decay, sustain: sustain * 0.8, release },
        portamento
      });
      components.filter.frequency.value = filterCutoff;
      components.filter.Q.value = filterResonance;
      components.filterEnvScale.gain.value = filterEnvAmount * 5000;
      components.vcoModScale.gain.value = vcoModAmount * 50;
      components.vcfModScale.gain.value = vcfModAmount * 5000;
      if (components.noise) components.noise.volume.value = noiseLevel;
      if (components.subOsc) components.subOsc.volume.value = subOscLevel;
      if (components.reverb) {
        components.reverb.decay = reverbDecay;
        components.reverb.preDelay = reverbPreDelay;
        components.reverb.wet.value = reverbMix;
      }
    } catch (error) {
      console.error('Error updating audio parameters:', error);
    }
  }, [
    isAudioInitialized, masterVolume, waveform, pulseWidth, attack, decay, sustain, release,
    filterCutoff, filterResonance, filterEnvAmount, vcoModAmount, vcfModAmount,
    noiseLevel, subOscLevel, reverbDecay, reverbPreDelay, reverbMix
  ]);

  // Update delay parameters
  useEffect(() => {
    if (!isAudioInitialized) return;
    const { delay, delayMix: delayMixer, pitchShift: shifter } = audioComponents.current;
    if (!delay || !delayMixer || !shifter) return;

    try {
      delay.delayTime.value = delayTime;
      delay.feedback.value = delayFeedback;
      delayMixer.fade.value = delayMix;
      shifter.pitch = pitchShift;
    } catch (error) {
      console.error('Error updating delay parameters:', error);
    }
  }, [isAudioInitialized, delayTime, delayFeedback, delayMix, pitchShift]);

  return null;
};