import { useState } from 'react';
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
  DialogTrigger,
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
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Tag,
  List,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// 字典项类型
interface DictionaryItem {
  id: number;
  dictType: string;
  dictTypeLabel: string;
  label: string;
  value: string;
  description: string;
  remark: string;
  sort: number;
  status: 'active' | 'inactive';
  createTime: string;
}

// 字典类型
interface DictionaryType {
  type: string;
  label: string;
  description: string;
  itemCount: number;
}

export default function DictionaryManagementPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['storage_type', 'backend_type']));

  // 字典类型数据
  const [dictTypes] = useState<DictionaryType[]>([
    { type: 'storage_type', label: '存储类型', description: '存储卷类型定义', itemCount: 3 },
    { type: 'backend_type', label: '存储后端类型', description: '存储后端类型定义', itemCount: 3 },
    { type: 'node_type', label: '节点类型', description: '计算节点类型定义', itemCount: 1 },
    { type: 'gpu_type', label: 'GPU型号', description: 'GPU型号定义', itemCount: 4 },
    { type: 'task_status', label: '任务状态', description: '任务执行状态定义', itemCount: 6 },
    { type: 'billing_unit', label: '计费单位', description: '计费单位定义', itemCount: 3 },
    { type: 'instance_status', label: '实例状态', description: '容器实例状态定义', itemCount: 5 },
  ]);

  // 字典数据
  const [dictItems] = useState<DictionaryItem[]>([
    // 存储类型
    {
      id: 1,
      dictType: 'storage_type',
      dictTypeLabel: '存储类型',
      label: 'SSD',
      value: 'SSD',
      description: 'SSD (高性能 ¥0.35/GB/月)',
      remark: '高性能固态硬盘存储',
      sort: 0,
      status: 'active',
      createTime: '2024-11-15 10:25:30',
    },
    {
      id: 2,
      dictType: 'storage_type',
      dictTypeLabel: '存储类型',
      label: 'HDD',
      value: 'HDD',
      description: 'HDD (标准 ¥0.15/GB/月)',
      remark: '标准机械硬盘存储',
      sort: 0,
      status: 'active',
      createTime: '2024-11-15 10:25:45',
    },
    {
      id: 3,
      dictType: 'storage_type',
      dictTypeLabel: '存储类型',
      label: '混合存储',
      value: 'hybrid',
      description: '混合存储',
      remark: 'SSD+HDD混合存储方案',
      sort: 0,
      status: 'active',
      createTime: '2024-11-15 10:26:00',
    },
    // 存储后端类型
    {
      id: 4,
      dictType: 'backend_type',
      dictTypeLabel: '存储后端类型',
      label: 'BeeGFS',
      value: 'BeeGFS',
      description: '存储类型BeeGFS',
      remark: '高性能并行文件系统',
      sort: 2,
      status: 'active',
      createTime: '2025-12-02 10:50:49',
    },
    {
      id: 5,
      dictType: 'backend_type',
      dictTypeLabel: '存储后端类型',
      label: 'CubeFS',
      value: 'CubeFS',
      description: '存储类型CubeFS',
      remark: '云原生分布式文件系统',
      sort: 0,
      status: 'active',
      createTime: '2025-11-20 14:32:18',
    },
    {
      id: 6,
      dictType: 'backend_type',
      dictTypeLabel: '存储后端类型',
      label: 'NFS',
      value: 'NFS',
      description: '存储类型NFS',
      remark: '网络文件系统',
      sort: 0,
      status: 'active',
      createTime: '2025-11-18 09:15:22',
    },
    // 节点类型
    {
      id: 7,
      dictType: 'node_type',
      dictTypeLabel: '节点类型',
      label: '节点类型',
      value: 'compute',
      description: '计算节点',
      remark: '用于执行计算任务的节点',
      sort: 3,
      status: 'active',
      createTime: '2025-11-06 09:48:08',
    },
    // GPU型号
    {
      id: 8,
      dictType: 'gpu_type',
      dictTypeLabel: 'GPU型号',
      label: 'A100',
      value: 'A100',
      description: 'NVIDIA A100 80GB',
      remark: '旗舰级AI训练卡',
      sort: 0,
      status: 'active',
      createTime: '2024-10-15 11:20:00',
    },
    {
      id: 9,
      dictType: 'gpu_type',
      dictTypeLabel: 'GPU型号',
      label: 'V100',
      value: 'V100',
      description: 'NVIDIA V100 32GB',
      remark: '高性能训练卡',
      sort: 1,
      status: 'active',
      createTime: '2024-10-15 11:21:00',
    },
    {
      id: 10,
      dictType: 'gpu_type',
      dictTypeLabel: 'GPU型号',
      label: 'T4',
      value: 'T4',
      description: 'NVIDIA T4 16GB',
      remark: '推理加速卡',
      sort: 2,
      status: 'active',
      createTime: '2024-10-15 11:22:00',
    },
    {
      id: 11,
      dictType: 'gpu_type',
      dictTypeLabel: 'GPU型号',
      label: 'RTX 4090',
      value: 'RTX4090',
      description: 'NVIDIA RTX 4090 24GB',
      remark: '消费级顶级显卡',
      sort: 3,
      status: 'active',
      createTime: '2024-10-15 11:23:00',
    },
    // 任务状态
    {
      id: 12,
      dictType: 'task_status',
      dictTypeLabel: '任务状态',
      label: '等待中',
      value: 'pending',
      description: '任务已提交，等待调度',
      remark: '',
      sort: 0,
      status: 'active',
      createTime: '2024-09-20 14:00:00',
    },
    {
      id: 13,
      dictType: 'task_status',
      dictTypeLabel: '任务状态',
      label: '运行中',
      value: 'running',
      description: '任务正在执行',
      remark: '',
      sort: 1,
      status: 'active',
      createTime: '2024-09-20 14:01:00',
    },
    {
      id: 14,
      dictType: 'task_status',
      dictTypeLabel: '任务状态',
      label: '已完成',
      value: 'completed',
      description: '任务执行成功',
      remark: '',
      sort: 2,
      status: 'active',
      createTime: '2024-09-20 14:02:00',
    },
    {
      id: 15,
      dictType: 'task_status',
      dictTypeLabel: '任务状态',
      label: '失败',
      value: 'failed',
      description: '任务执行失败',
      remark: '',
      sort: 3,
      status: 'active',
      createTime: '2024-09-20 14:03:00',
    },
    {
      id: 16,
      dictType: 'task_status',
      dictTypeLabel: '任务状态',
      label: '已取消',
      value: 'cancelled',
      description: '任务被取消',
      remark: '',
      sort: 4,
      status: 'active',
      createTime: '2024-09-20 14:04:00',
    },
    {
      id: 17,
      dictType: 'task_status',
      dictTypeLabel: '任务状态',
      label: '已暂停',
      value: 'paused',
      description: '任务已暂停',
      remark: '',
      sort: 5,
      status: 'active',
      createTime: '2024-09-20 14:05:00',
    },
    // 计费单位
    {
      id: 18,
      dictType: 'billing_unit',
      dictTypeLabel: '计费单位',
      label: '小时',
      value: 'hour',
      description: '按小时计费',
      remark: '',
      sort: 0,
      status: 'active',
      createTime: '2024-08-10 10:00:00',
    },
    {
      id: 19,
      dictType: 'billing_unit',
      dictTypeLabel: '计费单位',
      label: 'GB/月',
      value: 'gb_month',
      description: '按GB每月计费',
      remark: '用于存储计费',
      sort: 1,
      status: 'active',
      createTime: '2024-08-10 10:01:00',
    },
    {
      id: 20,
      dictType: 'billing_unit',
      dictTypeLabel: '计费单位',
      label: '次',
      value: 'count',
      description: '按次数计费',
      remark: '用于API调用计费',
      sort: 2,
      status: 'active',
      createTime: '2024-08-10 10:02:00',
    },
    // 实例状态
    {
      id: 21,
      dictType: 'instance_status',
      dictTypeLabel: '实例状态',
      label: '运行中',
      value: 'running',
      description: '实例正在运行',
      remark: '',
      sort: 0,
      status: 'active',
      createTime: '2024-07-15 09:00:00',
    },
    {
      id: 22,
      dictType: 'instance_status',
      dictTypeLabel: '实例状态',
      label: '已停止',
      value: 'stopped',
      description: '实例已停止',
      remark: '',
      sort: 1,
      status: 'active',
      createTime: '2024-07-15 09:01:00',
    },
    {
      id: 23,
      dictType: 'instance_status',
      dictTypeLabel: '实例状态',
      label: '启动中',
      value: 'starting',
      description: '实例正在启动',
      remark: '',
      sort: 2,
      status: 'active',
      createTime: '2024-07-15 09:02:00',
    },
    {
      id: 24,
      dictType: 'instance_status',
      dictTypeLabel: '实例状态',
      label: '停止中',
      value: 'stopping',
      description: '实例正在停止',
      remark: '',
      sort: 3,
      status: 'active',
      createTime: '2024-07-15 09:03:00',
    },
    {
      id: 25,
      dictType: 'instance_status',
      dictTypeLabel: '实例状态',
      label: '错误',
      value: 'error',
      description: '实例出现错误',
      remark: '',
      sort: 4,
      status: 'active',
      createTime: '2024-07-15 09:04:00',
    },
  ]);

  // 表单数据
  const [formData, setFormData] = useState({
    dictType: '',
    label: '',
    value: '',
    description: '',
    remark: '',
    sort: 0,
    status: 'active' as 'active' | 'inactive',
  });

  // 切换类型展开/折叠
  const toggleTypeExpanded = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  // 过滤数据
  const filteredItems = dictItems.filter(item => {
    const matchesType = !selectedType || selectedType === 'all' || item.dictType === selectedType;
    const matchesKeyword = !searchKeyword || 
      item.label.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.value.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.description.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesType && matchesKeyword;
  });

  // 按类型分组
  const groupedItems = dictTypes.reduce((acc, type) => {
    acc[type.type] = filteredItems.filter(item => item.dictType === type.type);
    return acc;
  }, {} as Record<string, DictionaryItem[]>);

  // 打开新增对话框
  const handleAdd = (dictType?: string) => {
    setEditingItem(null);
    setFormData({
      dictType: dictType || '',
      label: '',
      value: '',
      description: '',
      remark: '',
      sort: 0,
      status: 'active',
    });
    setShowDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (item: DictionaryItem) => {
    setEditingItem(item);
    setFormData({
      dictType: item.dictType,
      label: item.label,
      value: item.value,
      description: item.description,
      remark: item.remark,
      sort: item.sort,
      status: item.status,
    });
    setShowDialog(true);
  };

  // 保存字典项
  const handleSave = () => {
    if (!formData.dictType || !formData.label || !formData.value) {
      toast.error('请填写必填字段');
      return;
    }

    if (editingItem) {
      toast.success('字典项已更新');
    } else {
      toast.success('字典项已添加');
    }
    setShowDialog(false);
  };

  // 删除字典项
  const handleDelete = (item: DictionaryItem) => {
    if (confirm(`确定要删除字典项"${item.label}"吗？`)) {
      toast.success('字典项已删除');
    }
  };

  // 重置搜索
  const handleReset = () => {
    setSearchKeyword('');
    setSelectedType('');
  };

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">字典管理</h1>
        <p className="text-slate-600">管理系统字典数据和枚举值</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">字典类型</p>
                <p className="text-3xl">{dictTypes.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">字典项总数</p>
                <p className="text-3xl">{dictItems.length}</p>
              </div>
              <Tag className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">启用状态</p>
                <p className="text-3xl">{dictItems.filter(i => i.status === 'active').length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">停用状态</p>
                <p className="text-3xl">{dictItems.filter(i => i.status === 'inactive').length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-600" />
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
                  placeholder="请输入标签名、数据值或描述"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-64 space-y-2">
              <Label>字典类型</Label>
              <Select value={selectedType || 'all'} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {dictTypes.map(type => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>

            <Button onClick={() => handleAdd()}>
              <Plus className="w-4 h-4 mr-2" />
              增加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 字典列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">序号</TableHead>
                  <TableHead className="w-32">类型</TableHead>
                  <TableHead className="w-40">标签名</TableHead>
                  <TableHead className="w-40">数据值</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="w-48">备注信息</TableHead>
                  <TableHead className="w-48">创建时间</TableHead>
                  <TableHead className="w-32 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dictTypes.map((type, typeIndex) => {
                  const items = groupedItems[type.type] || [];
                  if (items.length === 0 && selectedType) return null;
                  
                  const isExpanded = expandedTypes.has(type.type);
                  
                  return (
                    <React.Fragment key={type.type}>
                      {/* 类型分组行 */}
                      <TableRow className="bg-slate-50 hover:bg-slate-100">
                        <TableCell colSpan={8}>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleTypeExpanded(type.type)}
                              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span className="font-medium">{type.label}</span>
                              <Badge variant="outline" className="ml-2">
                                {items.length} 项
                              </Badge>
                              <span className="text-sm text-slate-600 ml-2">{type.description}</span>
                            </button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAdd(type.type)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              添加
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* 字典项数据行 */}
                      {isExpanded && items.map((item, itemIndex) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sort}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.dictTypeLabel}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{item.label}</TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-slate-100 rounded text-sm">
                              {item.value}
                            </code>
                          </TableCell>
                          <TableCell className="text-slate-600">{item.description}</TableCell>
                          <TableCell className="text-slate-600">{item.remark || '-'}</TableCell>
                          <TableCell className="text-slate-600">{item.createTime}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                编辑
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                删除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* 空状态 */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <List className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">暂无字典数据</p>
              <p className="text-sm text-slate-500">请添加字典项或调整筛选条件</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑字典项' : '新增字典项'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改字典项信息' : '添加新的字典项到系统'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>字典类型 *</Label>
                <Select
                  value={formData.dictType}
                  onValueChange={(value) => setFormData({ ...formData, dictType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择字典类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {dictTypes.map(type => (
                      <SelectItem key={type.type} value={type.type}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>状态 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>标签名 *</Label>
                <Input
                  placeholder="显示名称，如：SSD"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>数据值 *</Label>
                <Input
                  placeholder="实际值，如：ssd"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.sort}
                  onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  placeholder="简短描述"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>备注信息</Label>
              <Textarea
                placeholder="详细备注说明（可选）"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                rows={3}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">字典说明</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 字典类型：定义字典的分类，如存储类型、节点类型等</li>
                    <li>• 标签名：用于界面显示的名称</li>
                    <li>• 数据值：程序中使用的实际值，建议使用英文</li>
                    <li>• 排序：数字越小越靠前，相同则按创建时间排序</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? '保存修改' : '确认添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 添加 React 导入以使用 Fragment
import React from 'react';