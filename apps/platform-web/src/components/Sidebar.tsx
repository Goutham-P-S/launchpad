import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", icon: "🏠", label: "Dashboard" },
    { to: "/create", icon: "✨", label: "Create Startup" },
];

export default function Sidebar() {
    console.log("Sidebar component rendering...");
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🚀</div>
                <span className="sidebar-logo-text">LaunchPad</span>
            </div>

            <div className="sidebar-section-label">Navigation</div>

            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                </NavLink>
            ))}
        </aside>
    );
}
