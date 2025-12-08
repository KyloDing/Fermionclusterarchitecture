import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from './ui/sidebar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  LayoutDashboard,
  Server,
  Cpu,
  PlayCircle,
  Rocket,
  Database,
  Box,
  Calendar,
  Users,
  Activity,
  DollarSign,
  FileText,
  Settings,
  Layers,
  Container,
  Terminal,
  Zap,
  Package,
  HardDrive,
  FolderOpen,
  Share2,
  LogOut,
  User,
  ChevronUp,
  GitBranch,
  TrendingUp,
  List,
  Play,
  Ticket,
  Menu,
  Shield,
  Lock,
  BookOpen,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/permissions';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const { logout, user } = useAuth();
  const { hasAnyPermission, isAdmin } = usePermissions();

  // 根据权限过滤菜单
  const filterMenuByPermissions = (items: any[]) => {
    return items.filter(item => {
      if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
        return true; // 没有权限要求，所有人可见
      }
      
      return hasAnyPermission(item.requiredPermissions);
    });
  };

  const menuItems = [
    {
      group: '总览',
      items: [
        { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, requiredPermissions: [Permission.VIEW_DASHBOARD] },
      ],
    },
    {
      group: '算力资源',
      items: [
        { id: 'clusters', label: '集群管理', icon: Layers, requiredPermissions: [Permission.VIEW_CLUSTERS] },
        { id: 'compute-nodes', label: '计算节点', icon: Server, requiredPermissions: [Permission.VIEW_COMPUTE_NODES] },
        { id: 'gpu-pools', label: 'GPU资源池', icon: Cpu, requiredPermissions: [Permission.VIEW_GPU_POOLS] },
      ],
    },
    {
      group: 'AI工作负载',
      items: [
        { id: 'instances', label: '开发环境', icon: Terminal, description: '交互式容器实例', requiredPermissions: [Permission.VIEW_INSTANCES] },
        { id: 'training-jobs', label: '训练任务', icon: Zap, description: '批处理训练作业', requiredPermissions: [Permission.VIEW_TRAINING_JOBS] },
        { id: 'inference-services', label: '推理服务', icon: Rocket, description: '在线API服务', requiredPermissions: [Permission.VIEW_INFERENCE_SERVICES] },
        { id: 'model-evaluation', label: '模型评测', icon: TrendingUp, description: '模型能力评估', requiredPermissions: [Permission.VIEW_EVALUATIONS] },
        { id: 'pipeline-orchestration', label: 'Pipeline编排', icon: GitBranch, description: '端到端流程', requiredPermissions: [Permission.VIEW_PIPELINES] },
      ],
    },
    {
      group: '数据资产',
      items: [
        { id: 'images', label: '镜像管理', icon: Package, requiredPermissions: [Permission.VIEW_IMAGES] },
        { id: 'datasets', label: '数据集', icon: Database, requiredPermissions: [Permission.VIEW_DATASETS] },
        { id: 'models', label: '模型仓库', icon: Box, requiredPermissions: [Permission.VIEW_MODELS] },
      ],
    },
    {
      group: '存储管理',
      items: [
        { id: 'storage-pools', label: '存储池', icon: HardDrive, requiredPermissions: [Permission.VIEW_STORAGE_POOLS] },
        { id: 'storage-volumes', label: '存储卷', icon: FolderOpen, requiredPermissions: [Permission.VIEW_STORAGE_VOLUMES] },
        { id: 'smb-shares', label: 'SMB共享', icon: Share2, description: '私有云部署', requiredPermissions: [Permission.VIEW_SMB_SHARES] },
        { id: 'webdav-shares', label: 'WebDAV共享', icon: Globe, description: '公有云部署', requiredPermissions: [] },
        { id: 'storage-backends', label: '存储后端', icon: Server, requiredPermissions: [Permission.VIEW_STORAGE_BACKENDS] },
      ],
    },
    {
      group: '资源调度',
      items: [
        { id: 'task-queues', label: '任务队列', icon: List, description: '队列管理与策略', requiredPermissions: [Permission.VIEW_TASK_QUEUES] },
        { id: 'compute-tasks', label: '计算任务', icon: Play, description: '任务监控与操作', requiredPermissions: [Permission.VIEW_OWN_TASKS, Permission.VIEW_ALL_TASKS] },
      ],
    },
    {
      group: '系统管理',
      items: [
        { id: 'scheduling', label: '调度中心', icon: Calendar, requiredPermissions: [Permission.VIEW_SCHEDULING] },
        { id: 'users', label: '用户与权限', icon: Users, requiredPermissions: [Permission.VIEW_USERS] },
        { id: 'monitoring', label: '监控告警', icon: Activity, requiredPermissions: [Permission.VIEW_MONITORING] },
        { id: 'billing', label: '计费管理', icon: DollarSign, requiredPermissions: [Permission.VIEW_OWN_BILLING, Permission.VIEW_ALL_BILLING] },
        { id: 'compute-usage-monitoring', label: '算力使用监控', icon: BarChart3, description: '使用报表与统计', requiredPermissions: [Permission.VIEW_ALL_BILLING] },
        { id: 'government-vouchers', label: '政府算力券', icon: Ticket, requiredPermissions: [Permission.VIEW_OWN_VOUCHERS, Permission.VIEW_ALL_VOUCHERS] },
        { id: 'dictionary-management', label: '字典管理', icon: BookOpen, requiredPermissions: [] },
        { id: 'audit-logs', label: '审计日志', icon: FileText, requiredPermissions: [Permission.VIEW_AUDIT_LOGS] },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-slate-900">费米集群</h2>
            <p className="text-xs text-slate-600">Fermion Cluster</p>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group, index) => {
          // 过滤该组的菜单项
          const filteredItems = filterMenuByPermissions(group.items);
          
          // 如果该组没有任何可见项，则不显示该组
          if (filteredItems.length === 0) {
            return null;
          }
          
          return (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onNavigate(item.id)}
                          isActive={currentPage === item.id}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-auto py-2">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm">{user?.name || '用户'}</p>
                  <p className="text-xs text-slate-600">{user?.email || ''}</p>
                </div>
                <ChevronUp className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-600 font-normal">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="w-4 h-4 mr-2" />
                个人资料
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                账号设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}