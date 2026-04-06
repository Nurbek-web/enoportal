"use client";

import { useEffect, useState } from "react";

const animatedTargets = new Set<number>();

export function useCountUp(target: number, duration = 1200) {
  const hasAnimated = animatedTargets.has(target);
  const [value, setValue] = useState(hasAnimated ? target : 0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    if (hasAnimated) {
      setValue(target);
      return;
    }
    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animatedTargets.add(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, hasAnimated]);

  return value;
}
