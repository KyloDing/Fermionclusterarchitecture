import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Server, Zap, Database, Eye, DollarSign, GitBranch, HardDrive, Lock } from 'lucide-react';

export default function DomainArchitecture() {
  const domains = [
    {
      id: 'auth',
      name: '身份认证与权限域',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50',
      responsibility: '统一认证、RBAC/ABAC策略、组织架构',
      services: ['IAM服务', 'SSO网关'],
      interactions: '所有领域依赖其鉴权能力',
      aggregates: [
        { name: '用户', description: '系统中的核心身份实体，管理认证状态与权限关联' },
        { name: '角色', description: '权限的集合载体，用于批量授权' },
        { name: '租户', description: '多租户系统中的客户隔离单元' },
        { name: '客户端', description: 'OAuth 2.0 中的第三方应用' },
      ],
    },
    {
      id: 'resource',
      name: '资源治理域',
      icon: Server,
      color: 'text-blue-600 bg-blue-50',
      responsibility: '异构资源全生命周期管理（纳管/监控/池化）、资源标签与配额分配',
      services: ['节点服务', 'GPU池化服务', '配额服务', '标签服务'],
      interactions: '向算力调度域提供资源，与存储域协同管理存储资源',
      aggregates: [
        { name: '计算节点', description: '管理节点状态与相关绑定的资源属性' },
        { name: '资源池', description: '对一类物理/虚拟资源的逻辑归集' },
      ],
    },
    {
      id: 'scheduling',
      name: '算力调度域',
      icon: Zap,
      color: 'text-orange-600 bg-orange-50',
      responsibility: '任务调度、资源碎片整理、作业队列',
      services: ['调度引擎', '优先级管理器'],
      interactions: '强依赖资源治理域，驱动AI工作负载域执行',
      aggregates: [
        { name: '调度策略', description: '定义资源调度的策略规则' },
        { name: '作业队列', description: '管理不同调度优先级的任务队列' },
      ],
    },
    {
      id: 'ai',
      name: 'AI工作负载域',
      icon: Database,
      color: 'text-green-600 bg-green-50',
      responsibility: '训练/推理任务管理、容器镜像构建',
      services: ['训练服务', '推理服务', '镜像构建服务'],
      interactions: '依赖数据资产域获取数据集，需与存储域交互模型持久化',
      aggregates: [
        { name: '训练任务', description: '管理训练任务的生命周期' },
        { name: '推理服务', description: '管理长时运行的在线/离线推理服务' },
      ],
    },
    {
      id: 'data',
      name: '数据资产域',
      icon: HardDrive,
      color: 'text-cyan-600 bg-cyan-50',
      responsibility: '数据集版本、模型仓库',
      services: ['数据集服务', '模型管理服务'],
      interactions: '为AI域提供数据，与存储域协同管理底层文件',
      aggregates: [
        { name: '数据集', description: '管理用于AI训练的原始/处理后数据集' },
        { name: '模型版本', description: '跟踪模型的每次导出或部署版本' },
      ],
    },
    {
      id: 'billing',
      name: '计费域',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
      responsibility: '资源计量、费率计算、账单生成',
      services: ['计量服务', '账单服务'],
      interactions: '消费资源治理域和AI域的用量数据',
      aggregates: [
        { name: '账单', description: '跟踪租户每月/周期性费用' },
        { name: '计量项', description: '记录每次资源使用明细' },
      ],
    },
    {
      id: 'observability',
      name: '可观测性域',
      icon: Eye,
      color: 'text-indigo-600 bg-indigo-50',
      responsibility: '监控告警、日志聚合、性能分析',
      services: ['采集服务', '告警服务', '日志聚合服务'],
      interactions: '从所有领域采集数据，提供统一运维入口',
      aggregates: [
        { name: '监控配置', description: '定义指标采集、阈值告警的规则' },
        { name: '告警规则', description: '管理各类监控触发条件及通知方式' },
      ],
    },
    {
      id: 'governance',
      name: '服务治理域',
      icon: GitBranch,
      color: 'text-pink-600 bg-pink-50',
      responsibility: '微服务治理（流量控制/熔断降级）、API网关、配置中心',
      services: ['API网关', '服务注册中心', '定时任务服务'],
      interactions: '为业务领域提供基础设施支持',
      aggregates: [
        { name: 'API网关配置', description: '管理服务路由、鉴权、限流等配置' },
        { name: '服务注册', description: '描述可被调用的服务实例信息' },
      ],
    },
    {
      id: 'storage',
      name: '存储域',
      icon: HardDrive,
      color: 'text-teal-600 bg-teal-50',
      responsibility: '统一存储接入、持久卷管理、数据生命周期',
      services: ['文件服务', '对象存储网关'],
      interactions: '被数据资产域、AI工作负载域依赖',
      aggregates: [
        { name: '存储卷', description: '表示绑定某用户/任务的持久化挂载资源' },
        { name: '存储策略', description: '定义不同类型存储的访问/生命周期策略' },
      ],
    },
    {
      id: 'security',
      name: '安全合规域',
      icon: Lock,
      color: 'text-rose-600 bg-rose-50',
      responsibility: '数据加密、访问审计、合规性检查',
      services: ['密钥管理服务', '审计日志服务'],
      interactions: '与身份认证域协同完成安全闭环',
      aggregates: [
        { name: '密钥对', description: '表示加密操作所用的密钥信息' },
        { name: '审计策略', description: '定义哪些行为需要记录/保存多久' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>领域划分</CardTitle>
          <CardDescription>10个核心业务领域，清晰的职责边界与协作关系</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {domains.map((domain) => {
              const Icon = domain.icon;
              return (
                <Card key={domain.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${domain.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{domain.name}</CardTitle>
                        <CardDescription className="text-xs">{domain.responsibility}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs mb-2">关键子服务</p>
                      <div className="flex flex-wrap gap-1.5">
                        {domain.services.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs mb-1">协作关系</p>
                      <p className="text-xs text-slate-600">{domain.interactions}</p>
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
          <CardTitle>领域模型设计</CardTitle>
          <CardDescription>核心聚合根与实体设计</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={domains[0].id} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-4">
              {domains.map((domain) => (
                <TabsTrigger key={domain.id} value={domain.id} className="text-xs px-2">
                  {domain.name.replace('域', '')}
                </TabsTrigger>
              ))}
            </TabsList>
            {domains.map((domain) => {
              const Icon = domain.icon;
              return (
                <TabsContent key={domain.id} value={domain.id} className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                    <div className={`w-12 h-12 rounded-lg ${domain.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4>{domain.name}</h4>
                      <p className="text-sm text-slate-600">{domain.responsibility}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-3">聚合根（Aggregate Root）</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domain.aggregates.map((aggregate, idx) => (
                        <div key={idx} className="p-4 rounded-lg border bg-white">
                          <h6 className="mb-1">{aggregate.name}</h6>
                          <p className="text-sm text-slate-600">{aggregate.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
