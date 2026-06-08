"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWorkspace } from "../context/WorkspaceContext";

interface SideNavBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ isOpen, onClose }) => {
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
    <nav className={`fixed left-0 top-0 h-screen w-[280px] bg-surface-glass backdrop-blur-xl border-r border-outline-glow flex flex-col pt-5 pb-3 px-3 z-50 transition-transform duration-300 md:translate-x-0 overflow-hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-4 px-3 h-10 shrink-0">
        <Image
          src="/Logo/Transpart.png"
          alt="Hipmipreneur Logo"
          width={160}
          height={48}
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
        <button
          onClick={onClose}
          className="md:hidden text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Main Navigation - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 custom-scrollbar pb-2">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 mb-1">
              {group.title}
            </span>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item, itemIdx) => {
                const active = isLinkActive(item.path);
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border-l-4 ${
                        active
                          ? "text-primary font-semibold border-primary bg-primary/10"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 border-transparent"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{
                          fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
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

      {/* Bottom Section — always visible, never clipped */}
      <div className="shrink-0 pt-3 flex flex-col gap-2.5 border-t border-outline-glow">
        {/* Ask IVA CTA */}
        <Link
          href="/dashboard/canvas"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-on-primary font-headline text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            smart_toy
          </span>
          <span>Ask IVA</span>
        </Link>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg glass-panel">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Founders Profile"
              className="w-full h-full object-cover"
              src={userProfile.avatar}
            />
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
