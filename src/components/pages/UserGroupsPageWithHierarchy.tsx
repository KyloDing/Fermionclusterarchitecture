/**
 * 用户组管理页面（带层级关系）
 * @description 支持树形结构展示和管理用户组的层级关系
 */

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  GitBranch,
  Network,
  List,
  Move,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================
// 类型定义
// ============================================

interface UserGroup {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'project' | 'custom';
  memberCount: number;
  adminCount: number;
  createdAt: string;
  parentId?: string;  // 父组ID
  children?: UserGroup[];  // 子组
  level?: number;  // 层级深度
  path?: string[];  // 层级路径
}

// ============================================
// 模拟数据
// ============================================

const mockGroups: UserGroup[] = [
  // 一级：公司级别
  {
    id: 'group-001',
    name: '费米科技',
    description: '公司根组织',
    type: 'department',
    memberCount: 100,
    adminCount: 5,
    createdAt: '2024-01-01',
    parentId: undefined,
  },
  
  // 二级：部门级别
  {
    id: 'group-002',
    name: 'AI研发部',
    description: '负责人工智能算法研发和模型训练',
    type: 'department',
    memberCount: 45,
    adminCount: 3,
    createdAt: '2024-01-15',
    parentId: 'group-001',
  },
  {
    id: 'group-003',
    name: '平台工程部',
    description: '负责平台开发和运维',
    type: 'department',
    memberCount: 30,
    adminCount: 2,
    createdAt: '2024-01-15',
    parentId: 'group-001',
  },
  {
    id: 'group-004',
    name: '产品部',
    description: '产品规划和设计',
    type: 'department',
    memberCount: 25,
    adminCount: 2,
    createdAt: '2024-01-15',
    parentId: 'group-001',
  },
  
  // 三级：团队级别
  {
    id: 'group-005',
    name: 'CV算法团队',
    description: '计算机视觉算法研究',
    type: 'project',
    memberCount: 15,
    adminCount: 1,
    createdAt: '2024-02-01',
    parentId: 'group-002',
  },
  {
    id: 'group-006',
    name: 'NLP算法团队',
    description: '自然语言处理算法研究',
    type: 'project',
    memberCount: 18,
    adminCount: 1,
    createdAt: '2024-02-01',
    parentId: 'group-002',
  },
  {
    id: 'group-007',
    name: '推荐算法团队',
    description: '推荐系统算法优化',
    type: 'project',
    memberCount: 12,
    adminCount: 1,
    createdAt: '2024-02-01',
    parentId: 'group-002',
  },
  {
    id: 'group-008',
    name: '前端开发组',
    description: '前端界面开发',
    type: 'custom',
    memberCount: 12,
    adminCount: 1,
    createdAt: '2024-02-10',
    parentId: 'group-003',
  },
  {
    id: 'group-009',
    name: '后端开发组',
    description: '后端服务开发',
    type: 'custom',
    memberCount: 15,
    adminCount: 1,
    createdAt: '2024-02-10',
    parentId: 'group-003',
  },
  
  // 四级：项目组
  {
    id: 'group-010',
    name: 'LLM训练项目组',
    description: '大语言模型训练',
    type: 'project',
    memberCount: 8,
    adminCount: 1,
    createdAt: '2024-03-01',
    parentId: 'group-006',
  },
  {
    id: 'group-011',
    name: '对话系统项目组',
    description: '智能对话系统开发',
    type: 'project',
    memberCount: 10,
    adminCount: 1,
    createdAt: '2024-03-01',
    parentId: 'group-006',
  },
];

// ============================================
// 工具函数
// ============================================

/**
 * 构建树形结构
 */
function buildTree(groups: UserGroup[]): UserGroup[] {
  const map = new Map<string, UserGroup>();
  const roots: UserGroup[] = [];
  
  // 第一遍：创建映射
  groups.forEach((group) => {
    map.set(group.id, { ...group, children: [] });
  });
  
  // 第二遍：建立父子关系
  groups.forEach((group) => {
    const node = map.get(group.id)!;
    if (group.parentId) {
      const parent = map.get(group.parentId);
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);  // 父节点不存在，作为根节点
      }
    } else {
      roots.push(node);
    }
  });
  
  // 计算层级和路径
  const calculateLevel = (node: UserGroup, level: number = 0, path: string[] = []) => {
    node.level = level;
    node.path = [...path, node.name];
    node.children?.forEach((child) => calculateLevel(child, level + 1, node.path));
  };
  
  roots.forEach((root) => calculateLevel(root));
  
  return roots;
}

