// 任务管理服务

export type TaskType = 
  | 'compress' 
  | 'decompress' 
  | 'move' 
  | 'rename' 
  | 'delete' 
  | 'download'
  | 'upload';

export type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface TaskProgress {
  taskId: string;
  type: TaskType;
  status: TaskStatus;
  progress: number; // 0-100
  current: number;
  total: number;
  speed?: string; // 如 "2.5 MB/s"
  eta?: string; // 预计剩余时间
  startTime: string;
  endTime?: string;
  error?: string;
  metadata: {
    operationName: string;
    files: string[];
    targetPath?: string;
    archiveName?: string;
    archiveFormat?: string;
    totalSize?: number;
  };
}

export interface CreateTaskParams {
  type: TaskType;
  operationName: string;
  files: string[];
  targetPath?: string;
  archiveName?: string;
  archiveFormat?: string;
  totalSize?: number;
}

// 创建任务
export async function createTask(params: CreateTaskParams): Promise<{ taskId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      resolve({ taskId });
    }, 100);
  });
}

// 获取任务进度
export async function getTaskProgress(taskId: string): Promise<TaskProgress | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟任务进度数据
      resolve({
        taskId,
        type: 'compress',
        status: 'running',
        progress: 45,
        current: 450,
        total: 1000,
        speed: '2.3 MB/s',
        eta: '00:02:15',
        startTime: new Date().toISOString(),
        metadata: {
          operationName: '压缩文件',
          files: ['file1.txt', 'file2.txt'],
          archiveName: 'archive.zip',
          archiveFormat: 'zip',
          totalSize: 1024000,
        },
      });
    }, 100);
  });
}

// 获取所有任务
export async function getAllTasks(): Promise<TaskProgress[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 100);
  });
}

// 取消任务
export async function cancelTask(taskId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 200);
  });
}

// 清除已完成的任务
export async function clearCompletedTasks(): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 100);
  });
}

// WebSocket 消息类型
export interface TaskProgressMessage {
  type: 'task_progress';
  data: TaskProgress;
}

export interface TaskCompleteMessage {
  type: 'task_complete';
  data: {
    taskId: string;
    status: 'completed' | 'failed';
    error?: string;
  };
}

export type WebSocketMessage = TaskProgressMessage | TaskCompleteMessage;

// 模拟 WebSocket 连接
export class TaskWebSocket {
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private mockTimers: Map<string, NodeJS.Timeout> = new Map();

  connect() {
    console.log('Task WebSocket connected');
  }

  disconnect() {
    console.log('Task WebSocket disconnected');
    // 清理所有模拟定时器
    this.mockTimers.forEach(timer => clearInterval(timer));
    this.mockTimers.clear();
  }

  subscribe(taskId: string, callback: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }
    this.listeners.get(taskId)!.add(callback);

    // 模拟进度推送
    this.startMockProgress(taskId);
  }

  unsubscribe(taskId: string, callback: (message: WebSocketMessage) => void) {
    const listeners = this.listeners.get(taskId);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(taskId);
        this.stopMockProgress(taskId);
      }
    }
  }

  private startMockProgress(taskId: string) {
    if (this.mockTimers.has(taskId)) {
      return;
    }

    let progress = 0;
    const timer = setInterval(() => {
      const listeners = this.listeners.get(taskId);
      if (!listeners || listeners.size === 0) {
        this.stopMockProgress(taskId);
        return;
      }

      progress += Math.random() * 15;

      if (progress >= 100) {
        progress = 100;
        // 发送完成消息
        const completeMessage: TaskCompleteMessage = {
          type: 'task_complete',
          data: {
            taskId,
            status: 'completed',
          },
        };
        listeners.forEach(callback => callback(completeMessage));
        this.stopMockProgress(taskId);
      } else {
        // 发送进度消息
        const progressMessage: TaskProgressMessage = {
          type: 'task_progress',
          data: {
            taskId,
            type: 'compress',
            status: 'running',
            progress: Math.floor(progress),
            current: Math.floor(progress * 10),
            total: 1000,
            speed: `${(Math.random() * 5 + 1).toFixed(1)} MB/s`,
            eta: this.calculateETA(100 - progress),
            startTime: new Date().toISOString(),
            metadata: {
              operationName: '处理中',
              files: [],
            },
          },
        };
        listeners.forEach(callback => callback(progressMessage));
      }
    }, 500);

    this.mockTimers.set(taskId, timer);
  }

  private stopMockProgress(taskId: string) {
    const timer = this.mockTimers.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.mockTimers.delete(taskId);
    }
  }

  private calculateETA(remainingProgress: number): string {
    const seconds = Math.floor(remainingProgress * 2);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

// 单例 WebSocket 实例
let wsInstance: TaskWebSocket | null = null;

export function getTaskWebSocket(): TaskWebSocket {
  if (!wsInstance) {
    wsInstance = new TaskWebSocket();
    wsInstance.connect();
  }
  return wsInstance;
}
