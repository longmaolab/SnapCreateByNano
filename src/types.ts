export type ElementType = "Fire" | "Water" | "Nature" | "Electric" | "Darkness" | "Light" | "Cosmic" | "Wind";

export type RarityType = "Common" | "Rare" | "Epic" | "Legendary";

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface VisualFeatures {
  bodyShape: "round" | "slender" | "chonk" | "star";
  hornType: "none" | "single" | "dual" | "crown";
  eyeStyle: "cute" | "sleepy" | "cool" | "excited";
  pattern: "spots" | "stripes" | "stars" | "bubbles";
  tailType: "fluffy" | "spiky" | "aquatic" | "none";
}

export interface MonsterData {
  name: string;
  description: string;
  element: ElementType;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  colorTheme: ColorTheme;
  visualFeatures: VisualFeatures;
}

export type LanguageType = "zh" | "en" | "ja";

export type HatchState = 
  | "idle"        // Ready to incubate
  | "gathering"   // 0 - 0.8s: Energy aggregation
  | "breathing"   // 0.8s - 3s: Soft breathing, faint heartbeat
  | "heartbeat"   // 3s - 6s: Crack 1, faster heartbeat
  | "cracking"    // 6s - 10s: Crack 2, Crack 3, small jumps
  | "glow"        // >10s: Golden light leak, ready to pop
  | "bursting"    // Pre-birth explosion
  | "revealed";   // Monster revealed

export interface EggLayerConfig {
  base: boolean;
  shadow: boolean;
  shine: boolean;
  crack1: boolean;
  crack2: boolean;
  crack3: boolean;
  glow: boolean;
  top: boolean;
  bottom: boolean;
}
