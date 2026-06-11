import { create } from 'zustand';

export const useSimulationStore = create((set) => ({
  robots: [
    { id: 'R-01', status: 'Idle', x: 0, z: 0, battery: 100 }
  ],
  
  //The Task Queue
  tasks: [],

  assignTask: () => set((state) => {
    const newTaskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask = {
      id: newTaskId,
      status: 'Assigned',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    return {
      // Add the new task to the top of the list, keep only the latest 4
      tasks: [newTask, ...state.tasks].slice(0, 4)
    };
  })
}));