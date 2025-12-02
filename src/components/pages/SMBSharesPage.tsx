import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Plus,
  Share2,
  Copy,
  Eye,
  EyeOff,
  Users,
  Activity,
  Clock,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SMBShare, getSMBShares } from '../../services/storageService';
import { toast } from 'sonner@2.0.3';
import CreateSMBShareDialog from '../CreateSMBShareDialog';

export default function SMBSharesPage() {
  const [shares, setShares] = useState<SMBShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    setLoading(true);
    try {
      const data = await getSMBShares();
      setShares(data);
    } catch (error) {
      toast.error('加载SMB分享失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: SMBShare['status']) => {
    const configs = {
      active: { label: '活跃', color: 'bg-green-50 text-green-700 border-green-200' },
      disabled: { label: '已禁用', color: 'bg-gray-50 text-gray-700 border-gray-200' },
      expired: { label: '已过期', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    return configs[status];
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('访问地址已复制到剪贴板');
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success('密码已复制到剪贴板');
  };

  const togglePasswordVisibility = (shareId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(shareId)) {
      newVisible.delete(shareId);
    } else {
      newVisible.add(shareId);
    }
    setVisiblePasswords(newVisible);
  };

  // 统计
  const stats = {
    total: shares.length,
    active: shares.filter((s) => s.status === 'active').length,
    totalConnections: shares.reduce((sum, s) => sum + s.activeConnections, 0),
    totalAccesses: shares.reduce((sum, s) => sum + s.totalAccesses, 0),
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">SMB分享管理</h1>
            <p className="text-slate-600">创建和管理SMB网络共享，支持Windows/Mac/Linux访问</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建分享
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">分享总数</p>
                <p className="text-xl">{stats.total}</p>
              </div>
              <Share2 className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">活跃分享</p>
                <p className="text-xl text-green-600">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">当前连接</p>
                <p className="text-xl text-blue-600">{stats.totalConnections}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">总访问次数</p>
                <p className="text-xl text-purple-600">
                  {stats.totalAccesses.toLocaleString()}
                </p>
              </div>
              <ExternalLink className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SMB分享列表 */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">加载中...</p>
          </CardContent>
        </Card>
      ) : shares.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">还没有创建任何SMB分享</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建第一个分享
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => {
            const statusConfig = getStatusConfig(share.status);
            const isPasswordVisible = visiblePasswords.has(share.id);

            return (
              <Card key={share.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Share2 className="w-5 h-5 text-slate-600" />
                        <CardTitle className="text-base">{share.shareName}</CardTitle>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            share.permissions === 'read-write'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }
                        >
                          {share.permissions === 'read-write' ? '读写' : '只读'}
                        </Badge>
                      </div>
                      {share.description && (
                        <p className="text-sm text-slate-600 mb-2">{share.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>存储卷: {share.volumeName}</span>
                        <span>•</span>
                        <span>路径: {share.sharePath}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>编辑设置</DropdownMenuItem>
                        <DropdownMenuItem>查看访问日志</DropdownMenuItem>
                        <DropdownMenuItem>
                          {share.status === 'active' ? '禁用' : '启用'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">删除分享</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 访问信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">访问地址</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-white px-2 py-1 rounded border">
                          {share.accessUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(share.accessUrl)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">用户名</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-white px-2 py-1 rounded border">
                          {share.username}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(share.username)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-600 mb-1">密码</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-white px-2 py-1 rounded border">
                          {isPasswordVisible ? share.password : '••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(share.id)}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPassword(share.password)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 连接和访问统计 */}
                  <div className="grid grid-cols-3 gap-4 text-center pt-3 border-t">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">当前连接</p>
                      <p className="text-lg font-medium text-blue-600">
                        {share.activeConnections}
                      </p>
                      {share.maxConnections && (
                        <p className="text-xs text-slate-500">/ {share.maxConnections}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">总访问次数</p>
                      <p className="text-lg font-medium">{share.totalAccesses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">最后访问</p>
                      <p className="text-xs font-medium">
                        {share.lastAccessedAt
                          ? new Date(share.lastAccessedAt).toLocaleString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '从未'}
                      </p>
                    </div>
                  </div>

                  {/* 权限用户 */}
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">授权用户</p>
                    <div className="flex flex-wrap gap-2">
                      {share.allowedUsers.map((user) => (
                        <Badge key={user.userId} variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {user.userName}
                        </Badge>
                      ))}
                      {share.allowedGroups.map((group) => (
                        <Badge key={group.groupId} variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {group.groupName}
                        </Badge>
                      ))}
                      {share.allowedUsers.length === 0 && share.allowedGroups.length === 0 && (
                        <span className="text-sm text-slate-500">所有用户</span>
                      )}
                    </div>
                  </div>

                  {/* IP白名单 */}
                  {share.ipWhitelist && share.ipWhitelist.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">IP白名单</p>
                      <div className="flex flex-wrap gap-2">
                        {share.ipWhitelist.map((ip, index) => (
                          <Badge key={index} variant="outline">
                            {ip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 创建信息 */}
                  <div className="flex items-center justify-between pt-3 border-t text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>创建于 {new Date(share.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <span>创建者: {share.createdBy}</span>
                  </div>

                  {/* 使用提示 */}
                  <div className="p-3 bg-blue-50 rounded text-xs text-blue-900">
                    <p className="font-medium mb-1">Windows 挂载方法：</p>
                    <code className="block bg-white p-2 rounded">
                      net use Z: {share.accessUrl} /user:{share.username} {share.password}
                    </code>
                    <p className="font-medium mt-2 mb-1">macOS/Linux 挂载方法：</p>
                    <code className="block bg-white p-2 rounded">
                      mount -t cifs {share.accessUrl} /mnt/share -o username={share.username},password={share.password}
                    </code>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <CreateSMBShareDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadShares}
      />
    </div>
  );
}