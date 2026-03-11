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

export interface WebFrontendConfig {
  storeName: string;
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  industry: string;
  brandStyle: string;
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

export async function planEcommerceFrontend(
  requirement: string
): Promise<WebFrontendConfig> {
  console.log("🎨 Frontend eCommerce planning...");

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

Design the styling and copy for an e-commerce storefront based on the startup's requirements.
CRITICAL CONSTRAINT: The mandated aesthetic vibe for this specific generation is "${randomVibe}". You absolutely MUST tailor the brand colors, button styles, container styles, and typography to aggressively match this unique aesthetic. Do not use generic safe colors. Be creative and heavily lean into the requested vibe.

STRICT RULES:
- Only output JSON.
- Do NOT include explanations.
- Do NOT use markdown outside of the JSON block if any.
- The brand colors MUST be valid hex codes representing a full Tailwind CSS color palette from 50 to 900.
- Ensure the heroHeading is catchy and relevant.
- \`fontFamily\` must be a valid Google Font name (e.g. "Inter", "Playfair Display", "Outfit", "Space Grotesk").
- \`borderRadius\` must be a valid Tailwind rounded size (e.g. "none", "sm", "md", "lg", "xl", "2xl", "3xl", "full").
- \`buttonStyle\` must be one of: "solid", "outline", "soft".
- \`containerStyle\` must be one of: "glass", "solid", "bordered", "flat".
- \`heroImageDescription\` must be a highly detailed, extremely vivid prompt describing a hyper-realistic commercial photography shot representing the startup. Do not include text in the image.

Return format:
{
  "storeName": "TechGear Pro",
  "heroBadge": "✨ Next-Gen Laptops",
  "heroHeading": "Discover the Future of Computing.",
  "heroSubheading": "Laptops that empower your everyday workflows.",
  "industry": "electronics",
  "brandStyle": "modern",
  "fontFamily": "Inter",
  "borderRadius": "none",
  "buttonStyle": "solid",
  "containerStyle": "bordered",
  "brandColors": {
    "50": "#f0fdfa",
    "100": "#ccfbf1",
    "200": "#99f6e4",
    "300": "#5eead4",
    "400": "#2dd4bf",
    "500": "#14b8a6",
    "600": "#0d9488",
    "700": "#0f766e",
    "800": "#115e59",
    "900": "#134e4a"
  },
  "heroImageDescription": "a hyperrealistic 8k studio product photography shot of a sleek modern laptop sitting on a clean marble desk, dramatic studio lighting"
}
`;

  const response = await llamaChat({
    system,
    user: requirement,
    temperature: 0.7
  });

  const parsed = extractJSON(response) as WebFrontendConfig;

  console.log("✅ Frontend eCommerce plan normalized");

  return parsed;
}
