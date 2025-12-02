import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Settings,
  Database,
  Server,
  FileText,
  DollarSign,
  BarChart,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  userCount: number;
  permissions: string[];
  createdAt: string;
  isSystem: boolean;
}

const permissions: Permission[] = [
  // 用户管理
  { id: 'user.view', name: '查看用户', description: '查看用户列表和详情', category: '用户管理' },
  { id: 'user.create', name: '创建用户', description: '添加新用户', category: '用户管理' },
  { id: 'user.edit', name: '编辑用户', description: '修改用户信息', category: '用户管理' },
  { id: 'user.delete', name: '删除用户', description: '删除用户账号', category: '用户管理' },
  
  // 资源管理
  { id: 'resource.view', name: '查看资源', description: '查看计算和存储资源', category: '资源管理' },
  { id: 'resource.create', name: '创建资源', description: '创建计算任务和存储卷', category: '资源管理' },
  { id: 'resource.edit', name: '编辑资源', description: '修改资源配置', category: '资源管理' },
  { id: 'resource.delete', name: '删除资源', description: '删除资源', category: '资源管理' },
  
  // 模型管理
  { id: 'model.view', name: '查看模型', description: '查看模型列表', category: '模型管理' },
  { id: 'model.upload', name: '上传模型', description: '上传新模型', category: '模型管理' },
  { id: 'model.download', name: '下载模型', description: '下载模型文件', category: '模型管理' },
  { id: 'model.delete', name: '删除模型', description: '删除模型', category: '模型管理' },
  
  // 数据管理
  { id: 'dataset.view', name: '查看数据集', description: '查看数据集列表', category: '数据管理' },
  { id: 'dataset.create', name: '创建数据集', description: '创建新数据集', category: '数据管理' },
  { id: 'dataset.edit', name: '编辑数据集', description: '修改数据集', category: '数据管理' },
  { id: 'dataset.delete', name: '删除数据集', description: '删除数据集', category: '数据管理' },
  
  // 计费管理
  { id: 'billing.view', name: '查看账单', description: '查看计费信息', category: '计费管理' },
  { id: 'billing.export', name: '导出账单', description: '导出账单数据', category: '计费管理' },
  { id: 'billing.config', name: '配置计费', description: '配置计费规则', category: '计费管理' },
  
  // 监控管理
  { id: 'monitor.view', name: '查看监控', description: '查看系统监控数据', category: '监控管理' },
  { id: 'monitor.config', name: '配置监控', description: '配置监控规则', category: '监控管理' },
  
  // 系统设置
  { id: 'system.config', name: '系统配置', description: '修改系统配置', category: '系统设置' },
  { id: 'system.logs', name: '查看日志', description: '查看审计日志', category: '系统设置' },
];

