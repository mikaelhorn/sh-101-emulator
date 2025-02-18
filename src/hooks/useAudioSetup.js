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
    mainOscLevel,
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
    filterEnvAmount,
    delayTime,
    delayFeedback,
    delayMix,
    pitchShift,
    reverbPreDelay,
    reverbDecay,
    reverbMix,
  } = useContext(AudioContext);

  // Initial setup effect (keep existing setup code)
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
      
      // Set a lower base frequency for the filter when envelope amount is high
      const baseFreq = filterEnvAmount > 0 ? Math.min(filterCutoff, 2000) : filterCutoff;
      components.filter.frequency.value = baseFreq;

      // Connect filter to both dry path and delay
      components.filter.connect(components.delayMix.a);
      components.filter.connect(components.delay);

      // Create mixer with significantly reduced gain to prevent clipping
      components.mixer = new Tone.Gain(0.2); // Reduced from 0.5 to 0.2
      components.mixer.connect(components.filter);
      
      // Source gains with proper scaling and reduced levels
      components.mainGain = new Tone.Gain(Math.min(0.6, mainOscLevel)); // Reduced from 0.8 to 0.6
      components.mainGain.connect(components.mixer);
      
      components.subGain = new Tone.Gain(Math.min(0.4, subOscLevel)); // Reduced from 0.6 to 0.4
      components.subGain.connect(components.mixer);
      
      components.noiseGain = new Tone.Gain(Math.min(0.4, noiseLevel)); // Added gain limiting
      components.noiseGain.connect(components.mixer);

      // Create synth with proper envelope settings and reduced volume
      components.synth = new Tone.MonoSynth({
        oscillator: {
          type: waveform === 'pulse' ? 'pulse' : waveform,
          width: pulseWidth
        },
        envelope: {
          attack: attack,
          decay: decay,
          sustain: sustain,
          release: release,
          attackCurve: 'linear',
          releaseCurve: 'exponential'
        },
        filter: {
          Q: 0,
          type: "lowpass",
          rolloff: -24
        },
        filterEnvelope: {
          attack: attack,
          decay: decay,
          sustain: sustain,
          release: release,
          baseFrequency: 200,
          octaves: 7,
          attackCurve: 'linear',
          releaseCurve: 'exponential'
        },
        portamento: 0,
        volume: Math.min(-6, mainOscLevel) // Added volume limiting
      }).connect(components.mainGain);

      // Create filter envelope that matches the amplitude envelope
      components.filterEnv = new Tone.Envelope({
        attack,
        decay,
        sustain,
        release,
        releaseCurve: 'exponential'
      });

      // Increase filter envelope scaling for more dramatic effect
      components.filterEnvScale = new Tone.Gain(filterEnvAmount * 10000); // Increased from 5000 to 10000
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
        volume: subOscLevel
      }).connect(components.mixer);

      // Create noise
      components.noise = new Tone.Noise({
        type: 'white',
        volume: noiseLevel
      });
      components.noise.connect(components.mixer);

      // Start continuous components
      components.lfo.start();
      components.subOsc.start();
      if (noiseLevel > -60) {
        components.noise.start();
      }

      // Set up note triggering with proper timing
      const originalTriggerAttack = components.synth.triggerAttack;
      const originalTriggerRelease = components.synth.triggerRelease;

      components.synth.triggerAttack = (note, time) => {
        const now = time || Tone.now();
        components.subOsc.frequency.setValueAtTime(Tone.Frequency(note).toFrequency() / 2, now);
        components.filterEnv.triggerAttack(now); // Explicitly trigger filter envelope
        return originalTriggerAttack.call(components.synth, note, now);
      };

      components.synth.triggerRelease = (time) => {
        const now = time || Tone.now();
        components.filterEnv.triggerRelease(now);
        return originalTriggerRelease.call(components.synth, now);
      };

      console.log('Audio components setup complete');
    };

    try {
      setupAudioComponents();
    } catch (error) {
      console.error('Error setting up audio components:', error);
    }

  }, [
    attack, decay, delayFeedback, delayMix, delayTime,
    filterCutoff, filterEnvAmount, filterResonance,
    lfoFrequency, lfoWaveform, mainOscLevel, masterVolume,
    noiseLevel, pitchShift, pulseWidth, release,
    reverbDecay, reverbMix, reverbPreDelay, subOscLevel,
    sustain, vcfModAmount, vcoModAmount, waveform,
    audioComponents, isAudioInitialized
  ]);

  // Single effect for all parameter updates
  useEffect(() => {
    if (!isAudioInitialized) return;
    const components = audioComponents.current;
    if (!components?.synth) return;

    try {
      const now = Tone.now();
      const rampTime = 0.016; // One frame at 60fps

      // Update synth settings with separate .set calls to avoid interruption
      components.synth.oscillator.set({
        type: waveform === 'pulse' ? 'pulse' : waveform,
        width: pulseWidth
      });

      components.synth.envelope.set({
        attack,
        decay,
        sustain: sustain * 0.8,
        release
      });

      components.synth.portamento = portamento;

      // Smoothly update continuous parameters
      if (components.filter) {
        components.filter.frequency.cancelScheduledValues(now);
        components.filter.frequency.linearRampToValueAtTime(filterCutoff, now + rampTime);
        components.filter.Q.cancelScheduledValues(now);
        components.filter.Q.linearRampToValueAtTime(filterResonance, now + rampTime);
      }

      if (components.masterGain) {
        components.masterGain.gain.cancelScheduledValues(now);
        components.masterGain.gain.linearRampToValueAtTime(masterVolume, now + rampTime);
      }

      // Update modulation amounts
      if (components.vcoModScale) {
        components.vcoModScale.gain.cancelScheduledValues(now);
        components.vcoModScale.gain.linearRampToValueAtTime(vcoModAmount * 50, now + rampTime);
      }

      if (components.vcfModScale) {
        components.vcfModScale.gain.cancelScheduledValues(now);
        components.vcfModScale.gain.linearRampToValueAtTime(vcfModAmount * 5000, now + rampTime);
      }

      // Update other parameters
      if (components.noise) {
        components.noise.volume.value = Math.min(0.4, noiseLevel);
      }

      if (components.subOsc) {
        components.subOsc.volume.value = Math.min(0.4, subOscLevel);
      }

      // Update effects
      if (components.delay) {
        components.delay.delayTime.value = delayTime;
        components.delay.feedback.value = delayFeedback;
      }

      if (components.delayMix) {
        components.delayMix.fade.value = delayMix;
      }

    } catch (error) {
      console.error('Error updating parameters:', error);
    }
  }, [
    isAudioInitialized,
    waveform,
    pulseWidth,
    attack,
    decay,
    sustain,
    release,
    portamento,
    filterCutoff,
    filterResonance,
    masterVolume,
    vcoModAmount,
    vcfModAmount,
    noiseLevel,
    subOscLevel,
    delayTime,
    delayFeedback,
    delayMix,
    audioComponents  // Add audioComponents to dependency array
  ]);

  return null;
};