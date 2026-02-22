import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStartups, type StartupRecord } from "../api";

function StatusBadge({ status }: { status: StartupRecord["status"] }) {
    const labels: Record<string, string> = {
        running: "Running",
        building: "Building",
        stopped: "Stopped",
        idle: "Idle",
    };
    return <span className={`badge ${status}`}>{labels[status] ?? status}</span>;
}

function StartupCard({ startup, onClick }: { startup: StartupRecord; onClick: () => void }) {
    const createdAt = startup.createdAt ? new Date(startup.createdAt) : new Date();
    const createdDate = createdAt.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
    const emojis = ["🛒", "📊", "🤖", "🎯", "🌐", "📱", "🔬", "💡", "🏗", "🎨"];
    const emoji = emojis[startup.startupId % emojis.length] || "🚀";

    return (
        <div className="startup-card" onClick={onClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}>
            <div className="startup-card-header">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div className="startup-card-icon">{emoji}</div>
                    <div>
                        <div className="startup-name">{startup.sandboxName || "Unnamed Sandbox"}</div>
                        <div className="startup-meta">Created {createdDate}</div>
                    </div>
                </div>
                <StatusBadge status={startup.status || "idle"} />
            </div>

            <div className="port-pills">
                <span className="port-pill">🌐 :{startup.ports?.webPort || '---'}</span>
                <span className="port-pill">⚡ :{startup.ports?.n8nPort || '---'}</span>
                <span className="port-pill">🗄 :{startup.ports?.dbPort || '---'}</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <span className="tag">infra·{startup.versions?.infra || "1.0"}</span>
                <span className="tag">planner·{startup.versions?.planner || "1.0"}</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [startups, setStartups] = useState<StartupRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStartups()
            .then(data => {
                if (Array.isArray(data)) {
                    setStartups(data);
                } else {
                    console.error("fetchStartups did not return an array", data);
                    setStartups([]);
                }
            })
            .catch((err) => {
                console.error("fetchStartups error:", err);
                setStartups([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const total = startups.length;
    const running = startups.filter(s => s && s.status === "running").length;
    const building = startups.filter(s => s && s.status === "building").length;
    const stopped = startups.filter(s => s && s.status === "stopped").length;

    return (
        <div className="dashboard-page">
            {/* Hero */}
            <div className="hero-banner">
                <div className="hero-title">Your Startup Launchpad 🚀</div>
                <div className="hero-sub">
                    Describe your idea — we'll generate the backend, frontend, and workflow automation, all sandboxed in Docker.
                </div>
                <div className="hero-emoji">🏗</div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Startups</div>
                    <div className="stat-value purple">{total}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Running</div>
                    <div className="stat-value green">{running}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Building</div>
                    <div className="stat-value amber">{building}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Stopped</div>
                    <div className="stat-value cyan">{stopped}</div>
                </div>
            </div>

            {/* Grid */}
            <div className="section-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="section-title">Sandboxed Startups</div>
                <button className="btn btn-primary" onClick={() => navigate("/create")}>
                    ✨ Create New
                </button>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="spinner" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--purple-400)', borderRadius: '50%', width: 24, height: 24, animation: 'spin 1s linear infinite', marginBottom: 12 }}></div>
                    <span>Loading startups…</span>
                </div>
            ) : (
                <div className="startup-grid">
                    {startups.map(s => s && (
                        <StartupCard
                            key={s.sandboxName}
                            startup={s}
                            onClick={() => navigate(`/startups/${s.sandboxName}`)}
                        />
                    ))}

                    {/* CTA to create */}
                    <div className="cta-card" onClick={() => navigate("/create")} role="button" tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate("/create")}>
                        <div className="cta-card-icon">＋</div>
                        <div className="cta-card-text">Launch a new startup</div>
                    </div>
                </div>
            )}

            {!loading && startups.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon" style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                    <p>No startups found. Create one to get started!</p>
                </div>
            )}
        </div>
    );
}
