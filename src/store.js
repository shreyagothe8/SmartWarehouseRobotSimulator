import { create } from 'zustand';

export const useSimulationStore = create((set) => ({
  // The Fleet (3 Robots)
  robots: [
    { id: 'R-01', status: 'Idle', battery: 100 },
    { id: 'R-02', status: 'Idle', battery: 100 },
    { id: 'R-03', status: 'Idle', battery: 100 }
  ],
  
  tasks: [],

  // Action: Assign task to the first available robot
  assignTask: () => set((state) => {
    // Find the first robot that is doing nothing
    const idleRobot = state.robots.find(r => r.status === 'Idle');
    
    // If everyone is busy, don't do anything
    if (!idleRobot) return state;

    const newTaskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask = {
      id: newTaskId,
      status: 'In Transit',
      robotId: idleRobot.id, // Tag the task with the assigned robot!
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    return {
      tasks: [newTask, ...state.tasks].slice(0, 5),
      // Set that specific robot to Active
      robots: state.robots.map(r => 
        r.id === idleRobot.id ? { ...r, status: 'Active' } : r
      )
    };
  }),

  // Action: Mark task done, free up the specific robot, drain its battery
  completeTask: (taskId) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    return {
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, status: 'Completed' } : t
      ),
      robots: state.robots.map(r => 
        r.id === task.robotId ? { 
          ...r, 
          status: 'Idle', 
          battery: Math.max(0, r.battery - 5) 
        } : r
      )
    };
  })
}));