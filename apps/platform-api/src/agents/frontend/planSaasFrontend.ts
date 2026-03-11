import { llamaChat } from "../llamaClient";

function extractJSON(text: string) {
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const match = cleaned.match(/{[\s\S]*}/);

    if (!match) {
        throw new Error("No valid JSON found in LLM output");
    }

    return JSON.parse(match[0]);
}

export interface SaasFrontendConfig {
    appName: string;
    heroHeadline: string;
    heroSubheadline: string;
    features: string[];
    pricing: {
        tier1: { name: string; price: string; description: string };
        tier2: { name: string; price: string; description: string };
    };
    brandColors: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    fontFamily: string;
    borderRadius: string;
    buttonStyle: string;
    containerStyle: string;
    heroImageDescription: string;
}

export async function planSaasFrontend(
    requirement: string
): Promise<SaasFrontendConfig> {
    console.log("🚀 Frontend SaaS planning...");

    const vibes = [
        "Ultra-Minimalist & Apple-like Clean",
        "Bold, High-Contrast & Brutalist",
        "Dark Mode Cyberpunk Neon",
        "Soft, Muted Earthy Pastels",
        "High-End Premium Luxury (Gold/Black/White)",
        "Playful, Quirky & Fun Pop-Art",
        "Industrial, Raw & Technical"
    ];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];

    const system = `
You are a senior frontend architect and brand designer.

Design the styling and copy for a SaaS platform based on the startup's requirements.
CRITICAL CONSTRAINT: The mandated aesthetic vibe for this specific generation is "${randomVibe}". You absolutely MUST tailor the brand colors, button styles, container styles, and typography to aggressively match this unique aesthetic. Do not use generic safe colors. Be creative and heavily lean into the requested vibe.

STRICT RULES:
- Only output JSON.
- Do NOT include explanations.
- Do NOT use markdown outside of the JSON block if any.
- The brand colors MUST be valid hex codes representing a full Tailwind CSS color palette from 50 to 900.
- Ensure the heroHeadline is catchy, benefit-driven, and relevant.
- features MUST be an array of exactly 3 short strings.
- \`fontFamily\` must be a valid Google Font name (e.g. "Inter", "Plus Jakarta Sans", "Figtree", "Outfit").
- \`borderRadius\` must be a valid Tailwind rounded size (e.g. "none", "sm", "md", "lg", "xl", "2xl", "3xl", "full").
- \`buttonStyle\` must be one of: "solid", "outline", "soft".
- \`containerStyle\` must be one of: "glass", "solid", "bordered", "flat".
- \`heroImageDescription\` must be a highly detailed, extremely vivid prompt describing a hyper-realistic commercial photography shot representing the startup. Do not include text in the image.

Return format:
{
  "appName": "DataSync",
  "heroHeadline": "Sync Your Data Automatically.",
  "heroSubheadline": "Connect all your tools in minutes and never manually export CSVs again.",
  "features": ["1-Click Integrations", "Real-time Sync", "Bank-level Security"],
  "pricing": {
    "tier1": { "name": "Starter", "price": "$12", "description": "Perfect for small teams." },
    "tier2": { "name": "Pro", "price": "$49", "description": "For scaling businesses." }
  },
  "fontFamily": "Plus Jakarta Sans",
  "borderRadius": "lg",
  "buttonStyle": "solid",
  "containerStyle": "glass",
  "brandColors": {
    "50": "#eef2ff",
    "100": "#e0e7ff",
    "200": "#c7d2fe",
    "300": "#a5b4fc",
    "400": "#818cf8",
    "500": "#6366f1",
    "600": "#4f46e5",
    "700": "#4338ca",
    "800": "#3730a3",
    "900": "#312e81"
  },
  "heroImageDescription": "a hyperrealistic 8k studio product photography shot of a sleek modern laptop sitting on a clean marble desk, dramatic studio lighting displaying data charts"
}
`;

    const response = await llamaChat({
        system,
        user: requirement,
        temperature: 0.7
    });

    const parsed = extractJSON(response) as SaasFrontendConfig;

    console.log("✅ Frontend SaaS plan normalized");

    return parsed;
}
