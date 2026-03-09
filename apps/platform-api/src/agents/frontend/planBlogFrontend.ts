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

export interface BlogFrontendConfig {
    blogTitle: string;
    heroHeadline: string;
    heroSubheadline: string;
    authorName: string;
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
}

export async function planBlogFrontend(
    requirement: string
): Promise<BlogFrontendConfig> {
    console.log("📝 Frontend Blog planning...");

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

Design the styling and copy for a Blog platform based on the startup's requirements.
CRITICAL CONSTRAINT: The mandated aesthetic vibe for this specific generation is "${randomVibe}". You absolutely MUST tailor the brand colors, button styles, container styles, and typography to aggressively match this unique aesthetic. Do not use generic safe colors. Be creative and heavily lean into the requested vibe.

STRICT RULES:
- Only output JSON.
- Do NOT include explanations.
- Do NOT use markdown outside of the JSON block if any.
- The brand colors MUST be valid hex codes representing a full Tailwind CSS color palette from 50 to 900.
- Ensure the heroHeadline is catchy and relevant to the blog subject.
- \`fontFamily\` must be a valid Google Font name (e.g. "Inter", "Playfair Display", "Outfit", "Lora", "Merriweather").
- \`borderRadius\` must be a valid Tailwind rounded size (e.g. "none", "sm", "md", "lg", "xl", "2xl", "3xl", "full").
- \`buttonStyle\` must be one of: "solid", "outline", "soft".
- \`containerStyle\` must be one of: "glass", "solid", "bordered", "flat".

Return format:
{
  "blogTitle": "The Dev Diary",
  "heroHeadline": "Insights and Perspectives on Modern Web Development.",
  "heroSubheadline": "Read my latest thoughts on React, Node.js, and Cloud Architecture.",
  "authorName": "Jane Doe",
  "fontFamily": "Merriweather",
  "borderRadius": "md",
  "buttonStyle": "outline",
  "containerStyle": "flat",
  "brandColors": {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a"
  }
}
`;

    const response = await llamaChat({
        system,
        user: requirement,
        temperature: 0.7
    });

    const parsed = extractJSON(response) as BlogFrontendConfig;

    console.log("✅ Frontend Blog plan normalized");

    return parsed;
}
