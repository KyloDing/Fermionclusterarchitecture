import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Box,
  Calendar,
  FileText,
  Download,
  Trash2,
  Rocket,
  Clock,
  Package,
  Loader2,
  Plus
} from 'lucide-react';
import { Model, ModelVersion, deleteModelVersion, formatFileSize } from '../../services/modelService';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { StartTrainingDialog } from './StartTrainingDialog';
import { AddModelVersionDialog } from './AddModelVersionDialog';

interface ModelDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: Model | null;
  onUpdate: () => void;
}

export function ModelDetailDialog({ open, onOpenChange, model, onUpdate }: ModelDetailDialogProps) {
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [trainingVersion, setTrainingVersion] = useState<ModelVersion | null>(null);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [showAddVersionDialog, setShowAddVersionDialog] = useState(false);

  if (!model) return null;

  const handleDeleteVersion = async () => {
    if (!deleteVersionId) return;

    setDeleting(true);
    try {
      await deleteModelVersion(model.id, deleteVersionId);
      toast.success('版本删除成功');
      setDeleteVersionId(null);
      onUpdate();
    } catch (error) {
      toast.error('删除失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (version: ModelVersion) => {
    toast.info('开始下载', {
      description: `正在准备下载 ${version.versionNumber}...`
    });
    
    // 模拟下载
    setTimeout(() => {
      toast.success('下载链接已生成', {
        description: '模型文件下载已开始'
      });
    }, 1000);
  };

  const handleStartTraining = (version: ModelVersion) => {
    setTrainingVersion(version);
    setShowTrainingDialog(true);
  };

  const getModelTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '文本模型',
      image: '图像模型',
      general: '通用文件'
    };
    return labels[type] || type;
  };

  const getModelTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-purple-100 text-purple-700',
      image: 'bg-blue-100 text-blue-700',
      general: 'bg-slate-100 text-slate-700'
    };
    return colors[type] || colors.general;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-700">就绪</Badge>;
      case 'uploading':
        return <Badge className="bg-yellow-100 text-yellow-700">上传中</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>模型详情</DialogTitle>
            <DialogDescription>查看模型信息和版本历史</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto pr-2 space-y-6">
            {/* 基本信息 */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Box className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-slate-900 mb-2">{model.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getModelTypeColor(model.type)}>
                          {getModelTypeLabel(model.type)}
                        </Badge>
                        <Badge variant="outline">
                          最新版本: {model.latestVersion}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-600">创建时间</p>
                        <p className="text-slate-900">{model.createTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-600">更新时间</p>
                        <p className="text-slate-900">{model.updateTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-600">版本数量</p>
                        <p className="text-slate-900">{model.versions.length} 个版本</p>
                      </div>
                    </div>
                  </div>

                  {model.remark && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{model.remark}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 版本列表 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-slate-900 mb-1">模型版本</h4>
                  <p className="text-sm text-slate-600">
                    管理模型的所有历史版本，发起训练任务或下载
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddVersionDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新增版本
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>版本号</TableHead>
                      <TableHead>上传时间</TableHead>
                      <TableHead>文件大小</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>备注</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.versions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          暂无版本
                        </TableCell>
                      </TableRow>
                    ) : (
                      model.versions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{version.versionNumber}</span>
                              {version.versionNumber === model.latestVersion && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  最新
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {version.uploadTime}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {formatFileSize(version.fileSize)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(version.status)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-slate-600 truncate">
                              {version.remark || '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartTraining(version)}
                                disabled={version.status !== 'ready'}
                                title="发起训练"
                              >
                                <Rocket className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(version)}
                                disabled={version.status !== 'ready'}
                                title="下载"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteVersionId(version.id)}
                                disabled={model.versions.length === 1}
                                title={model.versions.length === 1 ? '无法删除最后一个版本' : '删除'}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除版本确认对话框 */}
      <AlertDialog open={!!deleteVersionId} onOpenChange={() => setDeleteVersionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除版本？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该模型版本及其关联的文件，无法恢复。请确认是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVersion}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 发起训练对话框 */}
      <StartTrainingDialog
        open={showTrainingDialog}
        onOpenChange={setShowTrainingDialog}
        modelVersion={trainingVersion}
        modelName={model.name}
        onSuccess={() => {
          toast.success('训练任务已提交');
        }}
      />

      {/* 新增版本对话框 */}
      <AddModelVersionDialog
        open={showAddVersionDialog}
        onOpenChange={setShowAddVersionDialog}
        model={model}
        onSuccess={onUpdate}
      />
    </>
  );
}
