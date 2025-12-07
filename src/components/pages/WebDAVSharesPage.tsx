import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Globe,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Users,
  Activity,
  HardDrive,
  Lock,
  Unlock,
  ExternalLink,
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Eye,
  Download,
  Upload,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// WebDAV共享接口
interface WebDAVShare {
  id: string;
  name: string;
  path: string;
  url: string;
  backend: string;
  description: string;
  ssl: boolean;
  authType: 'none' | 'basic' | 'digest';
  readOnly: boolean;
  anonymous: boolean;
  maxConnections: number;
  status: 'active' | 'inactive';
  users: string[];
  createTime: string;
  stats: {
    totalAccess: number;
    activeConnections: number;
    totalDownload: string;
    totalUpload: string;
  };
}

export default function WebDAVSharesPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [editingShare, setEditingShare] = useState<WebDAVShare | null>(null);
  const [selectedShare, setSelectedShare] = useState<WebDAVShare | null>(null);

  // WebDAV共享数据
  const [shares] = useState<WebDAVShare[]>([
    {
      id: '1',
      name: 'AI模型库',
      path: '/storage/models',
      url: 'https://webdav.fermi-cluster.com/models',
      backend: 'CubeFS',
      description: '公开的AI模型共享库，供用户下载预训练模型',
      ssl: true,
      authType: 'basic',
      readOnly: true,
      anonymous: false,
      maxConnections: 1000,
      status: 'active',
      users: ['public', 'researchers', 'developers'],
      createTime: '2024-12-01 10:30:00',
      stats: {
        totalAccess: 15234,
        activeConnections: 87,
        totalDownload: '2.3 TB',
        totalUpload: '156 GB',
      },
    },
    {
      id: '2',
      name: '数据集存储',
      path: '/storage/datasets',
      url: 'https://webdav.fermi-cluster.com/datasets',
      backend: 'BeeGFS',
      description: '公共数据集存储，支持上传和下载',
      ssl: true,
      authType: 'digest',
      readOnly: false,
      anonymous: false,
      maxConnections: 500,
      status: 'active',
      users: ['data-team', 'ml-engineers'],
      createTime: '2024-11-28 14:20:00',
      stats: {
        totalAccess: 8456,
        activeConnections: 42,
        totalDownload: '1.8 TB',
        totalUpload: '3.2 TB',
      },
    },
    {
      id: '3',
      name: '文档中心',
      path: '/storage/documents',
      url: 'http://webdav.fermi-cluster.com/docs',
      backend: 'NFS',
      description: '技术文档和用户手册共享',
      ssl: false,
      authType: 'none',
      readOnly: true,
      anonymous: true,
      maxConnections: 2000,
      status: 'active',
      users: [],
      createTime: '2024-11-25 09:15:00',
      stats: {
        totalAccess: 23456,
        activeConnections: 156,
        totalDownload: '456 GB',
        totalUpload: '0 B',
      },
    },
    {
      id: '4',
      name: '个人空间',
      path: '/storage/users',
      url: 'https://webdav.fermi-cluster.com/users',
      backend: 'CubeFS',
      description: '用户个人文件存储空间',
      ssl: true,
      authType: 'basic',
      readOnly: false,
      anonymous: false,
      maxConnections: 10000,
      status: 'active',
      users: ['all-users'],
      createTime: '2024-11-20 16:45:00',
      stats: {
        totalAccess: 45678,
        activeConnections: 234,
        totalDownload: '5.6 TB',
        totalUpload: '8.9 TB',
      },
    },
    {
      id: '5',
      name: '临时共享',
      path: '/storage/temp',
      url: 'https://webdav.fermi-cluster.com/temp',
      backend: 'NFS',
      description: '临时文件交换区（已停用维护）',
      ssl: true,
      authType: 'basic',
      readOnly: false,
      anonymous: false,
      maxConnections: 100,
      status: 'inactive',
      users: ['temp-users'],
      createTime: '2024-11-15 11:30:00',
      stats: {
        totalAccess: 1234,
        activeConnections: 0,
        totalDownload: '234 GB',
        totalUpload: '567 GB',
      },
    },
  ]);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    backend: '',
    description: '',
    ssl: true,
    authType: 'basic' as 'none' | 'basic' | 'digest',
    readOnly: false,
    anonymous: false,
    maxConnections: 1000,
    users: '',
  });

  // 过滤数据
  const filteredShares = shares.filter(share => {
    const matchesKeyword = !searchKeyword || 
      share.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      share.path.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      share.url.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === 'all' || share.status === statusFilter;
    return matchesKeyword && matchesStatus;
  });

  // 打开新增对话框
  const handleAdd = () => {
    setEditingShare(null);
    setFormData({
      name: '',
      path: '',
      backend: '',
      description: '',
      ssl: true,
      authType: 'basic',
      readOnly: false,
      anonymous: false,
      maxConnections: 1000,
      users: '',
    });
    setShowDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (share: WebDAVShare) => {
    setEditingShare(share);
    setFormData({
      name: share.name,
      path: share.path,
      backend: share.backend,
      description: share.description,
      ssl: share.ssl,
      authType: share.authType,
      readOnly: share.readOnly,
      anonymous: share.anonymous,
      maxConnections: share.maxConnections,
      users: share.users.join(', '),
    });
    setShowDialog(true);
  };

  // 保存共享
  const handleSave = () => {
    if (!formData.name || !formData.path || !formData.backend) {
      toast.error('请填写必填字段');
      return;
    }

    if (editingShare) {
      toast.success('WebDAV共享已更新');
    } else {
      toast.success('WebDAV共享已创建');
    }
    setShowDialog(false);
  };

  // 删除共享
  const handleDelete = (share: WebDAVShare) => {
    if (confirm(`确定要删除WebDAV共享"${share.name}"吗？\n\n删除后用户将无法访问此共享。`)) {
      toast.success('WebDAV共享已删除');
    }
  };

  // 复制URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL已复制到剪贴板');
  };

  // 显示访问信息
  const handleShowAccessInfo = (share: WebDAVShare) => {
    setSelectedShare(share);
    setShowUrlDialog(true);
  };

  // 获取认证类型标签
  const getAuthTypeBadge = (authType: string) => {
    const config = {
      none: { label: '无认证', className: 'bg-slate-100 text-slate-700' },
      basic: { label: '基本认证', className: 'bg-blue-100 text-blue-700' },
      digest: { label: '摘要认证', className: 'bg-purple-100 text-purple-700' },
    };
    const { label, className } = config[authType as keyof typeof config];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl">WebDAV共享管理</h1>
          <Badge className="bg-green-100 text-green-700">
            <Globe className="w-3 h-3 mr-1" />
            公有云部署
          </Badge>
        </div>
        <p className="text-slate-600">
          基于HTTP/HTTPS协议的文件共享，适用于互联网访问和跨平台场景
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">共享总数</p>
                <p className="text-3xl">{shares.length}</p>
                <p className="text-sm text-green-600 mt-1">
                  活跃 {shares.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Globe className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">活跃连接</p>
                <p className="text-3xl">
                  {shares.reduce((sum, s) => sum + s.stats.activeConnections, 0)}
                </p>
                <p className="text-sm text-slate-600 mt-1">实时在线</p>
              </div>
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总访问量</p>
                <p className="text-3xl">
                  {(shares.reduce((sum, s) => sum + s.stats.totalAccess, 0) / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">累计请求</p>
              </div>
              <Users className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">数据传输</p>
                <p className="text-3xl">14.3 TB</p>
                <p className="text-sm text-slate-600 mt-1">总流量</p>
              </div>
              <HardDrive className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和操作栏 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>搜索关键词</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索共享名称、路径或URL"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-48 space-y-2">
              <Label>状态筛选</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setSearchKeyword('')} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>

            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              新建共享
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 部署场景说明 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">部署场景说明</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="font-medium">WebDAV共享（当前）</p>
                    <p className="text-blue-700">适用于公有云部署，基于HTTP/HTTPS协议，支持互联网访问，跨平台兼容性好</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="font-medium">SMB共享</p>
                    <p className="text-blue-700">适用于私有云部署，基于SMB/CIFS协议，性能高，适合内网环境</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white"
                  onClick={() => navigate('/smb-shares')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  切换到SMB
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white"
                  onClick={() => navigate('/file-shares')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回共享中心
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 共享列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>共享名称</TableHead>
                  <TableHead>访问URL</TableHead>
                  <TableHead>存储路径</TableHead>
                  <TableHead>后端</TableHead>
                  <TableHead>认证方式</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead>访问权限</TableHead>
                  <TableHead>活跃连接</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShares.map((share) => (
                  <TableRow key={share.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{share.name}</p>
                        <p className="text-sm text-slate-500">{share.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {share.url}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyUrl(share.url)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-slate-600">{share.path}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{share.backend}</Badge>
                    </TableCell>
                    <TableCell>
                      {getAuthTypeBadge(share.authType)}
                    </TableCell>
                    <TableCell>
                      {share.ssl ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Lock className="w-3 h-3 mr-1" />
                          HTTPS
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">
                          <Unlock className="w-3 h-3 mr-1" />
                          HTTP
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {share.readOnly ? (
                          <Badge variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            只读
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Edit className="w-3 h-3 mr-1" />
                            读写
                          </Badge>
                        )}
                        {share.anonymous && (
                          <Badge className="bg-slate-100 text-slate-700">匿名</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{share.stats.activeConnections}</span>
                        <span className="text-sm text-slate-500">/ {share.maxConnections}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {share.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          活跃
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          停用
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowAccessInfo(share)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <LinkIcon className="w-4 h-4 mr-1" />
                          访问
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(share)}>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShowAccessInfo(share)}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              访问信息
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 mr-2" />
                              配置
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(share)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 空状态 */}
          {filteredShares.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">暂无WebDAV共享</p>
              <p className="text-sm text-slate-500">创建WebDAV共享以提供基于Web的文件访问服务</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingShare ? '编辑WebDAV共享' : '新建WebDAV共享'}</DialogTitle>
            <DialogDescription>
              配置WebDAV共享以提供基于HTTP/HTTPS的文件访问服务
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>共享名称 *</Label>
                  <Input
                    placeholder="如：AI模型库"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>存储后端 *</Label>
                  <Select
                    value={formData.backend}
                    onValueChange={(value) => setFormData({ ...formData, backend: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择存储后端" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CubeFS">CubeFS</SelectItem>
                      <SelectItem value="BeeGFS">BeeGFS</SelectItem>
                      <SelectItem value="NFS">NFS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>存储路径 *</Label>
                  <Input
                    placeholder="/storage/shared"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>描述</Label>
                  <Textarea
                    placeholder="共享用途说明"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* 访问配置 */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">访问配置</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>认证方式</Label>
                  <Select
                    value={formData.authType}
                    onValueChange={(value: 'none' | 'basic' | 'digest') => 
                      setFormData({ ...formData, authType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无认证（公开访问）</SelectItem>
                      <SelectItem value="basic">基本认证（Basic Auth）</SelectItem>
                      <SelectItem value="digest">摘要认证（Digest Auth）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>最大连接数</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={formData.maxConnections}
                    onChange={(e) => setFormData({ ...formData, maxConnections: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>授权用户（逗号分隔）</Label>
                  <Input
                    placeholder="user1, user2, group:researchers"
                    value={formData.users}
                    onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                    disabled={formData.anonymous}
                  />
                </div>
              </div>

              {/* 选项开关 */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.ssl}
                    onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">启用SSL/TLS</p>
                    <p className="text-sm text-slate-600">使用HTTPS协议加密传输</p>
                  </div>
                  <Lock className="w-5 h-5 text-green-600" />
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.readOnly}
                    onChange={(e) => setFormData({ ...formData, readOnly: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">只读模式</p>
                    <p className="text-sm text-slate-600">仅允许下载，禁止上传</p>
                  </div>
                  <Eye className="w-5 h-5 text-blue-600" />
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">匿名访问</p>
                    <p className="text-sm text-slate-600">允许匿名用户访问</p>
                  </div>
                  <Users className="w-5 h-5 text-purple-600" />
                </label>
              </div>
            </div>

            {/* URL预览 */}
            {formData.name && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">访问URL预览</p>
                <code className="text-sm text-slate-900">
                  {formData.ssl ? 'https' : 'http'}://webdav.fermi-cluster.com/{formData.name.toLowerCase().replace(/\s+/g, '-')}
                </code>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingShare ? '保存修改' : '创建共享'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 访问信息对话框 */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>WebDAV访问信息</DialogTitle>
            <DialogDescription>
              {selectedShare?.name} - 跨平台访问指南
            </DialogDescription>
          </DialogHeader>

          {selectedShare && (
            <div className="space-y-6">
              {/* 访问URL */}
              <div className="space-y-3">
                <Label>访问地址</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-slate-100 px-4 py-3 rounded border">
                    {selectedShare.url}
                  </code>
                  <Button
                    variant="outline"
                    onClick={() => handleCopyUrl(selectedShare.url)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
              </div>

              {/* 连接信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>协议类型</Label>
                  <div className="text-sm">
                    {selectedShare.ssl ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Lock className="w-3 h-3 mr-1" />
                        HTTPS (安全连接)
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Unlock className="w-3 h-3 mr-1" />
                        HTTP (明文传输)
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>认证方式</Label>
                  <div className="text-sm">
                    {getAuthTypeBadge(selectedShare.authType)}
                  </div>
                </div>
              </div>

              {/* 使用统计 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900">下载流量</span>
                  </div>
                  <p className="text-2xl font-medium text-blue-900">{selectedShare.stats.totalDownload}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-900">上传流量</span>
                  </div>
                  <p className="text-2xl font-medium text-green-900">{selectedShare.stats.totalUpload}</p>
                </div>
              </div>

              {/* 平台连接指南 */}
              <div className="space-y-3">
                <Label>平台连接指南</Label>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900 mb-2">🪟 Windows</p>
                    <p className="text-slate-700">
                      在文件资源管理器地址栏输入：<code className="bg-white px-2 py-1 rounded">{selectedShare.url}</code>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900 mb-2">🍎 macOS</p>
                    <p className="text-slate-700">
                      Finder → 前往 → 连接服务器，输入：<code className="bg-white px-2 py-1 rounded">{selectedShare.url}</code>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900 mb-2">🐧 Linux</p>
                    <p className="text-slate-700 mb-1">使用命令行挂载：</p>
                    <code className="block bg-white px-2 py-1 rounded">
                      mount -t davfs {selectedShare.url} /mnt/webdav
                    </code>
                  </div>
                </div>
              </div>

              {selectedShare.authType !== 'none' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-medium mb-1">需要身份认证</p>
                      <p>连接时请使用您的费米集群账号和密码进行认证</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowUrlDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}