const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: '系统管理员',
    description: '拥有系统所有权限，负责系统管理和维护',
    color: 'red',
    userCount: 2,
    permissions: permissions.map((p) => p.id),
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'role-002',
    name: '开发者',
    description: '可以使用计算资源、管理模型和数据集',
    color: 'blue',
    userCount: 15,
    permissions: [
      'resource.view',
      'resource.create',
      'resource.edit',
      'model.view',
      'model.upload',
      'model.download',
      'dataset.view',
      'dataset.create',
      'dataset.edit',
      'billing.view',
      'monitor.view',
    ],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'role-003',
    name: '观察者',
    description: '只能查看资源和数据，不能进行修改操作',
    color: 'gray',
    userCount: 8,
    permissions: [
      'resource.view',
      'model.view',
      'dataset.view',
      'billing.view',
      'monitor.view',
    ],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'role-004',
    name: 'AI训练师',
    description: '专注于模型训练和评测的角色',
    color: 'purple',
    userCount: 5,
    permissions: [
      'resource.view',
      'resource.create',
      'model.view',
      'model.upload',
      'dataset.view',
      'dataset.create',
      'monitor.view',
    ],
    createdAt: '2024-03-15',
    isSystem: false,
  },
];

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: 'blue',
    permissions: [] as string[],
  });

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600',
      gray: 'bg-gray-600',
    };
    return colorMap[color] || 'bg-blue-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '用户管理':
        return <Users className="w-4 h-4" />;
      case '资源管理':
        return <Server className="w-4 h-4" />;
      case '模型管理':
        return <Database className="w-4 h-4" />;
      case '数据管理':
        return <FileText className="w-4 h-4" />;
      case '计费管理':
        return <DollarSign className="w-4 h-4" />;
      case '监控管理':
        return <BarChart className="w-4 h-4" />;
      case '系统设置':
        return <Settings className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const handleCreateRole = () => {
    const role: Role = {
      id: `role-${Date.now()}`,
      ...newRole,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isSystem: false,
    };
    setRoles([...roles, role]);
    setIsCreateDialogOpen(false);
    setNewRole({ name: '', description: '', color: 'blue', permissions: [] });
    toast.success('角色创建成功');
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      toast.error('系统预设角色不能删除');
      return;
    }
    setRoles(roles.filter((r) => r.id !== roleId));
    toast.success('角色已删除');
  };

  const togglePermission = (permissionId: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  // 按类别分组权限
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">角色管理</h1>
          <p className="text-slate-600">管理系统角色和权限配置</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          创建角色
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总角色数</p>
                <p className="text-3xl">{roles.length}</p>
              </div>
              <Shield className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">系统角色</p>
                <p className="text-3xl text-blue-600">{roles.filter((r) => r.isSystem).length}</p>
              </div>
              <Settings className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">自定义角色</p>
                <p className="text-3xl text-green-600">{roles.filter((r) => !r.isSystem).length}</p>
              </div>
              <Plus className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">权限总数</p>
                <p className="text-3xl text-orange-600">{permissions.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索角色名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 角色列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${getColorClass(role.color)} flex items-center justify-center`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="mb-1">{role.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {role.userCount} 用户
                      </Badge>
                      {role.isSystem && (
                        <Badge className="bg-blue-600 text-xs">系统角色</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="mt-3">{role.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">权限数量</span>
                  <Badge className={getColorClass(role.color)}>
                    {role.permissions.length} 项权限
                  </Badge>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-600 mb-2">包含的权限:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 6).map((permId) => {
                      const perm = permissions.find((p) => p.id === permId);
                      return perm ? (
                        <Badge key={permId} variant="outline" className="text-xs">
                          {perm.name}
                        </Badge>
                      ) : null;
                    })}
                    {role.permissions.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 6} 更多
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs text-slate-600">
                  <span>创建于 {role.createdAt}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    查看详情 →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 创建角色对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>创建新角色</DialogTitle>
            <DialogDescription>为角色配置权限并分配给用户</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">角色名称 *</Label>
                <Input
                  id="role-name"
                  placeholder="例如: 数据分析师"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description">角色描述</Label>
                <Textarea
                  id="role-description"
                  placeholder="描述角色的职责和用途"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>角色颜色</Label>
                <div className="flex gap-2">
                  {['red', 'blue', 'purple', 'green', 'orange', 'gray'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewRole({ ...newRole, color })}
                      className={`w-10 h-10 rounded-lg ${getColorClass(color)} ${
                        newRole.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>权限配置 *</Label>
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {perms.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3">
                          <Checkbox
                            id={permission.id}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </label>
                            <p className="text-xs text-slate-600">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRole}>
              <Plus className="w-4 h-4 mr-2" />
              创建角色
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑/查看角色对话框 */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedRole.name}</DialogTitle>
              <DialogDescription>{selectedRole.description}</DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className={`w-16 h-16 rounded-lg ${getColorClass(selectedRole.color)} flex items-center justify-center`}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {selectedRole.userCount} 用户
                      </Badge>
                      {selectedRole.isSystem && (
                        <Badge className="bg-blue-600">系统角色</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">创建于 {selectedRole.createdAt}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">权限列表 ({selectedRole.permissions.length})</h3>
                  {Object.entries(groupedPermissions).map(([category, perms]) => {
                    const rolePerms = perms.filter((p) =>
                      selectedRole.permissions.includes(p.id)
                    );
                    if (rolePerms.length === 0) return null;

                    return (
                      <Card key={category} className="mb-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {getCategoryIcon(category)}
                            {category}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {rolePerms.map((permission) => (
                            <div key={permission.id} className="flex items-start gap-3 p-2 bg-slate-50 rounded">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">{permission.name}</p>
                                <p className="text-xs text-slate-600">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
