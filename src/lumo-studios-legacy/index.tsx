
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId, formatHtml } from './utils';

import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';
import SignUp from './components/SignUp';
import Onboarding from './components/Onboarding';
import ProfileDashboard from './components/ProfileDashboard';
import LumoLoader from './components/LumoLoader';
import { 
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon, 
    EditIcon, 
    MaximizeIcon, 
    MinimizeIcon, 
    LibraryIcon, 
    TrashIcon,
    BookmarkIcon,
    FolderIcon,
    SwatchIcon,
    ImageIcon,
    MagicIcon
} from './components/Icons';

const STORAGE_KEY = 'lumo_core_sessions';
const THEME_KEY = 'lumo_core_theme';
const PROFILE_KEY = 'lumo_core_profile';

const UI_ARCHITECT_DIRECTIVE = `
You are a world-class UI Architect and Lead Frontend Engineer at LUMO STUDIOS. 
Your goal is to physicalize high-fidelity, production-ready interface concepts.
FOCUS AREAS:
1. SPATIAL HIERARCHY: Intentional use of whitespace and scale.
2. OPTICAL BALANCE: Perfect alignment and grid-aware positioning.
3. MATERIAL LOGIC: Sophisticated use of blurs, gradients, and shadows.
4. MICRO-INTERACTIONS: Use CSS transitions and animations for fluid feel.
5. TYPOGRAPHY: Assume 'Inter' or 'Roboto Mono' for a clean, professional look.
6. FUNCTIONAL ARCHITECTURE: Every generated artifact must be a fully interactive Single Page Application (SPA).
`;

const BRAND_STRATEGIST_DIRECTIVE = `
You are a Master Brand Identity Strategist and Visionary Visual Designer at LUMO STUDIOS.
Your goal is to create sophisticated "LUMO BRANDBOARDS" that capture the soul of a brand concept.
A Brandboard is a high-fidelity visual specification that defines a brand's DNA.

PRESENTATION REQUIREMENTS (Inspired by high-end studio portfolios like mockups-design.com):
1. SPATIAL ELEGANCE: Use a wide, well-structured layout with generous whitespace and clear sections.
2. DEDICATED COLOR PALETTE SECTION: 
   - Create a striking "Visual Color System" display.
   - Feature large, expressive blocks for Primary brand colors.
   - Use a clean grid for Secondary, Accent, and Neutral palettes.
   - Clearly label each swatch with its HEX code and specific usage role (e.g., "PRIMARY", "SECONDARY", "ACCENT", "SURFACE", "TEXT").
3. ENHANCED TYPOGRAPHIC SYSTEM:
   - FONT PAIRINGS: Explicitly define and showcase the primary "Display/Heading" font vs. the "Body/UI" font.
   - GRANULAR SPECS: Provide a technical table/grid showing font-family, weights, and sizes.
4. LOGO & SYMBOLISM: Create abstract, CSS-based representations of the brand's logo and mark. 
   - NOTE: If the layout expects a high-fidelity logo, use <img id="lumo-brand-logo" src="" alt="Brand Logo" style="max-height: 120px;"> as a placeholder.
5. MATERIAL & MOOD: Use sophisticated CSS patterns, glassmorphism, or gradients to convey the 'vibe'.
6. MOCKUP PRESENTATION (Style Reference: mockups-design.com):
   - Design mockup sections using highly realistic CSS layouts that mimic professional photography.
   - STATIONERY: Use CSS transforms (rotate, skew, shadow) to create perspective-based mockups of business cards, letterheads, and envelopes.
   - PACKAGING: Create 3D-feeling containers (boxes, bags, labels) using complex CSS shapes and gradients.
   - DIGITAL DEVICES: Render clean, minimal device outlines (phones, tablets, laptops) displaying the brand's UI.
   - PRESENTATION: Arrange these mockups in a curated "gallery" format with soft, realistic shadows and professional lighting effects (gradients).
`;

