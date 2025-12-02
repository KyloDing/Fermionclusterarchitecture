import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import {
  ExternalLink,
  FolderOpen,
  Lock,
  Unlock,
  Server,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { StorageVolume } from '../services/storageService';
import { Alert, AlertDescription } from './ui/alert';

interface VolumeMountPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volume: StorageVolume | null;
}

interface MountPoint {
  id: string;
  resourceType: 'instance' | 'job' | 'service';
  resourceName: string;
  resourceId: string;
  mountPath: string;
  readOnly: boolean;
  status: 'active' | 'stopped' | 'error';
  mountedAt: string;
  node: string;
}

export default function VolumeMountPointsDialog({
  open,
  onOpenChange,
  volume,
}: VolumeMountPointsDialogProps) {
  const [mountPoints, setMountPoints] = useState<MountPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && volume) {
      loadMountPoints();
    }
  }, [open, volume]);

  const loadMountPoints = async () => {
    setLoading(true);
    // 模拟加载挂载点数据
    setTimeout(() => {
      setMountPoints([
        {
          id: 'mount-1',
          resourceType: 'instance',
          resourceName: 'pytorch-training-v1',
          resourceId: 'inst-001',
          mountPath: '/data/imagenet',
          readOnly: true,
          status: 'active',
          mountedAt: '2024-11-10T08:30:00Z',
          node: 'node-gpu-01',
        },
        {
          id: 'mount-2',
          resourceType: 'instance',
          resourceName: 'jupyter-notebook-workspace',
          resourceId: 'inst-002',
          mountPath: '/workspace/data',
          readOnly: false,
          status: 'active',
          mountedAt: '2024-11-11T14:20:00Z',
          node: 'node-gpu-03',
        },
        {
          id: 'mount-3',
          resourceType: 'job',
          resourceName: 'batch-inference-job',
          resourceId: 'job-005',
          mountPath: '/models',
          readOnly: true,
          status: 'stopped',
          mountedAt: '2024-11-09T10:15:00Z',
          node: 'node-cpu-12',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      instance: '容器实例',
      job: '批处理任务',
      service: '推理服务',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getResourceTypeColor = (type: string) => {
    const colors = {
      instance: 'bg-blue-50 text-blue-700 border-blue-200',
      job: 'bg-purple-50 text-purple-700 border-purple-200',
      service: 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[type as keyof typeof colors] || '';
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { label: '运行中', color: 'bg-green-50 text-green-700 border-green-200' },
      stopped: { label: '已停止', color: 'bg-slate-50 text-slate-700 border-slate-200' },
      error: { label: '异常', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    return configs[status as keyof typeof configs] || configs.stopped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!volume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-purple-600" />
            挂载点信息 - {volume.name}
          </DialogTitle>
          <DialogDescription>
            查看当前存储卷的所有挂载位置和使用情况
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">总挂载点</p>
                <p className="text-2xl font-semibold text-purple-600">{mountPoints.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">运行中</p>
                <p className="text-2xl font-semibold text-green-600">
                  {mountPoints.filter((m) => m.status === 'active').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">只读挂载</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {mountPoints.filter((m) => m.readOnly).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 挂载点列表 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">挂载点列表</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMountPoints}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>

            <ScrollArea className="h-[400px] rounded-lg border">
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">加载中...</p>
                  </div>
                ) : mountPoints.length === 0 ? (
                  <div className="text-center py-12">
                    <ExternalLink className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-2">暂无挂载点</p>
                    <p className="text-xs text-slate-500">
                      此存储卷尚未被任何资源挂载
                    </p>
                  </div>
                ) : (
                  mountPoints.map((mount, index) => {
                    const statusConfig = getStatusConfig(mount.status);
                    return (
                      <Card key={mount.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* 标题行 */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-purple-700">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">{mount.resourceName}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={getResourceTypeColor(mount.resourceType)}
                                    >
                                      {getResourceTypeLabel(mount.resourceType)}
                                    </Badge>
                                    <Badge variant="outline" className={statusConfig.color}>
                                      {statusConfig.label}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={
                                        mount.readOnly
                                          ? 'bg-slate-50 text-slate-700 border-slate-200'
                                          : 'bg-green-50 text-green-700 border-green-200'
                                      }
                                    >
                                      {mount.readOnly ? (
                                        <>
                                          <Lock className="w-3 h-3 mr-1" />
                                          只读
                                        </>
                                      ) : (
                                        <>
                                          <Unlock className="w-3 h-3 mr-1" />
                                          读写
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 详细信息 */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-slate-600 mb-1 flex items-center gap-1">
                                  <FolderOpen className="w-3.5 h-3.5" />
                                  挂载路径
                                </p>
                                <p className="font-mono bg-slate-50 px-2 py-1 rounded">
                                  {mount.mountPath}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600 mb-1 flex items-center gap-1">
                                  <Server className="w-3.5 h-3.5" />
                                  运行节点
                                </p>
                                <p className="font-mono bg-slate-50 px-2 py-1 rounded">
                                  {mount.node}
                                </p>
                              </div>
                            </div>

                            {/* 时间信息 */}
                            <div className="text-xs text-slate-500 pt-2 border-t flex items-center justify-between">
                              <span>挂载时间: {formatDate(mount.mountedAt)}</span>
                              <span>资源ID: {mount.resourceId}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 提示信息 */}
          {mountPoints.length > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                <strong>注意：</strong>
                删除存储卷前，请先确保所有挂载点的资源已停止或卸载该存储卷。
                正在运行的资源无法卸载存储卷。
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
