import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Server,
  Cpu,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Activity,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
} from 'lucide-react';

export default function DashboardPage() {
  const clusterStats = [
    { name: '北京可用区A', status: 'healthy', nodes: 24, gpus: 192, utilization: 75.5 },
    { name: '上海可用区A', status: 'healthy', nodes: 16, gpus: 128, utilization: 64.1 },
    { name: '深圳可用区A', status: 'warning', nodes: 12, gpus: 96, utilization: 91.7 },
    { name: '成都可用区A', status: 'healthy', nodes: 8, gpus: 64, utilization: 43.8 },
  ];

  const stats = [
    {
      title: '计算节点',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: Server,
      color: 'text-blue-600 bg-blue-50',
      details: '在线: 22 | 离线: 2',
    },
    {
      title: 'GPU总数',
      value: '96',
      change: '使用率 68%',
      trend: 'stable',
      icon: Cpu,
      color: 'text-purple-600 bg-purple-50',
      details: '空闲: 31 | 使用中: 65',
    },
    {
      title: '运行任务',
      value: '42',
      change: '+8',
      trend: 'up',
      icon: PlayCircle,
      color: 'text-green-600 bg-green-50',
      details: '训练: 28 | 推理: 14',
    },
    {
      title: '存储使用',
      value: '128TB',
      change: '75%',
      trend: 'stable',
      icon: HardDrive,
      color: 'text-orange-600 bg-orange-50',
      details: '总容量: 170TB',
    },
  ];

  const recentJobs = [
    {
      id: 'job-001',
      name: 'BERT模型训练',
      type: 'training',
      status: 'running',
      gpu: 8,
      progress: 65,
      user: '张三',
      startTime: '2小时前',
    },
    {
      id: 'job-002',
      name: 'GPT推理服务',
      type: 'inference',
      status: 'running',
      gpu: 4,
      progress: 100,
      user: '李四',
      startTime: '1天前',
    },
    {
      id: 'job-003',
      name: 'ResNet图像分类',
      type: 'training',
      status: 'completed',
      gpu: 2,
      progress: 100,
      user: '王五',
      startTime: '3小时前',
    },
    {
      id: 'job-004',
      name: 'YOLO目标检测',
      type: 'training',
      status: 'pending',
      gpu: 4,
      progress: 0,
      user: '赵六',
      startTime: '刚刚',
    },
  ];

  const nodeStats = [
    { name: 'GPU-Node-01', cpu: 85, gpu: 90, memory: 78, status: 'healthy' },
    { name: 'GPU-Node-02', cpu: 45, gpu: 60, memory: 55, status: 'healthy' },
    { name: 'GPU-Node-03', cpu: 92, gpu: 95, memory: 88, status: 'warning' },
    { name: 'GPU-Node-04', cpu: 30, gpu: 25, memory: 40, status: 'healthy' },
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      running: { label: '运行中', className: 'bg-green-50 text-green-700 border-green-200' },
      completed: { label: '已完成', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      pending: { label: '等待中', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      failed: { label: '失败', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getNodeStatusIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'warning') return <AlertCircle className="w-4 h-4 text-orange-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">仪表盘</h1>
        <p className="text-slate-600">费米集群运行概览与关键指标</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.trend !== 'stable' && (
                    <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendIcon className="w-4 h-4" />
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.details}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cluster Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>集群概览</CardTitle>
          <CardDescription>各可用区集群的运行状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {clusterStats.map((cluster, index) => (
              <div key={index} className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h5 className="text-sm">{cluster.name}</h5>
                  {cluster.status === 'healthy' ? (
                    <CheckCircle2 className="w-3 h-3 text-green-600 ml-auto" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-orange-600 ml-auto" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <p className="text-slate-600">节点</p>
                    <p className="font-medium">{cluster.nodes}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">GPU</p>
                    <p className="font-medium">{cluster.gpus}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">利用率</span>
                    <span className={cluster.utilization > 80 ? 'text-orange-600' : 'text-slate-900'}>
                      {cluster.utilization.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={cluster.utilization} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近任务</CardTitle>
            <CardDescription>当前运行和最近完成的任务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg border bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm">{job.name}</h4>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>任务ID: {job.id}</span>
                        <span>用户: {job.user}</span>
                        <span>GPU: {job.gpu}卡</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.startTime}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {job.type === 'training' ? '训练' : '推理'}
                    </Badge>
                  </div>
                  {job.status === 'running' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">进度</span>
                        <span className="text-slate-900">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Node Health */}
        <Card>
          <CardHeader>
            <CardTitle>节点健康状态</CardTitle>
            <CardDescription>实时资源使用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodeStats.map((node, index) => (
                <div key={index} className="p-3 rounded-lg border bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm">{node.name}</h5>
                    {getNodeStatusIcon(node.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">CPU</span>
                        <span className={node.cpu > 80 ? 'text-orange-600' : 'text-slate-900'}>{node.cpu}%</span>
                      </div>
                      <Progress value={node.cpu} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">GPU</span>
                        <span className={node.gpu > 80 ? 'text-orange-600' : 'text-slate-900'}>{node.gpu}%</span>
                      </div>
                      <Progress value={node.gpu} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">内存</span>
                        <span className={node.memory > 80 ? 'text-orange-600' : 'text-slate-900'}>{node.memory}%</span>
                      </div>
                      <Progress value={node.memory} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Trends */}
      <Card>
        <CardHeader>
          <CardTitle>资源使用趋势</CardTitle>
          <CardDescription>过去24小时的资源使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gpu" className="w-full">
            <TabsList>
              <TabsTrigger value="gpu">GPU使用率</TabsTrigger>
              <TabsTrigger value="cpu">CPU使用率</TabsTrigger>
              <TabsTrigger value="memory">内存使用</TabsTrigger>
              <TabsTrigger value="storage">存储使用</TabsTrigger>
            </TabsList>
            <TabsContent value="gpu" className="mt-6">
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <div className="text-center text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">GPU使用率趋势图</p>
                  <p className="text-xs">（集成Grafana或Recharts图表）</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="cpu" className="mt-6">
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <div className="text-center text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">CPU使用率趋势图</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="memory" className="mt-6">
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <div className="text-center text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">内存使用趋势图</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="storage" className="mt-6">
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <div className="text-center text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">存储使用趋势图</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
