import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Rocket, Plus, Activity, Info, BarChart3, Zap, Clock, Globe } from 'lucide-react';
import { DeployInferenceDialog } from '../dialogs/DeployInferenceDialog';
import { MultiZoneSchedulingDialog } from '../dialogs/MultiZoneSchedulingDialog';

export default function InferenceServicesPage() {
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [multiZoneDialogOpen, setMultiZoneDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const services = [
    {
      id: 'inf-001',
      name: 'GPT对话服务',
      model: 'GPT-3.5-Turbo',
      modelId: 'model-001',
      status: 'running',
      replicas: 3,
      requests: 15234,
      avgLatency: 120,
      gpu: 4,
    },
    {
      id: 'inf-002',
      name: 'BERT文本分类',
      model: 'BERT-Base-Chinese',
      modelId: 'model-002',
      status: 'running',
      replicas: 2,
      requests: 8456,
      avgLatency: 45,
      gpu: 2,
    },
  ];

  const stats = {
    total: services.length,
    running: services.filter(s => s.status === 'running').length,
    totalRequests: services.reduce((sum, s) => sum + s.requests, 0),
    totalReplicas: services.reduce((sum, s) => sum + s.replicas, 0),
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">推理服务</h1>
          <p className="text-slate-600">在线API服务，用于生产环境的模型推理部署</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMultiZoneDialogOpen(true)}>
            <Globe className="w-4 h-4 mr-2" />
            跨可用区部署
          </Button>
          <Button onClick={() => setDeployDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            部署推理服务
          </Button>
        </div>
      </div>

      {/* 使用说明 */}
      <Alert className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
        <Info className="w-5 h-5 text-orange-600" />
        <AlertDescription className="text-sm">
          <strong className="text-orange-900">🚀 推理服务说明：</strong>
          <div className="mt-2 text-slate-700 space-y-1">
            <p>• <strong>适用场景</strong>：生产API服务、应用集成、实时推理、高并发服务</p>
            <p>• <strong>特点</strong>：服务化部署、高可用、自动扩缩容、负载均衡、版本管理、灰度发布</p>
            <p>• <strong>费用</strong>：按服务运行时间和副本数计费</p>
            <p className="text-orange-700 mt-2">
              💻 <strong>提示</strong>：如需开发调试请使用"开发环境"，如需训练模型请使用"训练任务"
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* 跨可用区调度对话框 */}
      <MultiZoneSchedulingDialog
        open={multiZoneDialogOpen}
        onOpenChange={setMultiZoneDialogOpen}
        mode="inference"
        onConfirm={(config) => {
          console.log('创建跨可用区推理服务:', config);
        }}
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">运行服务</p>
                <p className="text-2xl text-slate-900">{stats.running}</p>
              </div>
              <Rocket className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">副本总数</p>
                <p className="text-2xl text-purple-600">{stats.totalReplicas}</p>
              </div>
              <Zap className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总请求数</p>
                <p className="text-2xl text-green-600">{stats.totalRequests.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">平均延迟</p>
                <p className="text-2xl text-orange-600">
                  {Math.round(services.reduce((sum, s) => sum + s.avgLatency, 0) / services.length)}ms
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{service.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-slate-600">模型:</span>
                    <button className="text-purple-600 hover:underline">
                      {service.model}
                    </button>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200">运行中</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">副本数</p>
                  <p className="text-xl text-slate-900">{service.replicas}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">请求数</p>
                  <p className="text-xl text-slate-900">{service.requests.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">平均延迟</p>
                  <p className="text-xl text-slate-900">{service.avgLatency}ms</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  查看监控
                </Button>
                <Button size="sm" className="flex-1">
                  扩缩容
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 部署推理服务对话框 */}
      <DeployInferenceDialog
        open={deployDialogOpen}
        onOpenChange={setDeployDialogOpen}
        model={selectedModel}
      />
    </div>
  );
}