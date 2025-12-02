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
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Building,
  Layers,
  Shield,
  Settings,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserGroup {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'project' | 'custom';
  memberCount: number;
  adminCount: number;
  createdAt: string;
  members: string[];
}

const mockGroups: UserGroup[] = [
  {
    id: 'group-001',
    name: 'AI研发部',
    description: '负责人工智能算法研发和模型训练',
    type: 'department',
    memberCount: 15,
    adminCount: 2,
    createdAt: '2024-01-15',
    members: ['张三', '李四', '王五'],
  },
  {
    id: 'group-002',
    name: '算法团队',
    description: '专注于深度学习算法优化',
    type: 'department',
    memberCount: 8,
    adminCount: 1,
    createdAt: '2024-02-20',
    members: ['赵六', '孙七'],
  },
  {
    id: 'group-003',
    name: 'LLM训练项目组',
    description: '大语言模型训练和微调项目',
    type: 'project',
    memberCount: 12,
    adminCount: 2,
    createdAt: '2024-03-10',
    members: ['周八', '吴九', '郑十'],
  },
  {
    id: 'group-004',
    name: '计算机视觉团队',
    description: '图像识别和视频分析',
    type: 'project',
    memberCount: 10,
    adminCount: 1,
    createdAt: '2024-04-05',
    members: ['钱十一', '刘十二'],
  },
  {
    id: 'group-005',
    name: '平台运维组',
    description: '负责集群平台的运维和监控',
    type: 'custom',
    memberCount: 5,
    adminCount: 1,
    createdAt: '2024-01-20',
    members: ['陈十三'],
  },
];

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<UserGroup[]>(mockGroups);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'custom' as 'department' | 'project' | 'custom',
  });

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || group.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: groups.length,
    department: groups.filter((g) => g.type === 'department').length,
    project: groups.filter((g) => g.type === 'project').length,
    custom: groups.filter((g) => g.type === 'custom').length,
    totalMembers: groups.reduce((sum, g) => sum + g.memberCount, 0),
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'department':
        return <Badge className="bg-blue-600">部门</Badge>;
      case 'project':
        return <Badge className="bg-purple-600">项目组</Badge>;
      case 'custom':
        return <Badge variant="outline">自定义</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'department':
        return <Building className="w-5 h-5" />;
      case 'project':
        return <Layers className="w-5 h-5" />;
      case 'custom':
        return <Settings className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const handleCreateGroup = () => {
    const group: UserGroup = {
      id: `group-${Date.now()}`,
      ...newGroup,
      memberCount: 0,
      adminCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      members: [],
    };
    setGroups([...groups, group]);
    setIsCreateDialogOpen(false);
    setNewGroup({ name: '', description: '', type: 'custom' });
    toast.success('用户组创建成功');
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
    toast.success('用户组已删除');
  };

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">用户组管理</h1>
          <p className="text-slate-600">管理部门、项目组和自定义用户组</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          创建用户组
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总用户组</p>
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
                <p className="text-sm text-slate-600 mb-1">部门</p>
                <p className="text-3xl text-blue-600">{stats.department}</p>
              </div>
              <Building className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">项目组</p>
                <p className="text-3xl text-purple-600">{stats.project}</p>
              </div>
              <Layers className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">自定义组</p>
                <p className="text-3xl text-green-600">{stats.custom}</p>
              </div>
              <Settings className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总成员数</p>
                <p className="text-3xl text-orange-600">{stats.totalMembers}</p>
              </div>
              <UserPlus className="w-10 h-10 text-orange-600" />
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
                placeholder="搜索用户组名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                全部
              </Button>
              <Button
                variant={filterType === 'department' ? 'default' : 'outline'}
                onClick={() => setFilterType('department')}
              >
                部门
              </Button>
              <Button
                variant={filterType === 'project' ? 'default' : 'outline'}
                onClick={() => setFilterType('project')}
              >
                项目组
              </Button>
              <Button
                variant={filterType === 'custom' ? 'default' : 'outline'}
                onClick={() => setFilterType('custom')}
              >
                自定义
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户组列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600">
                    {getTypeIcon(group.type)}
                  </div>
                  <div>
                    <CardTitle className="mb-1">{group.name}</CardTitle>
                    {getTypeBadge(group.type)}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedGroup(group);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="w-4 h-4 mr-2" />
                      添加成员
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除用户组
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-3 line-clamp-2">
                {group.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600 mb-1">成员数</p>
                  <p className="text-xl">{group.memberCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">管理员</p>
                  <p className="text-xl">{group.adminCount}</p>
                </div>
              </div>

              {/* 成员头像 */}
              <div>
                <p className="text-xs text-slate-600 mb-2">部分成员:</p>
                <div className="flex items-center gap-2">
                  {group.members.slice(0, 5).map((member, index) => (
                    <Avatar key={index} className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white text-xs">
                        {member.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {group.memberCount > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                      +{group.memberCount - 5}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t text-xs text-slate-600">
                创建于 {group.createdAt}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-slate-300" />
            <div>
              <h3 className="text-xl mb-2">没有找到用户组</h3>
              <p className="text-slate-600">调整筛选条件或创建新用户组</p>
            </div>
          </div>
        </Card>
      )}

      {/* 创建用户组对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>创建用户组</DialogTitle>
            <DialogDescription>创建部门、项目组或自定义用户组</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">用户组名称 *</Label>
              <Input
                id="group-name"
                placeholder="例如: AI研发部"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-type">类型 *</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={newGroup.type === 'department' ? 'default' : 'outline'}
                  onClick={() => setNewGroup({ ...newGroup, type: 'department' })}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Building className="w-6 h-6" />
                  <span>部门</span>
                </Button>
                <Button
                  type="button"
                  variant={newGroup.type === 'project' ? 'default' : 'outline'}
                  onClick={() => setNewGroup({ ...newGroup, type: 'project' })}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Layers className="w-6 h-6" />
                  <span>项目组</span>
                </Button>
                <Button
                  type="button"
                  variant={newGroup.type === 'custom' ? 'default' : 'outline'}
                  onClick={() => setNewGroup({ ...newGroup, type: 'custom' })}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Settings className="w-6 h-6" />
                  <span>自定义</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">描述</Label>
              <Textarea
                id="group-description"
                placeholder="描述用户组的职责和用途"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateGroup}>
              <Plus className="w-4 h-4 mr-2" />
              创建用户组
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 用户组详情对话框 */}
      {selectedGroup && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
              <DialogDescription>{selectedGroup.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600">
                  {getTypeIcon(selectedGroup.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(selectedGroup.type)}
                    <Badge variant="outline">{selectedGroup.memberCount} 成员</Badge>
                  </div>
                  <p className="text-sm text-slate-600">创建于 {selectedGroup.createdAt}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">成员列表 ({selectedGroup.memberCount})</h3>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    添加成员
                  </Button>
                </div>

                <div className="space-y-2">
                  {selectedGroup.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white">
                            {member.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member}</p>
                          <p className="text-xs text-slate-600">member{index}@fermi.cn</p>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon">
                        <UserX className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                关闭
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                编辑用户组
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