/**
 * 扁平化树形结构（用于列表视图）
 */
function flattenTree(nodes: UserGroup[]): UserGroup[] {
  const result: UserGroup[] = [];
  
  const traverse = (node: UserGroup) => {
    result.push(node);
    node.children?.forEach(traverse);
  };
  
  nodes.forEach(traverse);
  return result;
}

/**
 * 查找节点
 */
function findNode(nodes: UserGroup[], id: string): UserGroup | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// ============================================
// 主组件
// ============================================

export default function UserGroupsPageWithHierarchy() {
  const [groups, setGroups] = useState<UserGroup[]>(mockGroups);
  const [treeData, setTreeData] = useState<UserGroup[]>(buildTree(mockGroups));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['group-001', 'group-002', 'group-003']));
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'department' as 'department' | 'project' | 'custom',
    parentId: undefined as string | undefined,
  });

  // 切换展开/折叠
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // 展开所有节点
  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: UserGroup[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.children) collect(node.children);
      });
    };
    collect(treeData);
    setExpandedNodes(allIds);
  };

  // 折叠所有节点
  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // 创建用户组
  const handleCreate = () => {
    const newGroup: UserGroup = {
      id: `group-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      memberCount: 0,
      adminCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      parentId: formData.parentId,
    };
    
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    setTreeData(buildTree(newGroups));
    
    toast.success('创建成功');
    setCreateDialogOpen(false);
    setFormData({ name: '', description: '', type: 'department', parentId: undefined });
  };

  // 编辑用户组
  const handleEdit = () => {
    if (!selectedGroup) return;
    
    const newGroups = groups.map((g) =>
      g.id === selectedGroup.id
        ? { ...g, name: formData.name, description: formData.description, type: formData.type }
        : g
    );
    
    setGroups(newGroups);
    setTreeData(buildTree(newGroups));
    
    toast.success('更新成功');
    setEditDialogOpen(false);
  };

  // 移动用户组
  const handleMove = () => {
    if (!selectedGroup) return;
    
    const newGroups = groups.map((g) =>
      g.id === selectedGroup.id ? { ...g, parentId: formData.parentId } : g
    );
    
    setGroups(newGroups);
    setTreeData(buildTree(newGroups));
    
    toast.success('移动成功');
    setMoveDialogOpen(false);
  };

  // 删除用户组
  const handleDelete = (id: string) => {
    const newGroups = groups.filter((g) => g.id !== id && g.parentId !== id);
    setGroups(newGroups);
    setTreeData(buildTree(newGroups));
    toast.success('删除成功');
  };

  // 类型徽章
  const getTypeBadge = (type: string) => {
    const configs = {
      department: { label: '部门', variant: 'default' as const },
      project: { label: '项目', variant: 'secondary' as const },
      custom: { label: '自定义', variant: 'outline' as const },
    };
    const config = configs[type as keyof typeof configs];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 获取层级缩进
  const getIndent = (level: number) => {
    return level * 24;
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Network className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-slate-900">用户组管理</h1>
              <p className="text-slate-600">管理用户组的层级关系和成员</p>
            </div>
          </div>
          <Button onClick={() => { setFormData({ name: '', description: '', type: 'department', parentId: undefined }); setCreateDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            创建用户组
          </Button>
        </div>
      </div>

      {/* 功能栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* 搜索 */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="搜索用户组..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 视图切换 */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'tree' | 'list')}>
                <TabsList>
                  <TabsTrigger value="tree" className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    树形视图
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    列表视图
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 展开/折叠 */}
            {viewMode === 'tree' && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>
                  展开全部
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                  折叠全部
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 主内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            用户组列表
          </CardTitle>
          <CardDescription>共 {groups.length} 个用户组</CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'tree' ? (
            <TreeView
              nodes={treeData}
              expandedNodes={expandedNodes}
              onToggleExpand={toggleExpand}
              onSelect={setSelectedGroup}
              onEdit={(group) => {
                setSelectedGroup(group);
                setFormData({ name: group.name, description: group.description, type: group.type, parentId: group.parentId });
                setEditDialogOpen(true);
              }}
              onMove={(group) => {
                setSelectedGroup(group);
                setFormData({ ...formData, parentId: group.parentId });
                setMoveDialogOpen(true);
              }}
              onDelete={handleDelete}
              onViewDetail={(group) => {
                setSelectedGroup(group);
                setDetailDialogOpen(true);
              }}
              getTypeBadge={getTypeBadge}
              searchText={searchText}
            />
          ) : (
            <ListView
              groups={flattenTree(treeData)}
              onSelect={setSelectedGroup}
              onEdit={(group) => {
                setSelectedGroup(group);
                setFormData({ name: group.name, description: group.description, type: group.type, parentId: group.parentId });
                setEditDialogOpen(true);
              }}
              onDelete={handleDelete}
              getTypeBadge={getTypeBadge}
              getIndent={getIndent}
              searchText={searchText}
            />
          )}
        </CardContent>
      </Card>

      {/* 创建对话框 */}
      <GroupFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="创建用户组"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreate}
        groups={groups}
      />

      {/* 编辑对话框 */}
      <GroupFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="编辑用户组"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleEdit}
        groups={groups}
        isEdit
      />

      {/* 移动对话框 */}
      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        group={selectedGroup}
        groups={groups}
        treeData={treeData}
        onMove={handleMove}
        formData={formData}
        onFormDataChange={setFormData}
      />

      {/* 详情对话框 */}
      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        group={selectedGroup}
        getTypeBadge={getTypeBadge}
      />
    </div>
  );
}

// ============================================
// 树形视图组件
// ============================================

interface TreeViewProps {
  nodes: UserGroup[];
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (group: UserGroup) => void;
  onEdit: (group: UserGroup) => void;
  onMove: (group: UserGroup) => void;
  onDelete: (id: string) => void;
  onViewDetail: (group: UserGroup) => void;
  getTypeBadge: (type: string) => JSX.Element;
  searchText: string;
}

function TreeView({
  nodes,
  expandedNodes,
  onToggleExpand,
  onSelect,
  onEdit,
  onMove,
  onDelete,
  onViewDetail,
  getTypeBadge,
  searchText,
}: TreeViewProps) {
  const renderNode = (node: UserGroup, level: number = 0): JSX.Element | null => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 24;
    
    // 搜索过滤
    if (searchText && !node.name.toLowerCase().includes(searchText.toLowerCase())) {
      return null;
    }

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-lg border-b border-slate-100 transition-colors group"
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          {/* 展开/折叠按钮 */}
          <button
            onClick={() => hasChildren && onToggleExpand(node.id)}
            className={`w-5 h-5 flex items-center justify-center rounded ${hasChildren ? 'hover:bg-slate-200' : 'invisible'}`}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* 图标 */}
          <div className={`w-8 h-8 rounded flex items-center justify-center ${level === 0 ? 'bg-purple-100' : level === 1 ? 'bg-blue-100' : 'bg-slate-100'}`}>
            {hasChildren ? (
              isExpanded ? <FolderOpen className={`w-4 h-4 ${level === 0 ? 'text-purple-600' : level === 1 ? 'text-blue-600' : 'text-slate-600'}`} /> : <Folder className={`w-4 h-4 ${level === 0 ? 'text-purple-600' : level === 1 ? 'text-blue-600' : 'text-slate-600'}`} />
            ) : (
              <Users className="w-4 h-4 text-slate-600" />
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{node.name}</span>
              {getTypeBadge(node.type)}
              <span className="text-sm text-slate-500">({node.memberCount} 成员)</span>
            </div>
            {node.description && (
              <p className="text-sm text-slate-500 truncate">{node.description}</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onViewDetail(node)}>
              <Eye className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(node)}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMove(node)}>
                  <Move className="w-4 h-4 mr-2" />
                  移动
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(node.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 子节点 */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {nodes.map((node) => renderNode(node))}
    </div>
  );
}

// ============================================
// 列表视图组件
// ============================================

interface ListViewProps {
  groups: UserGroup[];
  onSelect: (group: UserGroup) => void;
  onEdit: (group: UserGroup) => void;
  onDelete: (id: string) => void;
  getTypeBadge: (type: string) => JSX.Element;
  getIndent: (level: number) => number;
  searchText: string;
}

function ListView({ groups, onSelect, onEdit, onDelete, getTypeBadge, getIndent, searchText }: ListViewProps) {
  const filteredGroups = searchText
    ? groups.filter((g) => g.name.toLowerCase().includes(searchText.toLowerCase()))
    : groups;

  return (
    <div className="space-y-1">
      {filteredGroups.map((group) => (
        <div
          key={group.id}
          className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border-b border-slate-100 transition-colors group"
          style={{ paddingLeft: `${getIndent(group.level || 0) + 12}px` }}
        >
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{group.name}</span>
              {getTypeBadge(group.type)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {group.path && <span>{group.path.join(' / ')}</span>}
              <span>·</span>
              <span>{group.memberCount} 成员</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onEdit(group)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(group.id)}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 表单对话框
// ============================================

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: any;
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  groups: UserGroup[];
  isEdit?: boolean;
}

function GroupFormDialog({ open, onOpenChange, title, formData, onFormDataChange, onSubmit, groups, isEdit }: GroupFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改用户组信息' : '填写以下信息创建新的用户组'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>名称</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="输入用户组名称"
            />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="输入用户组描述"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>类型</Label>
            <Select value={formData.type} onValueChange={(v) => onFormDataChange({ ...formData, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">部门</SelectItem>
                <SelectItem value="project">项目</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label>父组（可选）</Label>
              <Select value={formData.parentId || 'none'} onValueChange={(v) => onFormDataChange({ ...formData, parentId: v === 'none' ? undefined : v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无（根组）</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSubmit}>{isEdit ? '保存' : '创建'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// 移动对话框
// ============================================

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UserGroup | null;
  groups: UserGroup[];
  treeData: UserGroup[];
  onMove: () => void;
  formData: any;
  onFormDataChange: (data: any) => void;
}

function MoveDialog({ open, onOpenChange, group, groups, treeData, onMove, formData, onFormDataChange }: MoveDialogProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>移动用户组</DialogTitle>
          <DialogDescription>选择 {group.name} 的新父组</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>目标父组</Label>
            <Select value={formData.parentId || 'none'} onValueChange={(v) => onFormDataChange({ ...formData, parentId: v === 'none' ? undefined : v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无（移到根级）</SelectItem>
                {groups
                  .filter((g) => g.id !== group.id)  // 不能移动到自己
                  .map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onMove}>确认移动</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// 详情对话框
// ============================================

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UserGroup | null;
  getTypeBadge: (type: string) => JSX.Element;
}

function DetailDialog({ open, onOpenChange, group, getTypeBadge }: DetailDialogProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {group.name}
          </DialogTitle>
          <DialogDescription>
            查看用户组的详细信息和统计数据
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-500">类型</Label>
              <div className="mt-1">{getTypeBadge(group.type)}</div>
            </div>
            <div>
              <Label className="text-slate-500">创建时间</Label>
              <p className="mt-1">{group.createdAt}</p>
            </div>
            <div>
              <Label className="text-slate-500">成员数量</Label>
              <p className="mt-1">{group.memberCount} 人</p>
            </div>
            <div>
              <Label className="text-slate-500">管理员数量</Label>
              <p className="mt-1">{group.adminCount} 人</p>
            </div>
          </div>
          {group.path && (
            <div>
              <Label className="text-slate-500">组织路径</Label>
              <p className="mt-1 text-sm">{group.path.join(' / ')}</p>
            </div>
          )}
          {group.description && (
            <div>
              <Label className="text-slate-500">描述</Label>
              <p className="mt-1">{group.description}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}