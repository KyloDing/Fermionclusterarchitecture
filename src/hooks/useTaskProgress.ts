import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TaskProgress,
  WebSocketMessage,
  getTaskWebSocket,
  getTaskProgress,
} from '../services/taskService';

export function useTaskProgress(taskId: string | null) {
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const callbackRef = useRef<((message: WebSocketMessage) => void) | null>(null);

  useEffect(() => {
    if (!taskId) {
      setProgress(null);
      setIsSubscribed(false);
      return;
    }

    // 初始加载任务进度
    getTaskProgress(taskId).then((data) => {
      if (data) {
        setProgress(data);
      }
    });

    // 订阅 WebSocket 更新
    const ws = getTaskWebSocket();
    const callback = (message: WebSocketMessage) => {
      if (message.type === 'task_progress') {
        setProgress(message.data);
      } else if (message.type === 'task_complete') {
        // 任务完成，获取最终状态
        getTaskProgress(taskId).then((data) => {
          if (data) {
            setProgress({
              ...data,
              status: message.data.status,
              progress: 100,
              error: message.data.error,
            });
          }
        });
      }
    };

    callbackRef.current = callback;
    ws.subscribe(taskId, callback);
    setIsSubscribed(true);

    return () => {
      if (callbackRef.current) {
        ws.unsubscribe(taskId, callbackRef.current);
        callbackRef.current = null;
      }
      setIsSubscribed(false);
    };
  }, [taskId]);

  return { progress, isSubscribed };
}

// 管理多个任务的进度
export function useTasksProgress() {
  const [tasks, setTasks] = useState<Map<string, TaskProgress>>(new Map());
  const subscriptionsRef = useRef<Map<string, (message: WebSocketMessage) => void>>(new Map());

  const addTask = useCallback((taskId: string, initialProgress?: TaskProgress) => {
    if (initialProgress) {
      setTasks((prev) => new Map(prev).set(taskId, initialProgress));
    }

    // 订阅任务进度
    const ws = getTaskWebSocket();
    const callback = (message: WebSocketMessage) => {
      if (message.type === 'task_progress') {
        setTasks((prev) => new Map(prev).set(taskId, message.data));
      } else if (message.type === 'task_complete') {
        setTasks((prev) => {
          const newMap = new Map(prev);
          const task = newMap.get(taskId);
          if (task) {
            newMap.set(taskId, {
              ...task,
              status: message.data.status,
              progress: 100,
              error: message.data.error,
              endTime: new Date().toISOString(),
            });
          }
          return newMap;
        });
      }
    };

    subscriptionsRef.current.set(taskId, callback);
    ws.subscribe(taskId, callback);
  }, []);

  const removeTask = useCallback((taskId: string) => {
    const callback = subscriptionsRef.current.get(taskId);
    if (callback) {
      const ws = getTaskWebSocket();
      ws.unsubscribe(taskId, callback);
      subscriptionsRef.current.delete(taskId);
    }

    setTasks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(taskId);
      return newMap;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => {
      const newMap = new Map();
      prev.forEach((task, taskId) => {
        if (task.status === 'running' || task.status === 'pending') {
          newMap.set(taskId, task);
        } else {
          // 取消订阅已完成的任务
          const callback = subscriptionsRef.current.get(taskId);
          if (callback) {
            const ws = getTaskWebSocket();
            ws.unsubscribe(taskId, callback);
            subscriptionsRef.current.delete(taskId);
          }
        }
      });
      return newMap;
    });
  }, []);

  useEffect(() => {
    return () => {
      // 清理所有订阅
      const ws = getTaskWebSocket();
      subscriptionsRef.current.forEach((callback, taskId) => {
        ws.unsubscribe(taskId, callback);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    tasks: Array.from(tasks.values()),
    addTask,
    removeTask,
    clearCompleted,
  };
}
