import path from "path";
import fs from "fs";
import axios from "axios";
import { llamaChat } from "../llamaClient";
import { streamLog } from "../../orchestrator/logUtils";

export async function runWebImprovementAgent(params: {
    sandboxPath: string;
    requirement: string;
    jobId: string;
}) {
    streamLog(params.jobId, "🔍 Scanning frontend source files...");
    const webSrc = path.join(params.sandboxPath, "web", "src");

    if (!fs.existsSync(webSrc)) {
        throw new Error("Sandbox frontend not found. Has it been built yet?");
    }

    // Gather selective core files to avoid blowing up the LLM context window
    const fileMap: Record<string, string> = {};

    const safeRead = (rel: string) => {
        const p = path.join(webSrc, rel);
        if (fs.existsSync(p)) fileMap[rel] = fs.readFileSync(p, "utf-8");
    };

    // Always include root mount points
    safeRead("App.tsx");
    safeRead("main.tsx");
    safeRead("index.css");

    // Scrape shallow components and pages
    const dirs = ["components", "pages"];
    for (const d of dirs) {
        const dp = path.join(webSrc, d);
        if (fs.existsSync(dp)) {
            const files = fs.readdirSync(dp);
            for (const f of files) {
                if (f.endsWith(".tsx") || f.endsWith(".ts")) {
                    safeRead(`${d}/${f}`);
                }
            }
        }
    }

    streamLog(params.jobId, `🧠 Passing codebase context to Local LLM...`);
    console.log("EXTRACTED FILES FOR CONTEXT:", Object.keys(fileMap));

    const systemPrompt = `
You are an elite, autonomous React developer AI.
You are given the full source code of the user's current sandbox project.
The user wants to make a specific targeted improvement: "${params.requirement}"

Current codebase context:
${Object.entries(fileMap).map(([k, v]) => `\n--- ${k} ---\n${v}`).join("\n")}

STRICT INSTRUCTIONS:
1. Synthesize the changes required to fulfill the user's request.
2. Modify ONLY the files that need changing. Do NOT touch unrelated files.
3. Return a SINGLE valid JSON dictionary mapping the relative file path to the EXACT full new file content.
4. Do NOT use markdown outside the JSON block. Do NOT truncate the file content (provide the complete file!).
5. Do NOT include markdown \`\`\`json wrappers in your final output, just raw JSON.
6. **IMAGE GENERATION:** If you need to add custom, highly contextual AI-generated images to the layout, use the exact syntax \`[GENERATE_IMAGE: "a detailed description of the image"]\` in place of standard \`src\` URLs. Our backend will automatically intercept these placeholders, generate the image, and replace your text with a valid remote URL before saving. For example: \`<img src="[GENERATE_IMAGE: 'realistic coffee mug on a wooden desk']" />\`.

Example Response:
{
  "pages/HomePage.tsx": "import { useState ... (full entire file content)"
}`;

    const responseText = await llamaChat({
        system: systemPrompt,
        user: "Please execute the requested improvement and return ONLY the raw JSON file map.",
        temperature: 0.1,
        format: "json"
    });

    streamLog(params.jobId, "⚙️ Parsing LLM response...");
    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
        throw new Error("Agent failed to return valid JSON codebase modifications.");
    }

    const modifiedFiles = JSON.parse(match[0]);

    streamLog(params.jobId, "💾 Applying unified patches to sandbox filesystem...");

    for (const [relPath, contentStr] of Object.entries(modifiedFiles)) {
        let newContent = contentStr as string;

        // 1. Intercept Image Requests
        const imageRegex = /\[GENERATE_IMAGE:\s*(?:'|")?(.*?)(?:'|")?\s*\]/g;
        const matches = Array.from(newContent.matchAll(imageRegex));

        if (matches.length > 0) {
            streamLog(params.jobId, `🖼️ Found ${matches.length} autonomous image generation requests in ${relPath}. Resolving...`);
            for (const m of matches) {
                const fullMatch = m[0];
                const description = m[1];
                try {
                    streamLog(params.jobId, `   - Generating: "${description}"`);
                    const res = await axios.post("http://localhost:5000/generate", {
                        startup_name: "WebDev",
                        industry: "general",
                        target_audience: "general",
                        brand_style: "modern",
                        image_description: description
                    });

                    if (res.data?.status === "success" && res.data?.image_url) {
                        const compiledUrl = "http://localhost:5000" + res.data.image_url;
                        newContent = newContent.replace(fullMatch, compiledUrl);
                        streamLog(params.jobId, `   ✓ Successfully generated image for ${relPath}`);
                    } else {
                        streamLog(params.jobId, `   ! Image generation returned invalid payload for: ${description}`);
                    }
                } catch (e: any) {
                    streamLog(params.jobId, `   ! Failed to contact Image Agent on port 5000: ${e.message}`);
                }
            }
        }

        // 2. Write to Sandbox
        const fullPath = path.join(webSrc, relPath);
        // Safety check: ensure we're not writing outside the sandbox
        if (fullPath.startsWith(webSrc)) {
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, newContent);
            streamLog(params.jobId, `+ Updated ${relPath}`);
        }
    }

    streamLog(params.jobId, "✨ Codebase modifications complete! Vite will hot-reload the changes.");
}
