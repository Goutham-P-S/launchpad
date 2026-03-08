import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startOrchestration, cancelJob } from "../api";
import type { N8nIntegrations } from "../api";
import { Lightbulb, Plug, Rocket, X, FileText, XCircle, ArrowLeft, CheckCircle, Globe, Activity } from "lucide-react";

type Step = "input" | "deploying" | "done";

interface LogLine {
    ts: string;
    msg: string;
    type?: "success" | "error" | "normal";
}

interface DeployResult {
    webUrl: string;
    n8nUrl: string;
}

function timestamp() {
    return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export default function CreateStartupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("input");
    const [prompt, setPrompt] = useState("");
    const [enableEmail, setEnableEmail] = useState(false);
    const [enableWhatsapp, setEnableWhatsapp] = useState(false);
    const [emailConfig, setEmailConfig] = useState({ apiKey: "", fromEmail: "" });
    const [waConfig, setWaConfig] = useState({ accountSid: "", authToken: "", fromNumber: "" });
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [jobId, setJobId] = useState<string | null>(null);
    const [result, setResult] = useState<DeployResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const addLog = (msg: string, type: LogLine["type"] = "normal") => {
        setLogs(prev => [...prev, { ts: timestamp(), msg, type }]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // WebSocket subscription
    useEffect(() => {
        if (!jobId) return;
        const ws = new WebSocket("ws://localhost:5050");
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "subscribe", jobId }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "log") {
                const msg: string = data.message ?? "";
                const t = msg.toLowerCase().includes("error") || msg.toLowerCase().includes("fail")
                    ? "error"
                    : msg.includes("✅") || msg.includes("complete") || msg.includes("success")
                        ? "success"
                        : "normal";
                addLog(msg, t);
            }

            if (data.status === "completed") {
                setResult({ webUrl: data.result.webUrl, n8nUrl: data.result.n8nUrl });
                addLog("🎉 Startup deployed successfully!", "success");
                setStep("done");
                ws.close();
            }

            if (data.status === "failed") {
                setError(data.error ?? "Unknown error");
                addLog(`❌ Deployment failed: ${data.error}`, "error");
                ws.close();
            }

            if (data.status === "cancelled") {
                addLog("⛔ Deployment cancelled.", "error");
                ws.close();
            }
        };

        return () => ws.close();
    }, [jobId]);

    const handleDeploy = async () => {
        if (!prompt.trim()) return;
        setStep("deploying");
        setLogs([]);
        setError(null);
        addLog("🚀 Initialising deployment pipeline...");

        const integrations: N8nIntegrations = {};
        if (enableEmail && emailConfig.apiKey && emailConfig.fromEmail) {
            integrations.email = emailConfig;
        }
        if (enableWhatsapp && waConfig.accountSid && waConfig.authToken && waConfig.fromNumber) {
            integrations.whatsapp = waConfig;
        }

        try {
            const id = await startOrchestration(prompt.trim(), integrations);
            setJobId(id);
            addLog(`📦 Job created: ${id}`);
        } catch (e: any) {
            addLog(`❌ Failed to start: ${e.message}`, "error");
            setError(e.message);
        }
    };

    const handleCancel = async () => {
        if (jobId) {
            await cancelJob(jobId);
            addLog("⛔ Cancellation requested…", "error");
            wsRef.current?.close();
        }
    };

    const stepIdx = step === "input" ? 0 : step === "deploying" ? 1 : 2;

    return (
        <div className="create-container">
            {/* Header */}
            <div className="page-header">
                <h1>Create a Startup</h1>
                <p>Describe your idea and the LLM will generate a full backend, frontend, and n8n automation workflow.</p>
            </div>

            {/* Step Dots */}
            <div className="step-indicator">
                {["Describe", "Deploying", "Live"].map((label, i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                            className={`step-dot ${i < stepIdx ? "done" : i === stepIdx ? "active" : ""}`}
                        />
                        <span style={{ fontSize: 12, color: i === stepIdx ? "var(--purple-400)" : "var(--text-muted)", fontWeight: i === stepIdx ? 600 : 400 }}>
                            {label}
                        </span>
                        {i < 2 && <div style={{ width: 24, height: 1, background: "var(--border)", marginLeft: 4 }} />}
                    </div>
                ))}
            </div>

            {/* ─── Step 0: Input ─── */}
            {step === "input" && (
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lightbulb size={18} color="var(--purple-400)" /> Describe your startup idea
                    </div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 13 }}>
                        Be as specific as you like — mention the industry, key features, and target users.
                    </p>
                    <textarea
                        className="prompt-textarea"
                        placeholder="e.g. An e-commerce platform for handmade crafts with user accounts, product listings, cart, orders, and a seller dashboard…"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDeploy();
                        }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>Tip: Ctrl/Cmd + Enter to deploy</div>

                    {/* Suggestions */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                        {[
                            "E-commerce for hand-crafted goods",
                            "SaaS analytics dashboard",
                            "Freelance marketplace with bids",
                            "Blog platform with subscriptions",
                        ].map(s => (
                            <button key={s} className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}
                                onClick={() => setPrompt(s)}>
                                {s}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 24, padding: 16, border: "1px solid var(--border)", borderRadius: 8 }}>
                        <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Plug size={18} /> n8n AI Integrations (Optional)
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
                            Configure credentials to dynamically generate notification workflows when activities (e.g. products added) occur.
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <input type="checkbox" id="chk-email" checked={enableEmail} onChange={e => setEnableEmail(e.target.checked)} />
                            <label htmlFor="chk-email" style={{ fontSize: 14, fontWeight: 500 }}>Enable Email Agent (SendGrid)</label>
                        </div>
                        {enableEmail && (
                            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                <input className="input-field" placeholder="SendGrid API Key" value={emailConfig.apiKey} onChange={e => setEmailConfig(c => ({ ...c, apiKey: e.target.value }))} style={{ flex: 1 }} />
                                <input className="input-field" placeholder="From Email (e.g. admin@domain.com)" value={emailConfig.fromEmail} onChange={e => setEmailConfig(c => ({ ...c, fromEmail: e.target.value }))} style={{ flex: 1 }} />
                            </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <input type="checkbox" id="chk-wa" checked={enableWhatsapp} onChange={e => setEnableWhatsapp(e.target.checked)} />
                            <label htmlFor="chk-wa" style={{ fontSize: 14, fontWeight: 500 }}>Enable WhatsApp Agent (Twilio)</label>
                        </div>
                        {enableWhatsapp && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <input className="input-field" placeholder="Twilio Account SID" value={waConfig.accountSid} onChange={e => setWaConfig(c => ({ ...c, accountSid: e.target.value }))} style={{ flex: 1 }} />
                                    <input className="input-field" placeholder="Twilio Auth Token" type="password" value={waConfig.authToken} onChange={e => setWaConfig(c => ({ ...c, authToken: e.target.value }))} style={{ flex: 1 }} />
                                </div>
                                <input className="input-field" placeholder="Twilio From Number (e.g. +1234567890)" value={waConfig.fromNumber} onChange={e => setWaConfig(c => ({ ...c, fromNumber: e.target.value }))} />
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <button
                            className="btn btn-primary"
                            disabled={!prompt.trim()}
                            onClick={handleDeploy}
                            style={{ width: "100%", justifyContent: "center", padding: 14 }}>
                            <Rocket size={18} /> Generate &amp; Deploy Startup
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 1: Deploying ─── */}
            {step === "deploying" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="spinner" />
                        <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Deployment in progress</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                                LLM is generating your backend + frontend + Docker stack…
                            </div>
                        </div>
                        <button className="btn btn-danger" style={{ marginLeft: "auto", display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleCancel}>
                            <X size={16} /> Cancel
                        </button>
                    </div>

                    {/* Idea summary */}
                    <div className="card" style={{ padding: "14px 20px" }}>
                        <span className="tag" style={{ marginBottom: 6 }}>Your idea</span>
                        <div style={{ marginTop: 8, color: "var(--text-secondary)", fontSize: 14 }}>{prompt}</div>
                    </div>

                    {/* Live log stream */}
                    <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={18} /> Build Logs</div>
                        <div className="log-stream">
                            {logs.map((l, i) => (
                                <div key={i} className="log-line">
                                    <span className="log-ts">{l.ts}</span>
                                    <span className={`log-msg ${l.type === "error" ? "error" : l.type === "success" ? "success" : ""}`}>
                                        {l.msg}
                                    </span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    {error && (
                        <div className="card" style={{ borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.05)" }}>
                            <div style={{ color: "var(--rose-400)", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><XCircle size={18} /> Deployment failed</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{error}</div>
                            <button className="btn btn-ghost" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setStep("input")}>
                                <ArrowLeft size={16} /> Try again
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Step 2: Done ─── */}
            {step === "done" && result && (
                <div className="card">
                    <div className="success-screen">
                        <div className="success-icon"><CheckCircle size={56} color="var(--green-400)" /></div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                            Your startup is live!
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                            All containers are running. Here are your access links:
                        </div>

                        <div className="detail-links-grid" style={{ width: "100%", marginTop: 8 }}>
                            <div className="link-card">
                                <div className="link-card-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14} /> Web App</div>
                                <a href={result.webUrl} target="_blank" rel="noreferrer" className="link-card-url">
                                    {result.webUrl}
                                </a>
                            </div>
                            <div className="link-card">
                                <div className="link-card-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> n8n Workflows</div>
                                <a href={result.n8nUrl} target="_blank" rel="noreferrer" className="link-card-url">
                                    {result.n8nUrl}
                                </a>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate("/")}>
                                <ArrowLeft size={16} /> Back to Dashboard
                            </button>
                            <button className="btn btn-ghost" onClick={() => {
                                setStep("input");
                                setPrompt("");
                                setLogs([]);
                                setJobId(null);
                                setResult(null);
                            }}>
                                Create another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