const VISUAL_LAB_SCRIPT = `
<script id="lumo-edit-script">
(function() {
    const style = document.createElement('style');
    style.textContent = \`
        [contenteditable="true"]:hover { outline: 1px dashed var(--primary, #ff3e00); cursor: text; }
        img:hover { outline: 2px solid var(--primary, #ff3e00); cursor: pointer; filter: brightness(1.1); }
    \`;
    document.head.appendChild(style);

    const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'BUTTON', 'A', 'LI', 'LABEL'];
    const makeEditable = () => {
        document.querySelectorAll('*').forEach(el => {
            if (textTags.includes(el.tagName)) {
                el.contentEditable = 'true';
            }
        });
    };
    makeEditable();

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (confirm('Open this image in LUMO Image Lab for AI editing?')) {
                window.parent.postMessage({ type: 'LUMO_EDIT_IMAGE', src: img.src }, '*');
            } else {
                const newUrl = prompt('Enter new Image URL:', img.src);
                if (newUrl) { img.src = newUrl; sendUpdate(); }
            }
        });
    });

    const sendUpdate = () => {
        const clone = document.documentElement.cloneNode(true);
        const s = clone.querySelector('#lumo-edit-script');
        if (s) s.remove();
        window.parent.postMessage({ type: 'LUMO_UPDATE_HTML', html: clone.outerHTML }, '*');
    };

    document.addEventListener('input', (e) => {
        if (e.target.contentEditable === 'true') { sendUpdate(); }
    });
})();
</script>
`;

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let delay = 3000; 
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (e: any) {
            const errorStr = e.message || "";
            const isQuotaError = errorStr.includes('429') || 
                               errorStr.includes('Quota exceeded') || 
                               errorStr.includes('RESOURCE_EXHAUSTED');
            
            if (isQuotaError && i < maxRetries) {
                console.warn(`Quota error hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; 
                continue;
            }
            throw e;
        }
    }
    throw new Error("Max retries exceeded.");
}

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [isDashboard, setIsDashboard] = useState<boolean>(false);
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isActionBarVisible, setIsActionBarVisible] = useState<boolean>(true);
  const [isUiCollapsed, setIsUiCollapsed] = useState<boolean>(false);
  const [generationType, setGenerationType] = useState<'ui' | 'brand'>('ui');
  
  // Canvas State
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholders] = useState<string[]>(INITIAL_PLACEHOLDERS);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Image Lab State
  const [imageLabSource, setImageLabSource] = useState<string | null>(null);
  const [imageLabResult, setImageLabResult] = useState<string | null>(null);
  const [imageLabPrompt, setImageLabPrompt] = useState('');
  const [isImageLabProcessing, setIsImageLabProcessing] = useState(false);

  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | 'edit' | 'library' | 'preview' | 'image_lab' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
        if (event.data?.type === 'LUMO_UPDATE_HTML' && focusedArtifactIndex !== null) {
            handleCodeChange(event.data.html);
        } else if (event.data?.type === 'LUMO_EDIT_IMAGE' && event.data.src) {
            handleOpenImageInLab(event.data.src);
        }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [focusedArtifactIndex, currentSessionIndex]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionIndex(parsed.length - 1);
        }
      } catch (e) { console.error("Failed to load sessions", e); }
    }

    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) { 
        setUserProfile(JSON.parse(savedProfile));
        setIsDashboard(true);
    }
    
    const savedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
    if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Robust persistence with automatic pruning for QuotaExceededError
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (e: any) {
        // If we hit the quota, we remove the oldest session and try again
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.warn("LUMO Core: Storage quota exceeded. Pruning oldest architectural sequence...");
          setSessions(prev => {
            if (prev.length <= 1) return prev; // Don't delete the only session
            return prev.slice(1);
          });
        } else {
          console.error("Persistence failure:", e);
        }
      }
    }
  }, [sessions]);

  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (isFullscreen) setIsFullscreen(false);
            else if (focusedArtifactIndex !== null) setFocusedArtifactIndex(null);
        }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isFullscreen, focusedArtifactIndex]);

  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
      }, 3500);
      return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleOpenImageInLab = (src: string) => {
    setImageLabSource(src);
    setImageLabResult(null);
    setDrawerState({ isOpen: true, mode: 'image_lab', title: 'LUMO Image Lab (Nano Banana)', data: null });
  };

  const performImageAction = async () => {
    if (!imageLabPrompt.trim() && !imageLabSource) return;
    setIsImageLabProcessing(true);
    setGlobalError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const contents: any = { parts: [{ text: imageLabPrompt }] };
        
        if (imageLabSource && imageLabSource.startsWith('data:')) {
            const [mimePart, base64Data] = imageLabSource.split(',');
            const mimeType = mimePart.split(':')[1].split(';')[0];
            contents.parts.unshift({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents
        });

        let foundImage = false;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                setImageLabResult(`data:image/png;base64,${part.inlineData.data}`);
                foundImage = true;
                break;
            }
        }
        if (!foundImage) setGlobalError("Nano Banana was unable to synthesize the image from your request.");

    } catch (e: any) {
        console.error(e);
        setGlobalError("Neural synchronization error during image synthesis.");
    } finally {
        setIsImageLabProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageLabSource(reader.result as string);
            setImageLabResult(null);
        };
        reader.readAsDataURL(file);
    }
  };

  // Canvas Interactions
  const handleWheel = (e: React.WheelEvent) => {
      if (focusedArtifactIndex !== null) return;
      const delta = e.deltaY;
      const factor = 1.1;
      const nextScale = delta < 0 ? canvasScale * factor : canvasScale / factor;
      setCanvasScale(Math.min(Math.max(nextScale, 0.1), 5));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      if (focusedArtifactIndex !== null) return;
      if (e.button === 0 || e.button === 1) { // Left or Middle click
          setIsPanning(true);
          lastMousePos.current = { x: e.clientX, y: e.clientY };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setCanvasOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsPanning(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleUpdateProfile = (newProfile: any) => {
    setUserProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  };

  const handleToggleArchive = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isArchived: !s.isArchived } : s));
  };

  const handleToggleSaveArtifact = useCallback(() => {
    if (focusedArtifactIndex === null) return;
    setSessions(prev => prev.map((sess, i) => 
        i === currentSessionIndex ? {
            ...sess,
            artifacts: sess.artifacts.map((art, j) => 
              j === focusedArtifactIndex ? { ...art, isSaved: !art.isSaved } : art
            )
        } : sess
    ));
  }, [currentSessionIndex, focusedArtifactIndex]);

  const parseJsonStream = async function* (responseStream: any) {
    let buffer = '';
    let braceCount = 0;
    let inString = false;
    let isEscaped = false;
    let objectStartIndex = -1;

    for await (const chunk of responseStream) {
        const text = chunk.text;
        if (typeof text !== 'string') continue;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            buffer += char;

            if (char === '"' && !isEscaped) {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') {
                    if (braceCount === 0) objectStartIndex = buffer.length - 1;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0 && objectStartIndex !== -1) {
                        const jsonStr = buffer.substring(objectStartIndex);
                        try {
                            const parsed = JSON.parse(jsonStr);
                            yield parsed;
                        } catch (e) {
                            console.warn("Partial or invalid JSON segment encountered:", e);
                        }
                        buffer = '';
                        objectStartIndex = -1;
                    }
                }
            }

            if (char === '\\' && !isEscaped) isEscaped = true;
            else isEscaped = false;
        }
    }
  };

  const handleGenerateVariations = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setComponentVariations([]);
    setSelectedVariationIndex(0);
    setDrawerState({ isOpen: true, mode: 'variations', title: 'Explore Variations', data: currentArtifact.id });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
        ${UI_ARCHITECT_DIRECTIVE}
        TASK: Generate 5 RADICAL CONCEPTUAL VARIATIONS of: "${currentSession.prompt}".
        STRICT FORMATTING: Return exactly 5 JSON objects in a continuous stream, each with "name" and "html" (RAW HTML with styles and scripts). No markdown.
        `.trim();

        const responseStream = await withRetry(() => ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
             contents: [{ parts: [{ text: prompt }], role: 'user' }],
             config: { temperature: 1.1, topP: 0.95 }
        })) as any;

        for await (const variation of parseJsonStream(responseStream)) {
            if (variation && variation.name && variation.html) {
                setComponentVariations(prev => [...prev, variation]);
            }
        }
    } catch (e: any) { console.error(e); } 
    finally { setIsLoading(false); }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  const handleGenerateBrandboard = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const sourceArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setGlobalError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            ${BRAND_STRATEGIST_DIRECTIVE}
            ROLE: Master Brand Identity Strategist & Lead Visual Designer.
            CONTEXT: Analyze the provided User Interface and extract its unique "Visual DNA".
            SOURCE_CONTENT: ${sourceArtifact.html.substring(0, 15000)}
            
            TASK: Generate an ENHANCED "LUMO BRANDBOARD" Identity Specification. 
            SPECIAL FOCUS: 
            - TYPOGRAPHY: Ultra-granular typography section. 
            - COLOR PALETTE: Striking palette section with HEX codes.
            - MOCKUPS: Use professional, high-fidelity mockup presentations styled after mockups-design.com.
            
            FORMAT: RAW HTML ONLY. DO NOT INCLUDE MARKDOWN BLOCKS.
        `.trim();

        const newArtifactId = generateId();
        const lastArt = currentSession.artifacts[currentSession.artifacts.length - 1];
        const placeholderArtifact: Artifact = {
            id: newArtifactId,
            styleName: 'BRAND_IDENTITY_SPEC',
            html: '',
            status: 'streaming',
            position: { 
                x: sourceArtifact.position?.x ?? 0, 
                y: (lastArt.position?.y ?? 0) + 750 
            }
        };

        setSessions(prev => prev.map((sess, i) => 
            i === currentSessionIndex ? {
                ...sess,
                artifacts: [...sess.artifacts, placeholderArtifact]
            } : sess
        ));

        const responseStream = await withRetry(() => ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }], role: "user" }],
            config: { temperature: 0.85, topP: 0.95 }
        })) as any;

        let accumulatedHtml = '';
        for await (const chunk of responseStream) {
            accumulatedHtml += chunk.text;
            setSessions(prev => prev.map(sess => 
                sess.id === currentSession.id ? {
                    ...sess,
                    artifacts: sess.artifacts.map(art => 
                        art.id === newArtifactId ? { ...art, html: accumulatedHtml } : art
                    )
                } : sess
            ));
        }

        let finalHtml = accumulatedHtml.trim();
        if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
        if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
        if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

        // NANO BANANA POWERED: Generate a logo for the brandboard
        try {
            const logoResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: `A sophisticated professional brand logo for the identity described in this context. Minimalist, premium, solid background. Prompt source: "${currentSession.prompt}".`
            });
            for (const part of logoResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    const logoUrl = `data:image/png;base64,${part.inlineData.data}`;
                    finalHtml = finalHtml.replace('id="lumo-brand-logo" src=""', `id="lumo-brand-logo" src="${logoUrl}"`);
                    break;
                }
            }
        } catch (logoErr) { console.warn("Logo synthesis failed", logoErr); }

        setSessions(prev => prev.map(sess => 
            sess.id === currentSession.id ? {
                ...sess,
                artifacts: sess.artifacts.map(art => 
                    art.id === newArtifactId ? { ...art, html: finalHtml, status: 'complete' } : art
                )
            } : sess
        ));
        
        setFocusedArtifactIndex(currentSession.artifacts.length);

    } catch (e: any) {
        console.error(e);
        setGlobalError("Failed to synthesize Brand DNA. The neural core returned an error.");
    } finally {
        setIsLoading(false);
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  const applyVariation = (html: string) => {
      if (focusedArtifactIndex === null) return;
      setSessions(prev => prev.map((sess, i) => 
          i === currentSessionIndex ? {
              ...sess,
              artifacts: sess.artifacts.map((art, j) => 
                j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
              )
          } : sess
      ));
      setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleShowCode = () => {
      const currentSession = sessions[currentSessionIndex];
      if (currentSession && focusedArtifactIndex !== null) {
          const artifact = currentSession.artifacts[focusedArtifactIndex];
          setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: formatHtml(artifact.html) });
      }
  };

  const handleEditCode = () => {
    const currentSession = sessions[currentSessionIndex];
    if (currentSession && focusedArtifactIndex !== null) {
        const artifact = currentSession.artifacts[focusedArtifactIndex];
        setDrawerState({ isOpen: true, mode: 'edit', title: 'Live Editor', data: formatHtml(artifact.html) });
    }
  };

  const handlePreviewArtifact = () => {
    const currentSession = sessions[currentSessionIndex];
    if (currentSession && focusedArtifactIndex !== null) {
        const artifact = currentSession.artifacts[focusedArtifactIndex];
        const previewHtml = artifact.html + VISUAL_LAB_SCRIPT;
        setDrawerState({ isOpen: true, mode: 'preview', title: 'Visual Lab (Interactive & Editable)', data: previewHtml });
    }
  };

  const handleOpenLibrary = () => {
      setDrawerState({ isOpen: true, mode: 'library', title: 'Library', data: null });
  };

  const handleSelectFromLibrary = (index: number) => {
      setCurrentSessionIndex(index);
      setFocusedArtifactIndex(null);
      setIsFullscreen(false);
      setIsDashboard(false);
      setHasEntered(true);
      
      setCanvasOffset({ x: 0, y: -index * 600 });
      setCanvasScale(1);

      setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleDeleteSession = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      const newSessions = sessions.filter((_, i) => i !== index);
      setSessions(newSessions);
      if (currentSessionIndex >= newSessions.length) setCurrentSessionIndex(newSessions.length - 1);
  };

  const handleCodeChange = (newHtml: string) => {
    if (focusedArtifactIndex === null) return;
    setSessions(prev => prev.map((sess, i) => 
        i === currentSessionIndex ? {
            ...sess,
            artifacts: sess.artifacts.map((art, j) => 
              j === focusedArtifactIndex ? { ...art, html: newHtml } : art
            )
        } : sess
    ));
    if (drawerState.mode === 'edit') {
        setDrawerState(prev => ({ ...prev, data: newHtml }));
    }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();
    if (!trimmedInput || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    setGlobalError(null);
    const sessionId = generateId();

    const sessionY = sessions.length * 800; 
    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: generationType === 'ui' ? 'Designing System...' : 'Synthesizing Identity...',
        html: '',
        status: 'streaming',
        position: { x: (i - 1) * 600, y: sessionY } 
    }));

    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput,
        timestamp: Date.now(),
        artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length); 
    setFocusedArtifactIndex(null); 
    setIsFullscreen(false);
    setIsDashboard(false);
    setHasEntered(true);
    
    setCanvasOffset({ x: 0, y: -sessionY });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const stylePrompt = `
        Generate 3 distinct ${generationType === 'ui' ? 'UI directions' : 'Brand Identity directions'} for: "${trimmedInput}".
        Return ONLY a raw JSON array of 3 names.
        `.trim();

        const styleResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: [{ text: stylePrompt }] }
        });

        let generatedStyles: string[] = [];
        const styleText = styleResponse.text || '[]';
        const jsonMatch = styleText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            try {
                generatedStyles = JSON.parse(jsonMatch[0]);
            } catch (e) { console.warn("Failed to parse styles"); }
        }

        if (!generatedStyles || generatedStyles.length < 3) {
            generatedStyles = generationType === 'ui' 
                ? ["Direction Alpha", "Direction Beta", "Direction Gamma"]
                : ["Identity One", "Identity Two", "Identity Three"];
        }
        generatedStyles = generatedStyles.slice(0, 3);

        setSessions(prev => prev.map(s => s.id === sessionId ? {
            ...s,
            artifacts: s.artifacts.map((art, i) => ({ ...art, styleName: generatedStyles[i] }))
        } : s));

        const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
            const prompt = generationType === 'ui' 
                ? `
                    ${UI_ARCHITECT_DIRECTIVE}
                    TASK: Create a COMPLETE, FULLY FUNCTIONAL multi-page web experience for: "${trimmedInput}".
                    VISUAL DIRECTION: "${styleInstruction}".
                    SINGLE-FILE OUTPUT: Provide RAW HTML (with <style> and <script>) and NO markdown.
                `.trim()
                : `
                    ${BRAND_STRATEGIST_DIRECTIVE}
                    TASK: Create a SOPHISTICATED "LUMO BRANDBOARD" Identity Specification for: "${trimmedInput}".
                    ENHANCEMENT: Prioritize an ultra-granular TYPOGRAPHY section.
                    VISUAL DIRECTION: "${styleInstruction}".
                    SINGLE-FILE OUTPUT: Provide RAW HTML (with <style> and <script>) and NO markdown.
                `.trim();

            const responseStream = await withRetry(() => ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: prompt }], role: "user" }],
                config: { temperature: 0.9, topK: 40, topP: 0.95 }
            })) as any;

            let accumulatedHtml = '';
            for await (const chunk of responseStream) {
                accumulatedHtml += chunk.text;
                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                        )
                    } : sess
                ));
            }
            
            let finalHtml = accumulatedHtml.trim();
            if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
            if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
            if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

            // Brandboard Logo Logic using Nano Banana
            if (generationType === 'brand') {
                try {
                    const logoRes = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: `Logo for a brand named "${trimmedInput}" in "${styleInstruction}" style. High fidelity.`
                    });
                    for (const p of logoRes.candidates[0].content.parts) {
                        if (p.inlineData) {
                            const b64 = `data:image/png;base64,${p.inlineData.data}`;
                            finalHtml = finalHtml.replace('id="lumo-brand-logo" src=""', `id="lumo-brand-logo" src="${b64}"`);
                        }
                    }
                } catch (e) { console.warn("Nano Banana logo failed"); }
            }

            setSessions(prev => prev.map(sess => 
                sess.id === sessionId ? {
                    ...sess,
                    artifacts: sess.artifacts.map(art => 
                        art.id === artifact.id ? { ...art, html: finalHtml, status: 'complete' } : art
                    )
                } : sess
            ));
        };

        for (let i = 0; i < placeholderArtifacts.length; i++) {
            await generateArtifact(placeholderArtifacts[i], generatedStyles[i]);
            if (i < placeholderArtifacts.length - 1) await new Promise(r => setTimeout(r, 600));
        }
    } catch (e: any) {
        console.error(e);
        setGlobalError("Connection to the LUMO Neural Grid was interrupted. Please retry.");
    } finally { setIsLoading(false); }
  }, [inputValue, isLoading, sessions.length, generationType]);

  const handleReturnHome = () => {
    setHasEntered(false);
    setIsSigningUp(false);
    setIsOnboarding(false);
    setIsDashboard(false);
    setFocusedArtifactIndex(null);
    setIsFullscreen(false);
    setIsActionBarVisible(true);
    setIsUiCollapsed(false);
  };

  const handleGoToDashboard = () => {
    setHasEntered(false);
    setIsDashboard(true);
    setFocusedArtifactIndex(null);
    setIsFullscreen(false);
    setIsActionBarVisible(true);
    setIsUiCollapsed(false);
  };

  const handleSurpriseMe = () => {
      const currentPrompt = placeholders[placeholderIndex];
      setInputValue(currentPrompt);
      if (!hasEntered && !isOnboarding && !isDashboard && !isSigningUp) {
          setIsInitializing(true);
          setTimeout(() => {
              setIsInitializing(false);
              setIsSigningUp(true);
          }, 2400); 
      }
      handleSendMessage(currentPrompt);
  };

  const handleEnterCore = () => {
    setIsInitializing(true);
    setTimeout(() => {
        setIsInitializing(false);
        setIsSigningUp(true);
    }, 2400); 
  };

  const handleFinishSignUp = () => {
    setIsSigningUp(false);
    setIsOnboarding(true);
  };

  const handleFinishOnboarding = (profileData: any) => {
    setUserProfile(profileData);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    setIsOnboarding(false);
    setIsDashboard(true);
  };

  const handleCreateProject = () => {
      setIsDashboard(false);
      setHasEntered(true);
      setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
        event.preventDefault();
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setInputValue(placeholders[placeholderIndex]);
    }
  };

  const nextItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex < (sessions[currentSessionIndex]?.artifacts.length || 0) - 1) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      } else if (currentSessionIndex < sessions.length - 1) {
          setCurrentSessionIndex(currentSessionIndex + 1);
      }
  }, [currentSessionIndex, sessions, focusedArtifactIndex]);

  const prevItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      } else if (currentSessionIndex > 0) {
           setCurrentSessionIndex(currentSessionIndex - 1);
      }
  }, [currentSessionIndex, focusedArtifactIndex]);

  const exitFocus = () => {
      setFocusedArtifactIndex(null);
      setIsFullscreen(false);
      setIsActionBarVisible(true);
  };

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];
  const currentFocusedArtifact = currentSession?.artifacts[focusedArtifactIndex ?? -1];

  let canGoBack = false;
  let canGoForward = false;
  if (hasStarted) {
      if (focusedArtifactIndex !== null) {
          canGoBack = focusedArtifactIndex > 0;
          canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
      } else {
          canGoBack = currentSessionIndex > 0;
          canGoForward = currentSessionIndex < sessions.length - 1;
      }
  }

  const activeVariation = componentVariations[selectedVariationIndex];
  const commonSandbox = "allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-downloads allow-presentation";

  return (
    <>
        {globalError && (
            <div className="global-error-banner" onClick={() => setGlobalError(null)}>
                <span>{globalError}</span>
            </div>
        )}

        {isInitializing && (
            <div className="initializing-overlay">
                <LumoLoader size="large" message="INITIALIZING CORE ASSETS..." />
            </div>
        )}

        <SideDrawer 
            isOpen={drawerState.isOpen} 
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))} 
            title={drawerState.title}
            wide={drawerState.mode === 'variations' || drawerState.mode === 'edit' || drawerState.mode === 'preview' || drawerState.mode === 'image_lab'}
        >
            {drawerState.mode === 'code' && (
                <pre className="code-block"><code>{drawerState.data}</code></pre>
            )}

            {drawerState.mode === 'preview' && (
                <div className="drawer-full-preview">
                     <iframe srcDoc={drawerState.data} title="Laboratory Preview" sandbox={commonSandbox} />
                </div>
            )}

            {drawerState.mode === 'image_lab' && (
                <div className="image-lab-container fade-in">
                    <div className="image-lab-workspace">
                        <div className="image-lab-canvas">
                            {!imageLabSource && (
                                <div className="image-lab-placeholder" onClick={() => imageUploadRef.current?.click()}>
                                    <ImageIcon style={{ fontSize: '3rem', opacity: 0.2 }} />
                                    <p>CLICK TO UPLOAD BASE ASSET</p>
                                    <input type="file" ref={imageUploadRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                                </div>
                            )}
                            {imageLabSource && !imageLabResult && (
                                <div className="image-lab-preview">
                                    <img src={imageLabSource} alt="Source" />
                                    <button className="image-lab-reset" onClick={() => setImageLabSource(null)}>&times;</button>
                                </div>
                            )}
                            {imageLabResult && (
                                <div className="image-lab-preview result">
                                    <img src={imageLabResult} alt="Result" />
                                    <div className="image-lab-result-overlay">
                                        <button className="cta-btn-prism small" onClick={() => { setImageLabSource(imageLabResult); setImageLabResult(null); }}>USE AS BASE</button>
                                        <a href={imageLabResult} download="lumo_nano_banana.png" className="secondary-cta-prism small">DOWNLOAD</a>
                                    </div>
                                </div>
                            )}
                            {isImageLabProcessing && (
                                <div className="image-lab-overlay">
                                    <ThinkingIcon className="spin-icon" style={{ fontSize: '3rem' }} />
                                    <p>NANO BANANA SYNCING...</p>
                                </div>
                            )}
                        </div>
                        <div className="image-lab-controls">
                            <div className="image-lab-input-group">
                                <label>NEURAL PIGMENT PROMPT</label>
                                <textarea 
                                    value={imageLabPrompt} 
                                    onChange={(e) => setImageLabPrompt(e.target.value)}
                                    placeholder="e.g. Add a retro filter, remove background, change to cyberpunk style..."
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && performImageAction()}
                                />
                            </div>
                            <button 
                                className="cta-btn-prism full-width" 
                                onClick={performImageAction} 
                                disabled={isImageLabProcessing || (!imageLabPrompt && !imageLabSource)}
                            >
                                <MagicIcon /> SYNTHESIZE
                            </button>
                            <div className="image-lab-meta">
                                Powered by Gemini 2.5 Flash Image // Nano Banana Core
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {drawerState.mode === 'edit' && (
                <div className="variations-layout">
                    <div className="active-variation-container">
                        <div className="active-variation-header"><h3>Live Preview</h3></div>
                        <div className="active-variation-preview">
                            <iframe srcDoc={drawerState.data} title="Live Edit Preview" sandbox={commonSandbox} />
                        </div>
                    </div>
                    <div className="editor-container">
                        <textarea 
                            className="live-editor" 
                            value={drawerState.data} 
                            onChange={(e) => handleCodeChange(e.target.value)}
                            placeholder="Edit code..."
                            spellCheck={false}
                        />
                    </div>
                </div>
            )}

            {drawerState.mode === 'library' && (
                <div className="library-list">
                    {sessions.length === 0 ? (
                        <div className="empty-library">Empty.</div>
                    ) : (
                        sessions.map((session, i) => (
                            <div 
                                key={session.id} 
                                className={`library-item ${currentSessionIndex === i ? 'active' : ''}`}
                                onClick={() => handleSelectFromLibrary(i)}
                            >
                                <div className="library-item-info">
                                    <div className="library-item-prompt">{session.prompt}</div>
                                </div>
                                <button className="delete-btn" onClick={(e) => handleDeleteSession(e, i)}><TrashIcon /></button>
                            </div>
                        )).reverse()
                    )}
                </div>
            )}
            
            {drawerState.mode === 'variations' && componentVariations.length > 0 && (
                <div className="variations-layout">
                    <div className="active-variation-container">
                        <div className="active-variation-header">
                             <h3>{activeVariation?.name || 'Loading...'}</h3>
                             <button className="apply-variation-btn" onClick={() => applyVariation(activeVariation.html)}>Apply</button>
                        </div>
                        <div className="active-variation-preview">
                            <iframe 
                                key={selectedVariationIndex}
                                srcDoc={(activeVariation?.html || '') + VISUAL_LAB_SCRIPT} 
                                title="Active Variation Preview" 
                                sandbox={commonSandbox} 
                            />
                        </div>
                    </div>
                    <div className="variations-selection-grid">
                        <div className="sexy-grid-horizontal">
                            {componentVariations.map((v, i) => (
                                <div key={i} className={`sexy-card compact ${selectedVariationIndex === i ? 'selected' : ''}`} onClick={() => setSelectedVariationIndex(i)}>
                                    <div className="sexy-preview"><iframe srcDoc={v.html} title={v.name} sandbox="allow-scripts allow-same-origin" /></div>
                                    <div className="sexy-label">{v.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </SideDrawer>

        <div className="immersive-app">
            {(hasEntered || isDashboard) && (
                <nav className={`app-top-nav ${isUiCollapsed ? 'ui-hidden' : ''}`}>
                    <div className="logo small" onClick={handleReturnHome}>
                        <div className="logo-box small"></div>
                        LUMO
                    </div>
                    <div className="nav-actions">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === 'dark' ? 'Dark' : 'Light'}
                        </button>
                        {hasEntered && (
                            <button className="nav-home-btn" onClick={handleGoToDashboard} style={{ background: 'var(--glass)', border: '1px solid var(--grid-line)' }}>DASHBOARD</button>
                        )}
                        <button className="nav-home-btn" onClick={handleReturnHome}>EXIT</button>
                    </div>
                </nav>
            )}

            <div 
                ref={canvasRef}
                className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-canvas'} ${isFullscreen ? 'mode-fullscreen-active' : ''}`}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                 <LandingPage 
                    isVisible={!hasEntered && !isOnboarding && !isDashboard && !isSigningUp} 
                    onEnterCore={handleEnterCore} 
                    onSurpriseMe={handleSurpriseMe}
                    isLoading={isLoading}
                    theme={theme}
                    toggleTheme={toggleTheme}
                 />

                 {isSigningUp && (
                   <SignUp onComplete={handleFinishSignUp} />
                 )}

                 {isOnboarding && (
                    <Onboarding onComplete={handleFinishOnboarding} />
                 )}

                 {isDashboard && userProfile && (
                     <ProfileDashboard 
                        profile={userProfile} 
                        onCreateProject={handleCreateProject}
                        sessions={sessions}
                        onSelectProject={handleSelectFromLibrary}
                        onUpdateProfile={handleUpdateProfile}
                        onToggleArchive={handleToggleArchive}
                     />
                 )}

                {hasEntered && (
                    <div 
                        className="canvas-world"
                        style={{
                            transform: `translate(calc(50% + ${canvasOffset.x}px), calc(50% + ${canvasOffset.y}px)) scale(${canvasScale})`,
                            cursor: isPanning ? 'grabbing' : 'grab'
                        }}
                    >
                        {sessions.map((session, sIndex) => (
                            <React.Fragment key={session.id}>
                                {session.artifacts.map((artifact, aIndex) => {
                                    const isFocused = focusedArtifactIndex === aIndex && currentSessionIndex === sIndex;
                                    return (
                                        <div 
                                            key={artifact.id}
                                            className={`canvas-node ${isFocused ? 'focused' : ''} ${isFullscreen && isFocused ? 'fullscreen' : ''}`}
                                            style={{
                                                left: `${artifact.position?.x || 0}px`,
                                                top: `${artifact.position?.y || 0}px`,
                                                zIndex: isFocused ? 200 : 1
                                            }}
                                        >
                                            <ArtifactCard 
                                                artifact={artifact}
                                                isFocused={isFocused}
                                                isFullscreen={isFullscreen && isFocused}
                                                onClick={() => {
                                                    if (!isPanning) {
                                                        setCurrentSessionIndex(sIndex);
                                                        setFocusedArtifactIndex(aIndex);
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

             {(canGoBack && !isFullscreen && hasEntered && !isUiCollapsed && focusedArtifactIndex !== null) && (
                <button className="nav-handle left" onClick={prevItem}><ArrowLeftIcon /></button>
             )}
             {(canGoForward && !isFullscreen && hasEntered && !isUiCollapsed && focusedArtifactIndex !== null) && (
                <button className="nav-handle right" onClick={nextItem}><ArrowRightIcon /></button>
             )}

            {hasEntered && (
                <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : ''} ${isFullscreen ? 'fullscreen-mode' : ''} ${!isActionBarVisible || isUiCollapsed ? 'minimized' : ''}`}>
                    {(!isActionBarVisible || isUiCollapsed) ? (
                        <button className="expand-bar-btn" onClick={() => { setIsActionBarVisible(true); setIsUiCollapsed(false); }}>
                             <SparklesIcon /> <span>OPEN ACTIONS</span>
                        </button>
                    ) : (
                        <>
                            <div className="active-prompt-header">
                                <div className="active-prompt-label">{currentSession?.prompt}</div>
                                <button className="minimize-bar-btn" onClick={() => setIsActionBarVisible(false)} title="Minimize Actions">
                                    &times;
                                </button>
                            </div>
                            <div className="action-buttons">
                                <button onClick={exitFocus}><GridIcon /> Workspace</button>
                                <button 
                                    onClick={handleToggleSaveArtifact} 
                                    className={currentFocusedArtifact?.isSaved ? 'saved-active' : ''}
                                    style={currentFocusedArtifact?.isSaved ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}
                                >
                                    <BookmarkIcon /> {currentFocusedArtifact?.isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button onClick={() => setDrawerState({ isOpen: true, mode: 'image_lab', title: 'LUMO Image Lab (Nano Banana)', data: null })}><ImageIcon /> Image Lab</button>
                                <button onClick={handleGenerateBrandboard} disabled={isLoading}><SwatchIcon /> Brandboard</button>
                                <button onClick={handlePreviewArtifact}><SparklesIcon /> Visual Lab</button>
                                <button onClick={() => setIsFullscreen(!isFullscreen)}>{isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />} Zoom</button>
                                <button onClick={handleGenerateVariations} disabled={isLoading}><LibraryIcon /> Variations</button>
                                <button onClick={handleEditCode}><EditIcon /> Edit</button>
                                <button onClick={handleShowCode}><CodeIcon /> Code</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {hasEntered && (
                <div className={`floating-input-container ${isUiCollapsed ? 'ui-collapsed' : ''}`}>
                    <div className={`input-wrapper pill-design ${isLoading ? 'loading' : ''} ${isFullscreen ? 'hide-input' : ''}`}>
                        <div className="input-left-side">
                            <button className="folder-action-btn" onClick={handleOpenLibrary} title="Library">
                                <FolderIcon />
                            </button>
                        </div>
                        
                        <div className="input-central-area">
                            {!isLoading ? (
                                <div className="input-with-selector">
                                    <div className="generation-type-toggle">
                                        <button 
                                            className={generationType === 'ui' ? 'active' : ''} 
                                            onClick={() => setGenerationType('ui')}
                                            title="Generate UI System"
                                        >
                                            <GridIcon />
                                        </button>
                                        <button 
                                            className={generationType === 'brand' ? 'active' : ''} 
                                            onClick={() => setGenerationType('brand')}
                                            title="Generate Brand Identity"
                                        >
                                            <SwatchIcon />
                                        </button>
                                    </div>
                                    <input 
                                        ref={inputRef}
                                        type="text" 
                                        value={inputValue} 
                                        placeholder={generationType === 'ui' ? "Design a UI System for..." : "Generate Brand Identity for..."}
                                        onChange={handleInputChange} 
                                        onKeyDown={handleKeyDown} 
                                        disabled={isLoading} 
                                    />
                                    {(!inputValue && !isLoading) && (
                                        <span className="input-tab-hint">Tab to cycle</span>
                                    )}
                                </div>
                            ) : (
                                <div className="input-generating-layout">
                                    <span className="generating-text-label">{currentSession?.prompt}</span>
                                    <div className="loading-bar-spinner">
                                        <div className="spinner-dot"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="input-right-side">
                            <button 
                                className={`pill-action-btn secondary ${isUiCollapsed ? 'collapsed' : ''}`}
                                onClick={() => setIsUiCollapsed(!isUiCollapsed)}
                                title={isUiCollapsed ? "Expand" : "Minimize"}
                            >
                                <ArrowUpIcon />
                            </button>
                            <button 
                                className="pill-action-btn primary" 
                                onClick={() => handleSendMessage()} 
                                disabled={isLoading || !inputValue.trim()}
                            >
                                <ArrowUpIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ChatBot isVisible={!isUiCollapsed} />
        </div>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
