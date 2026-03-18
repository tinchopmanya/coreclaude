"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { appNavigation } from "@/config/navigation";

type Props = {
  username: string;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
};

export default function AppShell({ username, onLogout, children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">SaaS Starter</div>
        <nav>
          {appNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname.startsWith(item.href) ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-nav-btn" onClick={() => setMobileOpen((v) => !v)}>
            Menu
          </button>
          <div className="topbar-right">
            <div className="user-chip">Signed in as {username}</div>
            <div className="user-menu">
              <button onClick={() => setMenuOpen((v) => !v)}>Account</button>
              {menuOpen ? (
                <div className="dropdown">
                  <p>{username}</p>
                  <button
                    onClick={async () => {
                      await onLogout();
                      setMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
