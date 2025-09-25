'use client';
import { Search } from 'lucide-react';

export default function EditorShell() {
  return (
    <div className="h-screen w-full bg-bg-primary text-text-primary">
      <div className="flex h-full">
        {/* Sidebar (C1) */}
        <aside
          id="col-folders"
          className="w-[200px] shrink-0 bg-bg-secondary border-r border-border-dark flex flex-col"
          aria-label="Sidebar"
          tabIndex={0}
        >
          <div className="px-3 py-2 text-sm text-text-secondary uppercase tracking-wider">Navigation</div>
          <nav className="flex-1 px-2 space-y-1">
            {['All Notes','TODO','CONTACTS','PROJECTS'].map((item) => (
              <button
                key={item}
                className="w-full text-left px-2 py-2 rounded-md hover:bg-[color:var(--bg-active)]/40 focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="p-2">
            <button className="w-full py-2 rounded-md bg-accent-blue text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-blue">
              + New Folder
            </button>
          </div>
        </aside>

        {/* Stred + Pravá časť */}
        <div className="flex flex-1 min-w-0">
          {/* Shared Header for C2+C3 */}
          <header className="absolute left-[200px] right-0 h-12 bg-bg-secondary border-b border-border-dark flex items-center gap-2 px-3">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-md bg-accent-blue text-white hover:opacity-90">+ New Note</button>
              <div className="flex gap-1 text-text-secondary">
                <button className="px-2 py-1 rounded-md hover:bg-[color:var(--bg-active)]/40 border border-transparent data-[active=true]:border-accent-blue" data-active>
                  Notes
                </button>
                <button className="px-2 py-1 rounded-md hover:bg-[color:var(--bg-active)]/40">Trash</button>
              </div>
            </div>
            <div className="ml-auto relative w-[320px] max-w-[40vw]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-text-secondary" />
              <input
                placeholder="Search…"
                className="w-full pl-8 pr-2 py-2 rounded-md bg-bg-primary border border-border-dark text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
          </header>

          {/* List Panel (C2) */}
          <section
            id="col-notes"
            className="w-[250px] shrink-0 bg-bg-primary border-r border-border-dark pt-12 overflow-y-auto"
            aria-label="Notes list"
            tabIndex={0}
          >
            <ul className="p-2 space-y-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <li key={i}>
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-[color:var(--bg-active)]/40 data-[active=true]:bg-[color:var(--bg-active)]">
                    <div className="text-sm truncate">Note title {i+1}</div>
                    <div className="text-xs text-text-secondary">2025-09-25 · updated</div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Editor Area (C3) */}
          <main
            id="col-editor"
            className="flex-1 min-w-0 bg-bg-primary pt-12"
            aria-label="Editor"
            tabIndex={0}
          >
            <div className="h-full max-w-4xl mx-auto px-6 py-6">
              {/* Toolbar (decent accent underline) */}
              <div className="mb-3 border-b border-border-dark">
                <div className="flex gap-1 pb-2">
                  {['B','I','H1','H2','• List','Code'].map((t) => (
                    <button key={t} className="px-2 py-1 rounded-md hover:bg-[color:var(--bg-active)]/40">
                      {t}
                    </button>
                  ))}
                </div>
                <div className="h-0.5 bg-accent-blue/50 rounded-full" />
              </div>

              {/* Title */}
              <input
                className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-text-secondary mb-3"
                placeholder="Untitled"
              />

              {/* Editor textarea (monospace friendly) */}
              <textarea
                className="w-full h-[60vh] bg-transparent outline-none resize-none leading-7 text-[15px] placeholder:text-text-secondary"
                placeholder="Start writing…"
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}