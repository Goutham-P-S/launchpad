import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStartup, startContainersApi, stopContainersApi, patchStartupStatus, type StartupRecord } from "../api";
import { Rocket, ShoppingCart, BarChart, Bot, Target, Globe, Smartphone, Microscope, Lightbulb, Building, Palette, AlertTriangle, LinkIcon, Activity, Database, Settings, FolderOpen, Play, Square, Wrench } from "lucide-react";

function StatusBadge({ status }: { status: StartupRecord["status"] }) {
    const labels: Record<string, string> = {
        running: "Running", building: "Building", stopped: "Stopped", idle: "Idle",
    };
    return <span className={`badge ${status || 'idle'}`}>{labels[status] ?? status ?? "Idle"}</span>;
}

export default function StartupDetailPage() {
    const { sandboxName } = useParams<{ sandboxName: string }>();
    const navigate = useNavigate();
    const [startup, setStartup] = useState<StartupRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => {
        if (!sandboxName) return;
        fetchStartup(sandboxName)
            .then(data => {
                if (data && typeof data === 'object') {
                    setStartup(data);
                } else {
                    setError("Could not load startup data");
                }
            })
            .catch(() => setError("Could not load startup"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { refresh(); }, [sandboxName]);

    const handleStart = async () => {
        if (!startup) return;
        setActionLoading(true);
        try {
            await patchStartupStatus(startup.sandboxName, "running");
            await startContainersApi(startup.sandboxName);
            refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStop = async () => {
        if (!startup) return;
        setActionLoading(true);
        try {
            await stopContainersApi(startup.sandboxName);
            await patchStartupStatus(startup.sandboxName, "stopped");
            refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="empty-state">
            <div className="spinner" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--purple-400)', borderRadius: '50%', width: 24, height: 24, animation: 'spin 1s linear infinite', marginBottom: 12 }}></div>
            <span>Loading detail…</span>
        </div>
    );

    if (error || !startup) return (
        <div>
            <div className="back-link" onClick={() => navigate("/")}>← Back to Dashboard</div>
            <div className="card" style={{ borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.05)", padding: 24 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--rose-400)", fontWeight: 600 }}>
                    <AlertTriangle size={20} /> {error ?? "Startup not found"}
                </div>
            </div>
        </div>
    );

    const createdAt = startup.createdAt ? new Date(startup.createdAt) : new Date();
    const createdDate = createdAt.toLocaleString("en-US", {
        dateStyle: "medium", timeStyle: "short",
    });
    const icons = [ShoppingCart, BarChart, Bot, Target, Globe, Smartphone, Microscope, Lightbulb, Building, Palette];
    const IconComponent = icons[startup.startupId % icons.length] || Rocket;

    // Safety check for ports
    const webPort = startup.ports?.webPort;
    const n8nPort = startup.ports?.n8nPort;
    const dbPort = startup.ports?.dbPort;

    const webUrl = webPort ? `http://localhost:${webPort}` : null;
    const n8nUrl = n8nPort ? `http://localhost:${n8nPort}` : null;
    const dbInfo = dbPort ? `postgres:${dbPort}` : "Not Assigned";

    return (
        <div className="startup-detail-page">
            {/* Back */}
            <div className="back-link" onClick={() => navigate("/")}>← Back to Dashboard</div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <div className="startup-card-icon" style={{ width: 52, height: 52, fontSize: 26 }}>
                    <IconComponent size={28} color="var(--text-primary)" />
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                        {startup.sandboxName || "Unnamed Startup"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                        <StatusBadge status={startup.status} />
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Created {createdDate}</span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/startups/${startup.sandboxName}/improve`)}
                    >
                        <Wrench size={16} /> Improve App
                    </button>
                    {startup.status !== "running" && (
                        <button
                            className="btn btn-success"
                            disabled={actionLoading || startup.status === "building"}
                            onClick={handleStart}>
                            {actionLoading ? "Starting…" : <><Play size={16} /> Start</>}
                        </button>
                    )}
                    {startup.status === "running" && (
                        <button className="btn btn-danger" disabled={actionLoading} onClick={handleStop}>
                            {actionLoading ? "Stopping…" : <><Square size={16} /> Stop</>}
                        </button>
                    )}
                </div>
            </div>

            {/* Access Links */}
            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><LinkIcon size={18} /> Access Links</div>
            <div className="detail-links-grid">
                <div className="link-card">
                    <div className="link-card-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Globe size={14} /> Web App</div>
                    {webUrl ? (
                        <a href={webUrl} target="_blank" rel="noreferrer" className="link-card-url">{webUrl}</a>
                    ) : (
                        <div className="link-card-url" style={{ color: 'var(--text-muted)' }}>Not available</div>
                    )}
                </div>
                <div className="link-card">
                    <div className="link-card-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Activity size={14} /> n8n Workflows</div>
                    {n8nUrl ? (
                        <a href={n8nUrl} target="_blank" rel="noreferrer" className="link-card-url">{n8nUrl}</a>
                    ) : (
                        <div className="link-card-url" style={{ color: 'var(--text-muted)' }}>Not available</div>
                    )}
                </div>
                <div className="link-card">
                    <div className="link-card-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Database size={14} /> Database</div>
                    <div className="link-card-url">{dbInfo}</div>
                </div>
            </div>

            <div className="divider" />

            {/* Config Details */}
            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Settings size={18} /> Configuration</div>
            <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20, padding: 24 }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Sandbox ID</div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>#{startup.startupId || '---'}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Slug</div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{startup.slug || '---'}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Infra Version</div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{startup.versions?.infra || "1.0"}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Planner Version</div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{startup.versions?.planner || "1.0"}</div>
                </div>
                {startup.jobId && (
                    <div style={{ gridColumn: "1/-1" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>Build Job ID</div>
                        <div style={{ color: "var(--purple-400)", fontWeight: 500, fontFamily: "monospace", fontSize: 13 }}>{startup.jobId}</div>
                    </div>
                )}
            </div>

            <div className="divider" />

            {/* Sandbox path */}
            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><FolderOpen size={18} /> Sandbox Path</div>
            <div className="card" style={{ padding: "14px 20px" }}>
                <code style={{ color: "var(--cyan-400)", fontSize: 12 }}>{startup.sandboxPath || 'N/A'}</code>
            </div>
        </div>
    );
}
