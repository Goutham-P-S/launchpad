import { NavLink } from "react-router-dom";
import { Home, Plus, UploadCloud } from "lucide-react";

const navItems = [
    { to: "/", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/create", icon: <Plus size={18} />, label: "Create Startup" },
];

export default function Sidebar() {
    console.log("Sidebar component rendering...");
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <UploadCloud size={20} color="white" />
                </div>
                <span className="sidebar-logo-text">StartupOptima</span>
            </div>

            <div className="sidebar-section-label">Navigation</div>

            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                >
                    <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', opacity: 1 }}>
                        {item.icon}
                    </span>
                    {item.label}
                </NavLink>
            ))}
        </aside>
    );
}
