import VanillaWarehouse from './components/VanillaWarehouse'
import { useSimulationStore } from './store'

function App() {
  // Connect the UI directly to the Zustand store
  const tasks = useSimulationStore((state) => state.tasks);
  const robots = useSimulationStore((state) => state.robots);
  const assignTask = useSimulationStore((state) => state.assignTask);

  return (
    <div className="flex h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans">
      
      {/* Left Sidebar: UI Dashboard */}
      <div className="w-[380px] p-6 border-r border-slate-800/50 flex flex-col gap-6 z-10 bg-slate-950/50 backdrop-blur-sm">
        
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] uppercase">
              Smart Warehouse Robot Simulator
          </h1>
          <p className="text-slate-400 text-xs tracking-widest mt-1 uppercase">Live Environment</p>
        </div>

        {/* Fleet Status Card */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">System Status</h2>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Active Robots</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-400 font-bold font-mono">
                {robots.length.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pending Tasks</span>
            <span className="text-orange-400 font-bold font-mono">
              {tasks.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Dynamic Activity Log */}
        <div className="flex-grow flex flex-col gap-3">
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-2">Recent Activity</h2>
          
          <div className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              // Completely blank empty state - no fake tasks.
              <div className="text-xs text-slate-600 uppercase tracking-widest flex justify-center py-8">
                [ No Active Tasks ]
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex justify-between items-center text-sm">
                  <span className="font-mono text-cyan-300">{task.id}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-orange-400 text-xs">{task.status}</span>
                    <span className="text-slate-500 text-[10px]">{task.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={assignTask}
          className="group relative w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 py-3 rounded-xl font-bold tracking-wide transition-all duration-200 active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative flex justify-center items-center gap-2 uppercase text-sm">
            <span className="text-lg leading-none">+</span> Dispatch Unit
          </span>
        </button>
      </div>

      {/* Right Content */}
      <div className="flex-grow p-4 md:p-8 flex flex-col relative">
        <div className="absolute top-12 right-12 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-md text-xs font-mono text-slate-400 shadow-lg">
          REC // CAMERA_01
        </div>
        <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative bg-slate-900">
          <VanillaWarehouse />
        </div>
      </div>

    </div>
  )
}

export default App