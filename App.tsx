import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, Type, Modality } from '@google/genai';

// Make GenAI classes available on the window for compatibility with tool components.
// Fix for `window.aistudio` type conflict.
// The error "Subsequent property declarations must have the same type" suggests another declaration exists.
// Defining and using a named `AIStudio` interface resolves this conflict.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    GoogleGenAI: typeof GoogleGenAI;
    GenAIType: typeof Type;
    GenAIModality: typeof Modality;
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
window.GoogleGenAI = GoogleGenAI;
window.GenAIType = Type;
window.GenAIModality = Modality;


// ===============================================
// 1. ICON COMPONENTS
// ===============================================

const iconProps = {
    className: "w-8 h-8 text-blue-600",
    strokeWidth: 1.5
};

const IconHome: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v8.25a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5V10.5M9 21V15a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 15v6" />
    </svg>
);

const IconGift: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 19.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875zM21 11.25H3v-3.75a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v3.75z" />
    </svg>
);

const IconPromptJson: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-promptjson" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-promptjson)" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconWhiskFlow: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-whiskflow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-whiskflow)" strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
);

const IconCreateImage: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-createimage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-createimage)" strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconCreateThumbnail: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-createthumbnail" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-createthumbnail)" strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2M16 3h2a2 2 0 012 2v2M16 21h2a2 2 0 002-2v-2" />
        <rect x="7" y="7" width="10" height="10" rx="1" stroke="url(#grad-createthumbnail)" strokeWidth="1.5" />
    </svg>
);

const IconCreateVideo: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-createvideo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-createvideo)" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const IconSeoYoutube: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-seoyoutube" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-seoyoutube)" strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const IconYoutubeExternal: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-youtubeexternal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-youtubeexternal)" strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.704 21.042A10.03 10.03 0 0112 21a10.03 10.03 0 014.296-.958M7.704 21.042L8.5 16.5M16.296 21.042L15.5 16.5M12 12a5 5 0 015-5h.01M12 12a5 5 0 00-5 5h.01" />
    </svg>
);

const IconAppAffiliate: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-appaffiliate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-appaffiliate)" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const IconFaq: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-faq" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-faq)" strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconStoryTeller: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-storybook" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-storybook)" strokeLinecap="round" strokeLinejoin="round" d="M2 6s1.5-2 5-2 5 2 5 2v14H2V6zm15 14V4s-1.5-2-5-2-5 2-5 2" />
        <path stroke="url(#grad-storybook)" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" />
    </svg>
);


const IconComingSoon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...iconProps}>
        <defs>
            <linearGradient id="grad-comingsoon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
        </defs>
        <path stroke="url(#grad-comingsoon)" strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 12l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 12z" />
    </svg>
);

const IconYoutube: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
    </svg>
);

const IconFacebook: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
    </svg>
);

const IconTiktok: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.81-1.77-1.77-2.69-4.14-2.6-6.6.02-1.28.31-2.57.88-3.73.9-1.86 2.54-3.24 4.5-4.13.57-.25 1.19-.41 1.81-.48v3.86c-.33.04-.66.11-.97.22-1.03.34-1.93 1-2.61 1.82-.69.83-1.11 1.83-1.16 2.86-.05 1.08.28 2.18.9 3.08.62.91 1.52 1.58 2.58 1.95.88.31 1.82.35 2.75.14.93-.21 1.77-.73 2.4-1.45.63-.72 1-1.61 1.11-2.59v-9.35c-1.39.42-2.85.6-4.25.54V.02z" />
    </svg>
);

const IconZalo: React.FC = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-7 h-7">
        <path d="M256,0C114.615,0,0,105.29,0,236.235c0,61.905,27.36,118.42,72.715,158.82L29.92,488.085l129.58-31.54 c30.555,9.21,63.15,14.155,96.5,14.155C397.385,470.7,512,365.41,512,234.465C512,105.29,397.385,0,256,0z M176.435,329.515 c-24.02,0-43.5-19.48-43.5-43.5s19.48-43.5,43.5-43.5s43.5,19.48,43.5,43.5S200.455,329.515,176.435,329.515z M335.565,329.515 c-24.02,0-43.5-19.48-43.5-43.5s19.48-43.5,43.5-43.5s43.5,19.48,43.5,43.5S359.585,329.515,335.565,329.515z" />
    </svg>
);

const IconSettings: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 1015 0M12 4.5v.01M12 19.5v.01" />
    </svg>
);

const IconKey: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-12 h-12 text-blue-500"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);


// ===============================================
// 2. HELPER/UI COMPONENTS
// ===============================================

interface IconButtonProps {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
}
const IconButton: React.FC<IconButtonProps> = ({ icon, text, onClick }) => {
    const buttonClasses = `
        group relative flex items-center w-full p-6 rounded-2xl overflow-hidden
        bg-white/60 backdrop-blur-sm border border-blue-500
        shadow-xl shadow-blue-500/20
        transform-gpu transition-all duration-300 ease-in-out
        hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/40
        focus:outline-none focus:ring-4 focus:ring-blue-500/50
        aurora-sparkle-on-active
    `;

    return (
        <button className={buttonClasses} onClick={onClick}>
            <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-blue-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
            />
            <div className="relative z-10 mr-5 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
                {icon}
            </div>
            <span className="relative z-10 text-xl font-semibold text-slate-800">{text}</span>
        </button>
    );
};


interface Tool {
    id: number;
    text: string;
    icon: React.ReactElement;
    title?: string;
    description?: string;
}

interface ApiKeyModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (keys: { gemini: string; openai: string; }) => void;
    currentGeminiKey: string;
    currentOpenAiKey: string;
}
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ show, onClose, onSave, currentGeminiKey, currentOpenAiKey }) => {
    const [geminiKey, setGeminiKey] = useState(currentGeminiKey);
    const [openAiKey, setOpenAiKey] = useState(currentOpenAiKey);

    useEffect(() => {
        setGeminiKey(currentGeminiKey);
        setOpenAiKey(currentOpenAiKey);
    }, [currentGeminiKey, currentOpenAiKey, show]);

    if (!show) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ gemini: geminiKey, openai: openAiKey });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-px rounded-2xl max-w-lg w-full shadow-2xl shadow-blue-500/20 m-4">
                <div className="bg-lime-50 rounded-[calc(1rem-1px)] p-8">
                    <div className="flex justify-center mb-4">
                        <IconKey className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Cài đặt API Keys</h2>
                    <form onSubmit={handleSave}>
                        <p className="text-slate-600 text-center mb-6 text-base">
                            Nhập API Keys của bạn để sử dụng các tính năng.
                        </p>
                        <div className='space-y-4'>
                            <div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <label htmlFor='gemini-key-input' className="text-slate-700 font-semibold text-sm">Gemini API Key</label>
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Lấy API Key</a>
                                </div>
                                <input
                                    id='gemini-key-input'
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Nhập Gemini API Key..."
                                    aria-label="Gemini API Key"
                                />
                            </div>
                             <div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <label htmlFor='openai-key-input' className="text-slate-700 font-semibold text-sm">OpenAI API Key</label>
                                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Lấy API Key</a>
                                </div>
                                <input
                                    id='openai-key-input'
                                    type="password"
                                    value={openAiKey}
                                    onChange={(e) => setOpenAiKey(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Nhập OpenAI API Key..."
                                    aria-label="OpenAI API Key"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-lg transition-all duration-300 aurora-sparkle-on-active"
                            >Hủy</button>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 aurora-sparkle-on-active"
                            >Lưu</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// 3. TOOL COMPONENTS
// ===============================================

interface ToolAppProps {
    geminiApiKey: string;
    openAiApiKey?: string;
    onRequestApiKeyInput: () => void;
}

const ToolButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'active' }> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyles = 'px-4 py-2 rounded-md font-bold text-sm transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lime-200 disabled:opacity-50 disabled:cursor-not-allowed aurora-sparkle-on-active';
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
        active: 'bg-blue-600 text-white ring-2 ring-blue-400',
    };
    return <button className={`${baseStyles} ${variantStyles[variant as keyof typeof variantStyles]} ${className}`} {...props}>{children}</button>;
};

const ToolSpinner: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ToolErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-4 bg-red-100 border border-red-400 rounded-lg text-center">
        <p className="text-red-800 text-sm font-semibold">Lỗi</p>
        <p className="text-xs text-red-700 mt-1">{message}</p>
    </div>
);


// --- START OF SCRIPT WRITER APP CODE (PROMPT JSON) ---
const ScriptWriterButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'active' }> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyles = 'px-4 py-2 rounded-md font-bold text-sm transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lime-200 disabled:opacity-50 disabled:cursor-not-allowed aurora-sparkle-on-active';
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      active: 'bg-blue-600 text-white ring-2 ring-blue-400',
    };
    const buttonStyle = variantStyles[variant] || variantStyles.primary;
    return <button className={`${baseStyles} ${buttonStyle} ${className}`} {...props}>{children}</button>;
};

const ScriptWriterInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
    const baseStyles = 'w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
    return <input className={`${baseStyles} ${className}`} {...props} />;
};

