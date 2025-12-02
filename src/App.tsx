import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from './components/ui/sidebar';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
// 费米集群系统 - 主应用入口
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import AppSidebar from './components/AppSidebar';
import LoginPage from './components/pages/LoginPage';
import AuthCallbackPage from './components/pages/AuthCallbackPage';
import DashboardPage from './components/pages/DashboardPage';
import ClustersPage from './components/pages/ClustersPage';
import ComputeNodesPage from './components/pages/ComputeNodesPage';
import GpuPoolsPage from './components/pages/GpuPoolsPage';
import { InstancesPage } from './components/pages/InstancesPage';
import TrainingJobsPage from './components/pages/TrainingJobsPage';
import InferenceServicesPage from './components/pages/InferenceServicesPage';
import ImagesPage from './components/pages/ImagesPageNew';
import DatasetsPage from './components/pages/DatasetsPage';
import ModelsPage from './components/pages/ModelsPage';
import SchedulingPage from './components/pages/SchedulingPage';
import UsersPage from './components/pages/UsersPage';
import UsersManagementPage from './components/pages/UsersManagementPage';
import RolesManagementPage from './components/pages/RolesManagementPage';
import UserGroupsPage from './components/pages/UserGroupsPage';
import AccessControlPage from './components/pages/AccessControlPage';
import MenuManagementPage from './components/pages/MenuManagementPage';
import MonitoringPage from './components/pages/MonitoringPage';
import BillingPage from './components/pages/BillingPage';
import BillingDetailsPage from './components/pages/BillingDetailsPage';
import AccountBalancePage from './components/pages/AccountBalancePage';
import InvoiceManagementPage from './components/pages/InvoiceManagementPage';
import OrdersPage from './components/pages/OrdersPage';
import BillingConfigPage from './components/pages/BillingConfigPage';
import PricingManagementPage from './components/pages/PricingManagementPage';
import DiscountManagementPage from './components/pages/DiscountManagementPage';
import BillingRulesPage from './components/pages/BillingRulesPage';
import GovernmentVouchersPage from './components/pages/GovernmentVouchersPage';
import AuditLogsPage from './components/pages/AuditLogsPage';
import StoragePoolsPage from './components/pages/StoragePoolsPage';
import StorageVolumesPage from './components/pages/StorageVolumesPage';
import FileBrowserPage from './components/pages/FileBrowserPage';
import SMBSharesPage from './components/pages/SMBSharesPage';
import StorageBackendsPage from './components/pages/StorageBackendsPage';
import DatasetListPage from './pages/DatasetListPage';
import DatasetDetailPage from './pages/DatasetDetailPage';
import TrainingTaskCreatePage from './pages/TrainingTaskCreatePage';
import ModelEvaluationPage from './components/pages/ModelEvaluationPage';
import PipelineOrchestrationPage from './components/pages/PipelineOrchestrationPage';
import PipelineEditorPage from './components/pages/PipelineEditorPage';
import TaskQueuesPage from './components/pages/TaskQueuesPage';
import ComputeTasksPage from './components/pages/ComputeTasksPage';
import TaskMonitoringPage from './components/pages/TaskMonitoringPage';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </AuthProvider>
    </HashRouter>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const location = useLocation();

  // 检查是否在OAuth回调页面 - 必须在认证检查之前处理
  const isCallbackPage = location.pathname === '/auth/callback';

  const handleLoginSuccess = async (accessToken: string, user?: any) => {
    await login(accessToken, user);
    // 清除URL中的callback参数
    window.history.replaceState({}, '', '/');
  };

  const handleCallbackError = () => {
    // 清除URL参数并返回登录页
    window.history.replaceState({}, '', '/');
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* 加载内容 */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl animate-pulse opacity-20" />
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin relative z-10" />
            </div>
            <h2 className="text-xl text-slate-900 mb-2">费米集群</h2>
            <p className="text-slate-600">正在加载...</p>
          </div>
        </div>
      </div>
    );
  }

  // OAuth回调页面 - 无论是否已认证都要处理
  if (isCallbackPage) {
    return <AuthCallbackPage onSuccess={handleLoginSuccess} onError={handleCallbackError} />;
  }

  // 未登录显示登录页
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <MainLayout />
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  );
}

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 根据当前路径确定当前页面
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/datasets')) return 'datasets';
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/clusters') return 'clusters';
    if (path === '/compute-nodes') return 'compute-nodes';
    if (path === '/gpu-pools') return 'gpu-pools';
    if (path === '/instances') return 'instances';
    if (path === '/training-jobs') return 'training-jobs';
    if (path === '/inference-services') return 'inference-services';
    if (path === '/images') return 'images';
    if (path === '/models') return 'models';
    if (path === '/model-evaluation') return 'model-evaluation';
    if (path === '/pipeline-orchestration') return 'pipeline-orchestration';
    if (path === '/scheduling') return 'scheduling';
    if (path === '/users' || path === '/access-control') return 'users';
    if (path === '/monitoring') return 'monitoring';
    if (path === '/billing') return 'billing';
    if (path === '/billing-details') return 'billing-details';
    if (path === '/account-balance') return 'account-balance';
    if (path === '/invoice-management') return 'invoice-management';
    if (path === '/orders') return 'orders';
    if (path === '/government-vouchers') return 'government-vouchers';
    if (path === '/audit-logs') return 'audit-logs';
    if (path === '/menu-management') return 'menu-management';
    if (path === '/storage-pools') return 'storage-pools';
    if (path === '/storage-volumes') return 'storage-volumes';
    if (path === '/storage-backends') return 'storage-backends';
    if (path === '/smb-shares') return 'smb-shares';
    if (path === '/task-queues') return 'task-queues';
    if (path === '/compute-tasks') return 'compute-tasks';
    if (path.startsWith('/task-monitoring')) return 'compute-tasks';
    if (path.startsWith('/file-browser')) return 'file-browser';
    return 'dashboard';
  };

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      'dashboard': '/',
      'clusters': '/clusters',
      'compute-nodes': '/compute-nodes',
      'gpu-pools': '/gpu-pools',
      'instances': '/instances',
      'training-jobs': '/training-jobs',
      'inference-services': '/inference-services',
      'images': '/images',
      'datasets': '/datasets',
      'models': '/models',
      'model-evaluation': '/model-evaluation',
      'pipeline-orchestration': '/pipeline-orchestration',
      'scheduling': '/scheduling',
      'users': '/access-control',
      'monitoring': '/monitoring',
      'billing': '/billing',
      'billing-details': '/billing-details',
      'account-balance': '/account-balance',
      'invoice-management': '/invoice-management',
      'orders': '/orders',
      'government-vouchers': '/government-vouchers',
      'audit-logs': '/audit-logs',
      'menu-management': '/menu-management',
      'storage-pools': '/storage-pools',
      'storage-volumes': '/storage-volumes',
      'storage-backends': '/storage-backends',
      'smb-shares': '/smb-shares',
      'task-queues': '/task-queues',
      'compute-tasks': '/compute-tasks',
    };
    
    const route = routes[page] || '/';
    navigate(route);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <AppSidebar currentPage={getCurrentPage()} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/clusters" element={<ClustersPage />} />
          <Route path="/compute-nodes" element={<ComputeNodesPage />} />
          <Route path="/gpu-pools" element={<GpuPoolsPage />} />
          <Route path="/instances" element={<InstancesPage />} />
          <Route path="/training-jobs" element={<TrainingJobsPage />} />
          <Route path="/inference-services" element={<InferenceServicesPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/datasets" element={<DatasetListPage />} />
          <Route path="/datasets/:id" element={<DatasetDetailPage />} />
          <Route path="/training/create" element={<TrainingTaskCreatePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/model-evaluation" element={<ModelEvaluationPage />} />
          <Route path="/pipeline-orchestration" element={<PipelineOrchestrationPage />} />
          <Route path="/pipeline-editor" element={<PipelineEditorPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users-management" element={<UsersManagementPage />} />
          <Route path="/roles-management" element={<RolesManagementPage />} />
          <Route path="/user-groups" element={<UserGroupsPage />} />
          <Route path="/access-control" element={<AccessControlPage />} />
          <Route path="/menu-management" element={<MenuManagementPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/billing" element={
            <BillingPage
              onNavigateToDetails={() => navigate('/billing-details')}
              onNavigateToAccount={() => navigate('/account-balance')}
              onNavigateToInvoices={() => navigate('/invoice-management')}
              onNavigateToOrders={() => navigate('/orders')}
              onNavigateToBillingConfig={() => navigate('/billing-config')}
              onNavigateToVouchers={() => navigate('/government-vouchers')}
            />
          } />
          <Route path="/billing-details" element={<BillingDetailsPage />} />
          <Route path="/account-balance" element={<AccountBalancePage />} />
          <Route path="/invoice-management" element={<InvoiceManagementPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/billing-config" element={<BillingConfigPage />} />
          <Route path="/pricing-management" element={<PricingManagementPage />} />
          <Route path="/discount-management" element={<DiscountManagementPage />} />
          <Route path="/billing-rules" element={<BillingRulesPage />} />
          <Route path="/government-vouchers" element={<GovernmentVouchersPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/storage-pools" element={<StoragePoolsPage />} />
          <Route path="/storage-volumes" element={
            <StorageVolumesPage onNavigateToFiles={(volumeId) => navigate(`/file-browser/${volumeId}`)} />
          } />
          <Route path="/storage-backends" element={<StorageBackendsPage />} />
          <Route path="/file-browser/:volumeId" element={<FileBrowserPage volumeId={location.pathname.split('/').pop() || null} />} />
          <Route path="/smb-shares" element={<SMBSharesPage />} />
          <Route path="/task-queues" element={<TaskQueuesPage />} />
          <Route path="/compute-tasks" element={<ComputeTasksPage />} />
          <Route path="/task-monitoring/:taskId" element={<TaskMonitoringPage />} />
        </Routes>
      </main>
    </div>
  );
}
