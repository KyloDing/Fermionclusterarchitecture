import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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
  Menu,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  FolderTree,
  FileCode,
  MousePointerClick,
} from 'lucide-react';
import CreateMenuDialog from '../dialogs/CreateMenuDialog';
import { toast } from 'sonner';

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 'directory', // 目录
  MENU = 'menu',          // 菜单
  BUTTON = 'button',      // 按钮
}

// 菜单数据结构
export interface MenuItem {
  id: string;
  name: string;
  type: MenuType;
  parentId: string | null;
  path: string;
  icon: string;
  orderNum: number;
  permissions: string[];
  visible: boolean;
  status: 'enabled' | 'disabled';
  children?: MenuItem[];
  component?: string; // 组件路径
  description?: string;
}

export default function MenuManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MenuType | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  // 模拟菜单数据
  const [menus, setMenus] = useState<MenuItem[]>([
    {
      id: '1',
      name: '总览',
      type: MenuType.DIRECTORY,
      parentId: null,
      path: '/overview',
      icon: 'LayoutDashboard',
      orderNum: 1,
      permissions: [],
      visible: true,
      status: 'enabled',
      children: [
        {
          id: '1-1',
          name: '仪表盘',
          type: MenuType.MENU,
          parentId: '1',
          path: '/dashboard',
          icon: 'LayoutDashboard',
          orderNum: 1,
          permissions: ['dashboard:view'],
          visible: true,
          status: 'enabled',
          component: 'DashboardPage',
        },
      ],
    },
    {
      id: '2',
      name: '算力资源',
      type: MenuType.DIRECTORY,
      parentId: null,
      path: '/resources',
      icon: 'Server',
      orderNum: 2,
      permissions: [],
      visible: true,
      status: 'enabled',
      children: [
        {
          id: '2-1',
          name: '集群管理',
          type: MenuType.MENU,
          parentId: '2',
          path: '/clusters',
          icon: 'Layers',
          orderNum: 1,
          permissions: ['cluster:view'],
          visible: true,
          status: 'enabled',
          component: 'ClustersPage',
          children: [
            {
              id: '2-1-1',
              name: '创建集群',
              type: MenuType.BUTTON,
              parentId: '2-1',
              path: '',
              icon: 'Plus',
              orderNum: 1,
              permissions: ['cluster:create'],
              visible: true,
              status: 'enabled',
            },
            {
              id: '2-1-2',
              name: '编辑集群',
              type: MenuType.BUTTON,
              parentId: '2-1',
              path: '',
              icon: 'Edit',
              orderNum: 2,
              permissions: ['cluster:edit'],
              visible: true,
              status: 'enabled',
            },
            {
              id: '2-1-3',
              name: '删除集群',
              type: MenuType.BUTTON,
              parentId: '2-1',
              path: '',
              icon: 'Trash2',
              orderNum: 3,
              permissions: ['cluster:delete'],
              visible: true,
              status: 'enabled',
            },
          ],
        },
        {
          id: '2-2',
          name: '计算节点',
          type: MenuType.MENU,
          parentId: '2',
          path: '/compute-nodes',
          icon: 'Server',
          orderNum: 2,
          permissions: ['compute-node:view'],
          visible: true,
          status: 'enabled',
          component: 'ComputeNodesPage',
        },
        {
          id: '2-3',
          name: 'GPU资源池',
          type: MenuType.MENU,
          parentId: '2',
          path: '/gpu-pools',
          icon: 'Cpu',
          orderNum: 3,
          permissions: ['gpu-pool:view'],
          visible: true,
          status: 'enabled',
          component: 'GpuPoolsPage',
        },
      ],
    },
    {
      id: '3',
      name: '用户与权限',
      type: MenuType.DIRECTORY,
      parentId: null,
      path: '/access',
      icon: 'Users',
      orderNum: 10,
      permissions: [],
      visible: true,
      status: 'enabled',
      children: [
        {
          id: '3-1',
          name: '用户管理',
          type: MenuType.MENU,
          parentId: '3',
          path: '/users-management',
          icon: 'Users',
          orderNum: 1,
          permissions: ['user:view'],
          visible: true,
          status: 'enabled',
          component: 'UsersManagementPage',
        },
        {
          id: '3-2',
          name: '角色管理',
          type: MenuType.MENU,
          parentId: '3',
          path: '/roles-management',
          icon: 'Shield',
          orderNum: 2,
          permissions: ['role:view'],
          visible: true,
          status: 'enabled',
          component: 'RolesManagementPage',
        },
        {
          id: '3-3',
          name: '用户组管理',
          type: MenuType.MENU,
          parentId: '3',
          path: '/user-groups',
          icon: 'Users',
          orderNum: 3,
          permissions: ['user-group:view'],
          visible: true,
          status: 'enabled',
          component: 'UserGroupsPage',
        },
        {
          id: '3-4',
          name: '菜单管理',
          type: MenuType.MENU,
          parentId: '3',
          path: '/menu-management',
          icon: 'Menu',
          orderNum: 4,
          permissions: ['menu:view'],
          visible: true,
          status: 'enabled',
          component: 'MenuManagementPage',
        },
      ],
    },
  ]);

  // 展开/折叠节点
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // 获取菜单类型图标
  const getTypeIcon = (type: MenuType) => {
    switch (type) {
      case MenuType.DIRECTORY:
        return <FolderTree className="w-4 h-4 text-blue-600" />;
      case MenuType.MENU:
        return <FileCode className="w-4 h-4 text-purple-600" />;
      case MenuType.BUTTON:
        return <MousePointerClick className="w-4 h-4 text-green-600" />;
    }
  };

  // 获取菜单类型标签
  const getTypeBadge = (type: MenuType) => {
    const config = {
      [MenuType.DIRECTORY]: { label: '目录', className: 'bg-blue-100 text-blue-700' },
      [MenuType.MENU]: { label: '菜单', className: 'bg-purple-100 text-purple-700' },
      [MenuType.BUTTON]: { label: '按钮', className: 'bg-green-100 text-green-700' },
    };
    const { label, className } = config[type];
    return <Badge className={className}>{label}</Badge>;
  };

  // 渲染菜单树
  const renderMenuTree = (items: MenuItem[], level: number = 0) => {
    return items.map((menu) => {
      const isExpanded = expandedIds.has(menu.id);
      const hasChildren = menu.children && menu.children.length > 0;

      // 搜索过滤
      if (searchQuery && !menu.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }

      // 类型过滤
      if (selectedType !== 'all' && menu.type !== selectedType) {
        return null;
      }

      return (
        <>
          <TableRow key={menu.id} className="hover:bg-slate-50">
            <TableCell>
              <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(menu.id)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-6" />}
                {getTypeIcon(menu.type)}
                <span className="font-medium text-slate-900">{menu.name}</span>
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(menu.type)}</TableCell>
            <TableCell>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                {menu.icon}
              </code>
            </TableCell>
            <TableCell>
              <span className="text-slate-600">{menu.path || '-'}</span>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {menu.permissions.length > 0 ? (
                  menu.permissions.map((perm, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {perm}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">{menu.orderNum}</TableCell>
            <TableCell>
              {menu.visible ? (
                <Badge className="bg-green-100 text-green-700">
                  <Eye className="w-3 h-3 mr-1" />
                  显示
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-700">
                  <EyeOff className="w-3 h-3 mr-1" />
                  隐藏
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {menu.status === 'enabled' ? (
                <Badge className="bg-green-100 text-green-700">启用</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">禁用</Badge>
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingMenu(menu);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      // 添加子菜单
                      setEditingMenu({ ...menu, parentId: menu.id } as any);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加子菜单
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(menu.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          {isExpanded && hasChildren && renderMenuTree(menu.children!, level + 1)}
        </>
      );
    });
  };

  // 删除菜单
  const handleDelete = (id: string) => {
    // 递归删除菜单及其子菜单
    const deleteRecursive = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? deleteRecursive(item.children) : undefined,
        }));
    };

    setMenus(deleteRecursive(menus));
    toast.success('菜单删除成功');
  };

  // 保存菜单
  const handleSave = (menu: MenuItem) => {
    if (editingMenu && editingMenu.id) {
      // 编辑模式
      const updateRecursive = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.id === editingMenu.id) {
            return { ...menu, id: editingMenu.id };
          }
          return {
            ...item,
            children: item.children ? updateRecursive(item.children) : undefined,
          };
        });
      };
      setMenus(updateRecursive(menus));
      toast.success('菜单更新成功');
    } else {
      // 新增模式
      const newMenu = { ...menu, id: Date.now().toString() };
      if (menu.parentId) {
        // 添加到指定父菜单
        const addToParent = (items: MenuItem[]): MenuItem[] => {
          return items.map((item) => {
            if (item.id === menu.parentId) {
              return {
                ...item,
                children: [...(item.children || []), newMenu],
              };
            }
            return {
              ...item,
              children: item.children ? addToParent(item.children) : undefined,
            };
          });
        };
        setMenus(addToParent(menus));
      } else {
        // 添加为顶级菜单
        setMenus([...menus, newMenu]);
      }
      toast.success('菜单创建成功');
    }
    setCreateDialogOpen(false);
    setEditingMenu(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-900 mb-2">菜单管理</h1>
            <p className="text-slate-600">配置系统菜单结构和按钮权限标识</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            新建菜单
          </Button>
        </div>
      </div>

      {/* 过滤器 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索菜单名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
              size="sm"
            >
              全部
            </Button>
            <Button
              variant={selectedType === MenuType.DIRECTORY ? 'default' : 'outline'}
              onClick={() => setSelectedType(MenuType.DIRECTORY)}
              size="sm"
              className={selectedType === MenuType.DIRECTORY ? 'bg-blue-600' : ''}
            >
              <FolderTree className="w-4 h-4 mr-1" />
              目录
            </Button>
            <Button
              variant={selectedType === MenuType.MENU ? 'default' : 'outline'}
              onClick={() => setSelectedType(MenuType.MENU)}
              size="sm"
              className={selectedType === MenuType.MENU ? 'bg-purple-600' : ''}
            >
              <FileCode className="w-4 h-4 mr-1" />
              菜单
            </Button>
            <Button
              variant={selectedType === MenuType.BUTTON ? 'default' : 'outline'}
              onClick={() => setSelectedType(MenuType.BUTTON)}
              size="sm"
              className={selectedType === MenuType.BUTTON ? 'bg-green-600' : ''}
            >
              <MousePointerClick className="w-4 h-4 mr-1" />
              按钮
            </Button>
          </div>
        </div>
      </Card>

      {/* 菜单树表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>菜单名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>图标</TableHead>
              <TableHead>路由路径</TableHead>
              <TableHead>权限标识</TableHead>
              <TableHead className="text-center">排序</TableHead>
              <TableHead>可见性</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderMenuTree(menus)}
          </TableBody>
        </Table>
      </Card>

      {/* 创建/编辑菜单对话框 */}
      <CreateMenuDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingMenu(null);
        }}
        onSave={handleSave}
        editingMenu={editingMenu}
        allMenus={menus}
      />
    </div>
  );
}
