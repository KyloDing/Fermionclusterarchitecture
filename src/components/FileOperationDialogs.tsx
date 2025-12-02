import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import {
  Download,
  Move,
  Archive,
  Share2,
  Trash2,
  Edit,
  Folder,
  File,
  Link2,
  Clock,
  Lock,
  Globe,
  Users,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { FileItem, getFiles } from '../services/storageService';
import { toast } from 'sonner@2.0.3';

// 下载对话框
interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  onConfirm: () => void;
}

export function DownloadDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
}: DownloadDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    // 模拟下载进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // 模拟下载完成
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      toast.success('下载完成');
      onConfirm();
      onOpenChange(false);
      setDownloading(false);
      setProgress(0);
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            下载文件
          </DialogTitle>
          <DialogDescription>
            {files.length === 1
              ? '确认下载该文件'
              : `确认下载 ${files.length} 个文件（将打包为ZIP）`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文件列表 */}
          <div className="max-h-48 overflow-y-auto border rounded-lg">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {file.type === 'directory' ? (
                    <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                  {file.type === 'directory' ? '文件夹' : formatSize(file.size)}
                </span>
              </div>
            ))}
          </div>

          {/* 总大小 */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-900">总大小</span>
            <span className="font-semibold text-blue-900">{formatSize(totalSize)}</span>
          </div>

          {/* 下载进度 */}
          {downloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">下载进度</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>
            取消
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                下载中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                开始下载
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 移动对话框
interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  volumeId: string;
  currentPath: string;
  onConfirm: (targetPath: string) => void;
}

export function MoveDialog({
  open,
  onOpenChange,
  files,
  volumeId,
  currentPath,
  onConfirm,
}: MoveDialogProps) {
  const [targetPath, setTargetPath] = useState('/');
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);

  useEffect(() => {
    if (open) {
      loadFolders('/');
    }
  }, [open]);

  const loadFolders = async (path: string) => {
    setLoading(true);
    try {
      const allFiles = await getFiles(volumeId, path);
      const folderList = allFiles.filter((f) => f.type === 'directory');
      setFolders(folderList);
      setTargetPath(path);
    } catch (error) {
      toast.error('加载文件夹失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setPathHistory([...pathHistory, path]);
    loadFolders(path);
  };

  const handleBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      loadFolders(previousPath);
    }
  };

  const handleMove = () => {
    if (targetPath === currentPath) {
      toast.error('目标位置与当前位置相同');
      return;
    }
    onConfirm(targetPath);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="w-5 h-5 text-purple-600" />
            移动文件
          </DialogTitle>
          <DialogDescription>
            选择目标位置移动 {files.length} 个项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 当前路径 */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Folder className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">当前位置:</span>
            <span className="text-sm text-slate-600">{targetPath || '/'}</span>
          </div>

          {/* 导航按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={pathHistory.length <= 1}
            >
              返回上级
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPathHistory(['/']);
                loadFolders('/');
              }}
            >
              返回根目录
            </Button>
          </div>

          {/* 文件夹列表 */}
          <div className="border rounded-lg max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">加载中...</div>
            ) : folders.length === 0 ? (
              <div className="p-8 text-center text-slate-500">此目录下没有文件夹</div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleNavigate(folder.path)}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    打开
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* 要移动的文件 */}
          <div>
            <Label className="mb-2">将要移动的项目:</Label>
            <div className="border rounded-lg max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border-b last:border-b-0"
                >
                  {file.type === 'directory' ? (
                    <Folder className="w-4 h-4 text-blue-500" />
                  ) : (
                    <File className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleMove}>
            <Move className="w-4 h-4 mr-2" />
            移动到此处
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 压缩对话框
interface CompressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  onConfirm: (archiveName: string, format: string) => void;
}

