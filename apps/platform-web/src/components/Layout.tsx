import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    console.log("Layout component rendering...");
    return (
        <div className="layout">
            <Sidebar />
            <main className="layout-main">
                {children}
            </main>
        </div>
    );
}
