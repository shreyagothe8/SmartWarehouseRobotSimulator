import { create } from 'zustand';

// Hardcoded coordinates of our storage racks for the routing engine
const RACK_LOCATIONS = [
  [-10, -10], [-10, -4], [-10, 2], [-10, 8],
  [-4, -10], [-4, -4], [-4, 2], [-4, 8],
  [2, -10], [2, -4], [2, 2], [2, 8]
];

export const useSimulationStore = create((set) => ({
  robots: [
    { id: 'R-01', status: 'Idle', battery: 100 },
    { id: 'R-02', status: 'Idle', battery: 100 },
    { id: 'R-03', status: 'Idle', battery: 100 }
  ],
  tasks: [],

  assignTask: () => set((state) => {
    const idleRobot = state.robots.find(r => r.status === 'Idle');
    if (!idleRobot) return state;

    // Pick a random rack for the robot to drive to
    const targetRack = RACK_LOCATIONS[Math.floor(Math.random() * RACK_LOCATIONS.length)];

    const newTask = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Retrieving', // Phase 1
      robotId: idleRobot.id,
      rackX: targetRack[0],
      rackZ: targetRack[1],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    return {
      tasks: [newTask, ...state.tasks].slice(0, 5),
      robots: state.robots.map(r => r.id === idleRobot.id ? { ...r, status: 'Active' } : r)
    };
  }),

  // Phase 2: Robot reached the rack, now send to delivery
  advanceTask: (taskId) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId ? { ...t, status: 'Delivering' } : t
    )
  })),

  // Phase 3: Robot reached the drop zone
  completeTask: (taskId) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t),
      robots: state.robots.map(r => r.id === task.robotId ? { 
        ...r, status: 'Idle', battery: Math.max(0, r.battery - 5) 
      } : r)
    };
  })
}));