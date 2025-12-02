import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Network, Database, Server, GitBranch, Layers } from 'lucide-react';

export default function DeploymentTopology() {
  const infrastructureComponents = [
    {
      category: 'Kubernetes 集群',
      icon: Server,
      color: 'text-blue-600 bg-blue-50',
      components: [
        { name: 'Master节点', description: '集群控制平面，管理所有节点和Pod' },
        { name: 'Worker节点', description: '运行容器化应用的计算节点' },
        { name: 'GPU节点', description: '配备GPU加速卡的专用计算节点' },
      ],
    },
    {
      category: '数据存储',
      icon: Database,
      color: 'text-green-600 bg-green-50',
      components: [
        { name: 'MySQL', description: '关系型数据库，存储业务数据和元数据' },
        { name: 'CubeFS', description: '分布式文件系统，提供高性能存储' },
        { name: 'Redis', description: '内存缓存数据库，提升访问性能' },
      ],
    },
    {
      category: '消息与流',
      icon: GitBranch,
      color: 'text-orange-600 bg-orange-50',
      components: [
        { name: 'Kafka', description: '消息队列，支持事件驱动架构' },
        { name: 'EventBus', description: '事件总线，实现服务间异步通信' },
      ],
    },
    {
      category: '可观测性',
      icon: Network,
      color: 'text-purple-600 bg-purple-50',
      components: [
        { name: 'Prometheus', description: '时间序列数据库，存储监控指标' },
        { name: 'Elasticsearch', description: '日志搜索引擎' },
        { name: 'Logstash', description: '日志收集与处理' },
        { name: 'Kibana', description: '日志可视化' },
        { name: 'Grafana', description: '监控仪表盘' },
      ],
    },
  ];

  const communicationPatterns = [
    {
      type: '同步调用',
      protocol: 'HTTP/REST/gRPC',
      scenarios: ['训练服务调用调度引擎', 'IAM鉴权', '推理服务加载模型'],
      features: ['简单直观', '强一致性', '适合请求-响应模型'],
    },
    {
      type: '异步通信',
      protocol: 'Kafka消息队列',
      scenarios: ['调度任务状态更新', '模型发布通知', '资源使用记录'],
      features: ['解耦强', '可缓冲', '支持广播与订阅'],
    },
    {
      type: '文件/数据交互',
      protocol: 'S3 API、PVC、NFS',
      scenarios: ['推理任务加载模型', '训练任务加载数据集', '日志文件存储'],
      features: ['面向大对象', '高吞吐', '适合数据密集型场景'],
    },
    {
      type: '日志/指标管道',
      protocol: 'Prometheus Pull、ELK Pipeline',
      scenarios: ['服务日志上报', '节点指标采集', '任务状态监控'],
      features: ['单向采集', '低干扰', '用于可观测性'],
    },
  ];

  const deploymentLayers = [
    {
      layer: '入口层',
      services: [
        { name: 'API网关', status: 'infrastructure', description: '统一入口、鉴权、限流' },
        { name: 'SSO服务', status: 'infrastructure', description: '单点登录' },
      ],
    },
    {
      layer: '业务服务层',
      services: [
        { name: '训练服务', status: 'active', description: '执行AI训练任务' },
        { name: '推理服务', status: 'active', description: '提供模型推理能力' },
        { name: '调度引擎', status: 'active', description: '智能任务调度' },
        { name: '镜像构建', status: 'active', description: '构建训练镜像' },
        { name: '数据管理', status: 'planning', description: '数据集与模型管理' },
        { name: '权限管理', status: 'active', description: 'RBAC权限控制' },
        { name: '计费服务', status: 'active', description: '资源计量与账单' },
      ],
    },
    {
      layer: '平台支撑层',
      services: [
        { name: '日志采集', status: 'active', description: '收集系统日志' },
        { name: '监控告警', status: 'active', description: '指标监控与告警' },
        { name: '存储访问', status: 'infrastructure', description: '文件与对象存储' },
        { name: '任务调度器', status: 'active', description: '定时任务管理' },
        { name: '服务注册', status: 'infrastructure', description: '服务发现' },
      ],
    },
    {
      layer: '基础设施层',
      services: [
        { name: 'Kubernetes', status: 'infrastructure', description: '容器编排平台' },
        { name: 'CubeFS', status: 'infrastructure', description: '分布式存储' },
        { name: 'MySQL', status: 'infrastructure', description: '关系数据库' },
        { name: 'Redis', status: 'infrastructure', description: '缓存中间件' },
        { name: 'Kafka', status: 'infrastructure', description: '消息中间件' },
        { name: 'Prometheus', status: 'infrastructure', description: '监控工具' },
        { name: 'ELK', status: 'infrastructure', description: '日志工具' },
      ],
    },
  ];

  const getServiceStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">已实现</Badge>;
    } else if (status === 'planning') {
      return <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">规划中</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">基础设施</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>部署架构</CardTitle>
          <CardDescription>基于Kubernetes的四层架构设计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {deploymentLayers.map((layer, idx) => (
              <div key={idx} className="border rounded-lg p-5 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3 mb-4">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h4>{layer.layer}</h4>
                  <Badge variant="outline" className="text-xs">{layer.services.length} 个组件</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {layer.services.map((service, sidx) => (
                    <div key={sidx} className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="text-sm">{service.name}</h6>
                        {getServiceStatusBadge(service.status)}
                      </div>
                      <p className="text-xs text-slate-600">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>基础设施组件</CardTitle>
          <CardDescription>支撑微服务运行的核心技术栈</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {infrastructureComponents.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-base">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.components.map((component, cidx) => (
                        <div key={cidx} className="p-3 rounded-lg bg-slate-50">
                          <h6 className="text-sm mb-1">{component.name}</h6>
                          <p className="text-xs text-slate-600">{component.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>服务间通信机制</CardTitle>
          <CardDescription>同步调用、异步事件、数据交互等多种通信模式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {communicationPatterns.map((pattern, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base mb-1">{pattern.type}</CardTitle>
                      <Badge variant="outline" className="text-xs">{pattern.protocol}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs mb-2">应用场景</p>
                    <div className="space-y-1">
                      {pattern.scenarios.map((scenario, sidx) => (
                        <div key={sidx} className="flex items-start gap-2 text-xs text-slate-600">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <span>{scenario}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-2">特点</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pattern.features.map((feature, fidx) => (
                        <Badge key={fidx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>高可用与扩展性策略</CardTitle>
          <CardDescription>确保系统稳定运行与灵活扩展</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5>扩展性策略</h5>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <h6 className="text-sm mb-1">水平扩展</h6>
                  <p className="text-xs text-slate-700">
                    所有微服务无状态设计，支持Kubernetes动态扩缩容
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <h6 className="text-sm mb-1">模块化扩展</h6>
                  <p className="text-xs text-slate-700">
                    新算法框架或硬件加速器通过插件机制集成
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <h6 className="text-sm mb-1">多租户支持</h6>
                  <p className="text-xs text-slate-700">
                    通过租户ID隔离数据和服务实例
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5>可用性策略</h5>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <h6 className="text-sm mb-1">高可用设计</h6>
                  <p className="text-xs text-slate-700">
                    多副本部署、健康检查、数据库主从复制
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <h6 className="text-sm mb-1">故障隔离</h6>
                  <p className="text-xs text-slate-700">
                    熔断机制防止级联失败，Schema隔离避免单点故障
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <h6 className="text-sm mb-1">监控与自愈</h6>
                  <p className="text-xs text-slate-700">
                    Prometheus监控、AlertManager告警、K8s自动重启
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
