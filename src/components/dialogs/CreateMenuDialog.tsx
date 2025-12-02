import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { MenuItem, MenuType } from '../pages/MenuManagementPage';

interface CreateMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (menu: MenuItem) => void;
  editingMenu?: MenuItem | null;
  allMenus: MenuItem[];
}

export default function CreateMenuDialog({
  open,
  onOpenChange,
  onSave,
  editingMenu,
  allMenus,
}: CreateMenuDialogProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    type: MenuType.MENU,
    parentId: null,
    path: '',
    icon: '',
    orderNum: 1,
    permissions: [],
    visible: true,
    status: 'enabled',
    component: '',
    description: '',
  });

  const [permissionInput, setPermissionInput] = useState('');

  useEffect(() => {
    if (editingMenu) {
      setFormData({
        name: editingMenu.name || '',
        type: editingMenu.type || MenuType.MENU,
        parentId: editingMenu.parentId || null,
        path: editingMenu.path || '',
        icon: editingMenu.icon || '',
        orderNum: editingMenu.orderNum || 1,
        permissions: editingMenu.permissions || [],
        visible: editingMenu.visible !== undefined ? editingMenu.visible : true,
        status: editingMenu.status || 'enabled',
        component: editingMenu.component || '',
        description: editingMenu.description || '',
      });
    } else {
      setFormData({
        name: '',
        type: MenuType.MENU,
        parentId: null,
        path: '',
        icon: '',
        orderNum: 1,
        permissions: [],
        visible: true,
        status: 'enabled',
        component: '',
        description: '',
      });
    }
    setPermissionInput('');
  }, [editingMenu, open]);

  // 扁平化所有菜单（用于选择父菜单）
  const flattenMenus = (items: MenuItem[], level = 0): Array<MenuItem & { level: number }> => {
    let result: Array<MenuItem & { level: number }> = [];
    items.forEach((item) => {
      // 只允许选择目录和菜单作为父级，不允许选择按钮
      if (item.type !== MenuType.BUTTON) {
        result.push({ ...item, level });
      }
      if (item.children) {
        result = [...result, ...flattenMenus(item.children, level + 1)];
      }
    });
    return result;
  };

  const flatMenus = flattenMenus(allMenus);

  // 添加权限标识
  const handleAddPermission = () => {
    if (permissionInput.trim() && !formData.permissions?.includes(permissionInput.trim())) {
      setFormData({
        ...formData,
        permissions: [...(formData.permissions || []), permissionInput.trim()],
      });
      setPermissionInput('');
    }
  };

  // 移除权限标识
  const handleRemovePermission = (permission: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions?.filter((p) => p !== permission) || [],
    });
  };

  // 处理保存
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as MenuItem);
  };

  // 常用图标列表
  const commonIcons = [
    'LayoutDashboard',
    'Server',
    'Cpu',
    'HardDrive',
    'Database',
    'Layers',
    'Box',
    'Package',
    'Folder',
    'File',
    'FileText',
    'Image',
    'Users',
    'User',
    'Shield',
    'Lock',
    'Key',
    'Settings',
    'Sliders',
    'Activity',
    'BarChart',
    'PieChart',
    'TrendingUp',
    'Calendar',
    'Clock',
    'Bell',
    'Mail',
    'MessageSquare',
    'Phone',
    'Video',
    'Camera',
    'Upload',
    'Download',
    'Share',
    'Link',
    'ExternalLink',
    'Plus',
    'Edit',
    'Trash2',
    'Search',
    'Filter',
    'Menu',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMenu?.id ? '编辑菜单' : '新建菜单'}
          </DialogTitle>
          <DialogDescription>
            配置菜单的基本信息、路由和权限标识
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>菜单名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入菜单名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>菜单类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MenuType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MenuType.DIRECTORY}>目录</SelectItem>
                    <SelectItem value={MenuType.MENU}>菜单</SelectItem>
                    <SelectItem value={MenuType.BUTTON}>按钮</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>上级菜单</Label>
              <Select
                value={formData.parentId || 'null'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === 'null' ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择上级菜单（不选则为顶级菜单）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">无（顶级菜单）</SelectItem>
                  {flatMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {'　'.repeat(menu.level)}
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>路由路径</Label>
                <Input
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/example"
                />
                <p className="text-xs text-slate-500">
                  {formData.type === MenuType.BUTTON ? '按钮类型无需路径' : '菜单的访问路径'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>组件路径</Label>
                <Input
                  value={formData.component}
                  onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                  placeholder="ExamplePage"
                />
                <p className="text-xs text-slate-500">
                  {formData.type === MenuType.BUTTON ? '按钮类型无需组件' : '组件名称'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>菜单图标</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择图标" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {commonIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>菜单描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述该菜单的功能..."
                rows={2}
              />
            </div>
          </div>

          {/* 权限配置 */}
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label>权限标识</Label>
              <div className="flex gap-2">
                <Input
                  value={permissionInput}
                  onChange={(e) => setPermissionInput(e.target.value)}
                  placeholder="例如: user:view, user:create"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPermission();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddPermission} variant="outline">
                  添加
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                配置访问该菜单/按钮所需的权限标识，支持多个权限
              </p>
              {formData.permissions && formData.permissions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="gap-1">
                      {permission}
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(permission)}
                        className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 其他配置 */}
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>排序号</Label>
                <Input
                  type="number"
                  value={formData.orderNum}
                  onChange={(e) =>
                    setFormData({ ...formData, orderNum: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label>是否可见</Label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={formData.visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    {formData.visible ? '显示' : '隐藏'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'enabled' | 'disabled') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">启用</SelectItem>
                    <SelectItem value="disabled">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editingMenu?.id ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
