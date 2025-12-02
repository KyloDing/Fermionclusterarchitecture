import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import {
  Trash2,
  RotateCcw,
  X,
  AlertCircle,
  RefreshCw,
  File,
  Folder,
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { formatFileSize, getFileIcon } from '../services/storageService';

interface RecycleBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volumeId: string | null;
}

interface DeletedItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  originalPath: string;
  deletedAt: string;
  deletedBy: string;
  mimeType?: string;
  autoDeleteAt: string; // 自动删除时间
}

export default function RecycleBinDialog({
  open,
  onOpenChange,
  volumeId,
}: RecycleBinDialogProps) {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && volumeId) {
      loadDeletedItems();
    }
  }, [open, volumeId]);

  const loadDeletedItems = async () => {
    setLoading(true);
    // 模拟加载回收站数据
    setTimeout(() => {
      setDeletedItems([
        {
          id: 'del-1',
          name: 'old-model.pth',
          type: 'file',
          size: 2147483648, // 2GB
          originalPath: '/models/old-model.pth',
          deletedAt: '2024-11-10T14:30:00Z',
          deletedBy: 'zhangsan',
          mimeType: 'application/octet-stream',
          autoDeleteAt: '2024-12-10T14:30:00Z',
        },
        {
          id: 'del-2',
          name: 'temp-data',
          type: 'directory',
          size: 524288000, // 500MB
          originalPath: '/datasets/temp-data',
          deletedAt: '2024-11-09T10:15:00Z',
          deletedBy: 'lisi',
          autoDeleteAt: '2024-12-09T10:15:00Z',
        },
        {
          id: 'del-3',
          name: 'training-log.txt',
          type: 'file',
          size: 1048576, // 1MB
          originalPath: '/logs/training-log.txt',
          deletedAt: '2024-11-08T16:20:00Z',
          deletedBy: 'zhangsan',
          mimeType: 'text/plain',
          autoDeleteAt: '2024-12-08T16:20:00Z',
        },
        {
          id: 'del-4',
          name: 'deprecated-scripts',
          type: 'directory',
          size: 10485760, // 10MB
          originalPath: '/scripts/deprecated-scripts',
          deletedAt: '2024-11-07T09:00:00Z',
          deletedBy: 'wangwu',
          autoDeleteAt: '2024-12-07T09:00:00Z',
        },
        {
          id: 'del-5',
          name: 'experiment-v1.ipynb',
          type: 'file',
          size: 524288, // 512KB
          originalPath: '/notebooks/experiment-v1.ipynb',
          deletedAt: '2024-11-06T11:45:00Z',
          deletedBy: 'zhangsan',
          mimeType: 'application/x-ipynb+json',
          autoDeleteAt: '2024-12-06T11:45:00Z',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(deletedItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleRestore = () => {
    if (selectedItems.length === 0) {
      toast.error('请先选择要恢复的项目');
      return;
    }
    toast.success(`已恢复 ${selectedItems.length} 个项目`);
    setDeletedItems(deletedItems.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handlePermanentDelete = () => {
    if (selectedItems.length === 0) {
      toast.error('请先选择要永久删除的项目');
      return;
    }
    
    if (confirm(`确定要永久删除 ${selectedItems.length} 个项目吗？\n\n警告：此操作不可恢复！`)) {
      toast.success(`已永久删除 ${selectedItems.length} 个项目`);
      setDeletedItems(deletedItems.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handleEmptyBin = () => {
    if (deletedItems.length === 0) {
      toast.error('回收站已经是空的');
      return;
    }
    
    if (confirm(`确定要清空回收站吗？\n\n这将永久删除 ${deletedItems.length} 个项目，此操作不可恢复！`)) {
      toast.success('回收站已清空');
      setDeletedItems([]);
      setSelectedItems([]);
    }
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

  const getDaysUntilAutoDelete = (autoDeleteAt: string) => {
    const now = new Date();
    const deleteDate = new Date(autoDeleteAt);
    const days = Math.ceil((deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTotalSize = () => {
    return deletedItems.reduce((sum, item) => sum + item.size, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            回收站
          </DialogTitle>
          <DialogDescription>
            已删除的文件将在回收站保留30天后自动永久删除
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">总项目数</p>
                <p className="text-xl font-semibold text-purple-600">{deletedItems.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">总大小</p>
                <p className="text-xl font-semibold text-orange-600">
                  {formatFileSize(getTotalSize())}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">已选择</p>
                <p className="text-xl font-semibold text-blue-600">{selectedItems.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={selectedItems.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              恢复选中项
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePermanentDelete}
              disabled={selectedItems.length === 0}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              永久删除
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDeletedItems}
              disabled={loading}
              className="ml-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmptyBin}
              disabled={deletedItems.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空回收站
            </Button>
          </div>

          {/* 已删除项目列表 */}
          <ScrollArea className="flex-1 rounded-lg border">
            <div className="p-4">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">加载中...</p>
                </div>
              ) : deletedItems.length === 0 ? (
                <div className="text-center py-12">
                  <Trash2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-2">回收站为空</p>
                  <p className="text-xs text-slate-500">
                    删除的文件将显示在这里
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* 全选 */}
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg border">
                    <Checkbox
                      checked={selectedItems.length === deletedItems.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="ml-3 font-medium text-sm">全选</span>
                  </div>

                  {/* 列表 */}
                  {deletedItems.map((item) => {
                    const daysLeft = getDaysUntilAutoDelete(item.autoDeleteAt);
                    const isUrgent = daysLeft <= 7;
                    
                    return (
                      <Card
                        key={item.id}
                        className={`hover:shadow-md transition-shadow ${
                          selectedItems.includes(item.id) ? 'ring-2 ring-purple-500' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) =>
                                handleSelectItem(item.id, checked as boolean)
                              }
                              className="mt-1"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-2xl flex-shrink-0">
                                    {item.type === 'directory' ? '📁' : getFileIcon({ 
                                      type: 'file', 
                                      mimeType: item.mimeType,
                                      name: item.name 
                                    } as any)}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-slate-500 truncate">
                                      原路径: {item.originalPath}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    variant="outline"
                                    className={
                                      isUrgent
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }
                                  >
                                    {daysLeft}天后永久删除
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.type === 'directory' ? '文件夹' : '文件'}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
                                <div>
                                  <span className="text-slate-500">大小: </span>
                                  <span className="font-medium">{formatFileSize(item.size)}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">删除者: </span>
                                  <span className="font-medium">{item.deletedBy}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">删除时间: </span>
                                  <span className="font-medium">{formatDate(item.deletedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 提示信息 */}
          <Alert className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>回收站说明：</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>删除的文件将在回收站保留30天，期间可以随时恢复</li>
                <li>30天后系统将自动永久删除文件，无法恢复</li>
                <li>您可以手动永久删除文件以释放存储空间</li>
                <li>回收站中的文件仍占用存储卷配额</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
