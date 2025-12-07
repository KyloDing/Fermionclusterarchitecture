import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Globe,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Activity,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MultiZoneTopologyView } from '../MultiZoneTopologyView';

export default function MultiZoneTaskDetailPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // 模拟跨可用区任务数据
  const task = {
    id: 'task-mz-001',
    name: 'GPT大模型分布式训练',
    status: 'running',
    progress: 42,
    framework: 'PyTorch',
    distributionStrategy: '混合并行（DDP + Pipeline）',
    startTime: '2024-12-05 10:30:00',
    estimatedEndTime: '2024-12-05 18:30:00',
    currentEpoch: '8/20',
    throughput: '1,245 samples/s',
    zones: [
      {
        zoneId: 'zone-a',
        zoneName: 'A可用区（北京-1）',
        nodeCount: 2,
        gpuPerNode: 8,
        totalGPUs: 16,
        cpuPerNode: 64,
        memoryPerNode: 256,
        region: '北京',
        latency: 1.2,
        status: 'healthy' as const,
      },
      {
        zoneId: 'zone-b',
        zoneName: 'B可用区（北京-2）',
        nodeCount: 3,
        gpuPerNode: 8,
        totalGPUs: 24,
        cpuPerNode: 64,
        memoryPerNode: 256,
        region: '北京',
        latency: 1.5,
        status: 'healthy' as const,
      },
    ],
  };

  const metrics = {
    gpuUtilization: 92,
    memoryUsage: 78,
    networkBandwidth: 85,
    diskIO: 45,
  };

  const logs = [
    { time: '10:35:12', level: 'INFO', zone: 'A可用区', message: '节点1初始化完成，GPU检测正常' },
    { time: '10:35:15', level: 'INFO', zone: 'A可用区', message: '节点2初始化完成，GPU检测正常' },
    { time: '10:35:18', level: 'INFO', zone: 'B可用区', message: '节点1初始化完成，GPU检测正常' },
    { time: '10:35:21', level: 'INFO', zone: 'B可用区', message: '节点2初始化完成，GPU检测正常' },
    { time: '10:35:24', level: 'INFO', zone: 'B可用区', message: '节点3初始化完成，GPU检测正常' },
    { time: '10:35:30', level: 'INFO', zone: '协调器', message: '跨可用区通信测试通过，延迟1.3ms' },
    { time: '10:35:35', level: 'INFO', zone: '协调器', message: '开始分布式训练，总计40个GPU' },
    { time: '10:36:00', level: 'INFO', zone: 'A可用区', message: 'Epoch 1/20 开始' },
    { time: '10:42:15', level: 'SUCCESS', zone: 'A可用区', message: 'Epoch 1/20 完成，loss=2.341' },
    { time: '10:42:18', level: 'SUCCESS', zone: 'B可用区', message: 'Epoch 1/20 完成，loss=2.339' },
    { time: '11:15:42', level: 'WARNING', zone: 'B可用区', message: '节点2 GPU温度较高(82°C)，已启动风扇加速' },
    { time: '11:16:05', level: 'INFO', zone: 'B可用区', message: '节点2 GPU温度恢复正常(75°C)' },
  ];

  const totalGPUs = task.zones.reduce((sum, z) => sum + z.totalGPUs, 0);
  const totalNodes = task.zones.reduce((sum, z) => sum + z.nodeCount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回任务列表
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl text-slate-900">{task.name}</h1>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <Activity className="w-3 h-3 mr-1" />
                运行中
              </Badge>
              <Badge variant="outline" className="border-purple-300 text-purple-600">
                <Globe className="w-3 h-3 mr-1" />
                跨可用区
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              任务ID: {task.id} · 开始时间: {task.startTime}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Pause className="w-4 h-4 mr-2" />
            暂停
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
            <Square className="w-4 h-4 mr-2" />
            终止
          </Button>
        </div>
      </div>

      {/* 进度概览 */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">训练进度</span>
                <span className="text-sm">
                  {task.currentEpoch} · {task.progress}%
                </span>
              </div>
              <Progress value={task.progress} className="h-3" />
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>预计完成时间: {task.estimatedEndTime}</span>
                <span className="text-green-600">{task.throughput}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">可用区</p>
                <p className="text-xl text-purple-600">{task.zones.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">节点</p>
                <p className="text-xl text-blue-600">{totalNodes}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">GPU</p>
                <p className="text-xl text-green-600">{totalGPUs}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">框架</p>
                <p className="text-xs text-slate-900 mt-1">{task.framework}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="topology">拓扑</TabsTrigger>
          <TabsTrigger value="metrics">监控指标</TabsTrigger>
          <TabsTrigger value="logs">日志</TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 实时监控 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">GPU利用率</span>
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl text-slate-900">{metrics.gpuUtilization}%</p>
                  <Progress value={metrics.gpuUtilization} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">内存使用</span>
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl text-slate-900">{metrics.memoryUsage}%</p>
                  <Progress value={metrics.memoryUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">网络带宽</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl text-slate-900">{metrics.networkBandwidth}%</p>
                  <Progress value={metrics.networkBandwidth} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">磁盘IO</span>
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl text-slate-900">{metrics.diskIO}%</p>
                  <Progress value={metrics.diskIO} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 任务配置 */}
          <Card>
            <CardHeader>
              <CardTitle>任务配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">训练框架</p>
                  <p className="text-slate-900">{task.framework}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">分布式策略</p>
                  <p className="text-slate-900">{task.distributionStrategy}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">总GPU数</p>
                  <p className="text-slate-900">{totalGPUs} 张</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">总节点数</p>
                  <p className="text-slate-900">{totalNodes} 台</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 mb-2">可用区分布</p>
                  <div className="flex gap-2">
                    {task.zones.map(zone => (
                      <Badge key={zone.zoneId} variant="outline">
                        {zone.zoneName.split('（')[0]}: {zone.nodeCount}节点 × {zone.gpuPerNode}GPU
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 性能建议 */}
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-slate-700">
              <strong className="text-blue-900">性能优化建议：</strong>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>跨可用区延迟低于2ms，通信效率良好</li>
                <li>GPU利用率达到92%，资源使用充分</li>
                <li>建议开启梯度压缩以进一步降低跨区通信开销</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* 拓扑标签页 */}
        <TabsContent value="topology" className="mt-6">
          <MultiZoneTopologyView
            zones={task.zones}
            taskName={task.name}
            taskStatus={task.status as any}
          />
        </TabsContent>

        {/* 监控指标标签页 */}
        <TabsContent value="metrics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>各可用区资源使用情况</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.zones.map((zone, index) => (
                  <div key={zone.zoneId}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-sm text-slate-900">{zone.zoneName}</span>
                      </div>
                      <Badge variant="outline">{zone.totalGPUs} GPU</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3 pl-8">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">GPU利用率</p>
                        <Progress value={90 + Math.random() * 10} className="h-2" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">内存使用</p>
                        <Progress value={75 + Math.random() * 10} className="h-2" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">网络吞吐</p>
                        <Progress value={80 + Math.random() * 10} className="h-2" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">温度</p>
                        <Progress value={60 + Math.random() * 20} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 日志标签页 */}
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>任务日志</CardTitle>
                <Button variant="outline" size="sm">刷新</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-2 rounded ${
                      log.level === 'SUCCESS'
                        ? 'bg-green-50'
                        : log.level === 'WARNING'
                        ? 'bg-yellow-50'
                        : log.level === 'ERROR'
                        ? 'bg-red-50'
                        : 'bg-slate-50'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0">{log.time}</span>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        log.level === 'SUCCESS'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : log.level === 'WARNING'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : log.level === 'ERROR'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                      }`}
                    >
                      {log.level}
                    </Badge>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {log.zone}
                    </Badge>
                    <span className="text-slate-700">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