export function CompressDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
}: CompressDialogProps) {
  const [archiveName, setArchiveName] = useState('');
  const [format, setFormat] = useState('zip');

  useEffect(() => {
    if (open && files.length > 0) {
      const defaultName = files.length === 1 ? files[0].name : 'archive';
      setArchiveName(defaultName);
    }
  }, [open, files]);

  const handleCompress = async () => {
    if (!archiveName.trim()) {
      toast.error('请输入压缩包名称');
      return;
    }

    try {
      // TODO: 创建异步任务 - 需要在App中添加TaskProvider后启用
      // const { taskId } = await createTask({
      //   type: 'compress',
      //   operationName: `压缩为 ${archiveName}.${format}`,
      //   files: files.map(f => f.name),
      //   archiveName: `${archiveName}.${format}`,
      //   archiveFormat: format,
      //   totalSize: files.reduce((sum, f) => sum + f.size, 0),
      // });

      toast.success('压缩任务已创建');
      onConfirm(archiveName, format);
      onOpenChange(false);
      setArchiveName('');
    } catch (error) {
      toast.error('创建压缩任务失败');
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const estimatedSize = totalSize * 0.7; // 估计压缩后大小

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-orange-600" />
            压缩文件
          </DialogTitle>
          <DialogDescription>
            将 {files.length} 个项目压缩为压缩包
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 压缩包名称 */}
          <div>
            <Label htmlFor="archive-name">压缩包名称</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="archive-name"
                value={archiveName}
                onChange={(e) => setArchiveName(e.target.value)}
                placeholder="输入压缩包名称"
              />
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">.zip</SelectItem>
                  <SelectItem value="tar">.tar</SelectItem>
                  <SelectItem value="tar.gz">.tar.gz</SelectItem>
                  <SelectItem value="7z">.7z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 文件列表 */}
          <div>
            <Label>要压缩的文件:</Label>
            <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {file.type === 'directory' ? (
                      <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {file.type === 'directory' ? '文件夹' : formatSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 大小信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">原始大小</p>
              <p className="font-semibold">{formatSize(totalSize)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">预计大</p>
              <p className="font-semibold text-green-700">{formatSize(estimatedSize)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCompress}>
            <Archive className="w-4 h-4 mr-2" />
            创建压缩任务
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 分享对话框
interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  onConfirm: (settings: ShareSettings) => void;
}

interface ShareSettings {
  permission: 'view' | 'edit';
  expireTime: number; // 小时数，0表示永久
  password?: string;
  allowDownload: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
}: ShareDialogProps) {
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [expireTime, setExpireTime] = useState('168'); // 7天
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (requirePassword && !password.trim()) {
      toast.error('请设置访问密码');
      return;
    }

    const settings: ShareSettings = {
      permission,
      expireTime: parseInt(expireTime),
      password: requirePassword ? password : undefined,
      allowDownload,
    };

    // 生成分享链接
    const link = `https://fermi-cluster.com/share/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);
    setShared(true);

    onConfirm(settings);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('链接已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setShared(false);
    setShareLink('');
    setPassword('');
    setRequirePassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-600" />
            分享文件
          </DialogTitle>
          <DialogDescription>
            创建分享链接让他人访问 {files.length} 个项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shared ? (
            <>
              {/* 文件列表 */}
              <div>
                <Label>分享的文件:</Label>
                <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border-b last:border-b-0"
                    >
                      {file.type === 'directory' ? (
                        <Folder className="w-4 h-4 text-blue-500" />
                      ) : (
                        <File className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 权限设置 */}
              <div>
                <Label>访问权限</Label>
                <RadioGroup value={permission} onValueChange={(v) => setPermission(v as any)} className="mt-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="view" id="view" />
                    <label htmlFor="view" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium">仅查看</p>
                          <p className="text-xs text-slate-500">访问者只能查看文件</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="edit" id="edit" />
                    <label htmlFor="edit" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium">可编辑</p>
                          <p className="text-xs text-slate-500">访问者可以编辑和上传文件</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* 过期时间 */}
              <div>
                <Label htmlFor="expire">有效期</Label>
                <Select value={expireTime} onValueChange={setExpireTime}>
                  <SelectTrigger id="expire" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24小时</SelectItem>
                    <SelectItem value="168">7天</SelectItem>
                    <SelectItem value="720">30天</SelectItem>
                    <SelectItem value="0">永久有效</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 访问密码 */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">访问密码</p>
                    <p className="text-xs text-slate-500">需要密码才能访问</p>
                  </div>
                </div>
                <Switch checked={requirePassword} onCheckedChange={setRequirePassword} />
              </div>

              {requirePassword && (
                <Input
                  type="text"
                  placeholder="设置6位访问密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={6}
                />
              )}

              {/* 允许下载 */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">允许下载</p>
                    <p className="text-xs text-slate-500">访问者可以下载文件</p>
                  </div>
                </div>
                <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
              </div>
            </>
          ) : (
            <>
              {/* 分享成功 */}
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">分享链接已创建</h3>
                <p className="text-sm text-slate-600 mb-6">
                  任何拥有此链接的人都可以访问这些文件
                </p>

                {/* 分享链接 */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border mb-4">
                  <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <Input
                    value={shareLink}
                    readOnly
                    className="border-0 bg-transparent flex-1"
                  />
                  <Button size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                </div>

                {/* 分享设置摘要 */}
                <div className="text-left space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">访问权限:</span>
                    <Badge variant="outline">
                      {permission === 'view' ? '仅查看' : '可编辑'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">有效期:</span>
                    <span className="font-medium">
                      {expireTime === '0'
                        ? '永久'
                        : expireTime === '24'
                        ? '24小时'
                        : expireTime === '168'
                        ? '7天'
                        : '30天'}
                    </span>
                  </div>
                  {requirePassword && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">访问密码:</span>
                      <span className="font-mono font-medium">{password}</span>
                    </div>
                  )}
                </div>
              </div>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  请妥善保管分享链接和密码。分享的文件可以在"我的分享"中管理。
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          {!shared ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                创建分享链接
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                创建新链接
              </Button>
              <Button onClick={() => onOpenChange(false)}>完成</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 重命名对话框
interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem;
  onConfirm: (newName: string) => void;
}

export function RenameDialog({
  open,
  onOpenChange,
  file,
  onConfirm,
}: RenameDialogProps) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (open) {
      setNewName(file.name);
    }
  }, [open, file]);

  const handleRename = () => {
    if (!newName.trim()) {
      toast.error('请输入文件名');
      return;
    }
    if (newName === file.name) {
      toast.error('文件名未更改');
      return;
    }
    onConfirm(newName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            重命名
          </DialogTitle>
          <DialogDescription>
            修改文件或文件夹的名称
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="new-name">新名称</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新名称"
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleRename}>
            <Edit className="w-4 h-4 mr-2" />
            确认重命名
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 删除确认对话框
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            删除确认
          </DialogTitle>
          <DialogDescription>
            确认要删除这些文件吗？文件将被移至回收站
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文件列表 */}
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border-b last:border-b-0"
              >
                {file.type === 'directory' ? (
                  <Folder className="w-4 h-4 text-blue-500" />
                ) : (
                  <File className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm truncate">{file.name}</span>
              </div>
            ))}
          </div>

          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              删除的文件将被移至回收站，可在30天内恢复。30天后将被永久删除。
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}>
            <Trash2 className="w-4 h-4 mr-2" />
            移至回收站
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}