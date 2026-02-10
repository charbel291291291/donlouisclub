
// Simple synthesizer for luxury UI sounds using Web Audio API
// This avoids the need for external MP3 files while ensuring consistent feedback.

const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export const playSound = (type: 'click' | 'success' | 'hover' | 'lock' | 'soft') => {
    try {
        const ctx = initAudio();
        const now = ctx.currentTime;

        if (type === 'click') {
            // Subtle high-frequency mechanical tick
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.03);
        } 
        else if (type === 'soft') {
            // Very soft tap for navigation
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        }
        else if (type === 'success') {
            // Premium major chord swell (Gold Unlock)
            const frequencies = [440, 554.37, 659.25, 880]; // A Major 7
            frequencies.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                
                // Staggered entry
                const startTime = now + (i * 0.04);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.05, startTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 1.5);
            });
        }
        else if (type === 'lock') {
             // Low mechanical thud
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.type = 'square';
             osc.frequency.setValueAtTime(100, now);
             osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
             gain.gain.setValueAtTime(0.05, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.2);
             
             // Lowpass filter to muffle it
             const filter = ctx.createBiquadFilter();
             filter.type = 'lowpass';
             filter.frequency.value = 200;

             osc.connect(filter);
             filter.connect(gain);
             gain.connect(ctx.destination);
             osc.start(now);
             osc.stop(now + 0.2);
        }
    } catch (e) {
        // Silently fail if audio is blocked
    }
};
