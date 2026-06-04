"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWorkspace } from "../context/WorkspaceContext";

export const SideNavBar: React.FC = () => {
  const pathname = usePathname();
  const { userProfile } = useWorkspace();

  const isLinkActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard/get-started") {
      return true;
    }
    return pathname === path || pathname.startsWith(path + "/");
  };

  const navGroups = [
    {
      title: "Navigation",
      items: [
        { name: "Get Started", path: "/dashboard/get-started", icon: "dashboard" },
      ],
    },
    {
      title: "Business Model",
      items: [
        { name: "Canvas", path: "/dashboard/canvas", icon: "view_quilt" },
        { name: "Builder", path: "/dashboard/builder", icon: "account_tree" },
      ],
    },
    {
      title: "Validation",
      items: [
        { name: "Research", path: "/dashboard/research", icon: "science" },
        { name: "Interviews", path: "/dashboard/interviews", icon: "forum" },
        { name: "Scripts", path: "/dashboard/scripts", icon: "description" },
      ],
    },
    {
      title: "Go-To-Market",
      items: [
        { name: "Personas", path: "/dashboard/personas", icon: "assignment_ind" },
        { name: "Positioning", path: "/dashboard/positioning", icon: "campaign" },
        { name: "Landing Pages", path: "/dashboard/landing-pages", icon: "web" },
        { name: "Sales Decks", path: "/dashboard/sales-decks", icon: "slideshow" },
      ],
    },
    {
      title: "Operations",
      items: [
        { name: "Analyses", path: "/dashboard/analyses", icon: "analytics" },
        { name: "Contacts", path: "/dashboard/contacts", icon: "contacts" },
        { name: "Calendar", path: "/dashboard/calendar", icon: "calendar_today" },
        { name: "Notes", path: "/dashboard/notes", icon: "note_alt" },
        { name: "Glossary", path: "/dashboard/glossary", icon: "book" },
        { name: "Settings", path: "/dashboard/settings", icon: "settings" },
      ],
    },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-[280px] bg-surface-glass backdrop-blur-md border-r border-outline-glow shadow-[inset_0_0_10px_rgba(192,193,255,0.1)] flex flex-col py-6 px-3 z-50 hidden md:flex">
      {/* Brand Header */}
      <div className="flex items-center justify-start mb-6 px-3 h-12 shrink-0">
        <Image
          src="/Logo/Transpart.png"
          alt="Hipmipreneur Logo"
          width={160}
          height={48}
          className="object-contain filter drop-shadow-[0_0_8px_rgba(192,193,255,0.4)]"
          style={{ width: "auto", height: "100%" }}
        />
      </div>

      {/* Main Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest px-3 mb-1">
              {group.title}
            </span>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item, itemIdx) => {
                const active = isLinkActive(item.path);
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border-l-4 ${
                        active
                          ? "text-primary font-semibold border-primary bg-primary/10 shadow-[inset_0_0_10px_rgba(192,193,255,0.1)]"
                          : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 border-transparent"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110"
                        style={{
                          fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                          textShadow: active ? "0 0 10px rgba(192,193,255,0.5)" : "none",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm font-body">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-outline-glow">
        {/* Ask IVA CTA */}
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-inverse-primary text-white font-headline text-xs font-semibold neon-glow-primary hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
          <span className="material-symbols-outlined text-[16px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            smart_toy
          </span>
          <span>Ask IVA</span>
        </button>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container-low border border-outline-glow">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-glow shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Founders Profile"
              className="w-full h-full object-cover"
              src={userProfile.avatar}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline text-xs font-semibold text-on-surface truncate">
              {userProfile.name}
            </p>
            <p className="font-mono text-[9px] text-on-surface-variant truncate">
              {userProfile.role}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};
