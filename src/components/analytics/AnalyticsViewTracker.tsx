'use client';

import { useEffect, useRef } from 'react';
import { classifyCaseStudyEntry, classifyReferrer, classifyViewport, track } from '@/services/analyticsService';

type AnalyticsViewTrackerProps =
  | { surface: 'lab' }
  | { surface: 'case-study' };

export function AnalyticsViewTracker({ surface }: AnalyticsViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    if (surface === 'lab') {
      track('lab_viewed', {
        referrerClass: classifyReferrer(document.referrer, window.location.origin),
        viewportClass: classifyViewport(window.innerWidth),
      });
      return;
    }

    track('case_study_viewed', {
      entrySurface: classifyCaseStudyEntry(
        document.referrer,
        window.location.origin,
        new URLSearchParams(window.location.search).get('from'),
      ),
    });
  }, [surface]);

  return null;
}
