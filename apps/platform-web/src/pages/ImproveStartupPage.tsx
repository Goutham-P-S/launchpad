import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startOrchestration, fetchStartup, cancelJob, type StartupRecord } from "../api";
import MessageBubble from "../components/MessageBubble";
import { Wrench, ArrowLeft, Send, StopCircle } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ImproveStartupPage() {
    const { sandboxName } = useParams<{ sandboxName: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [startup, setStartup] = useState<StartupRecord | null>(null);

    useEffect(() => {
        if (!sandboxName) return;
        fetchStartup(sandboxName).then(data => setStartup(data)).catch(() => navigate("/"));
    }, [sandboxName]);

    useEffect(() => {
        if (startup) {
            setMessages([{ role: "assistant", content: `Hi! I am the Web Dev Agent. What features or improvements would you like me to add to **${startup.sandboxName}**?` }]);
        }
    }, [startup]);

    const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

    const handleSend = async () => {
        if (!prompt.trim() || !sandboxName) return;

        addMessage({ role: "user", content: prompt });
        const currentPrompt = prompt;
        setPrompt("");

        // Special improve prompt prefix to ensure the backend routes it as an improvement
        const fullInstruction = `[IMPROVE:${sandboxName}] ${currentPrompt}`;
        const id = await startOrchestration(fullInstruction);
        setJobId(id);

        addMessage({ role: "assistant", content: "🛠️ Analyzing your request and preparing codebase modifications..." });
    };

    useEffect(() => {
        if (!jobId) return;

        const ws = new WebSocket("ws://localhost:5050");
        ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", jobId }));
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "log") addMessage({ role: "assistant", content: data.message });
            if (data.status === "completed") {
                const url = startup?.ports?.webPort ? 'http://localhost:' + startup.ports.webPort : 'your sandbox URL';
                addMessage({ role: "assistant", content: `🎉 Improvements successfully applied to frontend!\n\n🌐 Refresh the app at ${url} to see the changes.` });
                setJobId(null);
            }
            if (data.status === "failed") {
                addMessage({ role: "assistant", content: `❌ Modification failed: ${data.error}` });
                setJobId(null);
            }
            if (data.status === "cancelled") {
                addMessage({ role: "assistant", content: "⛔ Upgrades cancelled by user." });
                setJobId(null);
            }
        };

        return () => ws.close();
    }, [jobId, startup]);


    if (!startup) return <div className="empty-state">Loading workspace...</div>;

    return (
        <div className="layout-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
            {/* Header */}
            <div style={{ padding: "24px 32px", borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <div className="back-link" onClick={() => navigate(`/startups/${sandboxName}`)} style={{ marginBottom: 12 }}>
                    <ArrowLeft size={14} /> Back to Dashboard
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="startup-card-icon" style={{ width: 40, height: 40, background: 'var(--purple-400)', color: 'white', border: 'none' }}>
                        <Wrench size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Agent Workspace</h1>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Iterative code upgrades for {startup.sandboxName}</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px", background: 'var(--bg-base)' }}>
                <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} role={msg.role} content={msg.content} />
                    ))}
                </div>
            </div>

            {/* Input Form */}
            <div style={{ padding: "24px 32px", background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 760, margin: '0 auto', display: "flex", gap: 12 }}>
                    <input
                        className="prompt-textarea"
                        style={{ minHeight: 'auto', height: 48, flex: 1, padding: '0 16px', margin: 0, borderRadius: '24px' }}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="e.g. 'Add a dark mode toggle to the navigation bar' or 'Change the hero button to be round'"
                        disabled={!!jobId}
                    />
                    {!jobId ? (
                        <button className="btn btn-primary" onClick={handleSend} style={{ borderRadius: '24px', padding: '0 24px' }}>
                            <Send size={16} /> Send
                        </button>
                    ) : (
                        <button className="btn btn-danger" onClick={() => { cancelJob(jobId); setJobId(null); }} style={{ borderRadius: '24px', padding: '0 24px' }}>
                            <StopCircle size={16} /> Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
