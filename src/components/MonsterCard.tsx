import React from "react";
import { motion } from "motion/react";
import { MonsterData, RarityType } from "../types";
import { 
  Flame, 
  Droplet, 
  Leaf, 
  Zap, 
  Moon, 
  Sun, 
  Sparkles, 
  Wind, 
  Shield, 
  Swords, 
  Heart, 
  Gauge,
  Star
} from "lucide-react";

interface MonsterCardProps {
  monster: MonsterData;
  rarity: RarityType;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({ monster, rarity }) => {
  const { name, description, element, stats, colorTheme, visualFeatures } = monster;

  // Deep dark border color for organic child-like comic illustration
  const comicBorderColor = "#2B2540";

  // Get Element Icon with matching cute colored circle
  const getElementIcon = () => {
    const size = 16;
    switch (element) {
      case "Fire": 
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Flame size={size} className="text-red-500 fill-red-500" />
          </div>
        );
      case "Water": 
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Droplet size={size} className="text-blue-500 fill-blue-500" />
          </div>
        );
      case "Nature": 
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Leaf size={size} className="text-emerald-500 fill-emerald-500" />
          </div>
        );
      case "Electric": 
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Zap size={size} className="text-yellow-500 fill-yellow-500" />
          </div>
        );
      case "Darkness": 
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Moon size={size} className="text-purple-600 fill-purple-600" />
          </div>
        );
      case "Light": 
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Sun size={size} className="text-amber-500 fill-amber-500" />
          </div>
        );
      case "Cosmic": 
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Sparkles size={size} className="text-indigo-500" />
          </div>
        );
      case "Wind": 
        return (
          <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-[#2B2540] flex items-center justify-center shadow-sm">
            <Wind size={size} className="text-sky-500" />
          </div>
        );
    }
  };

  // Professional toy children's card borders & colors (Light, joyful, high quality cardboard feeling)
  const getRarityCardSpecs = () => {
    switch (rarity) {
      case "Common":
        return {
          frameBg: "bg-[#8CB7A5]", // Pastel green-sage cardboard border
          cardBg: "bg-[#FFFDF6]", // Cozy light eggshell white inside
          badgeBg: "bg-[#7AA694] text-white",
          stars: 1,
          lvl: "LV.8",
          ribbonBg: "bg-[#F7E1AD]",
          accentColor: "#4B9875"
        };
      case "Rare":
        return {
          frameBg: "bg-[#6BB7E6]", // Lovely soft blue cardboard border
          cardBg: "bg-[#FFFDF6]", 
          badgeBg: "bg-[#519DCC] text-white",
          stars: 2,
          lvl: "LV.15",
          ribbonBg: "bg-[#FFE7AD]",
          accentColor: "#398AC0"
        };
      case "Epic":
        return {
          frameBg: "bg-[#C49CE6]", // Soft playful lavendar card
          cardBg: "bg-[#FFFDF6]",
          badgeBg: "bg-[#AA7CCC] text-white",
          stars: 3,
          lvl: "LV.32",
          ribbonBg: "bg-[#FFF1C2]",
          accentColor: "#935CBF"
        };
      case "Legendary":
        return {
          frameBg: "bg-[#F7C643]", // Vivid bright gold cardboard frame
          cardBg: "bg-[#FFFDF4]",
          badgeBg: "bg-[#E3AA27] text-[#2B2540]",
          stars: 4,
          lvl: "LV.50",
          ribbonBg: "bg-[#FFF6D4]",
          accentColor: "#DF9319"
        };
    }
  };

  const specs = getRarityCardSpecs();

  // Procedural SVG Components
  const renderProceduralMonster = () => {
    const primary = colorTheme.primary;
    const secondary = colorTheme.secondary;
    const stroke = comicBorderColor;

    // Draw the body based on shape
    let bodyPath = "";
    switch (visualFeatures.bodyShape) {
      case "round":
        bodyPath = "M 100 60 C 145 60, 160 85, 160 115 C 160 145, 140 165, 100 165 C 60 165, 40 145, 40 115 C 40 85, 55 60, 100 60 Z";
        break;
      case "slender":
        bodyPath = "M 100 50 C 130 50, 145 75, 145 110 C 145 140, 125 160, 100 160 C 75 160, 55 140, 55 110 C 55 75, 70 50, 100 50 Z";
        break;
      case "chonk":
        bodyPath = "M 100 70 C 155 70, 175 95, 175 125 C 175 155, 145 170, 100 170 C 55 170, 25 155, 25 125 C 25 95, 45 70, 100 70 Z";
        break;
      case "star":
        bodyPath = "M 100 50 L 115 85 L 150 85 L 122 105 L 132 140 L 100 120 L 68 140 L 78 105 L 50 85 L 85 85 Z";
        break;
    }

    return (
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_6px_0_rgba(43,37,64,0.15)]">
        {/* Cute floor shadow ring */}
        <ellipse cx="100" cy="172" rx="48" ry="10" fill="#2B2540" opacity="0.15" />

        {/* Tail Layer */}
        {visualFeatures.tailType !== "none" && (
          <g>
            {visualFeatures.tailType === "fluffy" && (
              <path 
                d="M 50 140 C 20 140, 10 110, 25 95 C 40 80, 55 95, 50 120" 
                fill={secondary} 
                stroke={stroke} 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
            {visualFeatures.tailType === "spiky" && (
              <path 
                d="M 50 140 L 20 120 L 35 115 L 10 90 L 45 95 Z" 
                fill={secondary} 
                stroke={stroke} 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
            {visualFeatures.tailType === "aquatic" && (
              <path 
                d="M 50 140 C 30 150, 10 140, 15 115 C 18 100, 35 115, 45 125" 
                fill={secondary} 
                stroke={stroke} 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
          </g>
        )}

        {/* Main Body */}
        <path 
          d={bodyPath} 
          fill={primary} 
          stroke={stroke} 
          strokeWidth="7.5" 
          strokeLinejoin="round" 
        />

        {/* Highlights / Shine */}
        <path 
          d="M 75 75 C 65 85, 65 105, 75 115" 
          fill="none" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.45" 
        />

        {/* Pattern Overlays */}
        {visualFeatures.pattern === "spots" && (
          <g fill={secondary} opacity="0.85">
            <circle cx="75" cy="95" r="8" />
            <circle cx="120" cy="140" r="12" />
            <circle cx="65" cy="130" r="6" />
            <circle cx="130" cy="90" r="7" />
          </g>
        )}
        {visualFeatures.pattern === "stripes" && (
          <g stroke={secondary} strokeWidth="6" strokeLinecap="round" opacity="0.8">
            <path d="M 45 110 Q 60 110 65 105" />
            <path d="M 45 130 Q 65 130 70 120" />
            <path d="M 155 110 Q 140 110 135 105" />
            <path d="M 155 130 Q 135 130 130 120" />
          </g>
        )}
        {visualFeatures.pattern === "stars" && (
          <g fill="#FFD700" opacity="0.95">
            <path d="M 75 90 L 77 94 L 81 94 L 78 96 L 79 100 L 75 98 L 71 100 L 72 96 L 69 94 L 73 94 Z" />
            <path d="M 125 130 L 127 134 L 131 134 L 128 136 L 129 140 L 125 138 L 121 140 L 122 136 L 119 134 L 123 134 Z" />
          </g>
        )}
        {visualFeatures.pattern === "bubbles" && (
          <g fill="none" stroke="white" strokeWidth="2.5" opacity="0.75">
            <circle cx="75" cy="100" r="6" />
            <circle cx="125" cy="130" r="9" />
            <circle cx="70" cy="125" r="4" />
            <circle cx="130" cy="95" r="5" />
          </g>
        )}

        {/* Horn Layer */}
        {visualFeatures.hornType !== "none" && (
          <g>
            {visualFeatures.hornType === "single" && (
              <path 
                d="M 100 63 L 100 25 L 110 45 L 100 63" 
                fill="#FFC83D" 
                stroke={stroke} 
                strokeWidth="6.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
            {visualFeatures.hornType === "dual" && (
              <g>
                <path 
                  d="M 80 65 Q 60 40, 50 45 Q 68 55, 80 65" 
                  fill="#FFC83D" 
                  stroke={stroke} 
                  strokeWidth="6.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M 120 65 Q 140 40, 150 45 Q 132 55, 120 65" 
                  fill="#FFC83D" 
                  stroke={stroke} 
                  strokeWidth="6.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </g>
            )}
            {visualFeatures.hornType === "crown" && (
              <path 
                d="M 75 62 L 70 35 L 88 48 L 100 30 L 112 48 L 130 35 L 125 62 Z" 
                fill="#FFC83D" 
                stroke={stroke} 
                strokeWidth="6.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
          </g>
        )}

        {/* Eyes based on Style */}
        <g>
          {visualFeatures.eyeStyle === "cute" && (
            <g>
              <circle cx="80" cy="105" r="10.5" fill={stroke} />
              <circle cx="78" cy="101" r="4" fill="white" />
              <circle cx="83" cy="108" r="1.5" fill="white" />
              <circle cx="120" cy="105" r="10.5" fill={stroke} />
              <circle cx="118" cy="101" r="4" fill="white" />
              <circle cx="123" cy="108" r="1.5" fill="white" />
              <ellipse cx="68" cy="115" rx="5.5" ry="3.5" fill="#FF83A8" opacity="0.85" />
              <ellipse cx="132" cy="115" rx="5.5" ry="3.5" fill="#FF83A8" opacity="0.85" />
            </g>
          )}
          {visualFeatures.eyeStyle === "sleepy" && (
            <g stroke={stroke} strokeWidth="6" strokeLinecap="round" fill="none">
              <path d="M 68 110 Q 80 115, 90 110" />
              <path d="M 110 110 Q 120 115, 132 110" />
            </g>
          )}
          {visualFeatures.eyeStyle === "cool" && (
            <g>
              <path 
                d="M 65 100 L 135 100 L 130 114 C 120 120, 110 110, 100 110 C 90 110, 80 120, 70 114 Z" 
                fill="#2B2540" 
                stroke={stroke} 
                strokeWidth="5" 
                strokeLinejoin="round" 
              />
              <line x1="80" y1="104" x2="90" y2="108" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="110" y1="104" x2="120" y2="108" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            </g>
          )}
          {visualFeatures.eyeStyle === "excited" && (
            <g>
              <g fill="#FFC83D" stroke={stroke} strokeWidth="2" strokeLinejoin="round">
                <path d="M 80 94 L 83 102 L 91 102 L 85 106 L 87 114 L 80 109 L 73 114 L 75 106 L 69 102 L 77 102 Z" />
                <path d="M 120 94 L 123 102 L 131 102 L 125 106 L 127 114 L 120 109 L 113 114 L 115 106 L 109 102 L 117 102 Z" />
              </g>
              <ellipse cx="68" cy="118" rx="6" ry="4" fill="#FF5E85" opacity="0.9" />
              <ellipse cx="132" cy="118" rx="6" ry="4" fill="#FF5E85" opacity="0.9" />
            </g>
          )}
        </g>

        {/* Happy Smile Mouth */}
        <path 
          d="M 94 122 Q 100 128, 106 122" 
          fill="none" 
          stroke={stroke} 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
      </svg>
    );
  };

  return (
    <motion.div 
      id="summoned-monster-card"
      initial={{ scale: 0.95, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 18
      }}
      className={`relative w-[330px] h-[500px] ${specs.frameBg} rounded-3xl p-[11px] select-none shadow-[0_16px_40px_rgba(16,9,44,0.4)] flex flex-col border-[4px] border-[#2B2540] overflow-hidden`}
    >
      {/* Soft inner paper card body */}
      <div className={`relative w-full h-full ${specs.cardBg} rounded-[18px] border-2 border-[#2B2540] p-4 flex flex-col justify-between overflow-hidden shadow-inner`}>
        
        {/* Child-friendly cute diagonal background texture lines */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(45deg,#2B2540_25%,transparent_25%,transparent_50%,#2B2540_50%,#2B2540_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
        
        {/* Card Header (Level, Stars & Element) */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            {getElementIcon()}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono leading-none">
                {element} TYPE
              </span>
              <span className="text-sm font-black text-[#2B2540] tracking-tight leading-none">
                {name}
              </span>
            </div>
          </div>

          {/* Level Badge and Star Stamp */}
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono font-black text-xs text-[#2B2540] px-1.5 py-0.5 rounded-md bg-[#2B2540]/10 border border-[#2B2540]/25">
              {specs.lvl}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: specs.stars }).map((_, i) => (
                <Star key={i} size={11} className="text-[#FFBF1A] fill-[#FFBF1A]" />
              ))}
            </div>
          </div>
        </div>

        {/* Illustrated Landscape Window Container */}
        <div className="relative w-full h-[200px] bg-gradient-to-b from-sky-100 to-amber-50 border-2 border-[#2B2540] rounded-xl my-3 overflow-hidden flex items-center justify-center">
          
          {/* Adorable cartoon scenery background */}
          {/* Subtle sunrays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,231,173,0.6)_0%,transparent_60%)]" />
          
          {/* Cute cartoon clouds */}
          <div className="absolute top-4 left-4 w-12 h-6 bg-white/70 rounded-full blur-[1px]" />
          <div className="absolute top-8 right-6 w-16 h-8 bg-white/75 rounded-full blur-[1px]" />
          
          {/* Cute green rolling hills at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-emerald-100/80 border-t border-[#2B2540]/10" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-200/90" />

          {/* Sparkles for Epic and Legendary */}
          {rarity !== "Common" && (
            <div className="absolute inset-0 overflow-hidden opacity-85 pointer-events-none">
              <Sparkles size={14} className="absolute top-6 right-16 text-yellow-400/80 animate-bounce" />
              <Sparkles size={10} className="absolute bottom-8 left-12 text-yellow-300/90 animate-pulse" />
              <Sparkles size={12} className="absolute top-16 left-8 text-amber-400/75 animate-bounce delay-300" />
            </div>
          )}

          {/* The Cute Creature Vector */}
          <div className="w-[165px] h-[165px] z-10 transform hover:scale-105 transition-transform duration-300">
            {renderProceduralMonster()}
          </div>
        </div>

        {/* Monster Description inside a neat child paper ribbon */}
        <div className={`relative px-3 py-2 border-2 border-[#2B2540] rounded-xl ${specs.ribbonBg} shadow-sm z-10`}>
          <p className="text-xs text-[#2B2540] font-medium leading-relaxed font-sans opacity-95">
            {description}
          </p>
        </div>

        {/* Stats Section with playful children's colors */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-black text-[#2B2540] mt-3 z-10">
          {/* HP */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center px-0.5">
              <span className="flex items-center gap-1">
                <Heart size={11} className="text-red-500 fill-red-500" /> HP
              </span>
              <span className="font-mono text-[11px]">{stats.hp}</span>
            </div>
            <div className="h-2.5 bg-white border-2 border-[#2B2540] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stats.hp / 110) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-[#FF7070]"
              />
            </div>
          </div>

          {/* ATTACK */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center px-0.5">
              <span className="flex items-center gap-1">
                <Swords size={11} className="text-orange-500" /> ATK
              </span>
              <span className="font-mono text-[11px]">{stats.attack}</span>
            </div>
            <div className="h-2.5 bg-white border-2 border-[#2B2540] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stats.attack / 110) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-[#FFA052]"
              />
            </div>
          </div>

          {/* DEFENSE */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center px-0.5">
              <span className="flex items-center gap-1">
                <Shield size={11} className="text-emerald-500 fill-emerald-500" /> DEF
              </span>
              <span className="font-mono text-[11px]">{stats.defense}</span>
            </div>
            <div className="h-2.5 bg-white border-2 border-[#2B2540] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stats.defense / 110) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-[#5CD798]"
              />
            </div>
          </div>

          {/* SPEED */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center px-0.5">
              <span className="flex items-center gap-1">
                <Gauge size={11} className="text-sky-500" /> SPD
              </span>
              <span className="font-mono text-[11px]">{stats.speed}</span>
            </div>
            <div className="h-2.5 bg-white border-2 border-[#2B2540] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stats.speed / 110) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-[#5CBBEA]"
              />
            </div>
          </div>
        </div>

        {/* Tiny foot watermark stamp */}
        <div className="flex justify-between items-center text-[8px] font-mono font-bold text-[#2B2540]/40 mt-2 px-0.5">
          <span>SPM-CARD #009-PRO</span>
          <span>© SNAPMONSTER LAB</span>
        </div>
      </div>
    </motion.div>
  );
};
