import React from "react";
import { motion } from "motion/react";
import { EggLayerConfig } from "../types";

interface EggProps {
  layers: EggLayerConfig;
  scale?: number;
  rotation?: number;
  squashStretch?: { x: number; y: number };
  isBursting?: boolean;
}

export const Egg: React.FC<EggProps> = ({
  layers,
  scale = 1,
  rotation = 0,
  squashStretch = { x: 1, y: 1 },
  isBursting = false,
}) => {
  const strokeColor = "#2B2540";
  const shellColor = "#3FB877";
  const spotColor = "#FFC83D";
  const glowColor = "#FFC83D";
  const glowCoreColor = "#FFF6D6";

  return (
    <div id="egg-render-container" className="relative w-[230px] h-[270px] flex items-center justify-center">
      
      {/* 1. egg-shadow: Ground Projection (outside animated container so it scales inverse of jumps) */}
      {layers.shadow && (
        <motion.div
          id="egg-shadow"
          className="absolute bottom-3 w-[126px] h-[16px] bg-[#10092c]/75 rounded-full blur-[4px] pointer-events-none"
          style={{
            scaleX: squashStretch.x * (1 / scale),
            opacity: Math.max(0.15, Math.min(0.85, 0.85 - (scale - 1) * 1.8)),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
      )}

      {/* Main Egg Container: Inherits organic motion parameters (squash, stretch, rotation) */}
      <motion.div
        id="egg-body-container"
        className="relative w-full h-full flex items-center justify-center"
        style={{
          scaleX: scale * squashStretch.x,
          scaleY: scale * squashStretch.y,
          rotate: `${rotation}deg`,
          transformOrigin: "bottom center",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
      >
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] overflow-visible"
        >
          {/* Advanced definitions for multi-stage glows, linear gradients & clipping mask */}
          <defs>
            <radialGradient id="eggGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="25%" stopColor="#FFDF70" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#FF7A00" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF3C00" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="crackLeakGrad" cx="50%" cy="50%" r="40%">
              <stop offset="0%" stopColor="#FFFDF2" stopOpacity="1" />
              <stop offset="50%" stopColor="#FFC83D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
            </radialGradient>
            
            <linearGradient id="eggShellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5CD798" />
              <stop offset="55%" stopColor="#3FB877" />
              <stop offset="100%" stopColor="#227C4B" />
            </linearGradient>

            <clipPath id="eggShellClip">
              <path d="M 100 35 C 145 35, 172 75, 172 135 C 172 188, 140 215, 100 215 C 60 215, 28 188, 28 135 C 28 75, 55 35, 100 35 Z" />
            </clipPath>

            {/* Custom SVG filter for realistic flickering light bleed */}
            <filter id="flickerFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* NORMAL UNBURST MODE (Unified shell with progressive cracking layers) */}
          {!isBursting && (
            <g id="egg-normal-group">
              
              {/* 2. egg-base: Main green shell + brand golden spots + outline */}
              {layers.base && (
                <g id="egg-base">
                  {/* Egg base shell */}
                  <path
                    d="M 100 35 C 145 35, 172 75, 172 135 C 172 188, 140 215, 100 215 C 60 215, 28 188, 28 135 C 28 75, 55 35, 100 35 Z"
                    fill="url(#eggShellGrad)"
                    stroke={strokeColor}
                    strokeWidth="8.5"
                    strokeLinejoin="round"
                  />
                  
                  {/* Masked spots (Perfect bounding fit) */}
                  <g clipPath="url(#eggShellClip)">
                    {/* Brand Spots - Gold/yellow spots in organic, non-symmetric layout */}
                    <circle cx="70" cy="85" r="14" fill={spotColor} opacity="0.95" stroke={strokeColor} strokeWidth="3" />
                    <circle cx="130" cy="115" r="22" fill={spotColor} opacity="0.95" stroke={strokeColor} strokeWidth="3.5" />
                    <circle cx="78" cy="165" r="16" fill={spotColor} opacity="0.95" stroke={strokeColor} strokeWidth="3" />
                    <circle cx="145" cy="170" r="10" fill={spotColor} opacity="0.95" stroke={strokeColor} strokeWidth="2.5" />
                  </g>
                </g>
              )}

              {/* 3. egg-shine: Organic specular highlight layer */}
              {layers.shine && (
                <path
                  id="egg-shine"
                  d="M 72 55 C 55 75, 50 110, 52 140"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  opacity="0.38"
                  className="pointer-events-none"
                />
              )}

              {/* Glowing halo bleed behind the cracks when active */}
              {(layers.crack1 || layers.crack2 || layers.crack3) && (
                <g id="crack-glow-backing" opacity="0.85">
                  {/* Pulsating crack glow halos */}
                  <path
                    d="M 100 85 L 108 105 L 96 118 L 105 135"
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.25"
                    className="animate-pulse"
                  />
                  {layers.crack2 && (
                    <path
                      d="M 108 105 L 132 102 L 124 116 M 96 118 L 74 122 L 68 140"
                      fill="none"
                      stroke={glowColor}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}
                  {layers.crack3 && (
                    <path
                      d="M 105 135 L 94 158 L 112 172 M 124 116 L 145 125 L 158 112"
                      fill="none"
                      stroke={glowColor}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}
                </g>
              )}

              {/* 4. egg-crack-1: Light Crack Layer (First phase) */}
              {layers.crack1 && (
                <g id="egg-crack-1">
                  {/* Thick deep backing path */}
                  <path
                    d="M 100 85 L 108 105 L 96 118 L 105 135"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Glowing hot core path */}
                  <path
                    d="M 100 85 L 108 105 L 96 118 L 105 135"
                    fill="none"
                    stroke={glowCoreColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* 5. egg-crack-2: Medium Crack Layer (Second phase - branch out) */}
              {layers.crack2 && (
                <g id="egg-crack-2">
                  {/* Backing lines */}
                  <path
                    d="M 108 105 L 132 102 L 124 116 M 96 118 L 74 122 L 68 140"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Core glow lines */}
                  <path
                    d="M 108 105 L 132 102 L 124 116 M 96 118 L 74 122 L 68 140"
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* 6. egg-crack-3: Heavy Crack Layer (Third phase - deep cracks & split lines) */}
              {layers.crack3 && (
                <g id="egg-crack-3">
                  {/* Backing lines */}
                  <path
                    d="M 105 135 L 94 158 L 112 172 M 124 116 L 145 125 L 158 112"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Core glow lines */}
                  <path
                    d="M 105 135 L 94 158 L 112 172 M 124 116 L 145 125 L 158 112"
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Ejected splinter calcium shell particles around active cracks */}
              {layers.crack3 && (
                <g id="splinter-shards" className="animate-bounce">
                  {/* Fragment 1 */}
                  <polygon points="112,125 116,120 118,126" fill={shellColor} stroke={strokeColor} strokeWidth="2" />
                  {/* Fragment 2 */}
                  <polygon points="86,132 80,128 82,136" fill={spotColor} stroke={strokeColor} strokeWidth="1.5" />
                  {/* Sparkle spot */}
                  <circle cx="138" cy="110" r="2.5" fill={glowCoreColor} className="animate-ping" />
                  <circle cx="90" cy="154" r="2" fill={glowCoreColor} className="animate-pulse" />
                </g>
              )}

              {/* 7. egg-glow: Internal light leak glow radiating outwards */}
              {layers.glow && (
                <g id="egg-glow" style={{ mixBlendMode: "screen" }}>
                  <circle cx="106" cy="115" r="34" fill="url(#eggGlowGrad)" opacity="0.9" className="animate-pulse" />
                  <circle cx="95" cy="142" r="26" fill="url(#eggGlowGrad)" opacity="0.8" />
                  <circle cx="120" cy="98" r="22" fill="url(#eggGlowGrad)" opacity="0.7" />
                </g>
              )}
            </g>
          )}

          {/* BURSTING / REVEALING MODE (Separated egg shells that fly apart elegantly!) */}
          {isBursting && (
            <g id="egg-burst-group">
              
              {/* 8. egg-top: Upper egg shell wrapped in dynamic motion frame */}
              {layers.top && (
                <motion.g
                  id="egg-top"
                  initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                  animate={{ 
                    y: -110, 
                    x: -28, 
                    rotate: -35, 
                    opacity: 0 
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 110, 
                    damping: 10,
                    duration: 0.7 
                  }}
                >
                  {/* Upper shell jagged path */}
                  <path
                    d="M 28 125 C 28 75, 55 35, 100 35 C 145 35, 172 75, 172 125 L 142 120 L 128 135 L 110 115 L 98 130 L 78 115 L 55 135 L 28 125 Z"
                    fill="url(#eggShellGrad)"
                    stroke={strokeColor}
                    strokeWidth="8.5"
                    strokeLinejoin="round"
                  />
                  {/* Highlights and spots specifically on the upper shell */}
                  <path
                    d="M 72 55 C 60 70, 52 95, 52 115"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.35"
                  />
                  <circle cx="70" cy="85" r="14" fill={spotColor} stroke={strokeColor} strokeWidth="3" />
                  <circle cx="130" cy="115" r="22" fill={spotColor} stroke={strokeColor} strokeWidth="3.5" />
                </motion.g>
              )}

              {/* 9. egg-bottom: Lower egg shell sliding downwards with spring gravity bounce */}
              {layers.bottom && (
                <motion.g
                  id="egg-bottom"
                  initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                  animate={{ 
                    y: 24, 
                    x: 6, 
                    rotate: 15,
                    opacity: 0.7
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 90, 
                    damping: 14,
                    duration: 0.8
                  }}
                >
                  {/* Lower shell path */}
                  <path
                    d="M 28 125 L 55 135 L 78 115 L 98 130 L 110 115 L 128 135 L 142 120 L 172 125 C 172 175, 140 215, 100 215 C 60 215, 28 175, 28 125 Z"
                    fill="url(#eggShellGrad)"
                    stroke={strokeColor}
                    strokeWidth="8.5"
                    strokeLinejoin="round"
                  />
                  {/* Spots on lower shell */}
                  <circle cx="78" cy="165" r="16" fill={spotColor} stroke={strokeColor} strokeWidth="3" />
                  <circle cx="145" cy="170" r="10" fill={spotColor} stroke={strokeColor} strokeWidth="2.5" />
                </motion.g>
              )}

              {/* Massive cinematic blast halo during bursting sequence */}
              <circle cx="100" cy="125" r="55" fill="url(#eggGlowGrad)" opacity="0.95" className="mix-blend-screen" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
