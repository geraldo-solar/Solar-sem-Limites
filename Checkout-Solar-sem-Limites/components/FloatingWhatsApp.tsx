import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';

export const FloatingWhatsApp = () => {
  const phoneNumber = "5591981229825";
  const message = "dúvidas pacote Solar sem Limites";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay entrance for dramatic effect
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`
        fixed bottom-8 right-8 z-[100] flex items-center gap-5 group cursor-pointer 
        transition-all duration-1000 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
      aria-label="Entre em contato pelo WhatsApp"
    >
      {/* Tooltip Bubble - Enhanced */}
      <div className="
        hidden md:flex flex-col items-end
        bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-xl shadow-moss-900/10 
        border border-white/50 ring-1 ring-moss-900/5
        transform transition-all duration-300 group-hover:-translate-x-2 group-hover:scale-105
        relative
      ">
        <span className="font-serif text-moss-900 font-bold text-lg leading-none mb-1">
          Está com dúvidas?
        </span>
        <span className="text-xs text-brand-green font-sans font-bold tracking-widest uppercase flex items-center gap-1">
          Chame aqui
          <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </span>
        
        {/* Triangle Pointer */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 
          border-t-[10px] border-t-transparent 
          border-l-[12px] border-l-white 
          border-b-[10px] border-b-transparent 
          drop-shadow-sm"
        ></div>
      </div>

      {/* Button Container */}
      <div className="relative isolate">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        
        {/* Ripple Rings */}
        <span className="absolute inset-0 rounded-full border border-green-500/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
        <span className="absolute inset-0 rounded-full border border-green-400/50 opacity-0 delay-700 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></span>

        {/* Main Icon Button */}
        <div className="
          relative w-16 h-16 md:w-20 md:h-20 
          bg-gradient-to-tr from-brand-green to-[#25D366] 
          rounded-full shadow-2xl shadow-brand-green/40 
          flex items-center justify-center
          border-[3px] border-white/90
          transform transition-transform duration-300 ease-out 
          group-hover:scale-110 group-hover:rotate-6
        ">
          <div className="text-white w-8 h-8 md:w-10 md:h-10">
             <Icons.WhatsApp />
          </div>
          
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 md:top-1 md:right-1 block h-4 w-4 md:h-5 md:w-5 rounded-full ring-2 ring-white bg-red-500 animate-bounce"></span>
        </div>
      </div>
    </a>
  );
};