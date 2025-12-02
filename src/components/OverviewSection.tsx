import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Zap, Shield, GitBranch } from 'lucide-react';

export default function OverviewSection() {
  const highlights = [
    {
      icon: Zap,
      title: '异构计算资源',
      description: '统一纳管GPU、CPU、NPU等多种算力资源',
      color: 'text-orange-600 bg-orange-50',
    },
    {
      icon: GitBranch,
      title: '微服务架构',
      description: '13个核心服务，独立部署、灵活扩展',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: TrendingUp,
      title: '智能调度',
      description: '资源碎片整理、优先级队列、弹性扩缩容',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: Shield,
      title: '安全合规',
      description: 'RBAC权限、审计日志、数据加密',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const architectureLayers = [
    {
      name: '入口层',
      description: 'API网关、SSO认证、统一鉴权',
      services: ['API 网关', 'SSO 登录模块'],
    },
    {
      name: '业务服务层',
      description: '训练、推理、调度、数据管理等核心业务',
      services: ['训练服务', '推理服务', '调度引擎', '镜像构建', '数据管理', '权限管理', '计费服务'],
    },
    {
      name: '平台支撑层',
      description: '日志、监控、存储、任务调度等通用能力',
      services: ['日志采集', '监控告警', '存储访问', '任务调度器', '服务注册'],
    },
    {
      name: '基础设施层',
      description: 'Kubernetes、数据库、中间件等底层资源',
      services: ['Kubernetes', 'CubeFS', 'MySQL', 'Redis', 'Kafka', 'Prometheus', 'ELK'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Introduction */}
      <Card>
        <CardHeader>
          <CardTitle>系统概述</CardTitle>
          <CardDescription>基于 Kubernetes 构建的高性能算力调度系统</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            本平台定位是基于 Kubernetes 构建的高性能算力调度系统，核心聚焦异构计算资源的统一纳管、智能调度，以及一站式 AI 训练与推理平台建设。通过灵活的虚拟机与容器化部署模式，为 AI 开发者提供高可用、弹性可扩展的算力服务。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Layers */}
      <Card>
        <CardHeader>
          <CardTitle>架构分层</CardTitle>
          <CardDescription>四层架构设计，职责清晰、易于扩展</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {architectureLayers.map((layer, index) => (
              <div key={index} className="p-5 rounded-lg border bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="mb-1">{layer.name}</h4>
                    <p className="text-sm text-slate-600">{layer.description}</p>
                  </div>
                  <Badge variant="outline">{layer.services.length} 个组件</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>核心特性</CardTitle>
          <CardDescription>微服务架构带来的优势</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4>独立部署与迭代</h4>
              <p className="text-sm text-slate-600">
                各服务独立开发、部署与升级，支持灰度发布和快速迭代，降低系统整体风险
              </p>
            </div>
            <div className="space-y-2">
              <h4>定制化交付</h4>
              <p className="text-sm text-slate-600">
                根据客户需求灵活组合服务模块，支持按需交付，降低部署复杂度
              </p>
            </div>
            <div className="space-y-2">
              <h4>技术生态适配</h4>
              <p className="text-sm text-slate-600">
                快速集成新算法框架、硬件加速组件，保持平台技术先进性
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
