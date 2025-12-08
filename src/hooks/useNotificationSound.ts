'use client';

import { useCallback, useRef, useEffect } from 'react';

// Primary: Use the MP3 file from public folder
const NOTIFICATION_SOUND_URL = '/notification.mp3';

// Fallback: Base64 encoded notification sound (in case MP3 file fails to load)
const NOTIFICATION_FALLBACK_BASE64 = 'data:audio/wav;base64,UklGRiQFAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAFAACAf3h0cXBvcHJ1eoGJk5yjrbW7v8HBwL24sq2nn5mTjomGhYWGiIuPk5icoaWorbS4u77AwcHAvrq3s66ppqOhnp2cn56ho6aoq66wsr2/wMHBwL68urmzs7KysrO1t7q9wMLDxMPCwL25tbKvraytrq+xsr+AwMHBwb+8ubi0sq+trKuqq6utrq+xs7e5vMDBwcHAvrq3tLGvra2srK2ur7GytLa4ubu8vL28u7q5t7a1tLKxsbCwsbKztLa3ubu9v8DBwcHAv727ubazsbCvrq6ur7CxsrS2uLq8vr/AwMDAvry5trSysK+urrCws7a4u77AwMDAwL68urexsK+trq+xtLe6vb/BwcHBv7y5trOwr66usLK1uLu+wMHCwsLAvrq3s6+urq6xtLi8v8HCwsLBv7y4tLCurq6vs7e7vsHCw8PCwL25tK+urq+ytru+wcPDw8LAvbm0r62ur7K3u7/Bw8TExMLAvLezrq2usLW5vsDDxMTEw8C9uLKurq+ytru/wsXFxcTCv7u2sK2ur7O4vMDDxcbGxMK+ubOurq+zuL3BxMbGxsXCvri0r66wt7vAw8bHx8bDwLu2sK6utLq/w8bHyMfFwb24s6+vsbi+wsXIyMjGw7+6tbCusLa8wMTHyMnHxMC7trGvsLe9wcXIycnIxcC7trGvsbi9wsXIycnIxMC6tbKwtbvAw8bJycnHw766tbGxtbzAw8bJycnHw765tbKyuL3Bw8bJysnGwry4tbO0ucDBxcfJycjFwbu3tLS3u8DCxsjJycfEwLu3tbW3vMDDxsjJycfDv7q2tbW4vMHEx8nJyMbDvri2trm9wcTHyMnIxsK9uLa2ubzBxMjJycjGwry3trW4vMHExsjJyMbCvLi2trm9wsTHycnIxcK8t7a2ub3CxcjJycjFwby3tra5vMHFx8nJyMXBvLe2trm9wcXHycnIxsG8t7a2ub3BxcjJyMfFwby3tra5vMHFx8nJyMXBu7a2trm9wcXIycjHxMG7tra2ub3BxcjJyMfEwLu2tra5vcHFyMnIx8TAvLe2tri8wcXIycjHxMC7tra1uL3BxcjJyMfEwLu2trW4vMHFyMnIx8TAvLa2tri8wcXIyMjHxMC7trW1uLzBxcjIyMfEwLy2tbW4vMHFyMjIx8TAu7a1tbi8wcXIyMjHxMC7trW1uLzBxcjIyMfEwLy2tba4vMHFyMjIx8TAvLa1tri8wcXIyMjHxMC8trW2uLzBxcjIyMfEwLy2tba4vMHFyMjIx8S/u7a1tri8wcXHyMjHxMC7trW2uLzBxcfIyMfEv7u2tba4vMHFx8jIx8S/u7a1tri8wcXHyMjHxL+7tra2uLzBxcfIyMfEv7u2tra4vMHFx8jIx8S/vLa2tri8wcXHyMjHxL+8tra2uLzBxcfIyMfEv7y2trm8wMXHyMjHxL+8t7a5vMDFx8jIx8S/vLe2ubzAxcfIyMfEv7y3trm8wMXHyMjHxL+8t7a5vMDFx8jIx8S/vLe2ubzAxcfIyMfEv7y3trm8wMXHyMfGxL+8t7e5u8DFx8jHxsS/vLe3ubvAxcfIx8bEv7y3t7m7wMXHyMfGxL+8t7e5u8DExsfHxsS/vLe3ubvAxMbHx8bEv7y3t7q7wMTGx8fGxL+8t7e6u8DExsfHxsS/vLe4urtA';

export interface NotificationSoundOptions {
  volume?: number; // 0 to 1
  loop?: boolean;
  loopCount?: number; // number of times to repeat
}

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopCountRef = useRef(0);

  // Initialize audio on mount - try MP3 first, fallback to base64
  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);

    // If MP3 fails to load, use fallback
    audio.onerror = () => {
      console.warn('Could not load notification.mp3, using fallback sound');
      audioRef.current = new Audio(NOTIFICATION_FALLBACK_BASE64);
      audioRef.current.volume = 0.7;
    };

    audio.oncanplaythrough = () => {
      audioRef.current = audio;
      audioRef.current.volume = 0.7;
    };

    // Preload the audio
    audio.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback((options: NotificationSoundOptions = {}) => {
    const { volume = 0.7, loop = false, loopCount = 3 } = options;

    // Create new audio if not exists
    if (!audioRef.current) {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.onerror = () => {
        audioRef.current = new Audio(NOTIFICATION_FALLBACK_BASE64);
      };
    }

    const audio = audioRef.current;
    audio.volume = volume;
    audio.currentTime = 0;
    loopCountRef.current = 0;

    const handleEnded = () => {
      if (loop && loopCountRef.current < loopCount - 1) {
        loopCountRef.current++;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    audio.removeEventListener('ended', handleEnded);
    audio.addEventListener('ended', handleEnded);

    // Try to play
    audio.play().catch((error) => {
      console.warn('Could not play notification sound:', error);
      // On some browsers, we need user interaction first
      // The sound will work after the first user interaction
    });
  }, []);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      loopCountRef.current = 999; // Stop looping
    }
  }, []);

  return { playSound, stopSound };
}

// Also export a simpler function for one-off use
export function playNotificationSound(options: NotificationSoundOptions = {}) {
  const { volume = 0.7, loop = false, loopCount = 3 } = options;

  const audio = new Audio(NOTIFICATION_SOUND_URL);

  // Fallback if MP3 fails
  audio.onerror = () => {
    const fallbackAudio = new Audio(NOTIFICATION_FALLBACK_BASE64);
    fallbackAudio.volume = volume;
    fallbackAudio.play().catch(() => {});
  };

  audio.volume = volume;

  let currentLoop = 0;

  const handleEnded = () => {
    if (loop && currentLoop < loopCount - 1) {
      currentLoop++;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  audio.addEventListener('ended', handleEnded);

  audio.play().catch((error) => {
    console.warn('Could not play notification sound:', error);
  });

  return audio;
}
