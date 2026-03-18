"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

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
          <button className="mobile-nav-btn secondary-btn" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? "Close" : "Menu"}
          </button>
          <div className="topbar-right">
            <div className="user-chip">Signed in as {username}</div>
            <div className="user-menu" ref={menuRef}>
              <button className="secondary-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
                Account
              </button>
              {menuOpen ? (
                <div className="dropdown" role="menu">
                  <p>{username}</p>
                  <button
                    className="primary-btn"
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
