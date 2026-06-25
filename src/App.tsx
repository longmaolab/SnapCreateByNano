import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  Languages, 
  Play, 
  RotateCcw, 
  Layers, 
  HelpCircle, 
  AlertTriangle,
  Flame,
  CheckCircle,
  Clock,
  Music,
  Plus
} from "lucide-react";
import { 
  ElementType, 
  RarityType, 
  MonsterData, 
  LanguageType, 
  HatchState, 
  EggLayerConfig 
} from "./types";
import { Egg } from "./components/Egg";
import { MonsterCard } from "./components/MonsterCard";
import { 
  playHeartbeat, 
  playCrack, 
  playDing, 
  playPop 
} from "./utils/sfx";

export default function App() {
  // Config States
  const [lang, setLang] = useState<LanguageType>("zh");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rarity, setRarity] = useState<RarityType>("Epic");
  const [promptInput, setPromptInput] = useState<string>("A cute little woodland thunder dragon with gold horns");
  const [waitDuration, setWaitDuration] = useState<number>(6); // Default 6 seconds wait
  const [manualMode, setManualMode] = useState<boolean>(false);

  // Simulation / Game Playback States
  const [hatchState, setHatchState] = useState<HatchState>("idle");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [summonedMonster, setSummonedMonster] = useState<MonsterData | null>(null);
  const [summonHistory, setSummonHistory] = useState<(MonsterData & { rarity: RarityType; date: string })[]>([]);
  const [loadingMonster, setLoadingMonster] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTimeoutAlert, setShowTimeoutAlert] = useState<boolean>(false);

  // Egg Animation Specs
  const [eggScale, setEggScale] = useState<number>(1.0);
  const [eggRotation, setEggRotation] = useState<number>(0);
  const [squashStretch, setSquashStretch] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Manual inspector toggles (can override standard flow when idle)
  const [manualLayers, setManualLayers] = useState<EggLayerConfig>({
    base: true,
    shadow: true,
    shine: true,
    crack1: false,
    crack2: false,
    crack3: false,
    glow: false,
    top: true,
    bottom: true
  });

  // Timers and Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const monsterDataRef = useRef<MonsterData | null>(null);

  // Wordings for Hatching and Fallbacks
  const t = {
    zh: {
      title: "SnapMonster 孵化仪式",
      subtitle: "召唤等待 & 破壳动效验证实验室 (v2.0 Spec)",
      summonBtn: "召唤并开始孵化",
      summoning: "能量汇聚中...",
      waitingPrompt: "🥚 怪兽正在成形…",
      timeoutTitle: "AI 卡图仍在绘制中",
      timeoutBody: "先收服也没问题，完成后会自动换成精美卡图。",
      catchNow: "立即收服怪兽",
      reset: "重置仪式",
      promptLabel: "召唤咒语 (描述你想要的怪兽)",
      rarityLabel: "稀有度等级",
      timerLabel: "孵化等待时长",
      secs: "秒",
      unlimited: "手动控制",
      designerLab: "设计师控制台 (Audit Panel)",
      stateOverride: "孵化阶段模拟",
      layerInspector: "蛋体图层检测 (Layer Inspector)",
      soundBoard: "音效声学测试 (Sfx Board)",
      historyTitle: "召唤历史记录",
      soundOn: "音效已开启",
      soundOff: "音效已禁用",
      apiStatus: "Gemini 状态",
      activeLayers: "活跃图层",
      stats: "属性",
      organicPrinciple: "生命感原则：蛋绝不对称，拥有重量感与内部张力",
      howToUse: "点击召唤按钮，体验 3s - 10s 的渐进式孵化动画与 WebAudio 实时合成音色。"
    },
    en: {
      title: "SnapMonster Hatching Ceremony",
      subtitle: "Summoning Waiting & Hatching FX Design Lab (v2.0 Spec)",
      summonBtn: "Summon & Incubate",
      summoning: "Gathering energy...",
      waitingPrompt: "🥚 Your monster is taking shape…",
      timeoutTitle: "Final artwork is still being made",
      timeoutBody: "Catch it now — the polished art swaps in automatically when ready.",
      catchNow: "Catch Monster Now",
      reset: "Reset Ceremony",
      promptLabel: "Summoning Incantation",
      rarityLabel: "Summoning Rarity",
      timerLabel: "Incubation Delay",
      secs: "seconds",
      unlimited: "Manual Control",
      designerLab: "Designer Deck (Audit Panel)",
      stateOverride: "Phase Simulators",
      layerInspector: "Egg Layers Inspector",
      soundBoard: "Sound FX Acoustic Audit",
      historyTitle: "Summoning History",
      soundOn: "Acoustics On",
      soundOff: "Acoustics Off",
      apiStatus: "Gemini Engine",
      activeLayers: "Active Layers",
      stats: "Stats",
      organicPrinciple: "Living Principle: Asymmetry, squash & stretch weight feel.",
      howToUse: "Click Summon to experience the 3s - 10s progressive animation and synthesized WebAudio SFX."
    },
    ja: {
      title: "SnapMonster 孵化の儀式",
      subtitle: "召喚待機＆孵化アニメーション検証ラボ (v2.0 Spec)",
      summonBtn: "召喚＆孵化を開始",
      summoning: "エネルギー収束中...",
      waitingPrompt: "🥚 モンスターが育っている…",
      timeoutTitle: "AIカードアートを制作中",
      timeoutBody: "先にキャッチしてOK。完成したら自動で精密カードに切り替わります。",
      catchNow: "今すぐモンスターをキャッチ",
      reset: "儀式をリセット",
      promptLabel: "召喚呪文 (モンスターの説明)",
      rarityLabel: "レアリティ",
      timerLabel: "孵化の待機時間",
      secs: "秒",
      unlimited: "手動コントロール",
      designerLab: "デザイナーコントロール (Audit Panel)",
      stateOverride: "各フェーズのシミュレート",
      layerInspector: "エッグレイヤーの確認",
      soundBoard: "音響効果の確認 (Sfx Board)",
      historyTitle: "召喚の記録",
      soundOn: "音響オン",
      soundOff: "音響オフ",
      apiStatus: "Gemini ステータス",
      activeLayers: "有効レイヤー",
      stats: "ステータス",
      organicPrinciple: "生命感の原則：非対称、重量感、内部の膨張感",
      howToUse: "召喚ボタンをクリックして、3秒から10秒の孵化儀式とWebAudio合成効果音を体験してください。"
    }
  };

  // Helper to trigger correct localized audio
  const playSfx = (type: "heartbeat" | "crack" | "ding" | "pop") => {
    if (!soundEnabled) return;
    if (type === "heartbeat") playHeartbeat(0.4);
    else if (type === "crack") playCrack(0.25);
    else if (type === "ding") playDing(0.22);
    else if (type === "pop") playPop(0.35);
  };

  // Compute active layers based on state
  const getActiveLayers = (): EggLayerConfig => {
    if (hatchState === "idle") {
      return manualLayers;
    }

    const layers: EggLayerConfig = {
      base: true,
      shadow: true,
      shine: true,
      crack1: false,
      crack2: false,
      crack3: false,
      glow: false,
      top: false,
      bottom: false
    };

    switch (hatchState) {
      case "gathering":
        // Base intact, no cracks, light shadow
        break;
      case "breathing":
        // Faint heartbeat, pure egg
        break;
      case "heartbeat":
        // Crack 1 appears
        layers.crack1 = true;
        break;
      case "cracking":
        // Cracks propagate
        layers.crack1 = true;
        layers.crack2 = true;
        layers.crack3 = true;
        break;
      case "glow":
        // Ultimate cracks + warm leakage glows
        layers.crack1 = true;
        layers.crack2 = true;
        layers.crack3 = true;
        layers.glow = true;
        break;
      case "bursting":
        // Split shells
        layers.top = true;
        layers.bottom = true;
        layers.glow = true;
        break;
      case "revealed":
        // Hidden entirely or egg remains split under card
        layers.bottom = true;
        break;
    }
    return layers;
  };

  // Determine prompt templates for easy design selection
  const templates = [
    { name: "PiroChonk 🔥", prompt: "A round chubby fire-kitty with single small horn, warm red theme and spots" },
    { name: "SporeSprout 🌿", prompt: "A slender forest spore mushroom creature with dual crown, nature element" },
    { name: "GlowVolt ⚡", prompt: "An energetic star shaped lightning beast with dual golden horns" },
    { name: "CosmicBlob 🌌", prompt: "A purple chonk cosmic nebula creature with stars pattern, friendly cute eyes" }
  ];

  // Start the actual summon sequence (Incubation Ceremony!)
  const startIncubation = async () => {
    if (hatchState !== "idle" && hatchState !== "revealed") return;

    // Reset parameters
    setHatchState("gathering");
    setElapsedTime(0);
    setSummonedMonster(null);
    setErrorMessage(null);
    setShowTimeoutAlert(false);
    monsterDataRef.current = null;
    setLoadingMonster(true);

    startTimeRef.current = Date.now();

    // Trigger backend API immediately in the background
    fetch("/api/summon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptInput, rarity })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.monster) {
          monsterDataRef.current = data.monster;
          console.log("Incubated Monster received successfully:", data.monster);
        } else {
          setErrorMessage(data.error || "Summon failed");
        }
        setLoadingMonster(false);
      })
      .catch((err) => {
        console.error("Summon request failed", err);
        setErrorMessage(err.message || "Network Summon error");
        setLoadingMonster(false);
      });

    // 1. First Phase: 0 - 0.8s (Energy Gathering)
    playSfx("heartbeat");
    setSquashStretch({ x: 0.9, y: 1.15 });
    setEggScale(1.05);

    setTimeout(() => {
      setSquashStretch({ x: 1.05, y: 0.95 });
      setEggScale(1.0);
    }, 400);

    // Start Timeline Interval
    const tickRate = 100; // Tick every 100ms
    let localElapsed = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

    intervalRef.current = setInterval(() => {
      localElapsed += 0.1;
      setElapsedTime(parseFloat(localElapsed.toFixed(1)));

      const progress = localElapsed / waitDuration;

      // Hatching Phase Transitions
      if (progress < 0.15) {
        if (hatchState !== "gathering") setHatchState("gathering");
      } else if (progress >= 0.15 && progress < 0.45) {
        if (hatchState !== "breathing") setHatchState("breathing");
      } else if (progress >= 0.45 && progress < 0.70) {
        if (hatchState !== "heartbeat") {
          setHatchState("heartbeat");
          playSfx("crack"); // Crack 1 crack sound!
          setIsScreenShaking(true);
          setTimeout(() => setIsScreenShaking(false), 150);
          // Small jump shake
          setEggRotation(-4);
          setSquashStretch({ x: 1.06, y: 0.94 });
          setTimeout(() => {
            setEggRotation(4);
            setTimeout(() => setEggRotation(0), 100);
          }, 100);
        }
      } else if (progress >= 0.70 && progress < 0.95) {
        if (hatchState !== "cracking") {
          setHatchState("cracking");
          playSfx("crack"); // Crack 2 & 3 crack sound!
          setIsScreenShaking(true);
          setTimeout(() => setIsScreenShaking(false), 220);
          // Bigger jump
          triggerJump(6);
        }
      } else if (localElapsed >= waitDuration) {
        // We have passed the expected wait time.
        // Let's check if the AI card has completed drawing.
        if (monsterDataRef.current) {
          // Ready to hatch! Enter glow stage then trigger burst automatically
          if (hatchState !== "glow" && hatchState !== "bursting" && hatchState !== "revealed") {
            setHatchState("glow");
            playSfx("ding"); // Promising ding chime!
            
            // Pulse rapidly
            setEggScale(1.15);
            setIsScreenShaking(true);
            setTimeout(() => setIsScreenShaking(false), 250);
            setTimeout(() => {
              triggerBurst();
            }, 1200);
          }
        } else {
          // Timeout! AI is still generating, show the friendly worldbuilding card
          setShowTimeoutAlert(true);
        }
      }
    }, tickRate);

    // Heartbeat Rhythm Synthesizer Loops
    const triggerHeartbeatLoop = () => {
      if (localElapsed >= waitDuration) return;

      // Pulse animations
      setEggScale(1.07);
      setSquashStretch({ x: 1.04, y: 0.96 });
      playSfx("heartbeat");

      // Squash and stretch settles back
      setTimeout(() => {
        setEggScale(1.0);
        setSquashStretch({ x: 0.97, y: 1.03 });
        setTimeout(() => {
          setSquashStretch({ x: 1.0, y: 1.0 });
        }, 150);
      }, 100);

      // Speed up heartbeat rhythm as egg cracks more!
      const progress = localElapsed / waitDuration;
      let nextDelay = 1800; // 0% - 45% progress
      if (progress >= 0.45 && progress < 0.70) {
        nextDelay = 1200; // 45% - 70% progress
      } else if (progress >= 0.70) {
        nextDelay = 750;  // > 70% progress (imminent hatching!)
      }

      heartbeatTimerRef.current = setTimeout(triggerHeartbeatLoop, nextDelay);
    };

    // Initialize heartbeat loop after gathering phase completes
    setTimeout(() => {
      triggerHeartbeatLoop();
    }, 800);
  };

  // Heavy jumping with squash, stretch, overshoot, and settle
  const triggerJump = (intensity: number) => {
    // 1. Anticipation down
    setSquashStretch({ x: 1.12, y: 0.88 });
    
    setTimeout(() => {
      // 2. Jump Up (squash is elongated)
      setSquashStretch({ x: 0.88, y: 1.15 });
      setEggScale(1.1 + (intensity * 0.02));
      setEggRotation(Math.random() > 0.5 ? 4 : -4);
      
      // Screen shake on rare/legendary jumps
      if (rarity === "Epic" || rarity === "Legendary") {
        setIsScreenShaking(true);
        setTimeout(() => setIsScreenShaking(false), 200);
      }

      setTimeout(() => {
        // 3. Fall & Land (squashed flat)
        setSquashStretch({ x: 1.15, y: 0.82 });
        setEggScale(0.95);
        setEggRotation(0);
        playSfx("crack");

        setTimeout(() => {
          // 4. Settle back to normal
          setSquashStretch({ x: 1.0, y: 1.0 });
          setEggScale(1.0);
        }, 150);
      }, 250);
    }, 120);
  };

  // Burst and crack open sequence!
  const triggerBurst = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);

    setHatchState("bursting");
    
    // Screen shake
    setIsScreenShaking(true);
    playSfx("pop"); // Cheerfull popping boom sound!

    // Extreme scale before explosion
    setEggScale(1.25);
    setSquashStretch({ x: 1.1, y: 0.9 });

    setTimeout(() => {
      // Complete burst state
      setHatchState("revealed");
      setIsScreenShaking(false);
      
      // Retrieve loaded monster or use procedural fallback
      const finalMonster = monsterDataRef.current || {
        name: "Procedural Egglet",
        description: "A mysterious egg creature that hatched before the artwork could finish.",
        element: "Nature",
        stats: { hp: 70, attack: 65, defense: 80, speed: 50 },
        colorTheme: { primary: "#3FB877", secondary: "#FFC83D", accent: "#2B2540" },
        visualFeatures: {
          bodyShape: "round",
          hornType: "single",
          eyeStyle: "excited",
          pattern: "spots",
          tailType: "none"
        }
      };

      setSummonedMonster(finalMonster);

      // Save into summon history log
      setSummonHistory((prev) => [
        {
          ...finalMonster,
          rarity,
          date: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    }, 600);
  };

  // Force reveal immediately for timeouts
  const forceCatchNow = () => {
    setShowTimeoutAlert(false);
    // If we have local database fallback ready, use it immediately
    if (!monsterDataRef.current) {
      monsterDataRef.current = {
        name: "Swift Hatch",
        description: "Hatched quickly during the ceremony. Highly adaptive and cheerful.",
        element: "Wind",
        stats: { hp: 80, attack: 70, defense: 60, speed: 100 },
        colorTheme: { primary: "#3A9EFF", secondary: "#FFC83D", accent: "#2B2540" },
        visualFeatures: {
          bodyShape: "slender",
          hornType: "none",
          eyeStyle: "cute",
          pattern: "stripes",
          tailType: "fluffy"
        }
      };
    }
    triggerBurst();
  };

  // Reset Simulator
  const resetCeremony = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);

    setHatchState("idle");
    setElapsedTime(0);
    setSummonedMonster(null);
    setErrorMessage(null);
    setShowTimeoutAlert(false);
    setEggScale(1.0);
    setEggRotation(0);
    setSquashStretch({ x: 1, y: 1 });
    monsterDataRef.current = null;
  };

  // Handle designer panel overrides
  const setDesignerState = (state: HatchState) => {
    setHatchState(state);
    if (state === "idle") {
      setSummonedMonster(null);
    } else if (state === "revealed") {
      setSummonedMonster({
        name: "Audit Chonk",
        description: "A test model designed to inspect egg alignment. It loves being audited.",
        element: "Cosmic",
        stats: { hp: 100, attack: 50, defense: 90, speed: 40 },
        colorTheme: { primary: "#9A33FF", secondary: "#3FB877", accent: "#2B2540" },
        visualFeatures: {
          bodyShape: "chonk",
          hornType: "crown",
          eyeStyle: "cool",
          pattern: "stars",
          tailType: "spiky"
        }
      });
    } else {
      setSummonedMonster(null);
    }
  };

  // Toggle audio test
  const testAudio = (type: "heartbeat" | "crack" | "ding" | "pop") => {
    playSfx(type);
  };

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    };
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#0e0a24] text-slate-100 font-sans flex flex-col transition-all duration-300"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 30%, #1c1544 0%, #0d0921 100%)"
      }}
    >
      {/* Dynamic Star dust Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-12 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-500" />
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping delay-200" />
      </div>

      {/* Main Header navigation */}
      <header className="border-b border-white/10 bg-[#120E2E]/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-gradient-to-tr from-[#3FB877] to-[#FFC83D] rounded-xl flex items-center justify-center shadow-inner overflow-hidden border-2 border-[#2B2540]">
            <span className="font-black text-[#2B2540] text-lg select-none">🥚</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {t[lang].title}
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                v2.0 Spec
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {t[lang].subtitle}
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Acoustics Switcher */}
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-mono transition-all duration-200 ${
              soundEnabled 
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-inner" 
                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
            }`}
            title={soundEnabled ? t[lang].soundOn : t[lang].soundOff}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{soundEnabled ? "Sfx On" : "Sfx Off"}</span>
          </button>

          {/* Lang Selector */}
          <div className="bg-[#1b1542]/90 border border-white/10 rounded-xl p-0.5 flex gap-0.5 shadow-md">
            {(["zh", "en", "ja"] as LanguageType[]).map((l) => (
              <button
                key={l}
                id={`lang-select-${l}`}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  lang === l
                    ? "bg-[#3FB877] text-[#2B2540] shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10">
        
        {/* Summon Altar / Ceremonial Arena (Left 7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative aspect-video lg:aspect-auto lg:h-[580px] bg-gradient-to-b from-[#1b1542] to-[#120B2E] border-2 border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 shadow-2xl">
            
            {/* Spotlight background effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-radial from-[#FFC83D]/10 to-transparent pointer-events-none filter blur-[40px] opacity-70" />
            
            {/* Rarity ambient burst shine */}
            {hatchState !== "idle" && hatchState !== "revealed" && (
              <div 
                className={`absolute inset-0 pointer-events-none transition-opacity duration-500 mix-blend-screen filter blur-[60px] ${
                  rarity === "Legendary" ? "opacity-30" : rarity === "Epic" ? "opacity-20" : "opacity-10"
                }`}
                style={{
                  background: `radial-gradient(circle at center, #FFC83D 0%, transparent 70%)`
                }}
              />
            )}

            {/* Stage Title Overlay */}
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#FFC83D] font-bold">
                Summoning Stage
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3FB877] animate-pulse" />
                <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  {hatchState}
                </span>
              </div>
            </div>

            {/* Altar Area Content */}
            <AnimatePresence mode="wait">
              {hatchState === "revealed" && summonedMonster ? (
                // Beautiful Reveal Container
                <motion.div 
                  key="reveal"
                  initial={{ scale: 0.7, rotateY: 90, opacity: 0 }}
                  animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className="flex flex-col items-center gap-4 z-10 relative"
                >
                  {/* Explosion Ray Burst */}
                  <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(255,200,61,0.2)_0%,transparent_75%)] animate-pulse pointer-events-none" />
                  
                  {/* Card Sparkles */}
                  <div className="absolute -top-12 left-10 text-yellow-300 animate-bounce text-xl">✨</div>
                  <div className="absolute bottom-10 right-4 text-emerald-400 animate-ping text-lg">✨</div>

                  <MonsterCard monster={summonedMonster} rarity={rarity} />

                  {/* Reset Actions */}
                  <button
                    id="ceremony-reset-btn"
                    onClick={resetCeremony}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-slate-100 hover:text-white border border-white/20 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 mt-2 hover:scale-[1.02] shadow-lg font-mono uppercase tracking-wider"
                  >
                    <RotateCcw size={16} />
                    {t[lang].reset}
                  </button>
                </motion.div>
              ) : (
                // Ceremonial waiting or initial idle stage
                <motion.div 
                  key="incubating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center w-full z-10"
                >
                  {/* Floating particle stream in Epic / Legendary waiting cycles */}
                  {hatchState !== "idle" && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {Array.from({ length: rarity === "Legendary" ? 18 : rarity === "Epic" ? 10 : 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="absolute w-2 h-2 bg-gradient-to-tr from-[#3FB877] to-[#FFC83D] rounded-full filter blur-[1px]"
                          style={{
                            left: `${15 + Math.random() * 70}%`,
                            bottom: "20%",
                            opacity: 0.7,
                            animation: `bounce ${2 + Math.random() * 3}s infinite ease-in-out ${Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Egg representation */}
                  <div className={`relative select-none scale-110 lg:scale-125 transform-gpu cursor-pointer transition-transform duration-100 ${
                    isScreenShaking ? "animate-wiggle" : ""
                  }`}>
                    <Egg
                      layers={getActiveLayers()}
                      scale={eggScale}
                      rotation={eggRotation}
                      squashStretch={squashStretch}
                      isBursting={hatchState === "bursting"}
                    />
                    
                    {/* Ripple shockwave element on bursting */}
                    {hatchState === "bursting" && (
                      <div className="absolute inset-0 bg-[#FFC83D]/25 rounded-full animate-ping filter blur-sm pointer-events-none" />
                    )}
                  </div>

                  {/* State specific instructions or waiting strings */}
                  <div className="mt-8 text-center px-4 max-w-sm flex flex-col gap-2">
                    {hatchState === "idle" ? (
                      <>
                        <h3 className="text-white font-bold text-lg">
                          {t[lang].title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {t[lang].howToUse}
                        </p>
                        
                        {/* Start Ceremony Button */}
                        <button
                          id="ceremony-summon-btn"
                          onClick={startIncubation}
                          disabled={loadingMonster && hatchState !== "idle"}
                          className="mt-4 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#3FB877] to-[#FFC83D] text-[#2B2540] font-black font-mono text-sm px-8 py-4 rounded-2xl shadow-xl hover:shadow-[#3FB877]/10 hover:scale-[1.03] active:scale-95 transition-all duration-200"
                        >
                          <Play size={16} fill="#2B2540" />
                          {t[lang].summonBtn.toUpperCase()}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Worldbuilding translation wait text */}
                        <h4 className="text-emerald-300 font-bold font-mono text-base tracking-wide flex items-center justify-center gap-2 animate-pulse">
                          <span>🥚</span>
                          <span>{t[lang].waitingPrompt}</span>
                        </h4>

                        {/* Interactive dynamic progress ticker */}
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>Ceremony Elapsed</span>
                            <span>{elapsedTime}s / {waitDuration}s</span>
                          </div>
                          <div className="h-2 bg-[#120B2E] rounded-full overflow-hidden border border-white/10 p-[1px]">
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: `${Math.min(100, (elapsedTime / waitDuration) * 100)}%` }}
                              transition={{ ease: "linear" }}
                              className="h-full bg-gradient-to-r from-[#3FB877] to-[#FFC83D] rounded-full"
                            />
                          </div>
                        </div>

                        {/* Error state if any */}
                        {errorMessage && (
                          <div className="mt-4 bg-red-500/15 border border-red-500/30 text-red-400 p-2.5 rounded-xl text-xs flex items-center gap-2 justify-center">
                            <AlertTriangle size={14} />
                            <span>{errorMessage} (Hatching procedurally)</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeout warning fallback (spec rule 8: Worldview text constraints) */}
            <AnimatePresence>
              {showTimeoutAlert && (
                <motion.div 
                  id="timeout-alert-card"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-5 inset-x-5 z-20 bg-[#1F1940]/95 border-2 border-[#FFC83D]/40 p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FFC83D]/10 rounded-xl text-[#FFC83D]">
                      <Clock size={20} className="animate-spin" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-sm">
                        {t[lang].timeoutTitle}
                      </h5>
                      <p className="text-xs text-slate-300">
                        {t[lang].timeoutBody}
                      </p>
                    </div>
                  </div>
                  <button
                    id="catch-now-btn"
                    onClick={forceCatchNow}
                    className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-[#FFC83D] to-[#ffa43d] text-[#2B2540] font-black text-xs font-mono rounded-xl shadow-lg hover:scale-105 transition-all whitespace-nowrap uppercase tracking-wider"
                  >
                    {t[lang].catchNow}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Organic Motion Principle Banner */}
          <div className="bg-[#120E2E]/60 border border-white/5 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-[#FFC83D] text-lg">💡</span>
            <div>
              <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Living Creature Principle (生命感原则)
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                {t[lang].organicPrinciple}. Wait cycle transitions from soft breathing to sharp jumps & internal leak glow layers.
              </p>
            </div>
          </div>
        </div>

        {/* Control Deck / Spec Auditor Panel (Right 5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#120E2E]/90 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings className="text-[#FFC83D]" size={18} />
              <h3 className="font-black text-sm uppercase tracking-widest text-white font-mono">
                {t[lang].designerLab}
              </h3>
            </div>

            {/* Form Section 1: Prompt & Rarity */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
                {t[lang].promptLabel}
              </label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={2}
                className="w-full bg-[#1b1542]/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3FB877] transition-all font-sans"
                placeholder="Describe your creature..."
              />
              {/* Preset template tags */}
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => setPromptInput(tpl.prompt)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-mono text-slate-300 transition-all"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Rarity */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
                  {t[lang].rarityLabel}
                </label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as RarityType)}
                  className="bg-[#1b1542]/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#3FB877] transition-all font-mono"
                >
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>

              {/* Waiting Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
                  {t[lang].timerLabel}
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={waitDuration}
                    onChange={(e) => setWaitDuration(parseInt(e.target.value))}
                    className="flex-1 bg-[#1b1542]/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#3FB877] transition-all font-mono"
                  >
                    <option value={3}>3 {t[lang].secs}</option>
                    <option value={6}>6 {t[lang].secs}</option>
                    <option value={10}>10 {t[lang].secs}</option>
                    <option value={15}>15 {t[lang].secs}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sfx Board testing Section */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Music size={12} className="text-[#FFC83D]" />
                {t[lang].soundBoard}
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => testAudio("heartbeat")}
                  className="px-2 py-2 bg-[#1b1542] hover:bg-[#1b1542]/80 border border-white/10 rounded-xl text-[10px] text-slate-300 font-mono transition-all text-center flex flex-col items-center gap-1 justify-center shadow-md active:scale-95"
                  title="Low-frequency heart beat pulse"
                >
                  <span className="text-sm">🥁</span>
                  <span>heartbeat</span>
                </button>
                <button
                  onClick={() => testAudio("crack")}
                  className="px-2 py-2 bg-[#1b1542] hover:bg-[#1b1542]/80 border border-white/10 rounded-xl text-[10px] text-slate-300 font-mono transition-all text-center flex flex-col items-center gap-1 justify-center shadow-md active:scale-95"
                  title="Sharp crunchy shell fracture"
                >
                  <span className="text-sm">⚡</span>
                  <span>crack</span>
                </button>
                <button
                  onClick={() => testAudio("ding")}
                  className="px-2 py-2 bg-[#1b1542] hover:bg-[#1b1542]/80 border border-white/10 rounded-xl text-[10px] text-slate-300 font-mono transition-all text-center flex flex-col items-center gap-1 justify-center shadow-md active:scale-95"
                  title="Expectant magical chord"
                >
                  <span className="text-sm">🔔</span>
                  <span>ding</span>
                </button>
                <button
                  onClick={() => testAudio("pop")}
                  className="px-2 py-2 bg-[#1b1542] hover:bg-[#1b1542]/80 border border-white/10 rounded-xl text-[10px] text-slate-300 font-mono transition-all text-center flex flex-col items-center gap-1 justify-center shadow-md active:scale-95"
                  title="Explosive reveal burst"
                >
                  <span className="text-sm">💥</span>
                  <span>pop</span>
                </button>
              </div>
            </div>

            {/* Audit Section 2: Phase State overrides (Ideal for visual testing) */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers size={12} className="text-[#3FB877]" />
                {t[lang].stateOverride}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  "idle",
                  "gathering",
                  "breathing",
                  "heartbeat",
                  "cracking",
                  "glow",
                  "bursting",
                  "revealed"
                ] as HatchState[]).map((state) => (
                  <button
                    key={state}
                    onClick={() => setDesignerState(state)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all uppercase tracking-wide border ${
                      hatchState === state
                        ? "bg-[#3FB877]/20 text-[#3FB877] border-[#3FB877]"
                        : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Inspector (Toggle layers manually during IDLE) */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
                  {t[lang].layerInspector}
                </span>
                {hatchState !== "idle" && (
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                    ⚠️ Disabled during ceremony
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                {Object.keys(manualLayers).map((layerKey) => {
                  const active = getActiveLayers()[layerKey as keyof EggLayerConfig];
                  return (
                    <button
                      key={layerKey}
                      disabled={hatchState !== "idle"}
                      onClick={() => {
                        setManualLayers((prev) => ({
                          ...prev,
                          [layerKey]: !prev[layerKey as keyof EggLayerConfig],
                        }));
                      }}
                      className={`px-2 py-1.5 rounded-lg text-left border flex items-center justify-between transition-all ${
                        active
                          ? "bg-[#3FB877]/10 text-emerald-300 border-[#3FB877]/30"
                          : "bg-slate-500/5 text-slate-500 border-white/5"
                      }`}
                    >
                      <span>{layerKey}</span>
                      <span className="text-[8px] font-bold">
                        {active ? "●" : "○"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Environmental Secrets verification feedback */}
            <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-500">{t[lang].apiStatus}</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle size={10} /> Active fallback engine
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* History panel for continuous incubation testing (Bento block style) */}
      {summonHistory.length > 0 && (
        <footer className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-12 mt-4 z-10">
          <div className="bg-[#120E2E]/60 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#FFC83D]" />
              <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                {t[lang].historyTitle} ({summonHistory.length})
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {summonHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#1b1542]/80 border border-white/5 p-3 rounded-2xl flex flex-col gap-2 relative group overflow-hidden"
                >
                  {/* Subtle color highlight */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none filter blur-[20px]"
                    style={{ background: item.colorTheme.primary }}
                  />

                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span 
                      className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${
                        item.rarity === "Legendary" 
                          ? "bg-amber-500/20 text-amber-300" 
                          : item.rarity === "Epic" 
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {item.rarity}
                    </span>
                    <span className="text-slate-500">{item.date}</span>
                  </div>

                  <div className="w-20 h-20 mx-auto">
                    {/* Procedural render preview */}
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                      <circle cx="100" cy="100" r="75" fill={item.colorTheme.primary} stroke={item.colorTheme.accent} strokeWidth="6" />
                      <circle cx="100" cy="100" r="10" fill={item.colorTheme.accent} />
                    </svg>
                  </div>

                  <div className="text-center">
                    <h5 className="font-bold text-xs text-white leading-none">
                      {item.name}
                    </h5>
                    <span className="text-[9px] font-mono text-slate-400 capitalize mt-1 inline-block">
                      {item.element}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