const ScriptWriterApp: React.FC<ToolAppProps> = ({ geminiApiKey, openAiApiKey, onRequestApiKeyInput }) => {
    const [idea, setIdea] = useState('');
    const [duration, setDuration] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedScene, setCopiedScene] = useState<number | null>(null);
    const [apiProvider, setApiProvider] = useState('google');

    const parseDurationToSeconds = (durationStr: string) => {
      if (!durationStr.trim()) return null;
      let totalSeconds = 0;
      const minutesMatches = durationStr.match(/(\d+(\.\d+)?)\s*(phút|minute|min|m)/i);
      if (minutesMatches) {
        totalSeconds += parseFloat(minutesMatches[1]) * 60;
      }
      const secondsMatches = durationStr.match(/(\d+(\.\d+)?)\s*(giây|second|sec|s)/i);
      if (secondsMatches) {
        totalSeconds += parseFloat(secondsMatches[1]);
      }
      if (totalSeconds === 0 && /^\d+(\.\d+)?$/.test(durationStr.trim())) {
        totalSeconds = parseFloat(durationStr.trim());
      }
      return totalSeconds > 0 ? totalSeconds : null;
    };

    const getApiErrorMessage = (error: any) => {
      let message = 'An unknown error occurred during generation.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      try {
        const jsonMatch = message.match(/\{.*\}/s);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[0]);
          const nestedError = errorObj.error || errorObj;

          if (nestedError.status === 'UNAVAILABLE' || nestedError.code === 503) {
            return 'Lỗi từ Google AI: Model đang bị quá tải. Vui lòng thử lại sau ít phút.';
          }
          if (nestedError.message && (nestedError.message.includes('API key not valid') || nestedError.message.includes('API_KEY_INVALID'))) {
            return 'Lỗi API Google: API key không hợp lệ. Vui lòng kiểm tra lại trong phần Cài đặt.';
          }
          if (nestedError.message) {
            return `Lỗi từ Google AI: ${nestedError.message}`;
          }
        }
      } catch (e) {}

      if (message.includes('Incorrect API key')) {
        return 'Lỗi API OpenAI: API key không hợp lệ. Vui lòng kiểm tra lại trong phần Cài đặt.';
      }
      if (message.toLowerCase().includes('rate limit')) {
        return 'Lỗi API OpenAI: Bạn đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau hoặc kiểm tra gói cước của bạn.';
      }
      
      return `Không thể tạo kịch bản. Vui lòng kiểm tra API key và prompt. Chi tiết lỗi: ${message}`;
    };
    
    const systemInstruction = `You are an expert scriptwriter and AI prompt engineer. Your task is to transform a user's simple idea into a detailed script. For each scene, you must generate a highly structured, detailed JSON prompt object designed to guide another AI in creating a consistent video clip.

**INTERNAL MONOLOGUE & CONSISTENCY PLAN (CRITICAL):**
Before generating the JSON output, you MUST first create an internal plan. This plan will NOT be part of the final output.
1.  **Define Core Entities:** Create a detailed "entity sheet" for all main characters and key locations.
    *   **For Characters:** Specify their species, gender, age, clothing, hair color/style, facial features, unique marks (e.g., "a 25-year-old male explorer with short, messy brown hair, a rugged leather jacket over a grey t-shirt, cargo pants, and a noticeable scar above his left eyebrow").
    *   **For Locations:** Describe the key elements, atmosphere, lighting, and time of day (e.g., "a dense, Amazonian jungle at dusk, with thick fog clinging to the ground, giant glowing mushrooms providing an eerie blue light").
2.  **Reference the Plan:** For every scene you generate, you MUST refer back to this entity sheet and use the exact descriptive details to populate the fields in the structured JSON prompt. This is the key to consistency.

**LANGUAGE REQUIREMENT (CRITICAL):**
- The top-level "description" field for each scene MUST be in VIETNAMESE.
- All content inside the nested "prompt" JSON object MUST be in ENGLISH.

**STRUCTURED PROMPT FOR EACH SCENE (CRITICAL):**
For each scene, the "prompt" field must be a JSON object that strictly adheres to the following structure. You will populate it with details from your internal plan and the specific actions of the scene.

{
"Objective": "State the primary goal for the AI video generator for this specific scene. E.g., 'To create a photorealistic, 8-second, 4K cinematic clip of the protagonist discovering a hidden temple.'",
"Persona": {
  "Role": "Define the role the video AI should adopt. E.g., 'An expert cinematographer and visual effects artist.'",
  "Tone": "Specify the desired artistic tone. E.g., 'Suspenseful, epic, mysterious, dramatic.'",
  "Knowledge_Level": "Assume the AI has expert-level knowledge. E.g., 'Expert in Hollywood-style visual storytelling.'"
},
"Task_Instructions": [
  "Provide a bulleted list of step-by-step instructions for the AI. Be very specific. Use details from your consistency plan.",
  "Example 1: 'Depict the main character, a 25-year-old male explorer with a scar over his left eye, pushing aside thick jungle vines.'",
  "Example 2: 'The setting is the Amazonian jungle at dusk, with eerie blue light from glowing mushrooms illuminating the scene.'",
  "Example 3: 'Use a slow, dramatic dolly zoom camera shot to build tension as he reveals the temple entrance.'"
],
"Constraints": [
  "List any rules or limitations.",
  "E.g., 'The video clip must be exactly 8 seconds long.'",
  "E.g., 'Do not show any other characters in this scene.'",
  "E.g., 'Maintain a photorealistic style throughout.'"
],
"Input_Examples": [
  {
    "Input": "A simple text description of a similar, successful scene.",
    "Expected_Output": "A brief description of the high-quality video that should result."
  }
],
"Output_Format": {
  "Type": "Specify the final output type. E.g., 'video/mp4'",
  "Structure": {
      "character_details": "A concise summary of the character's appearance and gear for this scene, copied from your plan.",
      "setting_details": "A concise summary of the location, time, and atmosphere, copied from your plan.",
      "key_action": "The single most important action occurring in the scene.",
      "camera_direction": "The specific camera shot to use (e.g., 'dolly zoom', 'crane shot', 'tracking shot')."
  }
}
}`;

    const handleGenerate = async () => {
      if (apiProvider === 'google' && !geminiApiKey) {
        onRequestApiKeyInput();
        return;
      }
      if (apiProvider === 'openai' && !openAiApiKey) {
        onRequestApiKeyInput();
        return;
      }
      if (!idea.trim()) {
        setError("Please enter a content idea.");
        return;
      }

      setIsGenerating(true);
      setError(null);
      setResults([]);

      let userPrompt = `Generate a script and video prompts based on these details:\n\nIdea: "${idea}"`;
      const totalSeconds = parseDurationToSeconds(duration);
      if (totalSeconds) {
          const requiredScenes = Math.ceil(totalSeconds / 8);
          userPrompt += `\n\nRequirement: The final video should be approximately ${duration} (${totalSeconds} seconds). To achieve this, you MUST generate exactly ${requiredScenes} scenes, as each scene will become an 8-second video clip.`;
      } else {
          userPrompt += `\n\nDesired Video Duration: "${duration || 'not specified'}"`;
      }

      try {
        if (apiProvider === 'google') {
          const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: window.GenAIType.ARRAY,
                items: {
                  type: window.GenAIType.OBJECT,
                  properties: {
                    scene: { type: window.GenAIType.INTEGER, description: "The scene number, starting from 1." },
                    description: { type: window.GenAIType.STRING, description: "A VIETNAMESE description of what happens in this scene." },
                    prompt: {
                      type: window.GenAIType.OBJECT,
                      description: "A structured JSON prompt object for the video generation AI.",
                      properties: {
                        Objective: { type: window.GenAIType.STRING },
                        Persona: {
                          type: window.GenAIType.OBJECT,
                          properties: {
                            Role: { type: window.GenAIType.STRING },
                            Tone: { type: window.GenAIType.STRING },
                            Knowledge_Level: { type: window.GenAIType.STRING },
                          },
                          required: ['Role', 'Tone', 'Knowledge_Level'],
                        },
                        Task_Instructions: {
                          type: window.GenAIType.ARRAY,
                          items: { type: window.GenAIType.STRING },
                        },
                        Constraints: {
                          type: window.GenAIType.ARRAY,
                          items: { type: window.GenAIType.STRING },
                        },
                        Input_Examples: {
                          type: window.GenAIType.ARRAY,
                          items: {
                            type: window.GenAIType.OBJECT,
                            properties: {
                              Input: { type: window.GenAIType.STRING },
                              Expected_Output: { type: window.GenAIType.STRING },
                            },
                            required: ['Input', 'Expected_Output'],
                          },
                        },
                        Output_Format: {
                          type: window.GenAIType.OBJECT,
                          properties: {
                            Type: { type: window.GenAIType.STRING },
                            Structure: {
                              type: window.GenAIType.OBJECT,
                              properties: {
                                character_details: { type: window.GenAIType.STRING },
                                setting_details: { type: window.GenAIType.STRING },
                                key_action: { type: window.GenAIType.STRING },
                                camera_direction: { type: window.GenAIType.STRING },
                              },
                              required: ['character_details', 'setting_details', 'key_action', 'camera_direction'],
                            },
                          },
                          required: ['Type', 'Structure'],
                        },
                      },
                      required: ['Objective', 'Persona', 'Task_Instructions', 'Constraints', 'Input_Examples', 'Output_Format'],
                    },
                  },
                  required: ['scene', 'description', 'prompt'],
                },
              },
            },
          });
          const jsonText = response.text.trim();
          const parsedResults = JSON.parse(jsonText);
          setResults(parsedResults);
        } else { // OpenAI
          const openAISystemInstruction = `${systemInstruction}\n\n**OUTPUT FORMAT (CRITICAL):**\nYour final output must be a single, valid JSON object with one key: "scenes". The value of "scenes" should be an array of objects, where each object represents a scene. Each scene object must contain 'scene', 'description', and 'prompt' keys.`;
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${openAiApiKey}`
              },
              body: JSON.stringify({
                  model: 'gpt-4o',
                  messages: [
                      { role: 'system', content: openAISystemInstruction },
                      { role: 'user', content: userPrompt }
                  ],
                  response_format: { type: 'json_object' }
              })
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const jsonText = data.choices[0].message.content;
          const parsedResponse = JSON.parse(jsonText);
          
          if (!parsedResponse.scenes || !Array.isArray(parsedResponse.scenes)) {
            throw new Error("Invalid response format from OpenAI. Expected a 'scenes' array.");
          }
          
          setResults(parsedResponse.scenes);
        }

      } catch (e: any) {
        console.error(e);
        setError(getApiErrorMessage(e));
      } finally {
        setIsGenerating(false);
      }
    };

    const handleCopyPrompt = (promptText: string, sceneNumber: number) => {
      navigator.clipboard.writeText(promptText).then(() => {
        setCopiedScene(sceneNumber);
        setTimeout(() => setCopiedScene(null), 2000);
      }).catch(err => {
        setError(`Could not copy text. Please copy it manually.`);
        setTimeout(() => setError(null), 4000);
      });
    };
    
    const handleDownloadJson = (data: any, filename: string) => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleDownloadPrompts = () => {
      const promptsOnly = results.reduce((acc, scene) => {
        acc[`scene_${scene.scene}`] = scene.prompt;
        return acc;
      }, {} as Record<string, any>);
      handleDownloadJson(promptsOnly, 'generated_prompts.json');
    };

    const handleDownloadScript = () => {
      handleDownloadJson(results, 'generated_script.json');
    };

    const Spinner = () => (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
        <div className="p-4 bg-red-100 border border-red-400 rounded-lg text-center">
            <p className="text-red-800 text-sm font-semibold">Lỗi</p>
            <p className="text-xs text-red-700 mt-1">{message}</p>
        </div>
    );

    return (
        <div className="bg-transparent text-slate-900 p-0 sm:p-2 rounded-lg border border-blue-500/30 shadow-2xl h-full">
            <div className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="space-y-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-slate-300 overflow-y-auto">
                        <div>
                            <label htmlFor="idea-textarea" className="block text-sm font-semibold mb-1">1. Nhập Content / Ý tưởng</label>
                            <textarea
                                id="idea-textarea"
                                className="w-full h-40 bg-white border border-slate-300 rounded-md p-3 text-base text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Ví dụ: Cuộc đại chiến tranh giành lãnh thổ giữa Kong và một con Gấu khổng lồ trong khu rừng rậm Amazon."
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>
                        <div>
                            <label htmlFor="duration-input" className="block text-sm font-semibold mb-1">2. Cài đặt thời lượng Video (tùy chọn)</label>
                            <ScriptWriterInput
                                id="duration-input"
                                placeholder="Ví dụ: 30 giây, 1 phút, 90s..."
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">3. Chọn AI Model</label>
                          <div className="flex space-x-2 rounded-lg bg-slate-200/80 p-1 border border-slate-300">
                            <ScriptWriterButton 
                              variant={apiProvider === 'google' ? 'active' : 'secondary'} 
                              onClick={() => setApiProvider('google')}
                              className="flex-1 text-xs sm:text-sm"
                              disabled={isGenerating}
                            >Google Gemini</ScriptWriterButton>
                            <ScriptWriterButton 
                              variant={apiProvider === 'openai' ? 'active' : 'secondary'} 
                              onClick={() => setApiProvider('openai')}
                              className="flex-1 text-xs sm:text-sm"
                              disabled={isGenerating}
                            >OpenAI GPT-4o</ScriptWriterButton>
                          </div>
                        </div>
                        <ScriptWriterButton
                            variant="primary"
                            className="w-full text-lg py-3"
                            onClick={handleGenerate}
                            disabled={isGenerating || !idea.trim()}
                        >
                            {isGenerating ? 
                                <span className="flex items-center justify-center">
                                    <Spinner /> Đang tạo...
                                </span> : '4. Tạo kịch bản & Prompt'
                            }
                        </ScriptWriterButton>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg p-4 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-slate-900">Kết quả</h3>
                            {results.length > 0 && 
                                <div className="flex items-center space-x-2">
                                    <ScriptWriterButton onClick={handleDownloadPrompts} variant="secondary" className="text-xs py-1">Tải JSON</ScriptWriterButton>
                                    <ScriptWriterButton onClick={handleDownloadScript} variant="secondary" className="text-xs py-1">Tải Kịch bản</ScriptWriterButton>
                                </div>
                            }
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {isGenerating && 
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ToolSpinner className="h-10 w-10 text-blue-500" />
                                    <p className="mt-2 text-blue-500">AI đang viết, vui lòng chờ...</p>
                                    <p className="text-xs text-slate-500 mt-1">Quá trình này có thể mất một lúc.</p>
                                </div>
                            }
                            {error && <ErrorDisplay message={error} />}
                            {!isGenerating && results.length === 0 && !error && 
                                <p className="text-center text-slate-500 pt-8">Kịch bản và prompt sẽ xuất hiện ở đây.</p>
                            }
                            {results.map((scene) => 
                                <div key={scene.scene} className="bg-lime-50/50 border border-slate-300 p-3 rounded-lg space-y-2">
                                    <h4 className="font-bold text-blue-600">{`Cảnh ${scene.scene}`}</h4>
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-800">Mô tả cảnh:</h5>
                                        <p className="text-sm text-slate-700 mt-1">{scene.description}</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <h5 className="text-sm font-semibold text-slate-800">Câu lệnh (Prompt):</h5>
                                            <button
                                                onClick={() => handleCopyPrompt(JSON.stringify(scene.prompt, null, 2), scene.scene)}
                                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1 px-2 text-[10px] rounded flex-shrink-0 aurora-sparkle-on-active"
                                                aria-label={`Copy prompt for scene ${scene.scene}`}
                                            >
                                                {copiedScene === scene.scene ? 'Đã chép!' : 'Chép'}
                                            </button>
                                        </div>
                                        <div className="bg-slate-800 rounded-md font-mono text-xs text-yellow-300 overflow-x-auto">
                                            <pre className="whitespace-pre-wrap break-words p-2">{JSON.stringify(scene.prompt, null, 2)}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END OF SCRIPT WRITER APP CODE (PROMPT JSON) ---


// --- START OF WHISK & FLOW APP CODE ---
const cinematicStyles = [
  "Mặc định", "Hiện đại", "Điện ảnh", "Viễn tưởng", "Tiền sử", "Hoạt hình", "Hài hước"
];

interface Scene {
    character: string;
    style: string;
    scene: string;
    characterSummary: string;
    whisk_prompt_vi: string;
    motion_prompt: string;
}

const WhiskFlowApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    const [videoIdea, setVideoIdea] = useState('');
    const [totalDuration, setTotalDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'seconds'>('minutes');
    const [selectedCinematicStyle, setSelectedCinematicStyle] = useState('Mặc định');
    const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateScriptForWhiskFlow = useCallback(async (
        videoIdea: string,
        numberOfScenes: number,
        cinematicStyle: string,
        apiKey: string
    ) => {
        const ai = new window.GoogleGenAI({ apiKey });
        const styleInstruction = cinematicStyle === "Mặc định" ? "" : `The overall cinematic style for this video should be: ${cinematicStyle}. Elaborate on this style in each scene's 'style' field.`;

        const whiskPromptDescription = cinematicStyle === "Hoạt hình"
            ? `Concise, cinematic, sufficiently detailed, and emotionally evocative VIETNAMESE prompt for static image generation on Whisk, in an ANIMATED style. Crucially, this prompt MUST describe the context (bối cảnh) clearly and in detail, consistent with the scene description. This is mandatory for every single prompt. Focus on the visual composition and mood. DO NOT describe faces, clothes, gender, or identity.`
            : `Concise, cinematic, sufficiently detailed, and emotionally evocative VIETNAMESE prompt for static image generation on Whisk. The prompt MUST explicitly request a PHOTOREALISTIC, truthful, and realistic image. Crucially, this prompt MUST describe the context (bối cảnh) clearly and in detail, consistent with the scene description. This is mandatory for every single prompt. Focus on the visual composition and mood. DO NOT describe faces, clothes, gender, or identity.`;
        
        const systemPrompt = `
You are an AI film scriptwriting tool that generates scene descriptions and prompts for image and video generation systems (Whisk and Flow VEO 3.1).
Your task is to take a video idea and a total duration, divide it into 8-second scenes, and for each scene, generate a structured output. Each scene description should immediately present a high-climax visual or a pivotal moment. The narrative should focus on impactful, visually striking events directly.

**CRITICAL RULES TO FOLLOW:**
1.  **Mandatory Context:** For EVERY scene without exception, the 'scene' description and the 'whisk_prompt_vi' MUST clearly and detailedly describe the context (bối cảnh). This rule is absolute.
2.  **Perfect Character Accuracy:** The 'characterSummary' field MUST be 100% accurate for every scene. Adhere strictly to the character counting rules. Inaccuracy is not acceptable.

Video Idea: "${videoIdea}"
This video will be divided into ${numberOfScenes} scenes, each 8 seconds long.
${styleInstruction}

Crucially, ensure the generated script maintains strong contextual consistency between the "Video Idea" and the selected "Cinematic style." For example, if the video idea involves a "forest man" and the cinematic style is "cinematic," do not include modern items like walkie-talkies or compasses in the scene descriptions or prompts. All elements (environment, objects, actions) must be thematically aligned with the core concept.

For each scene, generate the following structure as a JSON array. Ensure all fields are present and follow the specified guidelines:
`;
        const userPrompt = `Generate a JSON array with ${numberOfScenes} scene objects, following the video idea and scene-by-scene progression. The narrative should have a realistic cinematic tone, natural lighting, and an emotional, narrative rhythm.`

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    character: {
                      type: Type.STRING,
                      description: "Left empty, user will attach reference character in Whisk.",
                    },
                    style: {
                      type: Type.STRING,
                      description: "Cinematic style, lighting, tone, depth of field, visual texture, camera.",
                    },
                    scene: {
                      type: Type.STRING,
                      description: "Context, action, emotion, lighting, environment. NO specific character description. In Vietnamese.",
                    },
                    characterSummary: {
                      type: Type.STRING,
                      description: "Summarize the main characters in this scene, e.g., '1 Nam', '1 Nữ', '1 Thú', '1 Nam và 1 Nữ', '1 Nam và 1 Thú', 'Không có nhân vật chính'.",
                    },
                    whisk_prompt_vi: {
                      type: Type.STRING,
                      description: whiskPromptDescription,
                    },
                    motion_prompt: {
                      type: Type.STRING,
                      description: "English prompt for Flow VEO 3.1. Describes camera movement, dynamic lighting, emotional rhythm, moving objects or environment. No faces, clothes, gender, identity.",
                    },
                  },
                  required: ["character", "style", "scene", "characterSummary", "whisk_prompt_vi", "motion_prompt"],
            }
        };

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as Scene[];
        } catch (error) {
            console.error("Error generating script:", error);
            throw new Error("Failed to generate script. Please check the API Key and try again.");
        }
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        setLoading(true);
        setError(null);
        setGeneratedScenes([]);

        let actualDurationInSeconds = 0;
        const durationNum = parseFloat(totalDuration);

        if (isNaN(durationNum) || durationNum <= 0) {
            setError("Thời lượng video phải là một số dương.");
            setLoading(false);
            return;
        }

        actualDurationInSeconds = durationUnit === 'minutes' ? durationNum * 60 : durationNum;
        const numberOfScenes = Math.ceil(actualDurationInSeconds / 8);

        if (numberOfScenes === 0) {
            setError("Thời lượng quá ngắn để tạo cảnh.");
            setLoading(false);
            return;
        }

        try {
            const scenes = await generateScriptForWhiskFlow(videoIdea, numberOfScenes, selectedCinematicStyle, geminiApiKey);
            setGeneratedScenes(scenes);
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi tạo kịch bản. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [videoIdea, totalDuration, durationUnit, selectedCinematicStyle, geminiApiKey, onRequestApiKeyInput, generateScriptForWhiskFlow]);
    
    const handleDownloadPrompts = (prompts: string[], filename: string) => {
        const content = prompts.map((prompt, index) => `Cảnh ${index + 1}:\n${prompt}`).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-transparent text-slate-800 p-3 sm:p-6 rounded-lg border border-blue-500/30 shadow-2xl h-full">
            <div className="h-full flex flex-col md:flex-row md:gap-8 lg:gap-12">
                <div className="md:w-2/5 lg:w-1/3 flex-shrink-0 md:overflow-y-auto md:pr-4 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="bg-white/60 p-6 rounded-lg shadow-lg border border-slate-300">
                        <div className="mb-6">
                            <label htmlFor="videoIdea" className="block text-slate-800 text-sm font-bold mb-2">Ý tưởng video:</label>
                            <textarea
                                id="videoIdea"
                                className="shadow appearance-none border border-slate-300 rounded w-full py-3 px-4 bg-white text-slate-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
                                placeholder="Ví dụ: Một hành trình khám phá về công nghệ tương lai trên sao Hỏa..."
                                value={videoIdea} onChange={(e) => setVideoIdea(e.target.value)} required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="totalDuration" className="block text-slate-800 text-sm font-bold mb-2">Tổng thời lượng video:</label>
                            <div className="flex">
                                <input
                                    type="number" id="totalDuration"
                                    className="shadow appearance-none border border-slate-300 rounded-l w-full py-3 px-4 bg-white text-slate-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ví dụ: 30" min="1" step="any"
                                    value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} required
                                />
                                <select
                                    className="shadow border border-slate-300 rounded-r py-3 px-4 bg-white text-slate-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'seconds')}
                                >
                                    <option value="minutes">Phút</option>
                                    <option value="seconds">Giây</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-slate-800 text-sm font-bold mb-2">Phong cách điện ảnh:</label>
                            <div className="flex flex-wrap gap-2">
                                {cinematicStyles.map((style) => (
                                    <button
                                        key={style} type="button" onClick={() => setSelectedCinematicStyle(style)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 aurora-sparkle-on-active ${selectedCinematicStyle === style ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-lime-100`}
                                    >{style}</button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed aurora-sparkle-on-active"
                        >{loading ? 'Đang tạo...' : 'Tạo Kịch Bản'}</button>
                    </form>
                </div>
                <div className="flex-grow md:w-3/5 lg:w-2/3 overflow-y-auto custom-scrollbar md:pr-4">
                    {loading && <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div><p className="ml-3 text-slate-700">Đang tạo kịch bản...</p></div>}
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert"><strong className="font-bold">Lỗi! </strong><span className="block sm:inline ml-2">{error}</span></div>}
                    {generatedScenes.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Kịch bản đã tạo:</h2>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                                <button onClick={() => handleDownloadPrompts(generatedScenes.map(s => s.whisk_prompt_vi), 'whisk_prompts_vi.txt')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 aurora-sparkle-on-active">Tải Prompt Whisk (.txt)</button>
                                <button onClick={() => handleDownloadPrompts(generatedScenes.map(s => s.motion_prompt), 'flow_veo_prompts.txt')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 aurora-sparkle-on-active">Tải Prompt Flow (.txt)</button>
                            </div>
                            {generatedScenes.map((scene, index) => <WhiskFlowSceneCard key={index} scene={scene} sceneNumber={index + 1} />)}
                        </div>
                    )}
                    {!loading && !error && generatedScenes.length === 0 && <div className="flex items-center justify-center h-full"><p className="text-center text-slate-500">Kịch bản sẽ xuất hiện ở đây.</p></div>}
                </div>
            </div>
        </div>
    );
};

const WhiskFlowSceneCard: React.FC<{ scene: Scene, sceneNumber: number }> = ({ scene, sceneNumber }) => {
    const [copiedWhisk, setCopiedWhisk] = useState(false);
    const [copiedFlow, setCopiedFlow] = useState(false);
    const copyToClipboard = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };
    return (
        <div className="bg-slate-100 rounded-lg shadow-lg p-6 mb-6 border border-slate-300">
            <h3 className="text-xl font-bold text-blue-600 mb-2">{`Cảnh ${sceneNumber}`}</h3>
            {scene.characterSummary && <p className="text-sm text-slate-500 mb-4 italic"><span className="font-semibold">Nhân vật chính: </span>{scene.characterSummary}</p>}
            <div className="mt-4">
                <p className="font-bold text-lg text-slate-800 mb-2">Prompt cho Whisk (Ảnh tĩnh, Tiếng Việt):</p>
                <div className="relative bg-white p-3 rounded-md border border-slate-300">
                    <p className="text-slate-700 text-sm break-words pr-20">{scene.whisk_prompt_vi}</p>
                    <button onClick={() => copyToClipboard(scene.whisk_prompt_vi, setCopiedWhisk)} className="absolute top-2 right-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-100 aurora-sparkle-on-active">{copiedWhisk ? 'Đã sao chép!' : 'Sao chép'}</button>
                </div>
            </div>
            <div className="mt-6">
                <p className="font-bold text-lg text-slate-800 mb-2">Prompt cho Flow VEO 3.1 (Chuyển động):</p>
                <div className="relative bg-white p-3 rounded-md border border-slate-300">
                    <p className="text-slate-700 text-sm break-words pr-20">{scene.motion_prompt}</p>
                    <button onClick={() => copyToClipboard(scene.motion_prompt, setCopiedFlow)} className="absolute top-2 right-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-100 aurora-sparkle-on-active">{copiedFlow ? 'Đã sao chép!' : 'Sao chép'}</button>
                </div>
            </div>
        </div>
    );
};
// --- END OF WHISK & FLOW APP CODE ---

// --- START OF IMAGE GENERATOR APP ---
const ImageGeneratorApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    type Result = {
        id: string;
        prompt: string;
        status: 'pending' | 'generating' | 'done' | 'error';
        imageUrl?: string;
        error?: string;
    };
    type Log = {
        id: number;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        timestamp: string;
    };

    const [prompts, setPrompts] = useState('');
    const [results, setResults] = useState<Result[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [logs, setLogs] = useState<Log[]>([]);

    const addLog = useCallback((message: string, type: Log['type'] = 'info') => {
        const newLog: Log = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp: new Date().toLocaleTimeString(),
        };
        setLogs(prev => [newLog, ...prev.slice(0, 100)]);
    }, []);

    const parseAndEnhanceErrorMessage = (rawError: any): string => {
        let message = rawError instanceof Error ? rawError.message : String(rawError);
        try {
            const errorJson = JSON.parse(message);
            if (errorJson.error && errorJson.error.message) message = errorJson.error.message;
        } catch (e) { /* Not a JSON string */ }
        if (message.includes("API key not valid")) return "API Key không hợp lệ. Vui lòng kiểm tra lại key.";
        if (message.includes("accessible to billed users")) return "Tính năng này yêu cầu tài khoản Google AI đã bật thanh toán.";
        if (message.includes("quota")) return "Lỗi hạn ngạch (Quota Error). Bạn đã đạt đến giới hạn yêu cầu.";
        return message;
    };

    const generateImage = async (originalPrompt: string, taskId: string) => {
        setResults(prev => prev.map(res => res.id === taskId ? { ...res, status: 'generating' } : res));
        addLog(`[Task ${taskId}] Bắt đầu với prompt: "${originalPrompt}"`);

        try {
            const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: originalPrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: aspectRatio,
                    outputMimeType: 'image/png',
                }
            });

            const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
            if (!base64ImageBytes) throw new Error('Tạo ảnh thành công, nhưng không có dữ liệu ảnh trả về.');
            
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            setResults(prev => prev.map(res => res.id === taskId ? { ...res, status: 'done', imageUrl } : res));
            addLog(`[Task ${taskId}] Ảnh đã sẵn sàng!`, 'success');
        } catch (error) {
            const errorMessage = parseAndEnhanceErrorMessage(error);
            addLog(`[Task ${taskId}] Lỗi: ${errorMessage}`, 'error');
            setResults(prev => prev.map(res => res.id === taskId ? { ...res, status: 'error', error: errorMessage } : res));
        }
    };

    const handleGenerateClick = async () => {
        if (!geminiApiKey) {
            addLog('Thiếu API Key. Vui lòng nhập trong phần Cài đặt.', 'error');
            onRequestApiKeyInput();
            return;
        }
        const promptList = prompts.split('\n').filter(p => p.trim() !== '');
        if (promptList.length === 0) {
            addLog('Vui lòng nhập ít nhất một câu lệnh.', 'warning');
            return;
        }

        const tasks: Result[] = [];
        promptList.forEach((prompt, pIndex) => {
            for (let i = 0; i < numberOfImages; i++) {
                tasks.push({
                    id: `task-${pIndex}-${i}-${Date.now()}`,
                    prompt: prompt,
                    status: 'pending'
                });
            }
        });

        setIsGenerating(true);
        addLog(`Bắt đầu tạo ${tasks.length} ảnh...`);
        setResults(tasks);

        for (const task of tasks) {
            await generateImage(task.prompt, task.id);
        }

        setIsGenerating(false);
        addLog('Tất cả các tác vụ đã hoàn thành.', 'info');
    };

    const promptCount = prompts.split('\n').filter(p => p.trim() !== '').length;
    const totalImages = promptCount * numberOfImages;

    const getLogColor = (type: Log['type']) => {
        switch (type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="bg-transparent text-slate-800 p-3 sm:p-6 rounded-lg border border-blue-500/30 shadow-2xl h-full flex flex-col gap-6">
            <div className="flex-grow overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    <div className="lg:w-2/5 xl:w-1/3 flex-shrink-0 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Cấu hình</h3>
                            <div className="bg-white/60 p-4 rounded-lg border border-slate-300 space-y-4">
                                <AspectRatioSelector aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} isGenerating={isGenerating} />
                                <ImageCountSelector numberOfImages={numberOfImages} setNumberOfImages={setNumberOfImages} isGenerating={isGenerating} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Nhập câu lệnh (Prompt)</h3>
                            <div className="bg-white/60 p-4 rounded-lg border border-slate-300">
                                <label htmlFor="prompt-textarea-image" className="block text-sm font-semibold mb-1">
                                    Prompts (mỗi dòng một câu lệnh)
                                </label>
                                <textarea
                                    id="prompt-textarea-image"
                                    className="w-full h-32 bg-white text-slate-900 border border-slate-300 rounded-md p-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder={`Một bức ảnh chân thực về một con mèo đội mũ phù thủy\nMột phong cảnh rộng lớn, tuyệt đẹp của một hành tinh xa lạ...`}
                                    value={prompts}
                                    onChange={(e) => setPrompts(e.target.value)}
                                    disabled={isGenerating}
                                />
                                <ImageGeneratorButton
                                    variant="primary"
                                    className="w-full mt-4 text-lg py-3"
                                    onClick={handleGenerateClick}
                                    disabled={isGenerating || !prompts.trim()}
                                >
                                    {isGenerating ? 'Đang tạo...' : `Tạo ${totalImages > 0 ? totalImages : ''} ảnh`}
                                </ImageGeneratorButton>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-3/5 xl:w-2/3 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">3. Kết quả</h3>
                        <ResultsPanel results={results} />
                    </div>
                </div>
            </div>
            {logs.length > 0 && (
                <div className="flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Nhật ký (Logs)</h3>
                    <div className="bg-white/60 border border-slate-300 rounded-lg p-3 max-h-60 overflow-y-auto font-mono text-xs custom-scrollbar">
                        {logs.map(log => (
                            <p key={log.id} className="flex">
                                <span className="text-slate-500 mr-2 flex-shrink-0">{log.timestamp}</span>
                                <span className={`${getLogColor(log.type)} break-all`}>{log.message}</span>
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components for ImageGeneratorApp ---
const ImageGeneratorButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'active' }> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyles = 'px-4 py-2 rounded-md font-bold text-sm transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lime-200 disabled:opacity-50 disabled:cursor-not-allowed aurora-sparkle-on-active';
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        active: 'bg-blue-600 text-white ring-2 ring-blue-400',
    };
    const buttonStyle = variantStyles[variant] || variantStyles.primary;
    return <button className={`${baseStyles} ${buttonStyle} ${className}`} {...props}>{children}</button>;
};

const ImageGeneratorSpinner: React.FC = () => (
    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ImageGeneratorErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-2 text-center">
        <p className="text-red-700 text-sm font-semibold">Lỗi</p>
        <p className="text-xs text-red-600 mt-1">{message}</p>
    </div>
);

const AspectRatioSelector: React.FC<{ aspectRatio: string, setAspectRatio: (ar: '1:1' | '16:9' | '9:16') => void, isGenerating: boolean }> = ({ aspectRatio, setAspectRatio, isGenerating }) => {
    const AspectRatioButton = ({ value, label }: { value: '1:1' | '16:9' | '9:16', label: string }) => (
        <ImageGeneratorButton
            variant={aspectRatio === value ? 'active' : 'secondary'}
            onClick={() => setAspectRatio(value)}
            className="flex-1"
            disabled={isGenerating}
        >{label}</ImageGeneratorButton>
    );
    return (
        <div>
            <label className="block text-sm font-semibold mb-2">Tỷ lệ ảnh (Aspect Ratio)</label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <AspectRatioButton value="16:9" label="Ngang (16:9)" />
                <AspectRatioButton value="9:16" label="Dọc (9:16)" />
                <AspectRatioButton value="1:1" label="Vuông (1:1)" />
            </div>
        </div>
    );
};

const ImageCountSelector: React.FC<{ numberOfImages: number, setNumberOfImages: (n: number) => void, isGenerating: boolean }> = ({ numberOfImages, setNumberOfImages, isGenerating }) => {
    return (
        <div>
            <label className="block text-sm font-semibold mb-2">Số lượng ảnh mỗi prompt</label>
            <div className="flex space-x-2">
                {[1, 2, 3, 4].map(num => (
                    <ImageGeneratorButton
                        key={num}
                        variant={numberOfImages === num ? 'active' : 'secondary'}
                        onClick={() => setNumberOfImages(num)}
                        disabled={isGenerating}
                        className="flex-1"
                    >{num}</ImageGeneratorButton>
                ))}
            </div>
        </div>
    );
};

const ResultsPanel: React.FC<{ results: any[] }> = ({ results }) => (
    <div className="bg-white/60 border border-slate-300 rounded-lg p-4 flex-grow overflow-y-auto custom-scrollbar">
        {results.length === 0 ? (
            <p className="text-center text-slate-500 pt-8">Ảnh được tạo sẽ xuất hiện ở đây.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map(res => (
                    <div key={res.id} className="bg-slate-100 rounded-lg shadow-lg overflow-hidden flex flex-col">
                        <div className="w-full aspect-square bg-slate-200 flex items-center justify-center">
                            {(res.status === 'generating' || res.status === 'pending') && <ImageGeneratorSpinner />}
                            {res.status === 'error' && <ImageGeneratorErrorDisplay message={res.error || 'Đã xảy ra lỗi không xác định.'} />}
                            {res.status === 'done' && res.imageUrl &&
                                <img src={res.imageUrl} alt={res.prompt} className="w-full h-full object-cover" />
                            }
                        </div>
                        <div className="p-3 flex-grow flex flex-col">
                            <p className="text-xs text-slate-600 flex-grow" title={res.prompt}>{res.prompt}</p>
                            {res.status === 'done' && res.imageUrl && (
                                <a
                                    href={res.imageUrl}
                                    download={`gemini_image_${res.prompt.slice(0, 20).replace(/[\s/\\?%*:|"<>]/g, '_')}_${res.id}.png`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ImageGeneratorButton variant="secondary" className="w-full mt-2 text-xs py-1">Tải xuống</ImageGeneratorButton>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);
// --- END OF IMAGE GENERATOR APP ---


// --- START OF THUMBNAIL GENERATOR APP ---
const ThumbnailGeneratorApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    type Platform = 'youtube' | 'tiktok' | 'facebook';
    type GenerationMode = 'precise' | 'creative';
    type Result = {
        id: string;
        status: 'pending' | 'generating' | 'done' | 'error';
        imageUrl?: string;
        error?: string;
        prompt: string;
    };

    const [platform, setPlatform] = useState<Platform>('youtube');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [numberOfThumbnails, setNumberOfThumbnails] = useState(1);
    const [generationMode, setGenerationMode] = useState<GenerationMode>('creative');
    const [showText, setShowText] = useState(true);
    const [textContent, setTextContent] = useState('');
    const [creativeSuggestion, setCreativeSuggestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<Result[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleImageUpload = (files: FileList | null) => {
        const file = files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const parseAndEnhanceErrorMessage = (rawError: any): string => {
        let message = rawError instanceof Error ? rawError.message : String(rawError);
        if (message.includes("API key not valid")) return "API Key không hợp lệ. Vui lòng kiểm tra lại key.";
        if (message.includes("quota") || message.includes("resource_exhausted")) return "Lỗi Hạn ngạch (Quota). Đảm bảo tài khoản Google AI của bạn đã bật thanh toán. Chi tiết: ai.google.dev/gemini-api/docs/billing";
        if (message.includes("Invalid value at 'parts[1].inline_data.data'")) return "Lỗi dữ liệu ảnh. Vui lòng thử một ảnh khác hoặc giảm độ phân giải.";
        return message;
    };
    
    const generateThumbnail = async (taskId: string, prompt: string, base64ImageData: string | null, mimeType: string | null) => {
        setResults(prev => prev.map(res => res.id === taskId ? { ...res, status: 'generating' } : res));
        
        try {
            const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
            
            const contentParts = [];
            if (base64ImageData && mimeType) {
                contentParts.push({ inlineData: { mimeType, data: base64ImageData } });
            }
            contentParts.push({ text: prompt });

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: contentParts },
              config: { responseModalities: [window.GenAIModality.IMAGE] },
            });

            const firstPart = response.candidates?.[0]?.content?.parts?.[0];
            if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
                const imageUrl = `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
                setResults(prev => prev.map(res => res.id === taskId ? { ...res, status: 'done', imageUrl } : res));
            } else {
                throw new Error('Không nhận được dữ liệu ảnh hợp lệ từ API.');
            }
        } catch (error) {
            const errorMessage = parseAndEnhanceErrorMessage(error);
            setResults(prev => prev.map(res => res.id === taskId ? { ...res, status: 'error', error: errorMessage } : res));
        }
    };
    
    const handleGenerateClick = async () => {
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        if (!textContent.trim()) {
            setError('Vui lòng nhập nội dung chữ cho thumbnail.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        setIsGenerating(true);
        setError(null);

        const platformDetails = {
            youtube: { name: 'YouTube', ratio: '16:9 (landscape)' },
            tiktok: { name: 'TikTok', ratio: '9:16 (portrait)' },
            facebook: { name: 'Facebook', ratio: '1:1 (square)' },
        };
        const details = platformDetails[platform];
        
        const base64Data = imageFile ? await blobToBase64(imageFile) : null;
        
        let prompt;
        if (base64Data) {
            // Image editing prompt
            prompt = `
            Using the provided base image, create ${numberOfThumbnails} thumbnail variations for a ${details.name} post.
            Modifications Requested:
            1. Text Integration: ${showText ? `Add the text "${textContent}" to the image. It must be prominent, bold, and easy to read against the background. Place it strategically for maximum impact.` : "Do not add any text."}
            2. Style & Enhancements: Apply a ${generationMode} style. ${creativeSuggestion}. You can enhance colors, add graphical elements, or change the mood, but the main subject of the original image should remain recognizable.
            3. Final Output: The final image must be a professional-looking thumbnail with a ${details.ratio} aspect ratio. You may need to crop or extend the original image to fit this ratio.
            `;
        } else {
            // Text-to-image prompt
            prompt = `
            Create ${numberOfThumbnails} thumbnail variations for a ${details.name} post.
            Core Subject/Idea: A thumbnail about "${textContent}".
            Creative Style: ${generationMode}. ${creativeSuggestion}
            CRITICAL REQUIREMENTS:
            1. Aspect Ratio: The final image must be ${details.ratio}.
            2. Text Integration: ${showText ? `The thumbnail MUST prominently feature the text: "${textContent}". Use a bold, highly readable font. The text should be the main focal point.` : "The thumbnail should NOT contain any text."}
            3. Visuals: Create a compelling, high-quality image that visually represents the core subject. It should be vibrant and eye-catching.
            `;
        }

        const tasks: Result[] = Array.from({ length: numberOfThumbnails }, (_, i) => ({
            id: `task-${i}-${Date.now()}`,
            status: 'pending',
            prompt: `Variation ${i+1} of: ${textContent}`
        }));
        setResults(tasks);

        for (const task of tasks) {
            await generateThumbnail(task.id, prompt, base64Data, imageFile?.type || null);
        }

        setIsGenerating(false);
    };

    const ThumbnailButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'active' }> = ({ children, className = '', variant = 'primary', ...props }) => {
        const baseStyles = 'px-4 py-2 rounded-md font-bold text-sm transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lime-200 disabled:opacity-50 disabled:cursor-not-allowed aurora-sparkle-on-active';
        const variantStyles = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500',
            active: 'bg-blue-600 text-white ring-2 ring-blue-400',
        };
        return <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>{children}</button>;
    };

    const ThumbnailSpinner: React.FC = () => (
      <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    return (
        <div className="bg-transparent text-slate-800 p-3 sm:p-6 rounded-lg border border-blue-500/30 shadow-2xl h-full flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* --- CONTROLS --- */}
                    <div className="bg-white/60 p-4 rounded-lg border border-slate-300 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">1. Tùy chỉnh</h3>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Nền tảng</label>
                            <div className="flex space-x-2">
                                {(['youtube', 'tiktok', 'facebook'] as Platform[]).map(p => (
                                    <ThumbnailButton key={p} variant={platform === p ? 'active' : 'secondary'} onClick={() => setPlatform(p)} disabled={isGenerating} className="capitalize">{p}</ThumbnailButton>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Tải ảnh lên (Tùy chọn)</label>
                            <div onClick={() => fileInputRef.current?.click()} className="w-full min-h-[120px] bg-slate-100 rounded-md border-2 border-dashed border-slate-400 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-2 relative overflow-hidden">
                                <input ref={fileInputRef} type="file" hidden multiple={false} accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} disabled={isGenerating} />
                                {uploadedImage ? (
                                    <>
                                        <img src={uploadedImage} alt="Uploaded preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 aurora-sparkle-on-active">&times;</button>
                                    </>
                                ) : (
                                    <p className="text-slate-500 text-sm">Click hoặc kéo thả ảnh</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Số lượng ảnh</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4].map(num => (
                                    <ThumbnailButton key={num} variant={numberOfThumbnails === num ? 'active' : 'secondary'} onClick={() => setNumberOfThumbnails(num)} disabled={isGenerating} className="flex-1">{num}</ThumbnailButton>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/60 p-4 rounded-lg border border-slate-300 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">2. Nhập nội dung</h3>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Chế độ tạo</label>
                            <div className="flex space-x-2">
                                {(['precise', 'creative'] as GenerationMode[]).map(m => (
                                    <ThumbnailButton key={m} variant={generationMode === m ? 'active' : 'secondary'} onClick={() => setGenerationMode(m)} disabled={isGenerating} className="capitalize">{m === 'precise' ? 'Chính xác' : 'Sáng tạo'}</ThumbnailButton>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Chữ trên Thumbnail</label>
                            <button onClick={() => setShowText(!showText)} disabled={isGenerating} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors aurora-sparkle-on-active ${showText ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showText ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div>
                            <label htmlFor="text-prompts" className="block text-sm font-semibold mb-1">Nội dung chữ</label>
                            <textarea id="text-prompts" value={textContent} onChange={e => setTextContent(e.target.value)} disabled={isGenerating || !showText} className="w-full h-24 bg-white text-slate-900 border border-slate-300 rounded-md p-2 font-mono text-sm disabled:opacity-50" placeholder="Ví dụ: BÍ MẬT GIẢM CÂN..." />
                        </div>
                        <div>
                            <label htmlFor="creative-suggestion" className="block text-sm font-semibold mb-1">Ý tưởng sáng tạo (Tùy chọn)</label>
                            <textarea id="creative-suggestion" value={creativeSuggestion} onChange={e => setCreativeSuggestion(e.target.value)} disabled={isGenerating} className="w-full h-20 bg-white text-slate-900 border border-slate-300 rounded-md p-2 font-mono text-sm" placeholder="tông màu vàng, bên trái..." />
                        </div>
                        <ThumbnailButton variant="primary" onClick={handleGenerateClick} disabled={isGenerating || !textContent.trim()} className="w-full mt-2 text-lg py-3">{isGenerating ? 'Đang tạo...' : 'Tạo Thumbnail'}</ThumbnailButton>
                        {error && <p className="text-red-600 text-xs text-center mt-2">{error}</p>}
                    </div>
                </div>
                <div className="lg:col-span-3 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Kết quả</h3>
                    <div className="bg-white/60 border border-slate-300 rounded-lg p-4 flex-grow overflow-y-auto custom-scrollbar">
                        {results.length === 0 ? (
                            <p className="text-center text-slate-500 pt-8">Thumbnail sẽ hiện ở đây.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map(res => (
                                    <div key={res.id} className="bg-slate-100 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                        <div className={`w-full bg-slate-200 flex items-center justify-center ${platform === 'youtube' ? 'aspect-video' : platform === 'tiktok' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                                            {(res.status === 'generating' || res.status === 'pending') && <ThumbnailSpinner />}
                                            {res.status === 'error' && <ImageGeneratorErrorDisplay message={res.error || 'Lỗi không xác định'} />}
                                            {res.status === 'done' && res.imageUrl && <img src={res.imageUrl} alt={res.prompt} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="p-3 flex-grow flex flex-col">
                                            <p className="text-xs text-slate-600 flex-grow" title={res.prompt}>{res.prompt}</p>
                                            {res.status === 'done' && res.imageUrl && (
                                                <a href={res.imageUrl} download={`thumbnail_${res.id}.png`} target="_blank" rel="noopener noreferrer">
                                                    <ThumbnailButton variant="secondary" className="w-full mt-2 text-xs py-1">Tải xuống</ThumbnailButton>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END OF THUMBNAIL GENERATOR APP ---


// --- START OF VIDEO GENERATOR APP ---
const VideoGeneratorApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    type GenerationMode = 'text-to-video' | 'image-to-video';
    type Result = {
        id: string;
        prompt: string;
        status: 'pending' | 'generating' | 'polling' | 'done' | 'error';
        videoUrl?: string;
        error?: string;
        statusMessage?: string;
    };

    const [generationMode, setGenerationMode] = useState<GenerationMode>('text-to-video');
    const [prompts, setPrompts] = useState('');
    const [results, setResults] = useState<Result[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [numberOfVideos, setNumberOfVideos] = useState(1);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const txtInputRef = useRef<HTMLInputElement>(null);

    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [checkingApiKey, setCheckingApiKey] = useState(true);
    
    const checkApiKey = useCallback(async () => {
        if (!window.aistudio) return;
        setCheckingApiKey(true);
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } catch (e) {
            console.error("Error checking for API key:", e);
            setApiKeySelected(false);
        } finally {
            setCheckingApiKey(false);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        if (!window.aistudio) return;
        try {
            await window.aistudio.openSelectKey();
            // Assume success after dialog opens to handle race conditions
            setApiKeySelected(true); 
        } catch (e) {
            console.error("Error opening select key dialog:", e);
        }
    };
    
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => reader.result ? resolve((reader.result as string).split(',')[1]) : reject(new Error('Failed to convert blob'));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleImageUpload = (files: FileList | null) => {
        const file = files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleTxtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                if (typeof content === 'string') {
                    setPrompts(content);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExcelInfoClick = () => {
        alert("Để tải lên từ Excel, vui lòng sao chép cột chứa các câu lệnh (prompt) và dán vào file .txt, sau đó sử dụng chức năng 'Tải file TXT'.");
    };

    const generateVideo = async (originalPrompt: string, taskId: string, base64ImageData: string | null, mimeType: string | null) => {
        const updateStatus = (status: Result['status'], message: string, data: Partial<Result> = {}) => {
            setResults(prev => prev.map(res => res.id === taskId ? { ...res, status, statusMessage: message, ...data } : res));
        };

        try {
            updateStatus('generating', 'Đang khởi tạo...');
            // Create a new instance right before the call to ensure the latest API key is used
            const ai = new window.GoogleGenAI({ apiKey: (window as any).process.env.API_KEY });

            const payload: any = {
                model: 'veo-3.1-fast-generate-preview',
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                }
            };

            if (generationMode === 'text-to-video') {
                payload.prompt = originalPrompt;
            } else if (generationMode === 'image-to-video' && base64ImageData && mimeType) {
                payload.prompt = originalPrompt; // Prompt is optional but can be used
                payload.image = { imageBytes: base64ImageData, mimeType };
            }

            let operation = await ai.models.generateVideos(payload);
            updateStatus('polling', 'Đang tạo video (có thể mất vài phút)...');

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await ai.operations.getVideosOperation({ operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) throw new Error("Không tìm thấy link tải video trong phản hồi.");
            
            updateStatus('polling', 'Đang tải video đã tạo...');
            const videoResponse = await fetch(`${downloadLink}&key=${(window as any).process.env.API_KEY}`);
            if (!videoResponse.ok) throw new Error(`Lỗi tải video: ${videoResponse.statusText}`);

            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            
            updateStatus('done', 'Hoàn thành!', { videoUrl });

        } catch (error: any) {
            let errorMessage = error.message || 'Đã xảy ra lỗi không xác định.';
            console.error("Video generation error:", error);
            
            if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("exceeded your current quota")) {
                errorMessage = "Bạn đã vượt quá hạn ngạch API. Vui lòng kiểm tra gói cước, thanh toán của bạn, hoặc thử lại sau. Xem chi tiết tại: https://ai.google.dev/gemini-api/docs/rate-limits";
            } else if (errorMessage.includes("Requested entity was not found.")) {
                errorMessage = "API Key không hợp lệ hoặc không có quyền truy cập. Vui lòng chọn lại key.";
                setApiKeySelected(false); // Reset key selection state
            }
            updateStatus('error', 'Lỗi!', { error: errorMessage });
        }
    };

    const handleGenerateClick = async () => {
        const promptList = prompts.split('\n').filter(p => p.trim() !== '');
        
        if (generationMode === 'text-to-video' && promptList.length === 0) {
            alert('Vui lòng nhập ít nhất một câu lệnh.');
            return;
        }
        if (generationMode === 'image-to-video' && !imageFile) {
            alert('Vui lòng tải lên một ảnh.');
            return;
        }

        setIsGenerating(true);
        const base64Data = imageFile ? await blobToBase64(imageFile) : null;
        
        const effectivePrompts = generationMode === 'image-to-video' 
            ? (promptList.length > 0 ? promptList : ['']) // Use empty prompt if none provided for image-to-video
            : promptList;

        const tasks: Result[] = [];
        effectivePrompts.forEach((prompt, pIndex) => {
            for (let i = 0; i < numberOfVideos; i++) {
                tasks.push({
                    id: `task-${pIndex}-${i}-${Date.now()}`,
                    prompt: prompt,
                    status: 'pending',
                    statusMessage: 'Đang chờ...'
                });
            }
        });
        
        setResults(tasks);

        for (const task of tasks) {
            await generateVideo(task.prompt, task.id, base64Data, imageFile?.type || null);
        }

        setIsGenerating(false);
    };

    const VideoGeneratorButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'active' }> = ({ children, ...props }) => <ImageGeneratorButton {...props}>{children}</ImageGeneratorButton>;
    const VideoGeneratorSpinner: React.FC = () => <ImageGeneratorSpinner />;

    if (checkingApiKey) {
        return <div className="flex items-center justify-center h-full"><VideoGeneratorSpinner /></div>;
    }
    
    if (!apiKeySelected) {
        return (
            <div className="bg-transparent text-slate-800 p-6 rounded-lg border border-blue-500/30 h-full flex items-center justify-center">
                <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-blue-500/30">
                     <IconKey className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Yêu cầu chọn API Key</h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                        Tính năng tạo video Veo yêu cầu một API key hợp lệ đã được kích hoạt thanh toán.
                        Vui lòng chọn API key của bạn để tiếp tục.
                    </p>
                    <VideoGeneratorButton variant="primary" onClick={handleSelectKey} className="text-lg py-3 px-6 aurora-sparkle-on-active">
                        Chọn API Key
                    </VideoGeneratorButton>
                    <p className="text-xs text-slate-500 mt-4">
                        Bằng cách tiếp tục, bạn đồng ý với các điều khoản thanh toán. 
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                            Xem chi tiết thanh toán
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    const totalVideos = (generationMode === 'text-to-video' ? prompts.split('\n').filter(p => p.trim() !== '').length : 1) * numberOfVideos;

    return (
        <div className="bg-transparent text-slate-800 p-3 sm:p-6 rounded-lg border border-blue-500/30 shadow-2xl h-full flex flex-col gap-6">
            <div className="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 border-b border-slate-300 pb-4">
                <VideoGeneratorButton variant={generationMode === 'text-to-video' ? 'active' : 'secondary'} onClick={() => setGenerationMode('text-to-video')} className="flex-1 text-xs sm:text-sm">Văn bản sang Video</VideoGeneratorButton>
                <VideoGeneratorButton variant={generationMode === 'image-to-video' ? 'active' : 'secondary'} onClick={() => setGenerationMode('image-to-video')} className="flex-1 text-xs sm:text-sm">Ảnh sang Video</VideoGeneratorButton>
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    <div className="lg:w-2/5 xl:w-1/3 flex-shrink-0 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Cấu hình</h3>
                            <div className="bg-white/60 p-4 rounded-lg border border-slate-300 space-y-4">
                                {generationMode === 'image-to-video' && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Tải ảnh lên</label>
                                        <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-slate-100 rounded-md border-2 border-dashed border-slate-400 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-2 relative overflow-hidden">
                                            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} disabled={isGenerating} />
                                            {uploadedImage ? <img src={uploadedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" /> : <p className="text-slate-500 text-sm">Click để tải ảnh</p>}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Tỷ lệ video (Aspect Ratio)</label>
                                    <div className="flex space-x-2">
                                        <VideoGeneratorButton variant={aspectRatio === '16:9' ? 'active' : 'secondary'} onClick={() => setAspectRatio('16:9')} disabled={isGenerating} className="flex-1">Ngang (16:9)</VideoGeneratorButton>
                                        <VideoGeneratorButton variant={aspectRatio === '9:16' ? 'active' : 'secondary'} onClick={() => setAspectRatio('9:16')} disabled={isGenerating} className="flex-1">Dọc (9:16)</VideoGeneratorButton>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Số lượng video mỗi prompt</label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4].map(num => (
                                            <VideoGeneratorButton key={num} variant={numberOfVideos === num ? 'active' : 'secondary'} onClick={() => setNumberOfVideos(num)} disabled={isGenerating} className="flex-1">{num}</VideoGeneratorButton>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Nhập câu lệnh (Prompt)</h3>
                            <div className="bg-white/60 p-4 rounded-lg border border-slate-300">
                                <div className="flex justify-between items-center mb-1">
                                     <label htmlFor="prompt-textarea-video" className="block text-sm font-semibold">
                                        {generationMode === 'image-to-video' ? 'Prompt (tùy chọn)' : 'Prompt (mỗi dòng một câu lệnh)'}
                                    </label>
                                    <div className="flex space-x-2">
                                        <input type="file" ref={txtInputRef} hidden accept=".txt" onChange={handleTxtUpload} disabled={isGenerating}/>
                                        <VideoGeneratorButton variant="secondary" onClick={() => txtInputRef.current?.click()} className="text-xs px-2 py-1" disabled={isGenerating}>Tải file TXT</VideoGeneratorButton>
                                        <VideoGeneratorButton variant="secondary" onClick={handleExcelInfoClick} className="text-xs px-2 py-1" disabled={isGenerating}>Tải file Excel</VideoGeneratorButton>
                                    </div>
                                </div>
                                <textarea id="prompt-textarea-video" className="w-full h-32 bg-white text-slate-900 border border-slate-300 rounded-md p-2 font-mono text-sm" placeholder="Một cảnh quay điện ảnh của một chiếc ô tô lái qua thành phố đèn neon vào ban đêm..." value={prompts} onChange={(e) => setPrompts(e.target.value)} disabled={isGenerating} />
                                <VideoGeneratorButton variant="primary" onClick={handleGenerateClick} disabled={isGenerating || (generationMode === 'text-to-video' && !prompts.trim()) || (generationMode === 'image-to-video' && !imageFile)} className="w-full mt-4 text-lg py-3">
                                    {isGenerating ? 'Đang tạo...' : `Tạo ${totalVideos > 0 ? totalVideos : ''} Video`}
                                </VideoGeneratorButton>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-3/5 xl:w-2/3 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">3. Kết quả</h3>
                        <div className="bg-white/60 border border-slate-300 rounded-lg p-4 flex-grow overflow-y-auto custom-scrollbar">
                            {results.length === 0 ? (
                                <p className="text-center text-slate-500 pt-8">Video được tạo sẽ hiển thị ở đây.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.map(res => (
                                        <div key={res.id} className="bg-slate-100 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                            <div className={`w-full bg-slate-200 flex items-center justify-center ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                                {res.status !== 'done' && res.status !== 'error' && <div className="text-center p-4"><VideoGeneratorSpinner /><p className="text-sm text-blue-500 mt-2">{res.statusMessage}</p></div>}
                                                {res.status === 'error' && <ImageGeneratorErrorDisplay message={res.error || 'Lỗi không xác định'} />}
                                                {res.status === 'done' && res.videoUrl && <video src={res.videoUrl} controls autoPlay loop className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="p-3 flex-grow flex flex-col">
                                                <p className="text-xs text-slate-600 flex-grow" title={res.prompt}>{res.prompt || 'Video từ ảnh'}</p>
                                                {res.status === 'done' && res.videoUrl && (
                                                    <a href={res.videoUrl} download={`gemini_video_${res.id}.mp4`}><VideoGeneratorButton variant="secondary" className="w-full mt-2 text-xs py-1">Tải xuống</VideoGeneratorButton></a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END OF VIDEO GENERATOR APP ---


// --- START OF SEO OPTIMIZER APP ---
const SeoOptimizerApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    type Language = 'vietnamese' | 'english';
    type Results = {
        titles: string[];
        description: string;
        hashtags: string[];
        keywords: string[];
    };

    const [topic, setTopic] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [language, setLanguage] = useState<Language>('vietnamese');
    const [results, setResults] = useState<Results | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleGenerate = async () => {
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        if (!topic.trim()) {
            setError('Vui lòng nhập chủ đề hoặc từ khóa chính cho video.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResults(null);

        const systemInstruction = `You are an AI assistant specialized in YouTube SEO. Your task is to generate highly optimized content for a YouTube video based on the user's topic. You must provide a variety of engaging titles, a structured description, and relevant hashtags and keywords.`;
        
        const userPrompt = `
        Video Topic/Primary Keyword: "${topic}"
        Video URL (for context, optional): "${videoUrl || 'Not provided'}"
        Language for output: ${language}

        Please generate the following SEO content:
        1.  **Titles**: 5 creative, click-worthy, and SEO-friendly titles.
        2.  **Description**: A well-structured video description. Include a hook at the beginning, a summary of the video content, and a call to action at the end. Use paragraphs and bullet points for readability.
        3.  **Hashtags**: 15 relevant hashtags, including a mix of broad and niche tags.
        4.  **Keywords**: A list of 20 SEO keywords that are highly relevant to the video topic.
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                titles: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "An array of 5 SEO-optimized video titles."
                },
                description: { 
                    type: Type.STRING,
                    description: "A well-structured video description with a hook, summary, and call to action."
                },
                hashtags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "An array of 15 relevant hashtags, each starting with '#'."
                },
                keywords: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "An array of 20 relevant SEO keywords."
                },
            },
            required: ["titles", "description", "hashtags", "keywords"],
        };

        try {
            const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                },
            });
            const jsonText = response.text.trim();
            setResults(JSON.parse(jsonText));
        } catch (e: any) {
            console.error(e);
            setError(`Không thể tạo nội dung. Lỗi: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const ResultSection: React.FC<{ title: string; fieldName: string; children: React.ReactNode; onCopy: () => void }> = ({ title, fieldName, children, onCopy }) => (
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold text-blue-600">{title}</h4>
                <ToolButton variant="secondary" onClick={onCopy} className="text-xs py-1 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300">
                    {copiedField === fieldName ? 'Đã chép!' : 'Chép'}
                </ToolButton>
            </div>
            {children}
        </div>
    );

    return (
        <div className="bg-transparent text-slate-800 p-3 sm:p-6 rounded-lg border border-blue-500/30 shadow-2xl h-full flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
                {/* --- CONTROLS --- */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white/60 p-4 rounded-lg border border-slate-300 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">1. Nhập thông tin</h3>
                        <div>
                            <label htmlFor="video-url" className="block text-sm font-semibold mb-1">Link Video Youtube (Tùy chọn)</label>
                            <input id="video-url" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} disabled={isGenerating} className="w-full bg-white text-slate-900 border border-slate-300 rounded-md p-2 text-sm" placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                        <div>
                            <label htmlFor="video-topic" className="block text-sm font-semibold mb-1">Chủ đề / Từ khóa chính</label>
                            <textarea id="video-topic" value={topic} onChange={e => setTopic(e.target.value)} disabled={isGenerating} rows={4} className="w-full bg-white text-slate-900 border border-slate-300 rounded-md p-2 text-sm" placeholder="Ví dụ: Hướng dẫn làm video AI từ A-Z cho người mới bắt đầu" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Ngôn ngữ</label>
                            <div className="flex space-x-2">
                                <ToolButton variant={language === 'vietnamese' ? 'active' : 'secondary'} onClick={() => setLanguage('vietnamese')} disabled={isGenerating} className="bg-slate-200 text-slate-700 hover:bg-slate-300">Tiếng Việt</ToolButton>
                                <ToolButton variant={language === 'english' ? 'active' : 'secondary'} onClick={() => setLanguage('english')} disabled={isGenerating} className="bg-slate-200 text-slate-700 hover:bg-slate-300">Tiếng Anh</ToolButton>
                            </div>
                        </div>
                    </div>
                    <ToolButton variant="primary" onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="w-full text-lg py-3">
                        {isGenerating ? 'Đang tạo...' : 'Tạo Nội Dung SEO'}
                    </ToolButton>
                </div>

                {/* --- RESULTS --- */}
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex-shrink-0">Kết quả</h3>
                    <div className="bg-white/60 border border-slate-300 rounded-lg p-4 flex-grow overflow-y-auto custom-scrollbar space-y-4">
                        {isGenerating && <div className="flex justify-center items-center h-full"><ToolSpinner className="h-10 w-10 text-blue-500" /></div>}
                        {error && <ToolErrorDisplay message={error} />}
                        {!isGenerating && !results && !error && <p className="text-center text-slate-500 pt-8">Nội dung SEO sẽ hiện ở đây.</p>}
                        {results && (
                            <>
                                <ResultSection title="Tiêu đề đề xuất" fieldName="titles" onCopy={() => handleCopy(results.titles.join('\n'), 'titles')}>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                                        {results.titles.map((title, i) => <li key={i}>{title}</li>)}
                                    </ul>
                                </ResultSection>
                                <ResultSection title="Mô tả Video" fieldName="description" onCopy={() => handleCopy(results.description, 'description')}>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{results.description}</p>
                                </ResultSection>
                                <ResultSection title="Hashtags" fieldName="hashtags" onCopy={() => handleCopy(results.hashtags.join(' '), 'hashtags')}>
                                    <p className="text-sm text-blue-600">{results.hashtags.join(' ')}</p>
                                </ResultSection>
                                <ResultSection title="Từ khoá SEO" fieldName="keywords" onCopy={() => handleCopy(results.keywords.join(', '), 'keywords')}>
                                     <p className="text-sm text-slate-700">{results.keywords.join(', ')}</p>
                                </ResultSection>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END OF SEO OPTIMIZER APP ---


// --- START OF OTHER TOOL APP PLACEHOLDERS ---

const LANGUAGES = [
    { name: 'Hoa Kỳ', fullName: 'English (United States)' },
    { name: 'Đức', fullName: 'German' },
    { name: 'Hàn Quốc', fullName: 'Korean' },
    { name: 'Nhật Bản', fullName: 'Japanese' },
    { name: 'Trung Quốc', fullName: 'Chinese (Simplified)' },
    { name: 'Pháp', fullName: 'French' },
    { name: 'Nga', fullName: 'Russian' },
    { name: 'Tây Ban Nha', fullName: 'Spanish' },
    { name: 'Ấn Độ', fullName: 'Hindi' },
    { name: 'Việt Nam', fullName: 'Vietnamese' },
];

type TranslationResult = {
    language: string;
    title: string;
    description: string;
};

const YoutubeNgoaiApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    const [sourceText, setSourceText] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hoa Kỳ']);
    const [translations, setTranslations] = useState<TranslationResult[] | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedState, setCopiedState] = useState<{ lang: string; type: 'title' | 'description' } | null>(null);

    const handleLanguageToggle = (langName: string) => {
        setSelectedLanguages(prev =>
            prev.includes(langName) ? prev.filter(l => l !== langName) : [...prev, langName]
        );
    };

    const handleCopy = (text: string, lang: string, type: 'title' | 'description') => {
        navigator.clipboard.writeText(text);
        setCopiedState({ lang, type });
        setTimeout(() => setCopiedState(null), 2000);
    };

    const handleTranslate = async () => {
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        if (!sourceText.trim() || selectedLanguages.length === 0) {
            setError('Vui lòng nhập văn bản và chọn ít nhất một ngôn ngữ.');
            return;
        }

        setIsTranslating(true);
        setError(null);
        setTranslations(null);

        const targetLanguages = selectedLanguages
            .map(sl => LANGUAGES.find(l => l.name === sl)?.fullName)
            .filter(Boolean)
            .join(', ');

        const systemInstruction = "You are an expert multilingual translator specializing in YouTube video metadata. Your task is to accurately translate a video's title and description into multiple languages. Ensure the tone is natural and engaging for each target audience. The source text will contain a title and a description, separated by a newline. You must translate both parts for each language.";
        const userPrompt = `Translate the following YouTube video title and description into these languages: ${targetLanguages}.\n\nSource Text:\n"""\n${sourceText}\n"""`;

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    language: { type: Type.STRING, description: 'The full name of the language of this translation (e.g., "German", "Korean").' },
                    title: { type: Type.STRING, description: 'The translated title.' },
                    description: { type: Type.STRING, description: 'The translated description.' }
                },
                required: ['language', 'title', 'description']
            }
        };

        try {
            const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                },
            });
            const jsonText = response.text.trim();
            const parsedResults: TranslationResult[] = JSON.parse(jsonText);
            setTranslations(parsedResults);
        } catch (e: any) {
            console.error(e);
            setError(`Không thể dịch. Lỗi: ${e.message}`);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 animate-fade-in custom-scrollbar overflow-y-auto">
            <div className="flex flex-col items-center gap-4">
                <span className="font-semibold text-slate-800">Ngôn ngữ cần dịch</span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.name}
                            onClick={() => handleLanguageToggle(lang.name)}
                            className={`px-6 py-3 text-base font-bold rounded-xl transition-all duration-300 border-2 transform hover:-translate-y-1 aurora-sparkle-on-active ${
                                selectedLanguages.includes(lang.name)
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                            }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center my-4">
                <button
                    onClick={handleTranslate}
                    disabled={isTranslating || !sourceText.trim() || selectedLanguages.length === 0}
                    className="w-full sm:w-auto px-12 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none aurora-sparkle-on-active"
                >
                    {isTranslating ? 'Đang dịch...' : 'Dịch'}
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[50vh]">
                <div className="flex flex-col h-full bg-white/60 rounded-xl border border-slate-300 shadow-lg">
                    <label htmlFor="source-text" className="p-4 border-b border-slate-300 font-semibold text-slate-800">Văn bản Nguồn</label>
                    <div className="relative flex-grow">
                        <textarea
                            id="source-text"
                            value={sourceText}
                            onChange={e => setSourceText(e.target.value)}
                            placeholder="Nhập tiêu đề và mô tả của bạn ở đây.&#10;Ví dụ:&#10;Tiêu đề: Hướng dẫn nấu ăn cho người mới bắt đầu&#10;Mô tả: Trong video này, chúng tôi sẽ chỉ cho bạn những điều cơ bản về nấu ăn."
                            className="w-full h-full p-4 bg-transparent text-slate-700 placeholder-slate-500 resize-none focus:outline-none focus:ring-0"
                        />
                    </div>
                </div>

                <div className="flex flex-col h-full bg-white/60 rounded-xl border border-slate-300 shadow-lg overflow-hidden">
                    {isTranslating && <div className="flex items-center justify-center h-full"><ToolSpinner className="h-10 w-10 text-blue-500" /></div>}
                    {error && <div className="p-4"><ToolErrorDisplay message={error} /></div>}
                    {!isTranslating && !error && !translations && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-slate-500 text-center px-4">Kết quả dịch sẽ được hiển thị tại đây.</p>
                        </div>
                    )}
                     {translations && (
                        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                           {translations.map(result => {
                                const langDisplayName = LANGUAGES.find(l => l.fullName === result.language)?.name || result.language;
                                return (
                                    <div key={result.language} className="p-4 border-b border-slate-300 last:border-b-0">
                                        <h3 className="font-bold text-lg text-blue-600 mb-3">{langDisplayName}</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-sm font-semibold text-slate-800">Tiêu đề</label>
                                                    <button onClick={() => handleCopy(result.title, langDisplayName, 'title')} className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded aurora-sparkle-on-active">
                                                        {copiedState?.lang === langDisplayName && copiedState?.type === 'title' ? 'Đã chép!' : 'Chép'}
                                                    </button>
                                                </div>
                                                <p className="text-sm bg-white/50 p-2 rounded border border-slate-300">{result.title}</p>
                                            </div>
                                            <div>
                                                 <div className="flex justify-between items-center mb-1">
                                                    <label className="text-sm font-semibold text-slate-800">Mô tả</label>
                                                    <button onClick={() => handleCopy(result.description, langDisplayName, 'description')} className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded aurora-sparkle-on-active">
                                                        {copiedState?.lang === langDisplayName && copiedState?.type === 'description' ? 'Đã chép!' : 'Chép'}
                                                    </button>
                                                </div>
                                                <p className="text-sm bg-white/50 p-2 rounded border border-slate-300 whitespace-pre-wrap">{result.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- START OF AFFILIATE APP ---
// Types and helper components for the new AffiliateApp
type Affiliate_Platform = 'tiktok' | 'facebook';
type Affiliate_GenerationMode = 'product' | 'fashion';
type Affiliate_AspectRatio = '9:16' | '16:9';
type Affiliate_Voice = 'female' | 'male';
type Affiliate_Region = 'south' | 'north';
type Affiliate_ImageData = { file: File; previewUrl: string; base64: string; };

type Affiliate_AnimationPrompt = {
    sceneDescription: string;
    characterAction: string;
    cameraMovement: string;
    lighting: string;
    facialExpression: string;
    videoDuration: string;
    audioDescription: string;
};

type Affiliate_PromptSet = {
    description: string;
    animationPrompts: Affiliate_AnimationPrompt[];
};

type Affiliate_GeneratedResult = {
    id: string;
    imageUrl: string;
    promptSets: Affiliate_PromptSet[];
};

// --- Icon Components ---
const Affiliate_UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const Affiliate_WandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
const Affiliate_SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const Affiliate_FilmIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
);
const Affiliate_CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const Affiliate_CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const Affiliate_SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// --- Helper Functions ---
const affiliateFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const affiliateAddWatermark = (base64Url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
              }
              
              ctx.drawImage(img, 0, 0);

              const watermarkText = 'BY: NGUYỄN VĂN SƠN - ZALO : 0986.196.383';
              const fontSize = Math.max(24, Math.round(canvas.width / 50));
              ctx.font = `bold ${fontSize}px Arial`;
              ctx.textAlign = 'left';
              ctx.fillStyle = 'rgba(255, 255, 255, 1)';
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.lineWidth = fontSize / 8;
              
              const x = fontSize * 0.5;
              const y = fontSize * 1.5;
              
              ctx.strokeText(watermarkText, x, y);
              ctx.fillText(watermarkText, x, y);

              resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = (err) => {
              reject(new Error('Failed to load image for watermarking.'));
          };
          img.src = base64Url;
      });
};

// --- Sub Components ---
const AffiliateOptionGroup: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div className="flex flex-col items-center gap-2">
        <label className="block text-sm font-medium text-slate-600">{label}</label>
        <div className="flex items-center gap-3 flex-wrap justify-center">{children}</div>
    </div>
);

const AffiliateOptionButton: React.FC<{selected: boolean, onClick: ()=>void, children: React.ReactNode}> = ({selected, onClick, children}) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 text-base rounded-lg font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lime-200 focus:ring-blue-500 transform active:translate-y-0.5 ${
            selected 
            ? 'bg-blue-600 text-white border-b-4 border-blue-800 shadow-md' 
            : 'bg-slate-200 text-slate-700 border-b-4 border-slate-300 hover:bg-slate-300 shadow-sm'
        }`}
    >
        {children}
    </button>
);

const AffiliateImageUploader: React.FC<{ title: string; onImageUpload: (data: Affiliate_ImageData) => void; }> = ({ title, onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        
        const base64 = await affiliateFileToBase64(file);
        onImageUpload({
          file: file,
          previewUrl: previewUrl,
          base64: base64,
        });
      }
    }, [onImageUpload, preview]);

    return (
      <div className="bg-white/50 border border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500 hover:bg-white/80">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">{title}</h3>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square bg-slate-100 rounded-lg cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-400 hover:border-blue-600 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              <Affiliate_UploadIcon />
              <p className="mt-2 text-sm">Nhấp để tải lên</p>
            </div>
          )}
        </div>
      </div>
    );
};

const AffiliateGeneratedContent: React.FC<{ result: Affiliate_GeneratedResult, isLoading: boolean }> = ({ result, isLoading }) => {
    const { id, imageUrl, promptSets } = result;
    const [copied, setCopied] = useState<Record<string, boolean>>({});

    const handleCopy = (text: string | object, promptIndex: number) => {
        const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
        navigator.clipboard.writeText(textToCopy);
        setCopied(prev => ({ ...prev, [promptIndex]: true }));
        setTimeout(() => setCopied(prev => ({ ...prev, [promptIndex]: false })), 2000);
    };

    const handleSaveImage = () => {
      if (imageUrl) {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `ai-product-shot-${id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
    };
    
    const promptSet = promptSets?.[0];

    const SkeletonLoader = () => (
        <div className="w-full animate-pulse flex flex-col gap-4">
            <div className="aspect-square bg-slate-300 rounded-lg"></div>
            <div className="h-4 bg-slate-300 rounded w-3/4"></div>
            <div className="h-4 bg-slate-300 rounded w-full"></div>
            <div className="h-4 bg-slate-300 rounded w-1/2"></div>
        </div>
    );

    return (
      <div className="bg-white/50 border border-slate-300 rounded-xl p-4 min-h-[300px] flex flex-col">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Kết quả từ AI</h3>
            {imageUrl && !isLoading && (
                <button
                    onClick={handleSaveImage}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg border-b-2 border-slate-300 hover:bg-slate-300 transition-all transform active:translate-y-0.5"
                >
                    <Affiliate_SaveIcon />
                    <span>Lưu ảnh</span>
                </button>
            )}
          </div>
         {isLoading ? (
            <SkeletonLoader />
        ) : imageUrl && promptSet ? (
            <div className="space-y-4">
                <img src={imageUrl} alt="Generated content" className="w-full object-contain rounded-lg shadow-lg" />
                <div className="bg-slate-100/50 p-4 rounded-lg border border-slate-300/50 space-y-3">
                    <div>
                        <h4 className="font-semibold text-blue-600 flex items-center gap-2"><Affiliate_SparklesIcon /> Lời thoại</h4>
                        <p className="text-slate-700 mt-2 text-sm md:text-base">{promptSet.description}</p>
                    </div>

                    {promptSet.animationPrompts && promptSet.animationPrompts.map((animationPrompt, index) => {
                      const formattedPrompt = JSON.stringify(animationPrompt, null, 2);
                      const copyKey = `${id}-${index}`;
                      return (
                        <div key={index} className="pt-3 border-t border-slate-300/50 first:border-t-0 first:pt-0">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-purple-600 flex items-center gap-2">
                                  <Affiliate_FilmIcon /> 
                                  Prompt Chuyển động {promptSet.animationPrompts.length > 1 ? `(Phần ${index + 1})` : ''}
                                </h4>
                                <button 
                                    onClick={() => handleCopy(formattedPrompt, index)}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg border-b-2 border-slate-300 hover:bg-slate-300 transition-all transform active:translate-y-0.5 disabled:bg-green-200 disabled:border-green-300 disabled:text-green-800"
                                    disabled={copied[copyKey]}
                                >
                                    {copied[copyKey] ? <Affiliate_CheckIcon /> : <Affiliate_CopyIcon />}
                                    <span>{copied[copyKey] ? 'Đã chép!' : 'Sao chép'}</span>
                                </button>
                            </div>
                            <pre className="text-slate-800 text-xs md:text-sm whitespace-pre-wrap font-mono bg-slate-800/10 text-slate-800 p-3 rounded">{formattedPrompt}</pre>
                        </div>
                      )
                    })}
                </div>
            </div>
        ) : (
            <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full flex-grow">
                <Affiliate_SparklesIcon className="w-12 h-12" />
                <p className="mt-2">Kết quả của bạn sẽ xuất hiện ở đây.</p>
            </div>
        )}
      </div>
    );
};


// --- Gemini Service Functions ---
const affiliateGenerateTextAndPromptSet = async (
    productImageBase64: string,
    generatedImageBase64: string,
    voice: Affiliate_Voice,
    region: Affiliate_Region,
    productInfo: string,
    seed: number,
    generationMode: Affiliate_GenerationMode,
    productSuggestion: string,
    platform: Affiliate_Platform,
    apiKey: string
): Promise<Affiliate_PromptSet> => {
  const ai = new window.GoogleGenAI({ apiKey });
  const voiceDescription = voice === 'male' ? 'a male' : 'a female';
  const regionDescription = region === 'south' ? 'Southern Vietnamese' : 'Northern Vietnamese';
  const productInfoContext = productInfo 
    ? `Critically, you MUST use the following user-provided "Product Information" as the primary inspiration for the description: "${productInfo}". For this specific generation (seed ${seed}), you MUST create a UNIQUE and CREATIVE variation that has NOT been generated before. Focus on a different feature or angle.`
    : "Analyze the product image to understand its key features and create an appealing, UNIQUE description.";
  const productSuggestionContext = productSuggestion 
    ? `In addition, take this "Product Suggestion" into account to guide the tone and focus: "${productSuggestion}".`
    : "";

  const contextItem = generationMode === 'fashion' ? 'fashion item' : 'product';
  
  const baseAnimationPromptInstruction = `
    - The JSON object must contain the following keys: "sceneDescription", "characterAction", "cameraMovement", "lighting", "facialExpression", "videoDuration", and "audioDescription".
    - "cameraMovement" MUST be a unique, dynamic, and creative camera movement. DO NOT use static shots or repeat previous camera movements. Use cinematic terms like 'smooth panning shot', 'dolly zoom in', 'orbital shot around the character', 'handheld follow shot', 'crane shot revealing the scene'.
    - All other fields must be filled with creative, detailed descriptions in English based on the generated image.`;

  let platformSpecificInstructions;
  let animationPromptTask;

  if (platform === 'tiktok') {
    platformSpecificInstructions = {
      descriptionLength: "between 15 and 25 words. This is a strict limit for an 8-second voiceover.",
      platformContext: 'The style should be trendy, fast-paced, and engaging, suitable for TikTok.'
    };
    animationPromptTask = `2.  **animationPrompts**: Create an array containing ONE detailed video prompt object for an 8-second TikTok video in an "Outfit Showcase" style. ${platformSpecificInstructions.platformContext}
      ${baseAnimationPromptInstruction}
      - "videoDuration" must be exactly "8 seconds".
      - "audioDescription" must describe BOTH the voiceover and suitable background music. It should state that the person speaks the Vietnamese "description" you created, performed by ${voiceDescription} with a ${regionDescription} accent, and be accompanied by a fitting, subtle background music track that enhances the video's mood (e.g., 'upbeat lo-fi hip hop', 'elegant classical music', 'cinematic ambient track').`;

  } else { // platform === 'facebook'
    platformSpecificInstructions = {
      descriptionLength: "between 25 and 40 words. It should be slightly more descriptive and persuasive.",
      platformContext: 'The style should be polished and informative, suitable for Facebook feed or Reels. A clear call-to-action is encouraged.'
    };
    animationPromptTask = `2.  **animationPrompts**: Create an array of TWO detailed video prompt objects for a continuous 16-second Facebook Reels video. ${platformSpecificInstructions.platformContext}
      - **Continuity is CRITICAL**: The second prompt object MUST be a direct and seamless continuation of the first one. The camera movement, character action, and scene must flow perfectly from the end of part 1 to the beginning of part 2.
      ${baseAnimationPromptInstruction}
      - "videoDuration" for EACH of the two objects must be exactly "8 seconds".
      - "audioDescription" for the first part must describe BOTH the voiceover and suitable background music, stating it's performed by ${voiceDescription} with a ${regionDescription} accent.
      - "audioDescription" for the second part should simply state: "Continue background music from Part 1."`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            { text: `Based on the unique qualities of the provided ${contextItem} image, the generated promotional image, and the user's product info, perform two tasks and return the result as a single JSON object with keys "description" and "animationPrompts". This content is for the ${platform.charAt(0).toUpperCase() + platform.slice(1)} platform.

IMPORTANT for seed ${seed}: Your response must be COMPLETELY UNIQUE and DIFFERENT from any previous attempts. Create a fresh, new idea for both the description and the animation prompts.

1.  **description**: Write a concise promotional description in Vietnamese. The length MUST be ${platformSpecificInstructions.descriptionLength}. CRITICAL RULE: The description MUST include commas (,) and periods (.) to create natural pauses for the voiceover. ${productInfoContext} ${productSuggestionContext}

${animationPromptTask}` },
            { text: `${generationMode === 'fashion' ? 'Fashion Item Image' : 'Product Image'}:` },
            { inlineData: { data: productImageBase64, mimeType: 'image/jpeg' } },
            { text: "Generated Promotional Image with Person:" },
            { inlineData: { data: generatedImageBase64, mimeType: 'image/jpeg' } }
        ]
    },
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                description: { 
                  type: Type.STRING,
                  description: `Promotional product description in Vietnamese, suitable for a voiceover on ${platform}. It MUST include commas and periods for natural voiceover pacing.`
                },
                animationPrompts: { 
                  type: Type.ARRAY,
                  description: "An array of detailed video generation prompts. Contains 1 for TikTok, 2 for Facebook.",
                  items: {
                      type: Type.OBJECT,
                      properties: {
                        sceneDescription: { type: Type.STRING, description: "Description of the scene and background."},
                        characterAction: { type: Type.STRING, description: "Detailed movement of the character."},
                        cameraMovement: { type: Type.STRING, description: "How the camera moves. MUST be dynamic and lively."},
                        lighting: { type: Type.STRING, description: "The style of lighting (e.g., golden hour, studio)."},
                        facialExpression: { type: Type.STRING, description: "The character's facial expression."},
                        videoDuration: { type: Type.STRING, description: "The exact duration of the video (e.g., '8 seconds')."},
                        audioDescription: { type: Type.STRING, description: "Description of the voiceover audio, including background music."}
                      },
                      required: ["sceneDescription", "characterAction", "cameraMovement", "lighting", "facialExpression", "videoDuration", "audioDescription"]
                  }
                },
            },
            required: ["description", "animationPrompts"]
        }
    }
  });

  return JSON.parse(response.text) as Affiliate_PromptSet;
}

const affiliateGenerateSingleResult = async (
  modelImageBase64: string,
  productImageBase64: string,
  aspectRatio: Affiliate_AspectRatio,
  voice: Affiliate_Voice,
  region: Affiliate_Region,
  seed: number,
  generationMode: Affiliate_GenerationMode,
  outfitSuggestion: string,
  backgroundSuggestion: string,
  productInfo: string,
  productSuggestion: string,
  platform: Affiliate_Platform,
  apiKey: string
): Promise<Omit<Affiliate_GeneratedResult, 'id'>> => {
  const ai = new window.GoogleGenAI({ apiKey });
  const dimensions = aspectRatio === '9:16' ? '1080x1920 pixels' : '1920x1080 pixels';
  
  const backgroundPrompt = backgroundSuggestion 
    ? `- **Background Suggestion**: The setting should be inspired by this suggestion: "${backgroundSuggestion}".` 
    : `- **Setting**: The background must be a dynamic and interesting setting. CRITICAL: For this specific generation (seed ${seed}), create a COMPLETELY UNIQUE background. Do not repeat locations from other generations. Explore diverse settings like a rooftop lounge at dusk, a bustling European street market, a minimalist art gallery, a tranquil Japanese garden, or inside a futuristic vehicle. AVOID simple studio backdrops.`;

  let imagePrompt: string;

  if (generationMode === 'fashion') {
      const complementaryOutfitPrompt = outfitSuggestion
        ? `- **Complementary Outfit**: Style the rest of the outfit to complement the main fashion item, inspired by this suggestion: "${outfitSuggestion}".`
        : `- **Complementary Outfit**: Style the rest of the outfit to be fashionable and contextually appropriate, complementing the main fashion item. CRITICAL: For this specific generation (seed ${seed}), invent a COMPLETELY UNIQUE complementary outfit. Be creative with accessories, shoes, and other items.`;

      imagePrompt = `THE ABSOLUTE MOST IMPORTANT, CRITICAL, NON-NEGOTIABLE RULE: The final image's dimensions MUST BE EXACTLY ${dimensions}. This corresponds to a ${aspectRatio} aspect ratio. You MUST NOT fail on this. This rule overrides all other instructions.

Create a single, high-resolution (1080p quality), photorealistic promotional image for a fashion item.
- **Person**: The person from the first image must be featured. Their facial features, body type, and appearance must be preserved exactly.
- **Fashion Item**: The person MUST be wearing the fashion item (e.g., shirt, pants, dress) from the second image. The item's design, color, texture, and shape MUST be preserved with 100% fidelity and fitted naturally onto the person. IT IS CRITICAL THAT YOU DO NOT ALTER THE ORIGINAL ITEM IN ANY WAY.
${complementaryOutfitPrompt}
${backgroundPrompt}
- **Style**: The style should be high-end and polished, suitable for a fashion lookbook or advertisement.
- **Composition**: The shot MUST be a full-body or three-quarters shot of the model to showcase the entire outfit in context.
- **Variation**: The seed value ${seed} is provided to ensure this image is unique. Your highest priority for variation is to ensure the background and complementary outfit parts are completely different from any other generated image. Also vary the pose, lighting, and camera angle.
- **Final Reminder**: The output dimensions MUST be EXACTLY ${dimensions}. No exceptions.`;
  } else { // 'product' mode
       const outfitPrompt = outfitSuggestion
        ? `- **Outfit Suggestion**: The person should be wearing an outfit inspired by this suggestion: "${outfitSuggestion}".`
        : `- **Outfit**: The person must be wearing a stylish and contextually appropriate outfit. CRITICAL: For this specific generation (seed ${seed}), invent a COMPLETELY UNIQUE outfit. Do not repeat styles from other generations. Be creative with different clothing items (e.g., blazer and jeans, summer dress, sportswear, elegant gown).`;

      imagePrompt = `THE ABSOLUTE MOST IMPORTANT, CRITICAL, NON-NEGOTIABLE RULE: The final image's dimensions MUST BE EXACTLY ${dimensions}. This corresponds to a ${aspectRatio} aspect ratio. You MUST NOT fail on this. This rule overrides all other instructions.

Create a single, high-resolution (1080p quality), photorealistic promotional image.
- **Person**: The person from the first image must be featured. Their facial features and appearance must be preserved exactly.
- **Product**: The product from the second image must be featured. The product's appearance, branding, color, and shape MUST be preserved with 100% fidelity. IT IS CRITICAL THAT YOU DO NOT ALTER THE ORIGINAL PRODUCT IN ANY WAY.
- **REALISTIC SCALING (CRITICAL)**: The product's size MUST be realistic and proportional to the person. It should look natural, as it would in real life. DO NOT enlarge the product for emphasis. For example, a lipstick should not be the size of a water bottle. This realism is more important than making the product highly visible.
- **Interaction**: The person should be interacting with or presenting the product in a natural, engaging way.
${outfitPrompt}
${backgroundPrompt}
- **Style**: The style should be high-end and polished, suitable for a professional advertisement.
- **Composition**: The shot MUST be a full-body shot of the model to showcase the entire outfit and product in context.
- **Variation**: The seed value ${seed} is provided to ensure this image is unique. Your highest priority for variation is to ensure the outfit and background are completely different from any other generated image, as per the instructions above. Also vary the pose, lighting, and camera angle.
- **Final Reminder**: The output dimensions MUST be EXACTLY ${dimensions}. No exceptions.`;
  }

  const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: imagePrompt },
          { inlineData: { data: modelImageBase64, mimeType: 'image/jpeg' } },
          { inlineData: { data: productImageBase64, mimeType: 'image/jpeg' } },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
  });

  const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData) {
    throw new Error('Không thể tạo ảnh từ AI.');
  }
  const generatedImageBase64 = imagePart.inlineData.data;
  const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${generatedImageBase64}`;
  
  const watermarkedImageUrl = await affiliateAddWatermark(imageUrl);
  
  const promptSet = await affiliateGenerateTextAndPromptSet(
    productImageBase64,
    generatedImageBase64,
    voice,
    region,
    productInfo,
    seed,
    generationMode,
    productSuggestion,
    platform,
    apiKey
  );
  
  return {
    imageUrl: watermarkedImageUrl,
    promptSets: [promptSet],
  };
};

// --- Main App Component ---
const AffiliateApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    const [modelImage, setModelImage] = useState<Affiliate_ImageData | null>(null);
    const [productImage, setProductImage] = useState<Affiliate_ImageData | null>(null);
    const [results, setResults] = useState<Affiliate_GeneratedResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationMode, setGenerationMode] = useState<Affiliate_GenerationMode>('product');
    const [aspectRatio, setAspectRatio] = useState<Affiliate_AspectRatio>('9:16');
    const [voice, setVoice] = useState<Affiliate_Voice>('female');
    const [region, setRegion] = useState<Affiliate_Region>('south');
    const [numberOfResults, setNumberOfResults] = useState(1);
    const [platform, setPlatform] = useState<Affiliate_Platform>('tiktok');
    const [outfitSuggestion, setOutfitSuggestion] = useState('');
    const [backgroundSuggestion, setBackgroundSuggestion] = useState('');
    const [productInfo, setProductInfo] = useState('');
    const [productSuggestion, setProductSuggestion] = useState('');

    useEffect(() => {
        if (generationMode === 'fashion') {
            setOutfitSuggestion('');
        }
    }, [generationMode]);

    const handleGenerateContent = useCallback(async () => {
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        if (!modelImage || !productImage) {
          setError('Vui lòng tải lên cả ảnh người mẫu và ảnh sản phẩm.');
          return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
          const generationPromises = Array.from({ length: numberOfResults }, (_, i) => 
            affiliateGenerateSingleResult(
                modelImage.base64,
                productImage.base64,
                aspectRatio,
                voice,
                region,
                i, // Use index as a seed for variation
                generationMode,
                outfitSuggestion,
                backgroundSuggestion,
                productInfo,
                productSuggestion,
                platform,
                geminiApiKey
            )
          );
          const generatedResults = await Promise.all(generationPromises);
          setResults(generatedResults.map((res, index) => ({...res, id: `result-${index}-${Date.now()}`})));
        } catch (err: any) {
          console.error(err);
          let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
          if (err instanceof Error) {
            const msg = err.message.toLowerCase();
            if (msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted')) {
              errorMessage = `
                <strong class="text-lg">Lỗi Hạn ngạch API (Quota Exceeded)</strong>
                <p class="mt-2">
                  Bạn đã đạt đến giới hạn sử dụng cho API key này. Điều này thường xảy ra với tài khoản miễn phí hoặc khi đạt đến giới hạn chi tiêu.
                </p>
                <div class="mt-4 text-left bg-red-200/20 p-3 rounded-lg border border-red-400">
                  <h4 class="font-semibold text-red-800">Các giải pháp:</h4>
                  <ul class="list-disc list-inside mt-2 space-y-1 text-red-900">
                    <li><strong>Kích hoạt thanh toán:</strong> Đảm bảo tài khoản Google AI của bạn đã liên kết với dự án Cloud có thanh toán đang hoạt động.</li>
                    <li><strong>Kiểm tra giới hạn:</strong> Truy cập Google AI Studio để theo dõi mức sử dụng của bạn.</li>
                    <li><strong>Thử lại sau:</strong> Giới hạn có thể được đặt lại sau mỗi phút hoặc mỗi ngày.</li>
                  </ul>
                  <a href='https://ai.google.dev/gemini-api/docs/billing' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:underline mt-3 inline-block'>Tìm hiểu thêm về thanh toán Gemini API</a>
                </div>`;
            } else if (msg.includes('api key not valid') || msg.includes('400')) {
               errorMessage = '<strong>Lỗi API:</strong> API key không hợp lệ. Vui lòng kiểm tra lại trong phần Cài đặt.';
            } else {
              errorMessage = `<strong>Đã xảy ra lỗi:</strong><pre class="mt-2 text-left whitespace-pre-wrap">${err.message}</pre>`;
            }
          }
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }, [
        geminiApiKey, onRequestApiKeyInput, modelImage, productImage, aspectRatio, voice, region, numberOfResults, 
        generationMode, outfitSuggestion, backgroundSuggestion, productInfo, productSuggestion, platform
    ]);
    
    return (
        <div className="w-full h-full p-0 sm:p-2 bg-transparent rounded-lg">
            <div className="w-full h-full mx-auto flex flex-col gap-6 overflow-y-auto custom-scrollbar p-2">
                 <div className="bg-white/60 backdrop-blur-sm border border-slate-300 rounded-xl p-6 flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
                    <AffiliateOptionGroup label="Nền tảng">
                        <AffiliateOptionButton selected={platform === 'tiktok'} onClick={() => setPlatform('tiktok')}>TikTok</AffiliateOptionButton>
                        <AffiliateOptionButton selected={platform === 'facebook'} onClick={() => setPlatform('facebook')}>Facebook</AffiliateOptionButton>
                    </AffiliateOptionGroup>
                    <AffiliateOptionGroup label="Loại Nội dung">
                        <AffiliateOptionButton selected={generationMode === 'product'} onClick={() => setGenerationMode('product')}>Sản phẩm cầm tay</AffiliateOptionButton>
                        <AffiliateOptionButton selected={generationMode === 'fashion'} onClick={() => setGenerationMode('fashion')}>Trang phục</AffiliateOptionButton>
                    </AffiliateOptionGroup>
                    <AffiliateOptionGroup label="Tỷ lệ ảnh">
                        <AffiliateOptionButton selected={aspectRatio === '9:16'} onClick={() => setAspectRatio('9:16')}>9:16</AffiliateOptionButton>
                        <AffiliateOptionButton selected={aspectRatio === '16:9'} onClick={() => setAspectRatio('16:9')}>16:9</AffiliateOptionButton>
                    </AffiliateOptionGroup>
                    <AffiliateOptionGroup label="Giọng đọc thoại">
                        <AffiliateOptionButton selected={voice === 'female'} onClick={() => setVoice('female')}>Nữ</AffiliateOptionButton>
                        <AffiliateOptionButton selected={voice === 'male'} onClick={() => setVoice('male')}>Nam</AffiliateOptionButton>
                    </AffiliateOptionGroup>
                    <AffiliateOptionGroup label="Vùng miền">
                        <AffiliateOptionButton selected={region === 'south'} onClick={() => setRegion('south')}>Miền Nam</AffiliateOptionButton>
                        <AffiliateOptionButton selected={region === 'north'} onClick={() => setRegion('north')}>Miền Bắc</AffiliateOptionButton>
                    </AffiliateOptionGroup>
                     <AffiliateOptionGroup label="Số lượng kết quả">
                         <select value={numberOfResults} onChange={(e) => setNumberOfResults(parseInt(e.target.value, 10))} className="bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                         </select>
                    </AffiliateOptionGroup>
                </div>

                <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label htmlFor="outfit-suggestion" className="block text-sm font-medium text-slate-600 mb-2">Gợi ý trang phục (không bắt buộc)</label>
                            <input 
                                type="text" 
                                id="outfit-suggestion"
                                value={outfitSuggestion}
                                onChange={(e) => setOutfitSuggestion(e.target.value)}
                                disabled={generationMode === 'fashion'}
                                placeholder={generationMode === 'fashion' ? 'AI sẽ tự động phối đồ phụ & phụ kiện' : 'VD: váy maxi đi biển, đồ công sở...'}
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="background-suggestion" className="block text-sm font-medium text-slate-600 mb-2">Gợi ý bối cảnh (không bắt buộc)</label>
                            <input 
                                type="text" 
                                id="background-suggestion"
                                value={backgroundSuggestion}
                                onChange={(e) => setBackgroundSuggestion(e.target.value)}
                                placeholder={generationMode === 'fashion' ? 'VD: quán cafe sân vườn...' : 'VD: studio ánh sáng tự nhiên...'}
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="flex flex-col">
                             <label htmlFor="product-info" className="block text-sm font-medium text-slate-600 mb-2">Thông tin sản phẩm (để tạo lời thoại hay hơn)</label>
                             <textarea
                                 id="product-info"
                                 value={productInfo}
                                 onChange={(e) => setProductInfo(e.target.value)}
                                 placeholder={generationMode === 'fashion' ? 'VD: Áo sơ mi lụa, thoáng mát...' : 'VD: Son môi siêu lì, giữ màu 8 tiếng...'}
                                 rows={4}
                                 className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
                             />
                         </div>
                         <div className="flex flex-col">
                             <label htmlFor="product-suggestion" className="block text-sm font-medium text-slate-600 mb-2">Gợi ý về sản phẩm (không bắt buộc)</label>
                             <textarea
                                 id="product-suggestion"
                                 value={productSuggestion}
                                 onChange={(e) => setProductSuggestion(e.target.value)}
                                 placeholder="Ví dụ: hợp với giới trẻ, nhấn mạnh chống nước..."
                                 rows={4}
                                 className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
                             />
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                    <AffiliateImageUploader title="1. Tải ảnh khuôn mặt" onImageUpload={setModelImage} />
                    <AffiliateImageUploader title={generationMode === 'product' ? "2. Tải ảnh sản phẩm" : "2. Tải ảnh trang phục (áo/quần)"} onImageUpload={setProductImage} />
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleGenerateContent}
                        disabled={!modelImage || !productImage || isLoading}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 disabled:bg-slate-400 disabled:border-slate-500 disabled:cursor-not-allowed transition-all transform active:translate-y-1 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lime-200 focus:ring-blue-500"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                           <Affiliate_WandIcon />
                        )}
                        <span className="text-lg">{isLoading ? `Đang tạo ${numberOfResults} kết quả...` : 'Tạo Nội dung'}</span>
                    </button>
                </div>
                {error && (
                  <div className="mt-4 w-full max-w-3xl mx-auto p-4 bg-red-100 border border-red-500 text-red-800 rounded-lg text-center" dangerouslySetInnerHTML={{ __html: error }}></div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        Array.from({ length: numberOfResults }).map((_, index) => (
                           <AffiliateGeneratedContent key={index} result={{id: `skel-${index}`, imageUrl: '', promptSets: []}} isLoading={true} />
                        ))
                    ) : results.length > 0 ? (
                        results.map((result) => (
                            <AffiliateGeneratedContent key={result.id} result={result} isLoading={false} />
                        ))
                    ) : !error ? (
                         <div className="md:col-span-2 text-center text-slate-500 py-16 border-2 border-dashed border-slate-400 rounded-xl">
                            <p>Kết quả của bạn sẽ xuất hiện ở đây.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
// --- END OF AFFILIATE APP ---


// --- START OF AI STORY TELLER APP ---
const StoryTellerApp: React.FC<ToolAppProps> = ({ geminiApiKey, onRequestApiKeyInput }) => {
    const TTS_VOICES_FEMALE = useMemo(() => [
        { name: 'Kore', description: 'Thân thiện/Ấm áp (Giọng trung)' },
        { name: 'Lyra', description: 'Kể chuyện/Ấm áp (Giọng trung)' },
        { name: 'Sol', description: 'Tươi sáng/Năng động (Giọng trung)' },
        { name: 'Zephyr', description: 'Nhẹ nhàng/Thanh lịch (Giọng cao)' },
    ], []);

    const TTS_VOICES_MALE = useMemo(() => [
        { name: 'Puck', description: 'Vui vẻ/Lạc quan (Giọng trung)' },
        { name: 'Orion', description: 'Bình tĩnh/Trấn an (Giọng trung)' },
        { name: 'Arcturus', description: 'Rõ ràng/Quyền uy (Giọng trầm)' },
        { name: 'Charon', description: 'Lạnh lùng/Bí ẩn (Giọng trầm)' },
        { name: 'Fenrir', description: 'Hùng tráng/Sử thi (Giọng trầm)' },
        { name: 'Abyssal', description: 'Oai nghiêm/Sâu lắng (Giọng rất trầm)' },
    ], []);
    
    // Script generation state
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('horror');
    const [charCount, setCharCount] = useState('1500');
    const [idea, setIdea] = useState('');
    const [script, setScript] = useState('');
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    // Audio generation state
    const [styleInstructions, setStyleInstructions] = useState('Đọc với giọng kể chuyện ma, chậm rãi, nhấn nhá và đầy bí ẩn.');
    const [selectedVoice, setSelectedVoice] = useState(TTS_VOICES_FEMALE[0].name);
    const [temperature, setTemperature] = useState(1.0);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    // Common state
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [speakingRate, setSpeakingRate] = useState(1.0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speakingRate;
        }
    }, [speakingRate]);

    const handleGenerateScript = async () => {
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        setIsGeneratingScript(true);
        setError(null);
        setAudioUrl(null);

        const prompt = `
            Hãy viết một kịch bản kể chuyện hoàn chỉnh dựa trên các thông tin sau:
            - **Chủ đề:** ${topic}
            - **Tiêu đề gợi ý:** ${title || 'Không có'}
            - **Ý tưởng chính:** ${idea}
            - **Yêu cầu:** Kịch bản phải có độ dài khoảng ${charCount} ký tự, văn phong phù hợp để kể chuyện, có mở đầu, cao trào và kết thúc rõ ràng.
        `;

        try {
            const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const generatedScript = response.text;
            setScript(generatedScript);
        } catch (e: any) {
            setError(`Không thể tạo kịch bản. Lỗi: ${e.message}`);
        } finally {
            setIsGeneratingScript(false);
        }
    };
    
    // Helper to convert raw PCM to a WAV blob
    const createWavBlob = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob => {
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);
        const dataSize = pcmData.length;
        const fileSize = 36 + dataSize;

        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        // RIFF header
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, fileSize, true);
        view.setUint32(8, 0x57415645, false); // "WAVE"

        // "fmt " sub-chunk
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true); // Sub-chunk size
        view.setUint16(20, 1, true); // Audio format (1 for PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);

        // "data" sub-chunk
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, dataSize, true);

        // PCM data
        const pcmBytes = new Uint8Array(buffer, 44);
        pcmBytes.set(pcmData);

        return new Blob([view], { type: 'audio/wav' });
    };
    
    const base64ToUint8Array = (base64: string) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };


    const handleGenerateAudio = async () => {
        if (!geminiApiKey) {
            onRequestApiKeyInput();
            return;
        }
        if (!script) {
            setError('Vui lòng tạo kịch bản trước khi tạo âm thanh.');
            return;
        }

        setIsGeneratingAudio(true);
        setError(null);
        setAudioUrl(null);

        try {
            const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `${styleInstructions}: "${script}"` }] }],
                config: {
                    responseModalities: [window.GenAIModality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: selectedVoice },
                        },
                        // The TTS model doesn't currently support temperature or rate in the API config.
                        // Playback speed will be controlled on the client side.
                    },
                },
            });
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (base64Audio) {
                const pcmData = base64ToUint8Array(base64Audio);
                const wavBlob = createWavBlob(pcmData, 24000, 1, 16); // Gemini TTS is 24kHz, 1-channel, 16-bit
                const url = URL.createObjectURL(wavBlob);
                setAudioUrl(url);
            } else {
                throw new Error("Không nhận được dữ liệu âm thanh từ API.");
            }
        } catch (e: any) {
             setError(`Không thể tạo âm thanh. Lỗi: ${e.message}`);
        } finally {
            setIsGeneratingAudio(false);
        }
    };
    
    const handleDownloadTxt = () => {
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'kich-ban'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="text-slate-800 p-0 sm:p-2 h-full">
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-300 space-y-6 overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-300 pb-3">Bảng điều khiển</h2>
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700">Tiêu đề Câu chuyện</label>
                        <input id="title" placeholder="Ví dụ: Ngôi nhà ma ám trên đồi" className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="topic" className="block text-sm font-semibold text-slate-700">Chọn Chủ đề</label>
                        <select id="topic" className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" value={topic} onChange={e => setTopic(e.target.value)}>
                            <option value="kinh dị, ma ám, rùng rợn">Truyện ma kinh dị</option>
                            <option value="vụ án, điều tra, tội phạm">Vụ án có thật</option>
                            <option value="tâm lý, tình cảm, lãng mạn">Tâm lý tình cảm</option>
                            <option value="khoa học, viễn tưởng, tương lai">Khoa học viễn tưởng</option>
                            <option value="lịch sử, hùng tráng, dân tộc">Lịch sử hùng tráng</option>
                            <option value="khám phá, bí ẩn, phiêu lưu">Khám phá bí ẩn</option>
                            <option value="truyền thuyết, dân gian, cổ tích">Truyền thuyết dân gian</option>
                            <option value="phát triển bản thân, bài học, triết lý">Phát triển bản thân</option>
                            <option value="bình luận game, phân tích, hướng dẫn">Bình luận game</option>
                            <option value="review phim, phân tích, tóm tắt">Review phim</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="charCount" className="block text-sm font-semibold text-slate-700">Số ký tự mong muốn</label>
                        <input id="charCount" placeholder="Ví dụ: 1500" min="500" step="100" className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" type="number" value={charCount} onChange={e => setCharCount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="idea" className="block text-sm font-semibold text-slate-700">Ý tưởng Kịch bản</label>
                        <textarea id="idea" placeholder="Nhập ý tưởng chính của bạn ở đây..." rows={4} className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" value={idea} onChange={e => setIdea(e.target.value)}></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={handleGenerateScript} disabled={isGeneratingScript || isGeneratingAudio} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors aurora-sparkle-on-active">
                            {isGeneratingScript ? <ToolSpinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>}
                            {isGeneratingScript ? 'Đang viết...' : 'Tạo Kịch bản'}
                        </button>
                         <button onClick={handleGenerateAudio} disabled={isGeneratingAudio || isGeneratingScript || !script} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors aurora-sparkle-on-active">
                            {isGeneratingAudio ? <ToolSpinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm4 0a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm-2 9a4 4 0 100-8 4 4 0 000 8zm-4 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>}
                            {isGeneratingAudio ? 'Đang đọc...' : 'Tạo Âm thanh'}
                        </button>
                    </div>

                    <div className="pt-4 border-t border-slate-300 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="styleInstructions" className="block text-sm font-semibold text-slate-700">Hướng dẫn Style Giọng đọc</label>
                            <input id="styleInstructions" placeholder="Ví dụ: Đọc với giọng kể chuyện, thân thiện" className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" type="text" value={styleInstructions} onChange={e => setStyleInstructions(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="voice-selector" className="block text-sm font-semibold text-slate-700">Giọng đọc</label>
                            <select id="voice-selector" className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
                                <optgroup label="Giọng Nữ">
                                    {TTS_VOICES_FEMALE.map(voice => (
                                        <option key={voice.name} value={voice.name}>{voice.description}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Giọng Nam">
                                    {TTS_VOICES_MALE.map(voice => (
                                        <option key={voice.name} value={voice.name}>{voice.description}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="speakingRate" className="block text-sm font-semibold text-slate-700">Tốc độ đọc ({speakingRate.toFixed(1)}x)</label>
                            <input id="speakingRate" min="0.5" max="2.0" step="0.1" className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer" type="range" value={speakingRate} onChange={e => setSpeakingRate(parseFloat(e.target.value))} />
                        </div>
                    </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-300 space-y-4 flex flex-col">
                    <div className="flex justify-between items-center border-b border-slate-300 pb-3 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-slate-800">Kịch bản & Âm thanh</h2>
                        <span className="text-sm text-slate-500">{script.length} ký tự</span>
                    </div>
                    {error && <ToolErrorDisplay message={error} />}
                    <div className="flex-grow h-[50vh] flex flex-col bg-lime-50/50 rounded-md border border-slate-300">
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Kịch bản sẽ xuất hiện ở đây sau khi tạo."
                            className="w-full h-full p-2 bg-transparent text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-0 border-0 custom-scrollbar"
                            aria-label="Script Content"
                        />
                    </div>
                    {audioUrl && (
                        <div className="flex-shrink-0">
                            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-300 flex-shrink-0">
                        <a href={audioUrl || undefined} download={audioUrl ? `${title || 'audio'}.wav` : undefined} className={`flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 font-bold rounded-lg transition-colors aurora-sparkle-on-active ${!audioUrl ? 'opacity-50 cursor-not-allowed bg-sky-300' : 'hover:bg-sky-700 text-white'}`}
                           onClick={(e) => !audioUrl && e.preventDefault()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Tải Audio
                        </a>
                        <button onClick={handleDownloadTxt} disabled={!script} className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors aurora-sparkle-on-active">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Tải File TXT
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// ===============================================
// 4. LOGIN SCREEN COMPONENT
// ===============================================

interface LoginScreenProps {
    onLogin: (e: React.FormEvent) => void;
    authCode: string;
    setAuthCode: (code: string) => void;
    authError: string;
    isSubmitting: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, authCode, setAuthCode, authError, isSubmitting }) => {
    return (
        <div className="min-h-screen bg-lime-200 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto">
                <div className="text-center mb-8">
                    <h1 className="logo-text-3d-aurora">RIVER SƠN MASTER</h1>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20">
                    <form className="space-y-6" onSubmit={onLogin}>
                        <div>
                            <label htmlFor="password-input" className="block text-sm font-semibold mb-2 text-slate-700">
                                Mã Truy Cập (Để dùng thử 7 ngày, nhập mã: <strong className="font-bold text-blue-600 tracking-wider">vip7ngay</strong>)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L4.5 17.5V21h3.5l5.757-5.757A6 6 0 0115 7z"></path>
                                    </svg>
                                </span>
                                <input
                                    id="password-input"
                                    className="w-full p-3 pl-10 bg-white/80 border rounded-md transition-shadow duration-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300"
                                    placeholder="Nhập mã của bạn..."
                                    type="password"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                />
                            </div>
                             {authError && <p className="text-red-600 text-xs mt-2 text-center">{authError}</p>}
                        </div>
                        <button type="submit" disabled={!authCode || isSubmitting} className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-200 animate-aurora-button aurora-sparkle-on-active">
                             {isSubmitting ? 'Đang kiểm tra...' : 'Truy cập' }
                             {!isSubmitting && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                        </button>
                    </form>
                    <a href="https://www.facebook.com/NguyenVanSonss" target="_blank" rel="noopener noreferrer" className="w-full mt-4 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 aurora-sparkle-on-active">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                        Lấy Mã Truy Cập Miễn Phí
                    </a>
                </div>
                <footer className="text-center mt-8 text-slate-600 text-sm">
                    <a href="https://www.facebook.com/NguyenVanSonss" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 transition-colors">PHÁT TRIỂN BỞI RIVER SƠN MASTER</a>
                </footer>
                <footer className="text-center mt-16 text-gray-500 text-sm flex flex-col items-center">
                    <p>Thêm từ khóađịnh vào cuối mỗi prompt</p>
                    <p>Donate để chúng tôi có động lực phát triển App đẳng cấp tối thượng hơn nữa, xin cảm ơn!</p>
                    <img alt="QR Code for Bank Transfer" className="w-64 h-64 rounded-lg shadow-lg border-2 border-slate-600 mt-4" src="https://img.vietqr.io/image/TCB-19037518595018-compact2.png?amount=100000&addInfo=TOOL%20AFFILIATE%20VINH%20VIEN&accountName=NGUYEN%20VAN%20SON" />
                </footer>
            </div>
        </div>
    );
};


// ===============================================
// 5. MAIN APP COMPONENT
// ===============================================

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authCode, setAuthCode] = useState('');
    const [authError, setAuthError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [currentView, setCurrentView] = useState<number | 'dashboard'>('dashboard');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [openAiApiKey, setOpenAiApiKey] = useState('');
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);

    const tools: Tool[] = useMemo(() => [
        { id: 1, text: 'Prompt JSON', icon: <IconPromptJson />, title: 'Công cụ viết Prompt JSON Video AI', description: 'Tạo kịch bản và prompt chi tiết dạng JSON thích hợp cho Flow AI.' },
        { id: 2, text: 'Whisk & Flow', icon: <IconWhiskFlow />, title: 'Đồng bộ nhân vật với Whisk & Flow', description: 'Tự động tạo prompt đồng bộ cho Whisk và Flow từ ý tưởng của bạn.' },
        { id: 3, text: 'Tạo ảnh', icon: <IconCreateImage />, title: 'Công cụ tạo ảnh bằng AI', description: 'Tạo hàng loạt từ các câu lệnh (prompt) văn bản đơn giản.' },
        { id: 4, text: 'Tạo Thumbnail', icon: <IconCreateThumbnail />, title: 'Tạo Thumbnail AI chuyên nghiệp', description: 'Tạo thumbnail cho Youtube, Tiktok, Facebook từ ảnh có sẵn hoặc tạo mới hoàn toàn.' },
        { id: 5, text: 'Tạo Video', icon: <IconCreateVideo />, title: 'Công cụ tạo Video AI', description: 'Tạo video từ văn bản (prompt) hoặc từ một ảnh tĩnh do bạn tải lên.' },
        { id: 6, text: 'SEO Youtube', icon: <IconSeoYoutube />, title: 'AI SEO YouTube', description: 'Tạo tiêu đề, mô tả, hashtag và từ khóa chuẩn SEO, giúp kênh YouTube phát triển.' },
        { id: 7, text: 'Youtube ngoại', icon: <IconYoutubeExternal />, title: 'Thêm ngôn ngữ Youtube', description: 'Dịch tiêu đề, mô tả Youtube sang nhiều ngôn ngữ khác nhau để tiếp cận khán giả ngoại.' },
        { id: 8, text: 'App Affiliate', icon: <IconAppAffiliate />, title: 'Affiliate Shorts Video', description: 'Tạo nội dung quảng cáo sản phẩm chuyên nghiệp cho TikTok, Facebook.' },
        { id: 9, text: 'Hỏi đáp', icon: <IconFaq />, title: 'Hỏi & Đáp', description: 'Các câu hỏi thường gặp và hướng dẫn sử dụng.' },
        { id: 10, text: 'AI Kể chuyện', icon: <IconStoryTeller />, title: 'AI Kể chuyện', description: 'Tạo kịch bản và giọng đọc cho câu chuyện của bạn bằng AI.' },
        { id: 11, text: 'Ứng dụng sắp ra mắt', icon: <IconComingSoon />, title: 'Sắp ra mắt', description: 'Một công cụ mới mạnh mẽ đang được phát triển. Hãy chờ đón nhé!' },
    ], []);
    
    const socialLinks = useMemo(() => [
        { href: "https://youtube.com/channel/UCUd2-445om-KIlCOlHSDPsQ?sub_confirmation=1", icon: <IconYoutube />, name: "Youtube", color: "bg-red-600 hover:bg-red-700" },
        { href: "https://www.facebook.com/NguyenVanSonss", icon: <IconFacebook />, name: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
        { href: "https://www.tiktok.com/@nguyenvanson1902", icon: <IconTiktok />, name: "Tiktok", color: "bg-gray-900 hover:bg-gray-800" },
        { href: "https://zalo.me/0986196383", icon: <IconZalo />, name: "Zalo", color: "bg-blue-500 hover:bg-blue-600" },
    ], []);

    // Local storage keys
    const AUTH_TOKEN_KEY = 'APP_AUTH_SESSION';
    const TRIAL_EXPIRY_KEY = 'APP_TRIAL_EXP';
    const TRIAL_USED_KEY = 'APP_TRIAL_FLAG';
    const GEMINI_API_KEY = 'GEMINI_API_KEY';
    const OPENAI_API_KEY = 'OPENAI_API_KEY';
    
    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            let authenticated = false;
            // Check for trial
            const trialExpiryEncoded = localStorage.getItem(TRIAL_EXPIRY_KEY);
            if (trialExpiryEncoded) {
                try {
                    const trialExpiry = parseInt(atob(trialExpiryEncoded), 10);
                    if (new Date().getTime() < trialExpiry) {
                        authenticated = true;
                    }
                } catch (e) {
                    console.error("Failed to decode trial expiry", e);
                    localStorage.removeItem(TRIAL_EXPIRY_KEY);
                }
            }
            
            // Check for permanent auth token
            const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
            if (authToken) {
                try {
                    const response = await fetch('./register.json');
                    const data = await response.json();
                    if (data.codes.includes(atob(authToken))) {
                        authenticated = true;
                    }
                } catch (e) {
                    console.error("Failed to fetch or validate auth token", e);
                }
            }
            setIsAuthenticated(authenticated);
            
            // Load API Keys from local storage
            const storedGeminiKey = localStorage.getItem(GEMINI_API_KEY);
            if(storedGeminiKey) setGeminiApiKey(atob(storedGeminiKey));
            
            const storedOpenAiKey = localStorage.getItem(OPENAI_API_KEY);
            if(storedOpenAiKey) setOpenAiApiKey(atob(storedOpenAiKey));

            setIsLoading(false);
        };

        checkAuthAndLoadData();
    }, []);

    const handleButtonClick = useCallback((toolId: number) => {
        const toolExists = tools.some(t => t.id === toolId);
        if (toolExists && ![9, 11].includes(toolId)) { // Do not switch view for FAQ and coming soon tools
            setCurrentView(toolId);
        } else {
            alert("Chức năng đang được phát triển!");
        }
    }, [tools]);

    const handleSaveApiKey = useCallback((keys: { gemini: string; openai: string; }) => {
        setGeminiApiKey(keys.gemini || '');
        setOpenAiApiKey(keys.openai || '');
        try {
            localStorage.setItem(GEMINI_API_KEY, btoa(keys.gemini || ''));
            localStorage.setItem(OPENAI_API_KEY, btoa(keys.openai || ''));
        } catch (e) {
            console.error("Error saving API keys to local storage", e);
        }
        setShowApiKeyModal(false);
    }, []);

    const handleAuthSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsSubmitting(true);

        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (authCode.toLowerCase() === 'vip7ngay') {
            const trialUsedEncoded = localStorage.getItem(TRIAL_USED_KEY);
            if (trialUsedEncoded) {
                setAuthError('Mã dùng thử đã được sử dụng hoặc đã hết hạn.');
                setIsSubmitting(false);
                return;
            }
            const expiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
            localStorage.setItem(TRIAL_EXPIRY_KEY, btoa(expiryTime.toString()));
            localStorage.setItem(TRIAL_USED_KEY, btoa('true'));
            setIsAuthenticated(true);
            setAuthCode('');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('./register.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.codes.includes(authCode)) {
                localStorage.setItem(AUTH_TOKEN_KEY, btoa(authCode));
                localStorage.removeItem(TRIAL_EXPIRY_KEY);
                localStorage.removeItem(TRIAL_USED_KEY);
                setIsAuthenticated(true);
                setAuthCode('');
            } else {
                 setAuthError('Mã không hợp lệ. Vui lòng thử lại hoặc lấy mã mới.');
            }
        } catch (error) {
            console.error('Failed to validate code:', error);
            setAuthError('Lỗi xác thực. Vui lòng kiểm tra kết nối và thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    }, [authCode]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-lime-200 flex items-center justify-center">
                <p className="text-slate-600 text-lg animate-pulse">Đang tải ứng dụng...</p>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return (
            <LoginScreen
                onLogin={handleAuthSubmit}
                authCode={authCode}
                setAuthCode={setAuthCode}
                authError={authError}
                isSubmitting={isSubmitting}
            />
        );
    }
    
    const renderToolComponent = () => {
        const props = { geminiApiKey, openAiApiKey, onRequestApiKeyInput: () => setShowApiKeyModal(true) };
        switch(currentView) {
            case 1: return <ScriptWriterApp {...props} />;
            case 2: return <WhiskFlowApp {...props} />;
            case 3: return <ImageGeneratorApp {...props} />;
            case 4: return <ThumbnailGeneratorApp {...props} />;
            case 5: return <VideoGeneratorApp {...props} />;
            case 6: return <SeoOptimizerApp {...props} />;
            case 7: return <YoutubeNgoaiApp {...props} />;
            case 8: return <AffiliateApp {...props} />;
            case 10: return <StoryTellerApp {...props} />;
            default: return null;
        }
    }
    
    const activeTool = tools.find(t => t.id === currentView);

    if (currentView === 'dashboard') {
        return (
            <>
                <ApiKeyModal 
                    show={showApiKeyModal}
                    onClose={() => setShowApiKeyModal(false)}
                    onSave={handleSaveApiKey}
                    currentGeminiKey={geminiApiKey}
                    currentOpenAiKey={openAiApiKey}
                />
                <div className="min-h-screen bg-transparent flex flex-col p-4 sm:p-8 lg:p-12">
                    <header className="flex flex-col md:flex-row justify-between items-center gap-6 w-full mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <a href="https://www.facebook.com/NguyenVanSonss" target="_blank" rel="noopener noreferrer" className="flex items-center bg-white/60 backdrop-blur-sm border border-blue-500 text-blue-600 font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/10 hover:bg-blue-500/10 hover:text-blue-700 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 aurora-sparkle-on-active"> 
                                <IconHome /> Trang chủ
                            </a>
                            <a href="https://www.facebook.com/NguyenVanSonss" target="_blank" rel="noopener noreferrer" className="flex items-center bg-white/60 backdrop-blur-sm border border-blue-500 text-blue-600 font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/10 hover:bg-blue-500/10 hover:text-blue-700 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 aurora-sparkle-on-active"> 
                                <IconGift /> Tài nguyên FREE
                            </a>
                        </div>
                        <div className="text-center">
                             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                                <span className="logo-text-3d-aurora" style={{ fontSize: 'inherit' }}>MASTER RIVER SƠN</span>
                             </h1>
                        </div>
                        <div className="flex items-center justify-end flex-wrap gap-3">
                            {socialLinks.map(link => 
                                <a 
                                    key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}
                                    className={`flex items-center justify-center w-11 h-11 rounded-lg text-white transition-all duration-300 transform hover:scale-115 aurora-sparkle-on-active ${link.color}`}
                                >{link.icon}</a>
                            )}
                            <button 
                                onClick={() => setShowApiKeyModal(true)}
                                className="flex items-center bg-white/60 backdrop-blur-sm border border-blue-500 text-blue-600 font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/10 hover:bg-blue-500/10 hover:text-blue-700 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap aurora-sparkle-on-active"> 
                                <IconSettings /> Cài đặt API Key
                            </button>
                        </div>
                    </header>
                    
                    <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto text-center mb-8 animate-fade-in">Giải phóng tiềm năng, tự động hóa công việc và nâng tầm nội dung của bạn chỉ với một cú nhấp chuột.</p>
                    <main className="flex-grow animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {tools.map(tool => (
                                <IconButton 
                                    key={tool.id} 
                                    text={tool.text} 
                                    icon={tool.icon} 
                                    onClick={() => handleButtonClick(tool.id)}
                                />
                            ))}
                        </div>
                    </main>

                     <footer className="text-center pt-8 mt-auto">
                        <p className="footer-credit-animated">Ứng dụng được phát triển bởi Nguyễn Văn Sơn</p>
                    </footer>
                </div>
            </>
        );
    }
    
    // Focused Tool View
    return (
        <>
            <ApiKeyModal 
                show={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
                onSave={handleSaveApiKey}
                currentGeminiKey={geminiApiKey}
                currentOpenAiKey={openAiApiKey}
            />
            <div className="min-h-screen bg-transparent flex flex-col p-4 sm:p-6">
                <main className="flex-grow flex flex-col gap-4 animate-fade-in">
                    <div className="flex-shrink-0 flex justify-between items-center mb-2">
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="group flex items-center text-left p-3 rounded-lg text-slate-700 hover:bg-blue-500/10 hover:text-blue-700 transition-colors duration-200 aurora-sparkle-on-active bg-white/50 backdrop-blur-sm border border-slate-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-semibold">Quay lại</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowApiKeyModal(true)}
                            className="flex items-center bg-white/60 backdrop-blur-sm border border-blue-500 text-blue-600 font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/10 hover:bg-blue-500/10 hover:text-blue-700 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap aurora-sparkle-on-active"> 
                            <IconSettings /> Cài đặt API Key
                        </button>
                     </div>

                    <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                        {activeTool?.title && (
                            <div className="flex-shrink-0">
                                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">{activeTool.title}</h2>
                                <p className="text-slate-600 mt-1">{activeTool.description}</p>
                            </div>
                        )}
                        <div className="flex-grow overflow-hidden">
                            {renderToolComponent()}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;