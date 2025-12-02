import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { 
  createDataset, 
  type CreateDatasetRequest,
  type AvailabilityZone,
  type DatasetVisibility,
  getAvailabilityZoneLabel,
  getVisibilityLabel
} from '../../services/datasetService';
import { toast } from 'sonner@2.0.3';

interface CreateDatasetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateDatasetDialog({ open, onOpenChange, onSuccess }: CreateDatasetDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as 'text' | 'image' | 'audio' | 'video' | 'mixed',
    description: '',
    availabilityZone: 'cn-north-1a' as AvailabilityZone,
    visibility: 'private' as DatasetVisibility
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
    const fileInput = document.getElementById('dataset-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入数据集名称');
      return;
    }

    if (!selectedFile) {
      toast.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const request: CreateDatasetRequest = {
        name: formData.name,
        type: formData.type,
        file: selectedFile,
        description: formData.description || undefined,
        availabilityZone: formData.availabilityZone,
        visibility: formData.visibility
      };

      await createDataset(request, (progress) => {
        setUploadProgress(progress.percentage);
      });

      toast.success('数据集创建成功');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('创建数据集失败:', error);
      toast.error('创建数据集失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData({
        name: '',
        type: 'text',
        description: '',
        availabilityZone: 'cn-north-1a',
        visibility: 'private'
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900">新建数据集</DialogTitle>
          <DialogDescription>创建新的数据集并上传初始数据</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* 数据集名称 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-slate-700">
              数据集名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入数据集名称"
              disabled={uploading}
              className="bg-white border-slate-300"
            />
          </div>

          {/* 数据类型 */}
          <div className="space-y-2">
            <Label htmlFor="dataType" className="text-sm text-slate-700">
              数据类型 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'text' | 'image' | 'audio' | 'video' | 'mixed') =>
                setFormData({ ...formData, type: value })
              }
              disabled={uploading}
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="text">文本数据</SelectItem>
                <SelectItem value="image">图像数据</SelectItem>
                <SelectItem value="audio">音频数据</SelectItem>
                <SelectItem value="video">视频数据</SelectItem>
                <SelectItem value="mixed">混合数据</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 可用区选择 */}
          <div className="space-y-2">
            <Label htmlFor="availabilityZone" className="text-sm text-slate-700">
              可用区 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.availabilityZone}
              onValueChange={(value: AvailabilityZone) =>
                setFormData({ ...formData, availabilityZone: value })
              }
              disabled={uploading}
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="cn-north-1a">{getAvailabilityZoneLabel('cn-north-1a')}</SelectItem>
                <SelectItem value="cn-north-1b">{getAvailabilityZoneLabel('cn-north-1b')}</SelectItem>
                <SelectItem value="cn-east-1a">{getAvailabilityZoneLabel('cn-east-1a')}</SelectItem>
                <SelectItem value="cn-east-1b">{getAvailabilityZoneLabel('cn-east-1b')}</SelectItem>
                <SelectItem value="cn-south-1a">{getAvailabilityZoneLabel('cn-south-1a')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              💡 数据集将存储在所选可用区，跨可用区使用需要先同步
            </p>
          </div>

          {/* 可见性设置 */}
          <div className="space-y-2">
            <Label htmlFor="visibility" className="text-sm text-slate-700">
              可见性 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: DatasetVisibility) =>
                setFormData({ ...formData, visibility: value })
              }
              disabled={uploading}
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="private">
                  <div className="flex flex-col items-start">
                    <span>{getVisibilityLabel('private')}</span>
                    <span className="text-xs text-slate-500">仅创建者可见</span>
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex flex-col items-start">
                    <span>{getVisibilityLabel('team')}</span>
                    <span className="text-xs text-slate-500">团队成员可见</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex flex-col items-start">
                    <span>{getVisibilityLabel('public')}</span>
                    <span className="text-xs text-slate-500">所有用户可见</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 文件上传 */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">
              数据导入 <span className="text-red-500">*</span>
            </Label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors bg-slate-50">
                <input
                  id="dataset-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  accept=".zip,.tar,.tar.gz,.tgz"
                />
                <label
                  htmlFor="dataset-file-input"
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
            disabled={uploading || !formData.name.trim() || !selectedFile}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {uploading ? '上传中...' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
