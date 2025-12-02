import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, X, FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  createModel, 
  uploadFileInChunks,
  type AvailabilityZone,
  type ModelVisibility,
  getAvailabilityZoneLabel,
  getVisibilityLabel
} from '../../services/modelService';
import { toast } from 'sonner@2.0.3';

interface ImportModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportModelDialog({ open, onOpenChange, onSuccess }: ImportModelDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'image' | 'general'>('text');
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [availabilityZone, setAvailabilityZone] = useState<AvailabilityZone>('cn-north-1a');
  const [visibility, setVisibility] = useState<ModelVisibility>('private');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入模型名称');
      return;
    }

    if (!file) {
      toast.error('请选择要上传的模型文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 使用分片上传
      const uploadController = uploadFileInChunks({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        onComplete: async (filePath) => {
          // 创建模型记录
          await createModel({
            name: name.trim(),
            type,
            remark: remark.trim(),
            file,
            availabilityZone,
            visibility
          });

          toast.success('模型导入成功', {
            description: '文件上传完成，模型已创建'
          });

          // 重置表单
          setName('');
          setType('text');
          setRemark('');
          setFile(null);
          setAvailabilityZone('cn-north-1a');
          setVisibility('private');
          setUploadProgress(0);
          setUploading(false);

          onSuccess();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error('上传失败', {
            description: error.message
          });
          setUploading(false);
        }
      });
    } catch (error) {
      toast.error('导入失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导入模型</DialogTitle>
          <DialogDescription>
            上传模型文件并创建新的模型资产。支持大文件分片上传和断点续传。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 模型名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              模型名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="例如: Llama-3-8B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* 模型类型 */}
          <div className="space-y-2">
            <Label htmlFor="type">
              模型类型 <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(value: any) => setType(value)} disabled={uploading}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">文本模型</SelectItem>
                <SelectItem value="image">图像模型</SelectItem>
                <SelectItem value="general">通用文件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 可用区选择 */}
          <div className="space-y-2">
            <Label htmlFor="availabilityZone">
              可用区 <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={availabilityZone} 
              onValueChange={(value: AvailabilityZone) => setAvailabilityZone(value)} 
              disabled={uploading}
            >
              <SelectTrigger id="availabilityZone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cn-north-1a">{getAvailabilityZoneLabel('cn-north-1a')}</SelectItem>
                <SelectItem value="cn-north-1b">{getAvailabilityZoneLabel('cn-north-1b')}</SelectItem>
                <SelectItem value="cn-east-1a">{getAvailabilityZoneLabel('cn-east-1a')}</SelectItem>
                <SelectItem value="cn-east-1b">{getAvailabilityZoneLabel('cn-east-1b')}</SelectItem>
                <SelectItem value="cn-south-1a">{getAvailabilityZoneLabel('cn-south-1a')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              💡 模型将存储在所选可用区，跨可用区使用需要先同步
            </p>
          </div>

          {/* 可见性设置 */}
          <div className="space-y-2">
            <Label htmlFor="visibility">
              可见性 <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={visibility} 
              onValueChange={(value: ModelVisibility) => setVisibility(value)} 
              disabled={uploading}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <Label>
              模型文件 <span className="text-red-500">*</span>
            </Label>
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-300 hover:border-slate-400'
                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={uploading}
                  accept=".zip,.tar,.tar.gz,.pth,.pt,.ckpt,.safetensors"
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-1">
                  拖拽文件到此处，或点击选择文件
                </p>
                <p className="text-sm text-slate-500">
                  支持 ZIP, TAR, PTH, CKPT, SafeTensors 等格式
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileUp className="w-10 h-10 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
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
                <span className="text-purple-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {uploadProgress < 100 ? '正在上传模型文件...' : '上传完成，正在处理...'}
              </p>
            </div>
          )}

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              placeholder="输入模型的详细描述、用途说明等..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !name.trim() || !file}
          >
            {uploading ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                导入模型
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
