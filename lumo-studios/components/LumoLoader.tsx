/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ThinkingIcon } from './Icons';
import './LumoLoader.css';

interface LumoLoaderProps {
  size?: 'small' | 'large';
  message?: string;
}

const VIDEO_CACHE_KEY = 'lumo_loader_veo_v1';
const FAILED_SESSION_KEY = 'lumo_loader_failed_session';

// Global singleton state to track generation across component mounts
let globalGenerationPromise: Promise<string | null> | null = null;

/**
 * Random range helper
 */
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Shape sub-component for the pre-loader animation
 */
const AnimatedShape = () => {
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'translate(0px, 0px) rotate(0deg)',
    transition: 'transform 800ms ease-in-out',
  });

  const triggerAnimation = useCallback(() => {
    const x = random(-100, 100);
    const y = random(-100, 100);
    const rotate = random(-180, 180);
    const duration = random(500, 1000);

    setStyle({
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    });

    // Schedule next jump
    setTimeout(triggerAnimation, duration);
  }, []);

  useEffect(() => {
    triggerAnimation();
  }, [triggerAnimation]);

  const shapes = ['rect', 'circle', 'triangle'];
  const type = shapes[random(0, 2)];

  return <div className={`shape ${type}`} style={style} />;
};

const LumoLoader: React.FC<LumoLoaderProps> = ({ size = 'large', message }) => {
  const [videoUri, setVideoUri] = useState<string | null>(localStorage.getItem(VIDEO_CACHE_KEY));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('INITIALIZING NEURAL STRATA...');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const performGeneration = async (): Promise<string | null> => {
      if (!process.env.API_KEY) return null;

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = "A clean, high-contrast black and white 2D line art animation in the style of Notionists illustrations. The character (LUMO avatar) with a cap and black vest is shown sitting at a desk intensely coding on a holographic keyboard and drawing digital interface patterns that float around him. At the end of the sequence, he stops, looks at the camera with a warm smile, and throws a bucket of paint directly at the screen, covering the view. Cinematic, high quality.";

        let operation;
        try {
          operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
              numberOfVideos: 1,
              aspectRatio: '16:9'
            }
          });
        } catch (genErr: any) {
          const errMsg = genErr?.message || "";
          if (errMsg.includes('429') || genErr.status === 429) {
            console.warn("Veo quota exceeded, using fallback.");
            sessionStorage.setItem(FAILED_SESSION_KEY, 'true');
            return null;
          }
          throw genErr;
        }

        const statuses = [
            "ARCHITECTING NEURAL FRAMEWORK...",
            "RENDERING MATERIAL LOGIC...",
            "PHYSICALIZING CHARACTER DYNAMICS...",
            "POLISHING PIGMENT HANDOFF...",
            "FINALIZING SEQUENCE SYNC..."
        ];
        let statusIdx = 0;

        if (!ai.operations || typeof ai.operations.getVideosOperation !== 'function') {
           throw new Error("SDK Error: operations API missing.");
        }

        while (!operation.done) {
          if (isMounted.current) {
            setStatusMessage(statuses[statusIdx % statuses.length]);
          }
          statusIdx++;
          
          // Respectful polling: 25-35 seconds to avoid 429 on status checks
          const pollDelay = 25000 + Math.random() * 10000;
          await new Promise(resolve => setTimeout(resolve, pollDelay));
          
          try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
          } catch (opErr: any) {
            const errMsg = opErr?.message || "";
            if (errMsg.includes('429') || opErr.status === 429) {
              console.warn("Veo operation quota exceeded.");
              await new Promise(resolve => setTimeout(resolve, 30000));
            } else {
              throw opErr;
            }
          }
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
          const finalUri = `${downloadLink}&key=${process.env.API_KEY}`;
          localStorage.setItem(VIDEO_CACHE_KEY, finalUri);
          return finalUri;
        }
      } catch (err: any) {
        // Only log if it's not a quota error
        if (!err.message?.includes('429')) {
            console.error("Veo generation fatal error:", err);
        }
        sessionStorage.setItem(FAILED_SESSION_KEY, 'true');
        return null;
      }
      return null;
    };

    const startOrJoinGeneration = async () => {
      if (videoUri || isGenerating) return;
      
      if (sessionStorage.getItem(FAILED_SESSION_KEY)) {
        setStatusMessage("MATERIAL CORE STABLE");
        return;
      }

      setIsGenerating(true);

      if (!globalGenerationPromise) {
        globalGenerationPromise = performGeneration();
      }

      const result = await globalGenerationPromise;
      
      if (isMounted.current) {
        if (result) {
          setVideoUri(result);
        } else {
          setStatusMessage("MATERIAL CORE STABLE");
          globalGenerationPromise = null;
        }
        setIsGenerating(false);
      }
    };

    if (size === 'large') {
        startOrJoinGeneration();
    }
  }, [videoUri, size, isGenerating]);

  if (size === 'small') {
    return (
      <div className="lumo-work-loader small">
        <ThinkingIcon className="spin-icon" />
      </div>
    );
  }

  return (
    <div className={`lumo-work-loader ${size}`}>
      {videoUri ? (
        <div className="video-loader-container">
          <video 
            src={videoUri} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="lumo-cinematic-video"
          />
          {message && <div className="video-overlay-message">{message}</div>}
        </div>
      ) : (
        <div className="fallback-loader">
          <div className="shape-preloader-container">
            <AnimatedShape />
            <AnimatedShape />
            <AnimatedShape />
            <AnimatedShape />
            <AnimatedShape />
            <AnimatedShape />
          </div>
          <div className="loader-status-text">{statusMessage}</div>
          {message && <div className="loader-sub-text">{message}</div>}
        </div>
      )}
    </div>
  );
};

export default LumoLoader;
