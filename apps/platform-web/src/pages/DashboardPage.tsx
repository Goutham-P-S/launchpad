import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStartups, type StartupRecord } from "../api";
import { CirclePoundSterling, ShoppingCart, BarChart, Bot, Target, Globe, Smartphone, Microscope, Lightbulb, Building, Palette, Activity, Database, Plus, FolderOpen } from "lucide-react";

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

    const icons = [ShoppingCart, BarChart, Bot, Target, Globe, Smartphone, Microscope, Lightbulb, Building, Palette];
    const IconComponent = icons[startup.startupId % icons.length];

    return (
        <div className="startup-card" onClick={onClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}>
            <div className="startup-card-header" style={{ alignItems: "center" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0, flex: 1 }}>
                    <div className="startup-card-icon">
                        <IconComponent size={20} color="var(--text-primary)" />
                    </div>
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <div className="startup-name" title={startup.sandboxName}>{startup.sandboxName || "Unnamed Sandbox"}</div>
                        <div className="startup-meta">Created {createdDate}</div>
                    </div>
                </div>
                <div style={{ flexShrink: 0, marginLeft: 8 }}>
                    <StatusBadge status={startup.status || "idle"} />
                </div>
            </div>

            <div className="port-pills">
                <span className="port-pill"><Globe size={12} style={{ marginRight: 4 }} /> :{startup.ports?.webPort || '---'}</span>
                <span className="port-pill"><Activity size={12} style={{ marginRight: 4 }} /> :{startup.ports?.n8nPort || '---'}</span>
                <span className="port-pill"><Database size={12} style={{ marginRight: 4 }} /> :{startup.ports?.dbPort || '---'}</span>
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
                <div className="hero-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    Your StartupOptima 
                </div>
                <div className="hero-sub">
                    Describe your idea  an let us build it for you
                </div>
                <div className="hero-emoji">
                    <CirclePoundSterling size={120} strokeWidth={1} color="rgba(255,255,255,0.06)" style={{ transform: 'rotate(15deg) translateY(-20px)' }} />
                </div>
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
            <div style={{ marginBottom: 24 }}>
                <div className="section-title" style={{ marginBottom: 12 }}>Sandboxed Startups</div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/create")}
                    style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                >
                    <Plus size={18} strokeWidth={2.5} /> Create New
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
                        <div className="cta-card-icon"><Plus size={32} color="var(--text-muted)" /></div>
                        <div className="cta-card-text">Launch a new startup</div>
                    </div>
                </div>
            )}

            {!loading && startups.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon" style={{ marginBottom: 12 }}><FolderOpen size={48} strokeWidth={1.5} color="var(--text-muted)" /></div>
                    <p>No startups found. Create one to get started!</p>
                </div>
            )}
        </div>
    );
}
