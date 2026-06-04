"use client";

import React, { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

export const TopHeader: React.FC = () => {
  const { workspaces, activeWorkspaceId, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState("Develop my idea");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName, newWorkspaceDesc, newWorkspaceType);
      setNewWorkspaceName("");
      setNewWorkspaceDesc("");
      setCreateModalOpen(false);
    }
  };

  return (
    <>
      <header className="bg-surface-glass text-primary font-headline fixed top-0 right-0 left-0 md:left-nav-width h-16 backdrop-blur-md border-b border-outline-glow shadow-sm flex items-center justify-between px-6 z-40">
        {/* Left Side: Workspace Selector */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-surface-container-high/60 border border-outline-glow rounded-lg px-3 py-1.5 hover:border-primary transition-all text-on-surface text-sm cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
            <span className="font-semibold text-sm max-w-[120px] sm:max-w-none truncate">
              {activeWorkspace?.name || "Select Workspace"}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              keyboard_arrow_down
            </span>
          </button>

          {/* Switcher Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-12 left-0 w-64 bg-surface-container-highest border border-outline-glow rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
              <div className="text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest px-2.5 py-1.5 border-b border-outline-glow/50 mb-1">
                Your Workspaces
              </div>
              <ul className="space-y-1">
                {workspaces.map((ws) => (
                  <li key={ws.id}>
                    <button
                      onClick={() => {
                        switchWorkspace(ws.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        ws.id === activeWorkspaceId
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{ws.name}</span>
                        <span className="text-[9px] text-on-surface-variant truncate font-normal">{ws.description}</span>
                      </div>
                      {ws.id === activeWorkspaceId && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setCreateModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 mt-2 border-t border-outline-glow/50 hover:bg-surface-variant/30 text-primary text-xs font-semibold flex items-center gap-2 rounded-b-lg"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Create New Venture
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Indicators and Actions */}
        <div className="flex items-center gap-3">
          {/* Credits Widget */}
          {activeWorkspace && (
            <div className="hidden sm:flex items-center gap-2 bg-surface-container-high/60 border border-outline-glow rounded-lg px-3 py-1.5 text-xs text-on-surface font-mono">
              <span className="material-symbols-outlined text-[16px] text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <span>
                <span className="text-secondary font-bold">
                  {activeWorkspace.credits.toLocaleString("id-ID")}
                </span>{" "}
                <span className="text-[10px] text-on-surface-variant">Credits</span>
              </span>
            </div>
          )}

          {/* Search bar inside header */}
          <div className="hidden lg:flex items-center bg-surface-container-high rounded-full px-3 py-1.5 border border-outline-glow focus-within:border-primary transition-colors w-48 xl:w-60">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
            <input
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-on-surface text-xs w-full placeholder-on-surface-variant/40 p-0"
              placeholder="Search workspaces..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Invite Collaborator Button */}
            <button 
              onClick={() => alert("Invite link copied to clipboard: https://hipmipreneur.com/invite/ws-nexus")}
              className="hidden sm:flex items-center gap-1.5 bg-primary-container text-on-primary-container px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Invite</span>
            </button>

            {/* Notifications Button */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 transition-colors scale-95 active:scale-90 relative cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full shadow-[0_0_5px_#ffb4ab]"></span>
            </button>

            {/* Apps Button */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 transition-colors scale-95 active:scale-90 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">apps</span>
            </button>
          </div>
        </div>
      </header>

      {/* Create Workspace Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              Start New Venture
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Create an isolated workspace. All business models, transcripts, research signals, and marketing artifacts will remain compartmentalized.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Venture Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus AI"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Venture Description</label>
                <textarea
                  placeholder="What idea, problem, or product is this workspace focusing on?"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Starting Venture Type</label>
                <select
                  value={newWorkspaceType}
                  onChange={(e) => setNewWorkspaceType(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-glow rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                >
                  <option value="Develop my idea">Develop my idea (Raw concept validation)</option>
                  <option value="Find my idea">Find my idea (Market discovery first)</option>
                  <option value="Grow my business">Grow my business (Scaling and GTM refinement)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-outline-glow text-on-surface-variant rounded-lg text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs shadow-[0_0_15px_rgba(192,193,255,0.3)] hover:shadow-[0_0_20px_rgba(192,193,255,0.5)] transition-all cursor-pointer"
                >
                  Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
