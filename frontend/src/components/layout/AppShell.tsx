"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  XCircle,
} from "@/components/ui/icons";
import { NAV_ROUTES } from "@/config/navigation";
import { api } from "@/lib/api";
import { usePolling } from "@/lib/polling";

interface AppShellProps {
  children: ReactNode;
}

const emptySubscribe = () => () => {};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("sentrix_sidebar_collapsed");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sentrix_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const fetchStatus = useCallback(() => api.getMitigationStatus(), []);
  const { data: shieldStatus, refresh: refreshShield } = usePolling(fetchStatus, 3000);

  useEffect(() => {
    const handleShieldUpdate = () => {
      void refreshShield();
    };
    window.addEventListener("sentrix:shield_update", handleShieldUpdate);
    return () => window.removeEventListener("sentrix:shield_update", handleShieldUpdate);
  }, [refreshShield]);

  // Lock body scroll and listen for Escape when mobile drawer is active
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  // Automatically close mobile drawer when route changes during render
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }

  // Automatically close mobile drawer if screen is resized to desktop breakpoint
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener("change", handleMediaChange);
    return () => mql.removeEventListener("change", handleMediaChange);
  }, []);

  const isShieldActive = Boolean(shieldStatus?.shield_active);
  const remainingSec = shieldStatus?.latest_mitigation?.remaining_seconds ?? 0;

  // Determine active route
  const isRouteActive = (routeHref: string) => {
    return pathname === routeHref;
  };

  const sidebarWidth = mounted && collapsed ? "4.75rem" : "16.25rem";

  return (
    <div
      className="app-shell"
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
    >
      {/* Top Header */}
      <header className="app-header" role="banner">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 sm:p-2 w-9 h-9 sm:w-10 sm:h-10 min-w-9 min-h-9 sm:min-w-10 sm:min-h-10 flex items-center justify-center shrink-0 rounded-lg bg-[#1F2937]/70 border border-gray-700/60 text-gray-400 hover:text-[#00FF9D] hover:border-[#00FF9D]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9D] transition-colors"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link className="brand group min-w-0 shrink" href="/overview">
            <span
              className="brand-mark shrink-0 group-hover:shadow-[0_0_20px_rgba(0,255,157,0.45)] transition-shadow"
              aria-hidden="true"
            >
              S
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-100 font-bold tracking-wider sm:tracking-widest text-sm sm:text-base md:text-lg font-mono flex items-center gap-2 truncate">
                SENTRIX
              </span>
              <span className="text-[11px] text-gray-400 font-sans leading-none hidden lg:inline truncate max-w-64 xl:max-w-none">
                DDoS Detection and Mitigation Simulator
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          {/* Synchronized Defense Shield Global Pill */}
          <Link
            href="/protection"
            aria-label={isShieldActive ? `Defense Shield Active: ${remainingSec} seconds remaining` : "Defense Shield Standby"}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono transition-all border shrink-0 ${
              isShieldActive
                ? "bg-[rgba(0,255,157,0.15)] border-[#00FF9D]/60 text-[#00FF9D] shadow-[0_0_14px_rgba(0,255,157,0.35)]"
                : "bg-[#1F2937]/70 border-gray-700/60 text-gray-300 hover:text-white hover:border-gray-600"
            }`}
          >
            <Shield className={`w-3.5 h-3.5 shrink-0 ${isShieldActive ? "text-[#00FF9D] animate-pulse" : "text-[#06B6D4]"}`} />
            <span className="font-bold tracking-tight whitespace-nowrap">
              <span className="hidden sm:inline">SHIELD: </span>
              {isShieldActive ? (
                <>
                  <span className="hidden min-[380px]:inline">ACTIVE </span>
                  <span>({remainingSec}s)</span>
                </>
              ) : (
                <span>STANDBY</span>
              )}
            </span>
          </Link>

          {/* Operational status badge */}
          <span className="mode-badge hidden lg:inline-flex">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse shadow-[0_0_8px_#00FF9D]" />
            DEFENSE ENGINE ARMED
          </span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <nav
        aria-label="Main navigation"
        className={`sidebar hidden lg:flex ${collapsed ? "items-center px-2" : "px-3"}`}
      >
        <div className="w-full flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-2 px-1">
          {!collapsed && <span>Control Menu</span>}
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] shadow-[0_0_8px_#00FF9D] animate-pulse mx-auto lg:mx-0" />
        </div>

        <div className="space-y-1 w-full">
          {NAV_ROUTES.map((route) => {
            const active = isRouteActive(route.href);
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? route.label : undefined}
                className={`sidebar-link flex items-center gap-3 rounded-xl transition-all ${
                  collapsed ? "justify-center p-3" : "justify-between px-3 py-2.5"
                } ${
                  active
                    ? "bg-[#00FF9D]/10 border-l-2 border-l-[#00FF9D] border-y border-r border-[#00FF9D]/30 text-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.15)]"
                    : "text-gray-400 hover:bg-[#1F2937]/60 hover:text-gray-100 border border-transparent"
                }`}
                href={route.href}
              >
                <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00FF9D]" : "text-gray-400"}`} />
                  {!collapsed && (
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold leading-tight font-sans">{route.label}</span>
                      <span className="text-[10px] text-gray-400/80 font-mono leading-tight">
                        {route.sublabel}
                      </span>
                    </div>
                  )}
                </div>

                {!collapsed && route.badge && (
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border shrink-0 ${
                      route.badge === "Live"
                        ? "bg-[#00FF9D]/15 text-[#00FF9D] border-[#00FF9D]/40"
                        : "bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40"
                    }`}
                  >
                    {route.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <div className="mt-auto pt-4 w-full border-t border-gray-800">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#1F2937]/40 hover:bg-[#1F2937] border border-gray-700/50 text-gray-400 hover:text-[#00FF9D] text-xs font-mono transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-[#090D16] border-r border-gray-700/60 p-4 flex flex-col z-10 shadow-2xl h-full max-h-screen overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4 shrink-0">
              <span className="font-mono text-sm font-bold text-gray-100 flex items-center gap-2">
                <span className="brand-mark w-7 h-7 text-xs" aria-hidden="true">S</span>
                SENTRIX
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg min-w-10 min-h-10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9D]"
                aria-label="Close navigation drawer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <nav aria-label="Mobile Navigation Links" className="space-y-1.5 overflow-y-auto flex-1 overscroll-contain pr-1">
              {NAV_ROUTES.map((route) => {
                const active = isRouteActive(route.href);
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all min-h-11 ${
                      active
                        ? "bg-[#00FF9D]/15 border border-[#00FF9D]/40 text-[#00FF9D] shadow-[0_0_15px_rgba(0,255,157,0.1)]"
                        : "text-gray-300 hover:bg-[#1F2937]/70 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00FF9D]" : "text-gray-400"}`} />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-semibold truncate">{route.label}</span>
                        <span className="text-[10px] text-gray-400 font-mono truncate">{route.sublabel}</span>
                      </div>
                    </div>
                    {route.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]/40 shrink-0">
                        {route.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-800 shrink-0">
              <span className="mode-badge w-full justify-center">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse shadow-[0_0_8px_#00FF9D]" />
                DEFENSE ENGINE ARMED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main
        className="main-content"
        id="main-content"
        tabIndex={-1}
        role="region"
        aria-label="SENTRIX Operational Console"
      >
        {children}
      </main>
    </div>
  );
}
