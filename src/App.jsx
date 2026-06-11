import VanillaWarehouse from './components/VanillaWarehouse'
import { useSimulationStore } from './store'

function App() {
  const tasks = useSimulationStore((state) => state.tasks);
  const robots = useSimulationStore((state) => state.robots);
  const assignTask = useSimulationStore((state) => state.assignTask);

  // If ALL robots are NOT idle, the system is busy
  const isBusy = !robots.some(r => r.status === 'Idle');

  // Helper to match colors to robots
  const getRobotColor = (id) => {
    if (id === 'R-01') return 'bg-cyan-500 text-cyan-400';
    if (id === 'R-02') return 'bg-purple-500 text-purple-400';
    if (id === 'R-03') return 'bg-rose-500 text-rose-400';
    return 'bg-slate-500 text-slate-400';
  };

  return (
    <div className="flex h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans">
      
      {/* Left Sidebar */}
      <div className="w-[380px] p-6 border-r border-slate-800/50 flex flex-col gap-6 z-10 bg-slate-950/50 backdrop-blur-sm">
        
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] uppercase">
            Smart Warehouse Robot Simulator
          </h1>
          <p className="text-slate-400 text-xs tracking-widest mt-1 uppercase">Live Server</p>
        </div>

        {/* Fleet Status Card */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">System Status</h2>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Active Fleet</span>
            <span className="text-cyan-400 font-bold font-mono">03</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Tasks Queued</span>
            <span className="text-orange-400 font-bold font-mono">
              {tasks.filter(t => t.status === 'In Transit').length.toString().padStart(2, '0')}
            </span>
          </div>

          {/* DYNAMIC FLEET BATTERIES */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
            {robots.map(robot => {
              const colors = getRobotColor(robot.id).split(' ');
              const barColor = robot.battery > 20 ? colors[0] : 'bg-red-500';
              
              return (
                <div key={robot.id} className="flex justify-between items-center">
                  <span className={`text-xs font-bold font-mono ${colors[1]}`}>{robot.id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${barColor}`} 
                        style={{ width: `${robot.battery}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-300 font-mono text-[10px] w-6">{robot.battery}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Activity Log */}
        <div className="flex-grow flex flex-col gap-3">
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-2">Recent Activity</h2>
          
          <div className="flex flex-col gap-2 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="text-xs text-slate-600 uppercase tracking-widest flex justify-center py-8">
                [ No Active Tasks ]
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex justify-between items-center text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-slate-300 text-xs">{task.id}</span>
                    <span className={`font-mono text-[10px] ${getRobotColor(task.robotId).split(' ')[1]}`}>
                      Assigned: {task.robotId}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[11px] font-bold tracking-wider uppercase ${task.status === 'Completed' ? 'text-green-400' : 'text-orange-400'}`}>
                      {task.status}
                    </span>
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
          disabled={isBusy}
          className={`group relative w-full py-3 rounded-xl font-bold tracking-wide transition-all duration-200 overflow-hidden 
            ${isBusy 
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 active:scale-[0.98]'
            }`}
        >
          <span className="relative flex justify-center items-center gap-2 uppercase text-sm">
            {isBusy ? 'Fleet at Capacity' : <><span className="text-lg leading-none">+</span> Dispatch Unit</>}
          </span>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 flex flex-col relative">
        <div className="absolute top-12 right-12 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-md text-xs font-mono text-slate-400 shadow-lg">
          REC
        </div>
        <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative bg-slate-900">
          <VanillaWarehouse />
        </div>
      </div>

    </div>
  )
}

export default App