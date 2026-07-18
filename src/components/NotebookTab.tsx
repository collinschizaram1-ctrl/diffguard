/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Save, 
  Check, 
  Search, 
  Clock, 
  BookOpen, 
  Copy,
  Edit3,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NotebookTabProps {
  sidebarOpen: boolean;
}

export default function NotebookTab({ sidebarOpen }: NotebookTabProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem("diffguard_pentest_notes");
      if (storedNotes) {
        const parsed = JSON.parse(storedNotes) as Note[];
        // Sort by updatedAt descending
        const sorted = parsed.sort((a, b) => b.updatedAt - a.updatedAt);
        setNotes(sorted);
        if (sorted.length > 0) {
          setActiveNoteId(sorted[0].id);
          setTitleInput(sorted[0].title);
        }
      } else {
        // Create initial default note if empty
        const defaultNote: Note = {
          id: "welcome-note",
          title: "Monad Pentesting Cheatsheet",
          content: `# Monad Security Audit Notes

## Parallel EVM Contention Checkpoints
1. Global Counter Bottlenecks:
   - Check if the contract uses a single global state variable (e.g. \`globalTxCount\` or \`totalPoolDeposits\`) that gets updated on every transaction.
   - Remediation: Partition state variables, use off-chain aggregators, or process events.

2. Reentrancy Vulnerabilities:
   - Ensure checks-effects-interactions (CEI) patterns are respected strictly.
   - Example: Perform balance deductions BEFORE performing external calls.

## Quick Commands
- Run static analyzer: \`slither contracts/MonadLendingPool.sol\`
- Execute unit tests: \`forge test -vvv --gas-report\`
`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setNotes([defaultNote]);
        setActiveNoteId(defaultNote.id);
        setTitleInput(defaultNote.title);
        localStorage.setItem("diffguard_pentest_notes", JSON.stringify([defaultNote]));
      }
    } catch (e) {
      console.error("Failed to load notes", e);
    }
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  // Handle note contents change with Auto-Save
  const handleContentChange = (newContent: string) => {
    if (!activeNoteId) return;

    setSaveStatus("saving");

    // Update notes state
    const updatedNotes = notes.map(note => {
      if (note.id === activeNoteId) {
        return {
          ...note,
          content: newContent,
          updatedAt: Date.now()
        };
      }
      return note;
    });

    setNotes(updatedNotes);

    // Debounce localStorage write
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem("diffguard_pentest_notes", JSON.stringify(updatedNotes));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (err) {
        setSaveStatus("error");
      }
    }, 800);
  };

  // Create a new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNoteId(newNote.id);
    setTitleInput(newNote.title);
    setIsEditingTitle(true);
    localStorage.setItem("diffguard_pentest_notes", JSON.stringify(updated));
  };

  // Delete current active note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem("diffguard_pentest_notes", JSON.stringify(updated));

    if (activeNoteId === id) {
      if (updated.length > 0) {
        setActiveNoteId(updated[0].id);
        setTitleInput(updated[0].title);
      } else {
        setActiveNoteId(null);
        setTitleInput("");
      }
    }
  };

  // Manual save of active note title
  const handleSaveTitle = () => {
    if (!activeNoteId || !titleInput.trim()) {
      setIsEditingTitle(false);
      return;
    }

    const updated = notes.map(note => {
      if (note.id === activeNoteId) {
        return {
          ...note,
          title: titleInput.trim(),
          updatedAt: Date.now()
        };
      }
      return note;
    });

    setNotes(updated);
    setIsEditingTitle(false);
    localStorage.setItem("diffguard_pentest_notes", JSON.stringify(updated));
  };

  // Copy active note content
  const handleCopyContent = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="notebook-container" className="flex-1 flex overflow-hidden bg-monad-deep">
      {/* Notebook sidebar/list */}
      <div className="w-80 border-r border-[#222631] bg-[#101217] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#222631]/50 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0088FF]" />
              Security Notebook
            </h2>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-[#0088FF]/10 hover:bg-[#0088FF]/20 border border-[#0088FF]/30 text-[#0088FF] hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Create New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search note contents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#222631] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0088FF]/50 transition-colors"
            />
          </div>
        </div>

        {/* Note list items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 h-64">
              <FileText className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-xs">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              const preview = note.content
                ? note.content.replace(/[#*`]/g, "").slice(0, 60) + (note.content.length > 60 ? "..." : "")
                : "Empty note";
              const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setTitleInput(note.title);
                    setIsEditingTitle(false);
                  }}
                  className={`group p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                    isActive
                      ? "bg-[#202533]/40 border-[#0088FF] shadow-md"
                      : "bg-[#0D0F14] border-[#222631]/60 hover:border-[#222631] hover:bg-[#0D0F14]/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-white leading-tight truncate flex-1">
                      {note.title || "Untitled Note"}
                    </span>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal line-clamp-2 mb-2 font-light">
                    {preview}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Note Editor Area */}
      <div className="flex-1 flex flex-col bg-monad-deep overflow-hidden">
        {activeNote ? (
          <>
            {/* Editor Header */}
            <div className="px-6 py-4 border-b border-[#222631]/50 flex items-center justify-between gap-4 shrink-0 bg-[#0D0F14]/40">
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      onBlur={handleSaveTitle}
                      autoFocus
                      className="bg-[#0D0F14] border border-[#0088FF]/50 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-[#0088FF] w-full max-w-md font-sans"
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group max-w-fit">
                    <h1 className="font-display font-bold text-base text-white leading-snug truncate">
                      {activeNote.title || "Untitled Note"}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#1E222D] text-gray-500 hover:text-gray-300 transition-opacity cursor-pointer"
                      title="Edit Title"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-1.5 text-[10px] text-gray-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-600" />
                    <span>Created: {new Date(activeNote.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span>Updated: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-gray-500 mr-2">
                  {saveStatus === "saving" && "Saving..."}
                  {saveStatus === "saved" && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Auto-saved
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Save Error
                    </span>
                  )}
                </span>

                <button
                  onClick={handleCopyContent}
                  className="bg-[#14171E] hover:bg-[#1E222D] border border-[#222631] text-gray-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy notes to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Note Editor Body */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing security analysis notes, test logs, contract addresses or general cheatsheets..."
                className="flex-1 w-full bg-[#0D0F14]/60 border border-[#222631]/80 rounded-2xl p-5 text-sm text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:border-[#222631] leading-relaxed resize-none overflow-y-auto select-text selection:bg-[#0088FF]/30"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <BookOpen className="w-12 h-12 text-gray-700 mb-3 animate-pulse" />
            <h3 className="font-display font-semibold text-sm text-white mb-1.5">No Active Note Selected</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">
              Select an existing security note from the sidebar, or create a brand new note to begin documenting your findings.
            </p>
            <button
              onClick={handleCreateNote}
              className="bg-[#0088FF] hover:bg-[#0088FF]/90 text-white font-mono text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-xl cursor-pointer shadow-lg shadow-[#0088FF]/10 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
