import { Terminal, Activity, Wifi, WifiOff, AlertCircle } from 'lucide-react'

export default function Header({ status }) {
  const getStatusDisplay = () => {
    switch(status) {
      case 'Connected':
        return { icon: <Wifi className="w-4 h-4 text-emerald-400" />, color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/30' }
      case 'Disconnected':
        return { icon: <WifiOff className="w-4 h-4 text-red-400" />, color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/30' }
      case 'Error':
        return { icon: <AlertCircle className="w-4 h-4 text-amber-400" />, color: 'text-amber-400', bg: 'bg-amber-400/20', border: 'border-amber-400/30' }
      default:
        return { icon: <Activity className="w-4 h-4 text-slate-400 animate-pulse" />, color: 'text-slate-400', bg: 'bg-slate-400/20', border: 'border-slate-400/30' }
    }
  }

  const s = getStatusDisplay()

  return (
    <header className="glass-card rounded-2xl p-4 flex items-center justify-between z-10 w-full animate-fade-in-down">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-purple-600 to-blue-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Terminal className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            OpenDocs <span className="text-purple-400">AI</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Smart API Documentation Platform</p>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${s.border} ${s.bg} transition-colors duration-500`}>
        {s.icon}
        <span className={`text-xs font-semibold ${s.color}`}>
          {status}
        </span>
      </div>
    </header>
  )
}
