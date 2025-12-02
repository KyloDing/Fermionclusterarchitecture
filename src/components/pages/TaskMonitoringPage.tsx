import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  ArrowLeft,
  Activity,
  Box,
  Network,
  Globe,
  Key,
  Terminal,
  FileText,
  Cpu,
  HardDrive,
  Zap,
  RefreshCw,
  Plus,
  ExternalLink,
  Copy,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Pod {
  name: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded';
  nodeName: string;
  ip: string;
  cpuUsage: string;
  memoryUsage: string;
  gpuUsage?: string;
  restartCount: number;
  createdAt: string;
}

interface Service {
  name: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  clusterIP: string;
  ports: { port: number; targetPort: number; nodePort?: number; protocol: string }[];
  selector: Record<string, string>;
}

interface Ingress {
  name: string;
  host: string;
  path: string;
  serviceName: string;
  servicePort: number;
  tlsEnabled: boolean;
}

interface Secret {
  name: string;
  type: string;
  dataKeys: string[];
  createdAt: string;
}

export default function TaskMonitoringPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pods, setPods] = useState<Pod[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [ingresses, setIngresses] = useState<Ingress[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [isConsoleDialogOpen, setIsConsoleDialogOpen] = useState(false);
  const [isAddPortDialogOpen, setIsAddPortDialogOpen] = useState(false);
  const [newPort, setNewPort] = useState({ container: '', host: '', protocol: 'TCP' });

  useEffect(() => {
    loadMonitoringData();
    // 每10秒刷新一次数据
    const interval = setInterval(loadMonitoringData, 10000);
    return () => clearInterval(interval);
  }, [taskId]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟Pod数据
      setPods([
        {
          name: 'pytorch-dev-pod-xyz123',
          status: 'Running',
          nodeName: 'node-gpu-01',
          ip: '10.244.1.15',
          cpuUsage: '2.5 / 8 cores',
          memoryUsage: '18.3 / 32 GB',
          gpuUsage: '87% (35.2 / 40 GB)',
          restartCount: 0,
          createdAt: '2024-11-25T08:00:30Z',
        },
      ]);

      // 模拟Service数据
      setServices([
        {
          name: 'pytorch-dev-svc',
          type: 'NodePort',
          clusterIP: '10.96.15.42',
          ports: [
            { port: 8888, targetPort: 8888, nodePort: 30888, protocol: 'TCP' },
            { port: 6006, targetPort: 6006, nodePort: 30606, protocol: 'TCP' },
          ],
          selector: { app: 'pytorch-dev', task: 'task-dev-1' },
        },
      ]);

      // 模拟Ingress数据
      setIngresses([
        {
          name: 'pytorch-dev-ingress',
          host: 'jupyter.fermi-cluster.com',
          path: '/pytorch-dev',
          serviceName: 'pytorch-dev-svc',
          servicePort: 8888,
          tlsEnabled: true,
        },
      ]);

      // 模拟Secret数据
      setSecrets([
        {
          name: 'registry-credentials',
          type: 'kubernetes.io/dockerconfigjson',
          dataKeys: ['.dockerconfigjson'],
          createdAt: '2024-11-25T08:00:00Z',
        },
        {
          name: 'jupyter-token',
          type: 'Opaque',
          dataKeys: ['token'],
          createdAt: '2024-11-25T08:00:10Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      toast.error('加载监控数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIP = (ip: string) => {
    navigator.clipboard.writeText(ip);
    toast.success('IP地址已复制');
  };

  const handleViewLogs = (pod: Pod) => {
    setSelectedPod(pod);
    setIsLogDialogOpen(true);
  };

  const handleOpenConsole = (pod: Pod) => {
    setSelectedPod(pod);
    setIsConsoleDialogOpen(true);
  };

  const handleAddPort = () => {
    if (!newPort.container || !newPort.host) {
      toast.error('请填写完整的端口信息');
      return;
    }
    toast.success(`端口映射已添加: ${newPort.container} -> ${newPort.host}`);
    setIsAddPortDialogOpen(false);
    setNewPort({ container: '', host: '', protocol: 'TCP' });
    loadMonitoringData();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/compute-tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-3xl mb-1">任务运行监控</h1>
          <p className="text-slate-600">任务ID: {taskId}</p>
        </div>
        <Button variant="outline" onClick={loadMonitoringData} className="ml-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 状态概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">容器组</p>
                <p className="text-3xl">{pods.length}</p>
                <p className="text-xs text-green-600 mt-1">
                  {pods.filter(p => p.status === 'Running').length} 运行中
                </p>
              </div>
              <Box className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">服务</p>
                <p className="text-3xl">{services.length}</p>
                <p className="text-xs text-slate-500 mt-1">网络服务</p>
              </div>
              <Network className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ingress</p>
                <p className="text-3xl">{ingresses.length}</p>
                <p className="text-xs text-slate-500 mt-1">外部访问</p>
              </div>
              <Globe className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Secret</p>
                <p className="text-3xl">{secrets.length}</p>
                <p className="text-xs text-slate-500 mt-1">敏感配置</p>
              </div>
              <Key className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs内容 */}
      <Tabs defaultValue="pods" className="w-full">
        <TabsList>
          <TabsTrigger value="pods">
            <Box className="w-4 h-4 mr-2" />
            容器组 ({pods.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            <Network className="w-4 h-4 mr-2" />
            服务 ({services.length})
          </TabsTrigger>
          <TabsTrigger value="ingresses">
            <Globe className="w-4 h-4 mr-2" />
            Ingress ({ingresses.length})
          </TabsTrigger>
          <TabsTrigger value="secrets">
            <Key className="w-4 h-4 mr-2" />
            Secrets ({secrets.length})
          </TabsTrigger>
        </TabsList>

        {/* Pods Tab */}
        <TabsContent value="pods" className="space-y-4 mt-6">
          {pods.map((pod, idx) => (
            <Card key={idx} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{pod.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">节点: {pod.nodeName}</p>
                  </div>
                  <Badge className={pod.status === 'Running' ? 'bg-green-600' : 'bg-orange-600'}>
                    {pod.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 资源使用 */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-slate-600">CPU使用</p>
                    </div>
                    <p className="text-sm">{pod.cpuUsage}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-slate-600">内存使用</p>
                    </div>
                    <p className="text-sm">{pod.memoryUsage}</p>
                  </div>
                  {pod.gpuUsage && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-slate-600">GPU使用</p>
                      </div>
                      <p className="text-sm">{pod.gpuUsage}</p>
                    </div>
                  )}
                </div>

                {/* Pod信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Pod IP</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{pod.ip}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyIP(pod.ip)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">重启次数</p>
                    <p className="text-sm">{pod.restartCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">创建时间</p>
                    <p className="text-sm">{new Date(pod.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleViewLogs(pod)}>
                    <FileText className="w-4 h-4 mr-2" />
                    查看日志
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenConsole(pod)}>
                    <Terminal className="w-4 h-4 mr-2" />
                    Web Console
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsAddPortDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增端口映射
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4 mt-6">
          {services.map((service, idx) => (
            <Card key={idx} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge>{service.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Cluster IP</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{service.clusterIP}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyIP(service.clusterIP)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 端口映射 */}
                <div>
                  <p className="text-xs text-slate-600 mb-2">端口映射</p>
                  <div className="space-y-2">
                    {service.ports.map((port, portIdx) => (
                      <div key={portIdx} className="flex items-center gap-4 p-3 bg-slate-50 rounded">
                        <span className="text-sm">服务端口: <strong>{port.port}</strong></span>
                        <span className="text-slate-400">→</span>
                        <span className="text-sm">目标端口: <strong>{port.targetPort}</strong></span>
                        {port.nodePort && (
                          <>
                            <span className="text-slate-400">→</span>
                            <span className="text-sm">节点端口: <strong>{port.nodePort}</strong></span>
                          </>
                        )}
                        <Badge variant="outline" className="ml-auto">{port.protocol}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selector */}
                <div>
                  <p className="text-xs text-slate-600 mb-2">Selector</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(service.selector).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Ingresses Tab */}
        <TabsContent value="ingresses" className="space-y-4 mt-6">
          {ingresses.map((ingress, idx) => (
            <Card key={idx} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ingress.name}</CardTitle>
                  {ingress.tlsEnabled && (
                    <Badge className="bg-green-600">TLS启用</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">访问地址</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {ingress.tlsEnabled ? 'https://' : 'http://'}
                        {ingress.host}{ingress.path}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(`${ingress.tlsEnabled ? 'https' : 'http'}://${ingress.host}${ingress.path}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">后端服务</p>
                    <p className="text-sm">{ingress.serviceName}:{ingress.servicePort}</p>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900">
                    Ingress已配置，可通过域名访问服务
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Secrets Tab */}
        <TabsContent value="secrets" className="space-y-4 mt-6">
          {secrets.map((secret, idx) => (
            <Card key={idx} className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">{secret.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">类型</p>
                    <Badge variant="outline">{secret.type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">创建时间</p>
                    <p className="text-sm">{new Date(secret.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-600 mb-2">数据键</p>
                  <div className="flex gap-2 flex-wrap">
                    {secret.dataKeys.map((key) => (
                      <Badge key={key} variant="outline" className="font-mono">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-xs text-orange-900">
                    Secret包含敏感信息，请妥善保管
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* 日志查看对话框 */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-[1000px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">容器日志</DialogTitle>
            <DialogDescription>{selectedPod?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>实时日志</Badge>
              <Button variant="outline" size="sm" onClick={loadMonitoringData}>
                <RefreshCw className="w-3 h-3 mr-2" />
                刷新
              </Button>
            </div>

            <ScrollArea className="h-[500px] w-full">
              <div className="p-4 bg-slate-900 rounded font-mono text-xs text-green-400 space-y-1">
                <div>[2024-11-25 08:00:50] Container started</div>
                <div>[2024-11-25 08:01:00] Initializing Jupyter Lab...</div>
                <div>[2024-11-25 08:01:05] Loading extensions...</div>
                <div>[2024-11-25 08:01:10] Jupyter Lab is running at: http://0.0.0.0:8888/</div>
                <div className="text-yellow-400">[2024-11-25 08:05:15] GPU 0: NVIDIA A100, Memory: 15.2GB / 40GB, Utilization: 87%</div>
                <div>[2024-11-25 08:10:20] Request received: GET /api/contents</div>
                <div>[2024-11-25 08:10:21] Response: 200 OK</div>
                <div>[2024-11-25 08:15:30] Autosave enabled</div>
                <div className="text-cyan-400">[2024-11-25 08:20:00] Health check: OK</div>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Web Console对话框 */}
      <Dialog open={isConsoleDialogOpen} onOpenChange={setIsConsoleDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Web Console</DialogTitle>
            <DialogDescription>{selectedPod?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Terminal className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                通过Web终端直接访问容器内部，执行命令和调试应用
              </AlertDescription>
            </Alert>

            <div className="h-[600px] bg-slate-900 rounded p-4 font-mono text-sm text-green-400">
              <div className="space-y-2">
                <div>root@{selectedPod?.name}:~# ls -la</div>
                <div className="text-slate-400">total 48</div>
                <div className="text-slate-400">drwxr-xr-x  1 root root 4096 Nov 25 08:00 .</div>
                <div className="text-slate-400">drwxr-xr-x  1 root root 4096 Nov 25 08:00 ..</div>
                <div className="text-slate-400">drwxr-xr-x  3 root root 4096 Nov 25 08:00 workspace</div>
                <div>root@{selectedPod?.name}:~# _</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsoleDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增端口映射对话框 */}
      <Dialog open={isAddPortDialogOpen} onOpenChange={setIsAddPortDialogOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">新增端口映射</DialogTitle>
            <DialogDescription>为运行中的容器添加新的端口映射</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="container-port">容器端口 *</Label>
              <Input
                id="container-port"
                type="number"
                placeholder="例如: 8080"
                value={newPort.container}
                onChange={(e) => setNewPort({ ...newPort, container: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host-port">主机端口 *</Label>
              <Input
                id="host-port"
                type="number"
                placeholder="例如: 30080"
                value={newPort.host}
                onChange={(e) => setNewPort({ ...newPort, host: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">协议</Label>
              <select
                id="protocol"
                className="w-full p-2 border rounded"
                value={newPort.protocol}
                onChange={(e) => setNewPort({ ...newPort, protocol: e.target.value })}
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPortDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddPort}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              添加端口
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
