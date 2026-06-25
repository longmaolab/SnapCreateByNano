import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Local monster database for offline/no-key fallback
const LOCAL_MONSTERS = [
  {
    name: "PiroChonk",
    description: "A pleasantly round fire-kitty that sneezes sparks when excited. Its favorite food is hot charcoal.",
    element: "Fire",
    stats: { hp: 75, attack: 85, defense: 50, speed: 60 },
    colorTheme: { primary: "#FF5E3A", secondary: "#FFAE19", accent: "#2B2540" },
    visualFeatures: {
      bodyShape: "chonk",
      hornType: "single",
      eyeStyle: "excited",
      pattern: "spots",
      tailType: "fluffy"
    }
  },
  {
    name: "TidalPuff",
    description: "An incredibly buoyant aquatic blob that floats on ocean breezes. It uses its bubble pattern to store extra water.",
    element: "Water",
    stats: { hp: 95, attack: 40, defense: 75, speed: 45 },
    colorTheme: { primary: "#3A9EFF", secondary: "#19FFE6", accent: "#2B2540" },
    visualFeatures: {
      bodyShape: "round",
      hornType: "none",
      eyeStyle: "cute",
      pattern: "bubbles",
      tailType: "aquatic"
    }
  },
  {
    name: "SporeSprout",
    description: "A mysterious little woodland fungi that wanders around seeking quiet spots. Its crown glows in complete darkness.",
    element: "Nature",
    stats: { hp: 60, attack: 55, defense: 80, speed: 65 },
    colorTheme: { primary: "#3FB877", secondary: "#FFC83D", accent: "#2B2540" },
    visualFeatures: {
      bodyShape: "slender",
      hornType: "crown",
      eyeStyle: "sleepy",
      pattern: "stripes",
      tailType: "none"
    }
  },
  {
    name: "GlowVolt",
    description: "A highly energetic star-shaped critter that runs on static electricity. It cannot sit still for more than three seconds.",
    element: "Electric",
    stats: { hp: 55, attack: 90, defense: 45, speed: 99 },
    colorTheme: { primary: "#FFDF00", secondary: "#FF4500", accent: "#2B2540" },
    visualFeatures: {
      bodyShape: "star",
      hornType: "dual",
      eyeStyle: "cool",
      pattern: "stars",
      tailType: "spiky"
    }
  },
  {
    name: "NebulaChonk",
    description: "A cosmic being of pure density that wobbles through space-time. It holds a tiny galaxy in its belly.",
    element: "Cosmic",
    stats: { hp: 110, attack: 65, defense: 85, speed: 30 },
    colorTheme: { primary: "#9A33FF", secondary: "#FF33D1", accent: "#2B2540" },
    visualFeatures: {
      bodyShape: "chonk",
      hornType: "crown",
      eyeStyle: "sleepy",
      pattern: "stars",
      tailType: "fluffy"
    }
  }
];

// Summon API
app.post("/api/summon", async (req, res) => {
  const { prompt, rarity } = req.body;
  const client = getGeminiClient();

  if (!client) {
    // Graceful fallback to custom generated local monster based on prompt
    console.log("No Gemini API key found, generating high-fidelity local monster.");
    const randomTemplate = LOCAL_MONSTERS[Math.floor(Math.random() * LOCAL_MONSTERS.length)];
    
    // Customize slightly based on prompt if provided
    let finalMonster = { ...randomTemplate };
    if (prompt && prompt.trim().length > 0) {
      const words = prompt.trim().split(" ");
      const customName = words[0].substring(0, 8) + (randomTemplate.name.slice(randomTemplate.name.length / 2));
      finalMonster.name = customName.charAt(0).toUpperCase() + customName.slice(1);
    }
    
    // Add brief artificial delay to simulate API call (1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return res.json({
      success: true,
      monster: finalMonster,
      isAiGenerated: false,
      message: "Generated via procedural engine (add GEMINI_API_KEY in Secrets for unique AI monsters!)."
    });
  }

  try {
    const userPrompt = prompt || "a cute friendly creature";
    const systemInstruction = 
      "You are the master SnapMonster designer. Generate a highly creative, cute, cohesive, and brand-aligned " +
      "SnapMonster creature based on the user's description. The response MUST be a valid JSON matching the schema.";

    const schema = {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "A single creative, adorable monster name (e.g., PiroClaw, Sproutlet, Bubblo)."
        },
        description: {
          type: Type.STRING,
          description: "A playful, engaging 1-2 sentence description about its personality or habitat."
        },
        element: {
          type: Type.STRING,
          description: "Must be one of: 'Fire', 'Water', 'Nature', 'Electric', 'Darkness', 'Light', 'Cosmic', 'Wind'."
        },
        stats: {
          type: Type.OBJECT,
          description: "Numeric stats between 30 and 110.",
          properties: {
            hp: { type: Type.INTEGER },
            attack: { type: Type.INTEGER },
            defense: { type: Type.INTEGER },
            speed: { type: Type.INTEGER }
          },
          required: ["hp", "attack", "defense", "speed"]
        },
        colorTheme: {
          type: Type.OBJECT,
          description: "Cohesive visual palette colors.",
          properties: {
            primary: { type: Type.STRING, description: "Primary hex code (e.g., '#FF5E3A')" },
            secondary: { type: Type.STRING, description: "Secondary hex code (e.g., '#FFAE19')" },
            accent: { type: Type.STRING, description: "Accent / line hex code, default is '#2B2540'" }
          },
          required: ["primary", "secondary", "accent"]
        },
        visualFeatures: {
          type: Type.OBJECT,
          description: "Visual traits for custom rendering.",
          properties: {
            bodyShape: { type: Type.STRING, description: "Must be: 'round', 'slender', 'chonk', 'star'" },
            hornType: { type: Type.STRING, description: "Must be: 'none', 'single', 'dual', 'crown'" },
            eyeStyle: { type: Type.STRING, description: "Must be: 'cute', 'sleepy', 'cool', 'excited'" },
            pattern: { type: Type.STRING, description: "Must be: 'spots', 'stripes', 'stars', 'bubbles'" },
            tailType: { type: Type.STRING, description: "Must be: 'fluffy', 'spiky', 'aquatic', 'none'" }
          },
          required: ["bodyShape", "hornType", "eyeStyle", "pattern", "tailType"]
        }
      },
      required: ["name", "description", "element", "stats", "colorTheme", "visualFeatures"]
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create a SnapMonster creature with rarity '${rarity}' based on the prompt: "${userPrompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.0,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const monsterData = JSON.parse(text.trim());
    return res.json({
      success: true,
      monster: monsterData,
      isAiGenerated: true
    });

  } catch (error: any) {
    console.error("Gemini API error during summon:", error);
    // Graceful fallback on failure
    const randomTemplate = LOCAL_MONSTERS[Math.floor(Math.random() * LOCAL_MONSTERS.length)];
    return res.json({
      success: true,
      monster: randomTemplate,
      isAiGenerated: false,
      error: error.message || "Failed to call Gemini API, fell back to procedural."
    });
  }
});

// Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
