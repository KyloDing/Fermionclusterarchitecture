import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Upload, X, FileUp, AlertCircle } from 'lucide-react';
import { addModelVersion, uploadFileInChunks, Model } from '../../services/modelService';
import { toast } from 'sonner@2.0.3';

interface AddModelVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: Model | null;
  onSuccess: () => void;
}

export function AddModelVersionDialog({ open, onOpenChange, model, onSuccess }: AddModelVersionDialogProps) {
  const [versionNumber, setVersionNumber] = useState('');
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState<File | null>(null);
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
    if (!model) return;

    if (!versionNumber.trim()) {
      toast.error('请输入版本号');
      return;
    }

    if (!file) {
      toast.error('请选择要上传的模型文件');
      return;
    }

    // 检查版本号是否已存在
    const versionExists = model.versions.some(v => v.versionNumber === versionNumber.trim());
    if (versionExists) {
      toast.error('版本号已存在', {
        description: '请使用不同的版本号'
      });
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
          // 创建新版本
          await addModelVersion({
            modelId: model.id,
            versionNumber: versionNumber.trim(),
            remark: remark.trim(),
            file
          });

          toast.success('版本添加成功', {
            description: `已为 ${model.name} 添加版本 ${versionNumber.trim()}`
          });

          // 重置表单
          setVersionNumber('');
          setRemark('');
          setFile(null);
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
      toast.error('添加版本失败', {
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

  // 根据已有版本建议下一个版本号
  const suggestNextVersion = () => {
    if (!model || model.versions.length === 0) return 'v1';
    
    const latestVersion = model.latestVersion;
    const match = latestVersion.match(/v(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `v${nextNum}`;
    }
    
    return latestVersion;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新增模型版本</DialogTitle>
          <DialogDescription>
            为模型 <span className="text-slate-900">{model?.name}</span> 添加新版本
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 模型名称（只读） */}
          <div className="space-y-2">
            <Label htmlFor="model-name">模型名称</Label>
            <Input
              id="model-name"
              value={model?.name || ''}
              disabled
              className="bg-slate-50"
            />
          </div>

          {/* 版本号 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="version">
                版本号 <span className="text-red-500">*</span>
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVersionNumber(suggestNextVersion())}
                disabled={uploading}
                className="h-auto py-1 px-2 text-xs"
              >
                建议: {suggestNextVersion()}
              </Button>
            </div>
            <Input
              id="version"
              placeholder="例如: v2, v2.1, v2_checkpoint"
              value={versionNumber}
              onChange={(e) => setVersionNumber(e.target.value)}
              disabled={uploading}
            />
            <p className="text-xs text-slate-600">
              当前已有版本: {model?.versions.map(v => v.versionNumber).join(', ')}
            </p>
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
                <div className="flex items-start gap-3">
                  <FileUp className="w-10 h-10 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate mb-1">{file.name}</p>
                    <p className="text-xs text-slate-600">
                      {formatFileSize(file.size)}
                    </p>
                    {uploading && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">
                            上传中...
                          </span>
                          <span className="text-xs text-purple-600">
                            {uploadProgress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              placeholder="描述本版本的更新内容、改进点等..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>新版本文件将存储在对象存储中，上传完成后会自动更新为最新版本。</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || !versionNumber.trim() || !file}>
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                添加版本
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
