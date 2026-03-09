import path from "path";
import fs from "fs";
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

Example Response:
{
  "pages/HomePage.tsx": "import { useState } ... (full entire file content)"
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

    for (const [relPath, newContent] of Object.entries(modifiedFiles)) {
        const fullPath = path.join(webSrc, relPath);
        // Safety check: ensure we're not writing outside the sandbox
        if (fullPath.startsWith(webSrc)) {
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, newContent as string);
            streamLog(params.jobId, `+ Updated ${relPath}`);
        }
    }

    streamLog(params.jobId, "✨ Codebase modifications complete! Vite will hot-reload the changes.");
}
