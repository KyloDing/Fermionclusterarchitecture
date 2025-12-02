import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  initChunkUpload,
  uploadChunk,
  mergeChunks,
  formatFileSize
} from '../services/datasetService';

interface FileUploaderProps {
  onUploadComplete?: (file: File) => void;
  onUploadStart?: () => void;
  accept?: string;
  maxSize?: number; // MB
  disabled?: boolean;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error' | 'paused';
  uploadId?: string;
  uploadedChunks: Set<number>;
  error?: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
const MAX_RETRIES = 3;

export function FileUploader({
  onUploadComplete,
  onUploadStart,
  accept = '.zip,.tar,.tar.gz,.rar',
  maxSize = 10240, // 10GB default
  disabled = false
}: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle',
    uploadedChunks: new Set()
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error('文件过大', {
        description: `文件大小 ${formatFileSize(file.size)} 超过限制 ${maxSize}MB`
      });
      return;
    }

    setUploadState({
      file,
      progress: 0,
      status: 'idle',
      uploadedChunks: new Set()
    });
  };

  const uploadFileInChunks = useCallback(async (file: File) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    try {
      onUploadStart?.();
      
      // 初始化分片上传
      const uploadId = await initChunkUpload(file.name, file.size, totalChunks);
      
      setUploadState(prev => ({
        ...prev,
        status: 'uploading',
        uploadId
      }));

      abortControllerRef.current = new AbortController();
      const uploadedChunks = new Set<number>();

      // 上传每个分片
      for (let i = 0; i < totalChunks; i++) {
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('上传已取消');
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // 重试机制
        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            await uploadChunk(chunk, i, uploadId);
            uploadedChunks.add(i);
            
            // 更新进度
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            setUploadState(prev => ({
              ...prev,
              progress,
              uploadedChunks: new Set(uploadedChunks)
            }));
            
            break;
          } catch (error) {
            retries++;
            if (retries >= MAX_RETRIES) {
              throw new Error(`分片 ${i + 1} 上传失败，已重试 ${MAX_RETRIES} 次`);
            }
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }

      // 合并分片
      await mergeChunks(uploadId);

      setUploadState(prev => ({
        ...prev,
        status: 'success',
        progress: 100
      }));

      toast.success('文件上传成功', {
        description: `${file.name} (${formatFileSize(file.size)})`
      });

      onUploadComplete?.(file);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      toast.error('上传失败', {
        description: errorMessage
      });
    }
  }, [onUploadComplete, onUploadStart]);

  const handleUpload = () => {
    if (!uploadState.file) return;
    uploadFileInChunks(uploadState.file);
  };

  const handlePause = () => {
    abortControllerRef.current?.abort();
    setUploadState(prev => ({
      ...prev,
      status: 'paused'
    }));
    toast.info('上传已暂停');
  };

  const handleResume = () => {
    if (!uploadState.file) return;
    uploadFileInChunks(uploadState.file);
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setUploadState({
      file: null,
      progress: 0,
      status: 'idle',
      uploadedChunks: new Set()
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {!uploadState.file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            disabled
              ? 'border-white/10 bg-white/5 cursor-not-allowed'
              : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer'
          }`}
          onClick={disabled ? undefined : handleBrowse}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${disabled ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mb-2 ${disabled ? 'text-slate-600' : 'text-slate-300'}`}>
            点击选择文件或拖拽文件到此处
          </p>
          <p className="text-sm text-slate-500">
            支持 .zip, .tar, .tar.gz, .rar 格式，最大 {maxSize}MB
          </p>
          <p className="text-xs text-slate-600 mt-2">
            支持大文件分片上传和断点续传
          </p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg p-6 bg-white/5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              uploadState.status === 'success' ? 'bg-green-500/20' :
              uploadState.status === 'error' ? 'bg-red-500/20' :
              uploadState.status === 'uploading' ? 'bg-purple-500/20' :
              'bg-blue-500/20'
            }`}>
              {uploadState.status === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : uploadState.status === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : uploadState.status === 'uploading' ? (
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              ) : (
                <File className="w-6 h-6 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate mb-1">
                    {uploadState.file.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatFileSize(uploadState.file.size)}
                  </p>
                </div>
                {uploadState.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-slate-400 hover:text-white hover:bg-white/10 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {uploadState.status === 'error' && uploadState.error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                  {uploadState.error}
                </div>
              )}

              {(uploadState.status === 'uploading' || uploadState.status === 'paused' || uploadState.status === 'success') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {uploadState.status === 'success' ? '上传完成' :
                       uploadState.status === 'paused' ? '上传已暂停' :
                       '正在上传...'}
                    </span>
                    <span className="text-slate-300">
                      {uploadState.progress}%
                    </span>
                  </div>
                  <Progress value={uploadState.progress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {uploadState.status === 'idle' && (
                  <Button
                    onClick={handleUpload}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={disabled}
                  >
                    开始上传
                  </Button>
                )}

                {uploadState.status === 'uploading' && (
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    暂停
                  </Button>
                )}

                {uploadState.status === 'paused' && (
                  <>
                    <Button
                      onClick={handleResume}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      继续上传
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      取消
                    </Button>
                  </>
                )}

                {uploadState.status === 'error' && (
                  <>
                    <Button
                      onClick={handleUpload}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      重试
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      取消
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
