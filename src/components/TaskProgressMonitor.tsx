import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  Archive,
  Download,
  Upload,
  Move,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  Minimize2,
  Maximize2,
  FolderArchive,
} from 'lucide-react';
import { useTasksProgress } from '../hooks/useTaskProgress';
import { TaskProgress, TaskType, cancelTask } from '../services/taskService';
import { toast } from 'sonner@2.0.3';

interface TaskProgressMonitorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TaskProgressMonitor({
  open: controlledOpen,
  onOpenChange,
}: TaskProgressMonitorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const { tasks, removeTask, clearCompleted } = useTasksProgress();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  const getTaskIcon = (type: TaskType) => {
    const icons = {
      compress: Archive,
      decompress: FolderArchive,
      move: Move,
      rename: Edit,
      delete: Trash2,
      download: Download,
      upload: Upload,
    };
    return icons[type] || Archive;
  };

  const getTaskTypeLabel = (type: TaskType) => {
    const labels = {
      compress: '压缩',
      decompress: '解压',
      move: '移动',
      rename: '重命名',
      delete: '删除',
      download: '下载',
      upload: '上传',
    };
    return labels[type] || type;
  };

  const getStatusConfig = (status: TaskProgress['status']) => {
    const configs = {
      pending: {
        label: '等待中',
        color: 'bg-slate-100 text-slate-700',
        icon: Clock,
      },
      running: {
        label: '进行中',
        color: 'bg-blue-100 text-blue-700',
        icon: Loader2,
      },
      completed: {
        label: '已完成',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      },
      failed: {
        label: '失败',
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
      },
      cancelled: {
        label: '已取消',
        color: 'bg-slate-100 text-slate-700',
        icon: XCircle,
      },
    };
    return configs[status] || configs.pending;
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await cancelTask(taskId);
      toast.success('任务已取消');
    } catch (error) {
      toast.error('取消任务失败');
    }
  };

  const handleClearCompleted = () => {
    clearCompleted();
    toast.success('已清除完成的任务');
  };

  const runningTasks = tasks.filter(
    (t) => t.status === 'running' || t.status === 'pending'
  );
  const completedTasks = tasks.filter(
    (t) => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled'
  );

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const TaskItem = ({ task }: { task: TaskProgress }) => {
    const TaskIcon = getTaskIcon(task.type);
    const statusConfig = getStatusConfig(task.status);
    const StatusIcon = statusConfig.icon;
    const isRunning = task.status === 'running' || task.status === 'pending';

    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <TaskIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{task.metadata.operationName}</h4>
                  <Badge variant="outline" className={statusConfig.color}>
                    <StatusIcon
                      className={`w-3 h-3 mr-1 ${
                        task.status === 'running' ? 'animate-spin' : ''
                      }`}
                    />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {task.metadata.files.length > 0 &&
                    `${task.metadata.files[0]}${
                      task.metadata.files.length > 1
                        ? ` 等 ${task.metadata.files.length} 项`
                        : ''
                    }`}
                </p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {isRunning && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelTask(task.taskId)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              {!isRunning && (
                <Button variant="ghost" size="sm" onClick={() => removeTask(task.taskId)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 进度条 */}
          {isRunning && (
            <div className="space-y-2">
              <Progress value={task.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {task.current} / {task.total} 项
                </span>
                <div className="flex items-center gap-3">
                  {task.speed && <span>{task.speed}</span>}
                  {task.eta && <span>剩余 {task.eta}</span>}
                </div>
              </div>
            </div>
          )}

          {/* 完成信息 */}
          {task.status === 'completed' && (
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-green-600">✓ 完成于 {formatTime(task.endTime!)}</span>
              {task.metadata.totalSize && (
                <span>{formatSize(task.metadata.totalSize)}</span>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {task.status === 'failed' && task.error && (
            <div className="text-xs text-red-600 mt-2">错误: {task.error}</div>
          )}

          {/* 任务详情 */}
          {task.metadata.archiveName && (
            <div className="text-xs text-slate-500 mt-2">
              {task.type === 'compress' ? '压缩为' : '解压到'}: {task.metadata.archiveName}
            </div>
          )}
          {task.metadata.targetPath && (
            <div className="text-xs text-slate-500 mt-2">
              目标路径: {task.metadata.targetPath}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Archive className="w-4 h-4 mr-2" />
          任务
          {runningTasks.length > 0 && (
            <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">
              {runningTasks.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>任务管理</span>
            <div className="flex gap-2">
              {completedTasks.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearCompleted}>
                  清除已完成
                </Button>
              )}
            </div>
          </SheetTitle>
          <SheetDescription>
            {runningTasks.length > 0
              ? `${runningTasks.length} 个任务正在进行`
              : '没有正在进行的任务'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Archive className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="font-medium text-slate-900 mb-1">暂无任务</h3>
              <p className="text-sm text-slate-600">文件操作任务将在这里显示</p>
            </div>
          ) : (
            <div>
              {/* 进行中的任务 */}
              {runningTasks.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-sm text-slate-700 mb-3">
                    进行中 ({runningTasks.length})
                  </h3>
                  {runningTasks.map((task) => (
                    <TaskItem key={task.taskId} task={task} />
                  ))}
                </div>
              )}

              {/* 已完成的任务 */}
              {completedTasks.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-slate-700 mb-3">
                    已完成 ({completedTasks.length})
                  </h3>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.taskId} task={task} />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// 导出一个全局的任务管理器实例用于添加任务
export { useTasksProgress };
