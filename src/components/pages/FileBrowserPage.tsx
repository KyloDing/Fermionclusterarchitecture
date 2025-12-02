import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Upload,
  FolderPlus,
  RefreshCw,
  LayoutGrid,
  List,
  Search,
  ChevronRight,
  Home,
  Folder,
  File,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Move,
  Archive,
  Share2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { FileItem, getFiles, createDirectory, formatFileSize, getFileIcon } from '../../services/storageService';
import { toast } from 'sonner@2.0.3';
import RecycleBinDialog from '../RecycleBinDialog';
import {
  DownloadDialog,
  MoveDialog,
  CompressDialog,
  ShareDialog,
  RenameDialog,
  DeleteDialog,
} from '../FileOperationDialogs';

type ViewMode = 'grid' | 'list';

interface FileBrowserPageProps {
  volumeId?: string | null;
}

export default function FileBrowserPage({ volumeId: propVolumeId }: FileBrowserPageProps) {
  // 默认使用第一个存储卷ID，或使用传入的volumeId
  const volumeId = propVolumeId || 'vol-001';
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // 操作对话框状态
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [compressDialogOpen, setCompressDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentOperationFile, setCurrentOperationFile] = useState<FileItem | null>(null);

  useEffect(() => {
    if (volumeId) {
      loadFiles();
    }
  }, [volumeId, currentPath]);

  const loadFiles = async () => {
    if (!volumeId) return;
    setLoading(true);
    try {
      const data = await getFiles(volumeId, currentPath);
      setFiles(data);
      setSelectedFiles([]);
    } catch (error) {
      toast.error('加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 面包屑导航
  const pathParts = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: '根目录', path: '/' },
    ...pathParts.map((part, index) => ({
      name: part,
      path: '/' + pathParts.slice(0, index + 1).join('/'),
    })),
  ];

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    } else if (file.mimeType?.startsWith('image/')) {
      setPreviewFile(file);
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, fileId]);
    } else {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map((f) => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleCreateFolder = async () => {
    if (!volumeId || !newFolderName.trim()) {
      toast.error('请输入文件夹名称');
      return;
    }

    try {
      await createDirectory(volumeId, currentPath, newFolderName);
      toast.success('文件夹创建成功');
      setNewFolderDialogOpen(false);
      setNewFolderName('');
      loadFiles();
    } catch (error) {
      toast.error('创建文件夹失败');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUploadClick = () => {
    folderInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast.success(`已选择 ${files.length} 个文件，开始上传...`);
      // 这里实际应该调用上传API
      setTimeout(() => {
        toast.success('上传完成');
        loadFiles();
      }, 2000);
    }
  };

  const handleDelete = () => {
    if (selectedFiles.length === 0) {
      toast.error('请先选择要删除的文件');
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleCompress = () => {
    if (selectedFiles.length === 0) {
      toast.error('请先选择要压缩的文件');
      return;
    }
    setCompressDialogOpen(true);
  };

  // 获取选中的文件对象
  const getSelectedFileObjects = () => {
    return files.filter((f) => selectedFiles.includes(f.id));
  };

  // 处理函数
  const handleDownloadConfirm = () => {
    toast.success('下载已完成');
    loadFiles();
  };

  const handleMoveConfirm = (targetPath: string) => {
    toast.success(`已移动到 ${targetPath}`);
    loadFiles();
  };

  const handleCompressConfirm = (archiveName: string, format: string) => {
    toast.success(`已创建压缩包: ${archiveName}.${format}`);
    loadFiles();
  };

  const handleShareConfirm = (settings: any) => {
    toast.success('分享链接已创建');
  };

  const handleRenameConfirm = (newName: string) => {
    toast.success(`已重命名为: ${newName}`);
    loadFiles();
  };

  const handleDeleteConfirm = () => {
    toast.success(`已将 ${selectedFiles.length} 个项目移至回收站`);
    loadFiles();
  };

  // 单文件操作
  const handleSingleFileDownload = (file: FileItem) => {
    setCurrentOperationFile(file);
    setDownloadDialogOpen(true);
  };

  const handleSingleFileMove = (file: FileItem) => {
    setCurrentOperationFile(file);
    setMoveDialogOpen(true);
  };

  const handleSingleFileCompress = (file: FileItem) => {
    setCurrentOperationFile(file);
    setCompressDialogOpen(true);
  };

  const handleSingleFileShare = (file: FileItem) => {
    setCurrentOperationFile(file);
    setShareDialogOpen(true);
  };

  const handleSingleFileRename = (file: FileItem) => {
    setCurrentOperationFile(file);
    setRenameDialogOpen(true);
  };

  const handleSingleFileDelete = (file: FileItem) => {
    setCurrentOperationFile(file);
    setDeleteDialogOpen(true);
  };

  // 筛选文件
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 排序：文件夹优先
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900 mb-2">文件管理</h1>
        <p className="text-slate-600">浏��和管理存储卷中的文件</p>
      </div>

      {/* 面包屑导航 */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index === 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(crumb.path)}
                    className="h-8 gap-1"
                  >
                    <Home className="w-4 h-4" />
                    {crumb.name}
                  </Button>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigate(crumb.path)}
                      className="h-8"
                    >
                      {crumb.name}
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 工具栏 */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    上传
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleUploadClick}>
                    <File className="w-4 h-4 mr-2" />
                    上传文件
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFolderUploadClick}>
                    <Folder className="w-4 h-4 mr-2" />
                    上传文件夹
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" onClick={() => setNewFolderDialogOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                新建文件夹
              </Button>

              <Button variant="outline" onClick={loadFiles}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" onClick={() => setRecycleBinOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                回收站
              </Button>
            </div>

            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索文件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="w-4 h-4" />
                    列表
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    网格
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* 批量操作栏 */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-slate-600">已选择 {selectedFiles.length} 项</span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setDownloadDialogOpen(true)}>
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMoveDialogOpen(true)}>
                  <Move className="w-4 h-4 mr-1" />
                  移动
                </Button>
                <Button variant="outline" size="sm" onClick={handleCompress}>
                  <Archive className="w-4 h-4 mr-1" />
                  压缩
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="w-4 h-4 mr-1" />
                  分享
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                  删除
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 文件列表 */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">加载中...</p>
          </CardContent>
        </Card>
      ) : sortedFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">
              {searchTerm ? '未找到匹配的文件' : '此文件夹为空'}
            </p>
            {!searchTerm && (
              <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-2" />
                上传文件
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        // 列表视图
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="w-12 p-3">
                      <Checkbox
                        checked={selectedFiles.length === files.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-3">名称</th>
                    <th className="text-left p-3 w-32">大小</th>
                    <th className="text-left p-3 w-48">修改时间</th>
                    <th className="text-left p-3 w-32">所有者</th>
                    <th className="w-12 p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b hover:bg-slate-50 cursor-pointer"
                      onDoubleClick={() => handleFileDoubleClick(file)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={(checked) =>
                            handleSelectFile(file.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getFileIcon(file)}</span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{file.name}</p>
                            {file.isShared && (
                              <Badge variant="outline" className="text-xs mt-1">
                                已共享
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {file.type === 'directory' ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {new Date(file.modifiedAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="p-3 text-sm text-slate-600">{file.owner.userName}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSingleFileDownload(file)}>
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSingleFileRename(file)}>
                              <Edit className="w-4 h-4 mr-2" />
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSingleFileMove(file)}>
                              <Move className="w-4 h-4 mr-2" />
                              移动
                            </DropdownMenuItem>
                            {file.type === 'file' && !file.isCompressed && (
                              <DropdownMenuItem onClick={() => handleSingleFileCompress(file)}>
                                <Archive className="w-4 h-4 mr-2" />
                                压缩
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSingleFileShare(file)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              分享
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleSingleFileDelete(file)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // 网格视图
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {sortedFiles.map((file) => (
            <Card
              key={file.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onDoubleClick={() => handleFileDoubleClick(file)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) =>
                      handleSelectFile(file.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSingleFileDownload(file)}>下载</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSingleFileRename(file)}>重命名</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSingleFileDelete(file)}>删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-col items-center text-center">
                  {file.mimeType?.startsWith('image/') && file.thumbnail ? (
                    <div className="w-full h-24 mb-2 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-6xl mb-2">{getFileIcon(file)}</div>
                  )}
                  <p className="text-sm font-medium truncate w-full">{file.name}</p>
                  {file.type === 'file' && (
                    <p className="text-xs text-slate-500 mt-1">{formatFileSize(file.size)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 新建文件夹对话框 */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建文件夹</DialogTitle>
            <DialogDescription>在当前目录下创建一个新文件夹</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">文件夹名称</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="输入文件夹名称"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateFolder}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图片预览对话框 */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
            <DialogDescription>预览图片文件</DialogDescription>
          </DialogHeader>
          {previewFile?.thumbnail && (
            <div className="flex items-center justify-center p-4">
              <img
                src={previewFile.thumbnail}
                alt={previewFile.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
          {previewFile?.imageMetadata && (
            <p className="text-sm text-slate-600 text-center">
              {previewFile.imageMetadata.width} × {previewFile.imageMetadata.height} •{' '}
              {formatFileSize(previewFile.size)}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* 回收站对话框 */}
      <RecycleBinDialog
        open={recycleBinOpen}
        onOpenChange={setRecycleBinOpen}
        volumeId={volumeId}
      />

      {/* 文件操作对话框 */}
      <DownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        files={currentOperationFile ? [currentOperationFile] : getSelectedFileObjects()}
        onConfirm={handleDownloadConfirm}
      />
      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        files={currentOperationFile ? [currentOperationFile] : getSelectedFileObjects()}
        volumeId={volumeId}
        currentPath={currentPath}
        onConfirm={handleMoveConfirm}
      />
      <CompressDialog
        open={compressDialogOpen}
        onOpenChange={setCompressDialogOpen}
        files={currentOperationFile ? [currentOperationFile] : getSelectedFileObjects()}
        onConfirm={handleCompressConfirm}
      />
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        files={currentOperationFile ? [currentOperationFile] : getSelectedFileObjects()}
        onConfirm={handleShareConfirm}
      />
      {currentOperationFile && (
        <RenameDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          file={currentOperationFile}
          onConfirm={handleRenameConfirm}
        />
      )}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        files={currentOperationFile ? [currentOperationFile] : getSelectedFileObjects()}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}