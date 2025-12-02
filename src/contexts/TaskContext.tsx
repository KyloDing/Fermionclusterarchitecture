import { createContext, useContext, ReactNode } from 'react';
import { useTasksProgress } from '../hooks/useTaskProgress';
import { TaskProgress } from '../services/taskService';

interface TaskContextValue {
  tasks: TaskProgress[];
  addTask: (taskId: string, initialProgress?: TaskProgress) => void;
  removeTask: (taskId: string) => void;
  clearCompleted: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const taskManager = useTasksProgress();

  return (
    <TaskContext.Provider value={taskManager}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskManager() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskManager must be used within TaskProvider');
  }
  return context;
}
