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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import {
  UserPlus,
  Search,
  MoreVertical,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Trash2,
  Lock,
  Unlock,
  UserX,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  role: string;
  status: 'active' | 'disabled' | 'locked';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    email: 'admin@fermi.cn',
    fullName: '系统管理员',
    phone: '13800138000',
    department: '技术部',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2024-11-27 10:30:00',
  },
  {
    id: 'user-002',
    username: 'zhangsan',
    email: 'zhangsan@fermi.cn',
    fullName: '张三',
    phone: '13800138001',
    department: 'AI研发部',
    role: 'developer',
    status: 'active',
    createdAt: '2024-03-15',
    lastLogin: '2024-11-27 09:15:00',
  },
  {
    id: 'user-003',
    username: 'lisi',
    email: 'lisi@fermi.cn',
    fullName: '李四',
    phone: '13800138002',
    department: '算法团队',
    role: 'developer',
    status: 'active',
    createdAt: '2024-04-20',
    lastLogin: '2024-11-26 16:45:00',
  },
  {
    id: 'user-004',
    username: 'wangwu',
    email: 'wangwu@fermi.cn',
    fullName: '王五',
    department: '产品部',
    role: 'viewer',
    status: 'active',
    createdAt: '2024-05-10',
    lastLogin: '2024-11-25 14:20:00',
  },
  {
    id: 'user-005',
    username: 'zhaoliu',
    email: 'zhaoliu@fermi.cn',
    fullName: '赵六',
    phone: '13800138004',
    department: 'AI研发部',
    role: 'developer',
    status: 'disabled',
    createdAt: '2024-06-01',
    lastLogin: '2024-11-20 10:00:00',
  },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    department: '',
    role: 'viewer',
    password: '',
  });

  // 过滤用户
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    disabled: users.filter((u) => u.status === 'disabled').length,
    locked: users.filter((u) => u.status === 'locked').length,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600">管理员</Badge>;
      case 'developer':
        return <Badge className="bg-blue-600">开发者</Badge>;
      case 'viewer':
        return <Badge variant="outline">观察者</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            正常
          </Badge>
        );
      case 'disabled':
        return (
          <Badge className="bg-gray-600">
            <XCircle className="w-3 h-3 mr-1" />
            已禁用
          </Badge>
        );
      case 'locked':
        return (
          <Badge className="bg-orange-600">
            <Lock className="w-3 h-3 mr-1" />
            已锁定
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleCreateUser = () => {
    const user: User = {
      id: `user-${Date.now()}`,
      ...newUser,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, user]);
    setIsCreateDialogOpen(false);
    setNewUser({
      username: '',
      email: '',
      fullName: '',
      phone: '',
      department: '',
      role: 'viewer',
      password: '',
    });
    toast.success('用户创建成功');
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === 'active' ? 'disabled' : 'active',
            }
          : user
      )
    );
    toast.success('用户状态已更新');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    toast.success('用户已删除');
  };

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">用户管理</h1>
          <p className="text-slate-600">管理系统用户账号、角色权限和访问控制</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <UserPlus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总用户数</p>
                <p className="text-3xl">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">正常用户</p>
                <p className="text-3xl text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已禁用</p>
                <p className="text-3xl text-gray-600">{stats.disabled}</p>
              </div>
              <XCircle className="w-10 h-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已锁定</p>
                <p className="text-3xl text-orange-600">{stats.locked}</p>
              </div>
              <Lock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索用户名、邮箱或姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="角色筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="developer">开发者</SelectItem>
                <SelectItem value="viewer">观察者</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="disabled">已禁用</SelectItem>
                <SelectItem value="locked">已锁定</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>共 {filteredUsers.length} 个用户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* 头像 */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white">
                    {user.fullName.charAt(0)}
                  </div>

                  {/* 用户信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-slate-900">{user.fullName}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {user.phone}
                        </span>
                      )}
                      {user.department && (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          {user.department}
                        </span>
                      )}
                      {user.lastLogin && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          最后登录: {user.lastLogin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    详情
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        编辑信息
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="w-4 h-4 mr-2" />
                        重置密码
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                        {user.status === 'active' ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            禁用用户
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 mr-2" />
                            启用用户
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除用户
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl mb-2">没有找到用户</h3>
              <p className="text-slate-600">调整筛选条件或添加新用户</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建用户对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>添加新用户</DialogTitle>
            <DialogDescription>填写用户基本信息并分配角色权限</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  placeholder="请输入用户名"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">姓名 *</Label>
                <Input
                  id="fullName"
                  placeholder="请输入真实姓名"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@fermi.cn"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  placeholder="13800138000"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  placeholder="请输入部门"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">角色 *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="developer">开发者</SelectItem>
                  <SelectItem value="viewer">观察者</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">初始密码 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入初始密码"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              创建用户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 用户详情对话框 */}
      {selectedUser && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-[700px]">
            <DialogHeader>
              <DialogTitle>用户详情</DialogTitle>
              <DialogDescription>{selectedUser.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl mb-2">{selectedUser.fullName}</h3>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">用户名</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">邮箱</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">手机号</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.department && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">部门</p>
                    <p className="font-medium">{selectedUser.department}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600 mb-1">创建时间</p>
                  <p className="font-medium">{selectedUser.createdAt}</p>
                </div>
                {selectedUser.lastLogin && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">最后登录</p>
                    <p className="font-medium">{selectedUser.lastLogin}</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
