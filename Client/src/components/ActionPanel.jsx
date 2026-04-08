import { Sparkles, FolderOpen, CheckCircle2, Terminal, MousePointer2 } from 'lucide-react'

export default function ActionPanel({ onTrack, onBrowse, isGenerating, lastUpdated, projectPath }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute -inset-10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl rounded-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Zero-Copy Engine
        </h2>
        <p className="text-sm text-slate-400">
          Select a project folder directly from your machine to begin live tracking.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Large "Upload Style" Folder Picker Button */}
        <div 
          onClick={onBrowse}
          className={`relative group/selector w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden ${
            projectPath 
              ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50' 
              : 'border-slate-800 hover:border-purple-500/50 hover:bg-purple-600/5'
          }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent bg-[length:200%_200%] group-hover/selector:bg-[100%_100%] transition-all duration-1000" />

            <FolderOpen className={`w-10 h-10 mb-3 transition-all duration-500 ${
              projectPath ? 'text-emerald-400 scale-110' : 'text-slate-600 group-hover/selector:text-purple-400 group-hover/selector:scale-110'
            }`} />
            
            <div className="text-center px-4 relative z-10">
              <span className={`block text-xs font-bold transition-colors ${
                projectPath ? 'text-emerald-200' : 'text-slate-400 group-hover/selector:text-slate-100'
              }`}>
                {projectPath ? 'Project Location Selected' : 'Click to Select Folder'}
              </span>
              {projectPath && (
                <span className="block text-[10px] text-emerald-500/80 mt-1 font-mono truncate max-w-[240px]">
                  {projectPath}
                </span>
              )}
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover/selector:opacity-100 transition-opacity">
                <MousePointer2 className="w-4 h-4 text-purple-400 animate-bounce" />
            </div>
        </div>

        {projectPath && (
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Location</span>
            <button 
              onClick={onBrowse}
              className="text-[10px] font-black text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <button
          onClick={onTrack}
          disabled={isGenerating || !projectPath}
          className={`relative w-full overflow-hidden rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isGenerating || !projectPath
              ? 'bg-purple-600/30 cursor-not-allowed text-white/50' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 active:scale-[0.98]'
          }`}
      >
          {isGenerating ? (
          <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting Tracker...
          </>
          ) : (
          <>
              <Terminal className="w-5 h-5" />
              Connect Live Folder
          </>
          )}
      </button>

      {lastUpdated && !isGenerating && (
        <div className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-xl animate-fade-in shadow-xl shadow-emerald-500/5">
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500 blur-sm animate-pulse-slow" />
             <CheckCircle2 className="w-5 h-5 flex-shrink-0 relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">LIVE TRACKER ACTIVE</span>
            <span className="opacity-80 text-[10px] uppercase font-mono tracking-tighter">Syncing directly with local source</span>
          </div>
        </div>
      )}
    </div>
  )
}
