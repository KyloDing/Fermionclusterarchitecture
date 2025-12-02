import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { addDatasetVersion, type AddVersionRequest, type Dataset } from '../../services/datasetService';
import { toast } from 'sonner@2.0.3';

interface AddDatasetVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: Dataset | null;
  onSuccess?: () => void;
}

export function AddDatasetVersionDialog({ 
  open, 
  onOpenChange, 
  dataset,
  onSuccess 
}: AddDatasetVersionDialogProps) {
  const [formData, setFormData] = useState({
    version: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('version-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!dataset) return;

    if (!formData.version.trim()) {
      toast.error('请输入版本号');
      return;
    }

    if (!selectedFile) {
      toast.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const request: AddVersionRequest = {
        datasetId: dataset.id,
        version: formData.version,
        file: selectedFile,
        description: formData.description || undefined
      };

      await addDatasetVersion(request, (progress) => {
        setUploadProgress(progress.percentage);
      });

      toast.success('版本添加成功');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('添加版本失败:', error);
      toast.error(error instanceof Error ? error.message : '添加版本失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData({
        version: '',
        description: ''
      });
      setSelectedFile(null);
      setUploadProgress(0);
      onOpenChange(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!dataset) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900">新增版本</DialogTitle>
          <DialogDescription>为数据集添加新版本并上传数据文件</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* 数据集名称（只读） */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">数据集名称</Label>
            <Input
              value={dataset.name}
              disabled
              className="bg-slate-100 border-slate-300 text-slate-600"
            />
          </div>

          {/* 版本号 */}
          <div className="space-y-2">
            <Label htmlFor="version" className="text-sm text-slate-700">
              版本号 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="例如: v2, v1_cleaned"
              disabled={uploading}
              className="bg-white border-slate-300"
            />
            <p className="text-xs text-slate-500">
              当前最新版本: {dataset.latestVersion}
            </p>
          </div>

          {/* 文件上传 */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">
              数据导入 <span className="text-red-500">*</span>
            </Label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors bg-slate-50">
                <input
                  id="version-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  accept=".zip,.tar,.tar.gz,.tgz"
                />
                <label
                  htmlFor="version-file-input"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="text-purple-600">点击上传</span>
                      <span className="text-slate-600"> 或拖拽文件到此处</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      支持 .zip, .tar, .tar.gz 格式，支持大文件分片上传
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-purple-50 flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">上传进度</span>
                <span className="text-purple-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-slate-700">
              备注
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入备注信息（选填）"
              disabled={uploading}
              className="bg-white border-slate-300 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="border-slate-300"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !formData.version.trim() || !selectedFile}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {uploading ? '上传中...' : '确定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}