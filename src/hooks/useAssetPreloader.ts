import { useEffect, useState } from 'react';
import type { Slide } from '../data/types';

export function useAssetPreloader(slides: Slide[], currentIdx: number) {
  const [nextLoading, setNextLoading] = useState(false);
  const [nextLoaded, setNextLoaded] = useState(false);

  useEffect(() => {
    setNextLoaded(false);
    setNextLoading(false);
    if (!slides.length || currentIdx >= slides.length - 1) return;
    const next = slides[currentIdx + 1];
    setNextLoading(true);
    let loadedCount = 0;
    let toLoad = 0;
    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= toLoad) {
        setNextLoaded(true);
        setNextLoading(false);
      }
    };
    // Preload assets for next slide
    if (next.type === 'video' && next.video_url) {
      toLoad++;
      fetch(next.video_url, { method: 'GET', cache: 'force-cache' })
        .then(() => markLoaded())
        .catch(() => markLoaded());
    }
    if (next.type === 'quiz') {
      if (next.quiz_audio_url) {
        toLoad++;
        const audio = new Audio();
        audio.src = next.quiz_audio_url;
        audio.oncanplaythrough = markLoaded;
        audio.onerror = markLoaded;
      }
      if (next.quiz_correct_audio_url) {
        toLoad++;
        const audio = new Audio();
        audio.src = next.quiz_correct_audio_url;
        audio.oncanplaythrough = markLoaded;
        audio.onerror = markLoaded;
      }
      if (next.quiz_wrong_audio_url) {
        toLoad++;
        const audio = new Audio();
        audio.src = next.quiz_wrong_audio_url;
        audio.oncanplaythrough = markLoaded;
        audio.onerror = markLoaded;
      }
      (next.quiz_answers || []).forEach(answer => {
        if (answer.image_url) {
          toLoad++;
          const img = new window.Image();
          img.src = answer.image_url;
          img.onload = markLoaded;
          img.onerror = markLoaded;
        }
      });
    }
    if (toLoad === 0) setNextLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, currentIdx]);

  return { nextLoading, nextLoaded };
} 