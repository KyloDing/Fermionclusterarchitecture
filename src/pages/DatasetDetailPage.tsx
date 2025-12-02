import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Download, 
  Trash2, 
  Play,
  Database,
  Calendar,
  HardDrive,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { AddDatasetVersionDialog } from '../components/dialogs/AddDatasetVersionDialog';
import {
  getDataset,
  getDatasetVersions,
  deleteDatasetVersion,
  downloadDatasetVersion,
  formatFileSize,
  formatDateTime,
  getDataTypeLabel,
  type Dataset,
  type DatasetVersion,
} from '../services/datasetService';
import { toast } from 'sonner@2.0.3';

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [versions, setVersions] = useState<DatasetVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const [addVersionDialogOpen, setAddVersionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<DatasetVersion | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadDatasetDetails();
    }
  }, [id]);

  const loadDatasetDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [datasetData, versionsData] = await Promise.all([
        getDataset(id),
        getDatasetVersions(id)
      ]);

      if (!datasetData) {
        toast.error('数据集不存在');
        navigate('/datasets');
        return;
      }

      setDataset(datasetData);
      setVersions(versionsData);
    } catch (error) {
      console.error('加载数据集详情失败:', error);
      toast.error('加载数据集详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async () => {
    if (!versionToDelete) return;

    try {
      setDeleting(true);
      await deleteDatasetVersion(versionToDelete.id);
      toast.success('版本删除成功');
      setDeleteDialogOpen(false);
      setVersionToDelete(null);
      loadDatasetDetails();
    } catch (error) {
      console.error('删除版本失败:', error);
      toast.error(error instanceof Error ? error.message : '删除版本失败');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (version: DatasetVersion) => {
    setVersionToDelete(version);
    setDeleteDialogOpen(true);
  };

  const handleDownload = async (version: DatasetVersion) => {
    try {
      await downloadDatasetVersion(version.id);
      toast.success('开始下载');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败');
    }
  };

  const handleLaunchTraining = (version: DatasetVersion) => {
    // 跳转到训练任务创建页面，携带数据集版本信息
    navigate('/training/create', {
      state: {
        datasetId: version.datasetId,
        datasetVersionId: version.id,
        datasetName: dataset?.name,
        datasetVersion: version.version
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-600">加载数据集详情...</div>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/datasets')}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>

        {/* 数据集基本信息 */}
        <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2 text-slate-900">{dataset.name}</h1>
              {dataset.description && (
                <p className="text-slate-600">{dataset.description}</p>
              )}
            </div>
            <Button
              onClick={() => setAddVersionDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增版本
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">数据类型</p>
                <p className="text-slate-900">{getDataTypeLabel(dataset.dataType)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">最新版本</p>
                <p className="text-slate-900">{dataset.latestVersion}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">创建时间</p>
                <p className="text-slate-900">{formatDateTime(dataset.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 版本列表 */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl text-slate-900">数据版本</h2>
            <p className="text-sm text-slate-600 mt-1">
              共 {versions.length} 个版本
            </p>
          </div>

          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-slate-500 mb-4">暂无版本</div>
              <Button
                onClick={() => setAddVersionDialogOpen(true)}
                variant="outline"
                className="border-slate-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加第一个版本
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead className="text-slate-600">版本号</TableHead>
                  <TableHead className="text-slate-600">文件大小</TableHead>
                  <TableHead className="text-slate-600">上传时间</TableHead>
                  <TableHead className="text-slate-600">备注</TableHead>
                  <TableHead className="text-slate-600 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id} className="border-slate-200">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900">{version.version}</span>
                        {version.version === dataset.latestVersion && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                            最新
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900">
                      {formatFileSize(version.fileSize)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDateTime(version.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {version.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLaunchTraining(version)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          发起训练
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-slate-200">
                            <DropdownMenuItem
                              onClick={() => handleDownload(version)}
                              className="cursor-pointer"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(version)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              disabled={versions.length === 1}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除版本
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* 新增版本对话框 */}
      <AddDatasetVersionDialog
        open={addVersionDialogOpen}
        onOpenChange={setAddVersionDialogOpen}
        dataset={dataset}
        onSuccess={loadDatasetDetails}
      />

      {/* 删除版本确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">确认删除版本</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              确定要删除版本 <span className="text-slate-900">"{versionToDelete?.version}"</span> 吗？
              此操作无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300" disabled={deleting}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVersion}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}