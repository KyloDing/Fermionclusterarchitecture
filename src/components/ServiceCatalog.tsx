import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Search, CheckCircle2, Clock } from 'lucide-react';

export default function ServiceCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const services = [
    {
      id: '1',
      name: '认证授权服务',
      status: 'active',
      description: '统一处理用户认证、单点登录（SSO）、角色权限管理和访问控制（RBAC/ABAC）',
      domain: '身份认证与权限域',
      capabilities: [
        '用户注册、登录、注销（支持多因素认证）',
        '单点登录（SSO）入口，支持OAuth2、SAML、OpenID Connect协议',
        '用户管理（创建、更新、删除用户，管理用户属性）',
        '角色与权限管理（基于RBAC/ABAC策略）',
        'JWT令牌生成与验证',
        '会话管理（会话超时、跨服务会话同步）',
        '集成外部身份提供商（LDAP、Azure AD）',
      ],
    },
    {
      id: '2',
      name: '任务调度服务',
      status: 'active',
      description: '负责定时任务和计划任务的调度与执行',
      domain: '服务治理域',
      capabilities: [
        '定时任务管理（创建、编辑、暂停、删除）',
        '基于Cron表达式或固定间隔触发',
        '任务执行引擎（分发任务到合适节点）',
        '任务状态监控（运行中、成功、失败、重试）',
        '任务优先级支持（基于租户或任务类型）',
        '失败重试与通知机制',
        '分布式任务锁（防止任务重复执行）',
      ],
    },
    {
      id: '3',
      name: '审计日志服务',
      status: 'active',
      description: '记录系统关键操作日志，满足安全审计和合规要求',
      domain: '安全合规域',
      capabilities: [
        '记录用户操作日志（登录、权限变更、资源访问）',
        '记录系统事件日志（服务启动、异常、配置变更）',
        '日志存储与归档（支持长期存储和压缩）',
        '日志查询与搜索（时间范围、用户、事件类型过滤）',
        '日志导出（CSV、JSON格式）',
        '与外部日志系统集成（ELK、Splunk）',
        '日志加密与访问控制',
      ],
    },
    {
      id: '4',
      name: '监控告警服务',
      status: 'active',
      description: '收集节点和任务运行指标，基于规则触发告警并通知',
      domain: '可观测性域',
      capabilities: [
        '收集节点指标（CPU、内存、GPU、磁盘使用率）',
        '收集任务指标（训练/推理任务的耗时、资源占用、错误率）',
        '指标存储与查询（支持时间序列数据库）',
        '告警规则管理（定义阈值、触发条件）',
        '告警通知（邮件、短信、Webhook等）',
        '仪表盘支持（可视化指标展示，集成Grafana）',
        '异常检测（基于机器学习或规则识别异常）',
      ],
    },
    {
      id: '5',
      name: '计费服务',
      status: 'active',
      description: '收集资源使用明细，生成周期性账单，按租户/用户统计资源费用',
      domain: '计费域',
      capabilities: [
        '收集资源使用数据（CPU、GPU、存储、带宽等）',
        '按租户/用户/时间维度统计资源消耗',
        '账单生成（支持按月、按季度等周期）',
        '账单查询与导出（PDF、CSV格式）',
        '支持多种计费模型（按量计费、包年包月）',
        '与支付系统集成（Stripe、PayPal等）',
        '账单审计（记录账单生成历史）',
      ],
    },
    {
      id: '6',
      name: '数据资产服务',
      status: 'planning',
      description: '管理数据集和模型的上传、版本控制、快照生成和访问授权',
      domain: '数据资产域',
      capabilities: [
        '数据集上传与存储（支持大文件分片上传）',
        '数据集版本管理（支持版本快照、回滚）',
        '模型注册与管理（存储模型文件、元数据、标签）',
        '数据与模型访问授权（基于用户/角色控制）',
        '数据集与模型元数据管理',
        '数据预处理支持（格式转换、清洗、采样）',
        '数据与模型快照生成',
      ],
    },
    {
      id: '7',
      name: '镜像构建服务',
      status: 'active',
      description: '从用户代码构建训练镜像，支持版本追踪',
      domain: 'AI工作负载域',
      capabilities: [
        '接收用户代码与构建配置（Dockerfile）',
        '自动化构建训练镜像（支持TensorFlow、PyTorch）',
        '镜像版本管理（支持版本号、标签）',
        '镜像存储（推送到Docker Hub、Harbor）',
        '构建状态监控（成功、失败、日志）',
        '构建资源限制（控制CPU、内存使用）',
        '支持构建结果通知',
      ],
    },
    {
      id: '8',
      name: '训练服务',
      status: 'active',
      description: '接收调度任务，在节点上执行训练容器',
      domain: 'AI工作负载域',
      capabilities: [
        '接收训练任务请求（镜像、数据集、超参数）',
        '启动训练容器（基于Docker或Podman）',
        '任务状态监控（运行中、成功、失败）',
        '训练日志收集与存储（支持实时查看）',
        '资源分配与隔离（CPU、GPU、内存）',
        '支持分布式训练（多节点、多GPU）',
        '任务暂停与恢复',
      ],
    },
    {
      id: '9',
      name: '推理服务',
      status: 'active',
      description: '部署和管理模型推理服务，处理实时或离线请求',
      domain: 'AI工作负载域',
      capabilities: [
        '模型部署（从数据资产服务加载模型）',
        '推理服务启动与管理（支持REST、gRPC接口）',
        '推理请求处理（支持批量和实时推理）',
        '推理性能优化（模型量化、批处理）',
        '推理结果缓存',
        '推理日志记录（请求、响应、耗时）',
        '自动扩缩容（根据负载调整实例数）',
      ],
    },
    {
      id: '10',
      name: '调度服务',
      status: 'active',
      description: '接收任务请求，调度到合适节点，管理任务优先级和资源标签',
      domain: '算力调度域',
      capabilities: [
        '任务调度（基于节点资源、任务优先级选择节点）',
        '任务队列管理（支持优先级队列、FIFO）',
        '资源分配（CPU、GPU、内存、存储）',
        '任务优先级策略（租户等级、任务类型）',
        '调度优化（考虑资源碎片、节点亲和性）',
        '调度状态监控',
      ],
    },
    {
      id: '11',
      name: '节点管理服务',
      status: 'active',
      description: '注册与管理计算节点，抽象GPU资源池，支持异构调度',
      domain: '资源治理域',
      capabilities: [
        '节点注册与发现（管理节点IP、标签、状态）',
        '节点健康检查（检测节点可用性、资源状态）',
        'GPU资源池化（抽象GPU资源，支持多型号）',
        '节点资源监控（CPU、GPU、内存、磁盘）',
        '节点标签管理（支持动态标签更新）',
        '节点故障隔离（自动下线故障节点）',
        '支持异构调度（适配不同GPU型号）',
      ],
    },
    {
      id: '12',
      name: '配额服务',
      status: 'active',
      description: '为租户设置资源上限，并在调度时校验配额',
      domain: '资源治理域',
      capabilities: [
        '租户配额设置（CPU、GPU、存储、带宽上限）',
        '配额动态调整（支持按需分配、回收）',
        '配额校验（在任务调度前验证资源可用性）',
        '配额使用统计（按租户/时间维度）',
        '配额超限告警',
        '支持多级配额（租户、项目、用户级别）',
        '与计费服务集成',
      ],
    },
    {
      id: '13',
      name: '日志聚合服务',
      status: 'planning',
      description: '聚合系统和任务日志，构建检索索引，支持查询与分析',
      domain: '可观测性域',
      capabilities: [
        '收集系统和任务日志（从各服务聚合日志）',
        '日志存储与索引（支持Elasticsearch、Loki）',
        '日志查询与搜索（关键字、时间范围过滤）',
        '日志可视化（集成Kibana、Grafana）',
        '日志清理与归档',
        '日志访问控制（基于用户/角色授权）',
        '支持实时日志流',
      ],
    },
  ];

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          已实现
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-200">
        <Clock className="w-3 h-3 mr-1" />
        规划中
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>服务目录</CardTitle>
          <CardDescription>13个核心微服务，覆盖认证、调度、AI负载、监控等全领域</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索服务名称、描述或所属领域..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4 text-sm">
            <Badge variant="outline">总计 {services.length} 个服务</Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              已实现 {services.filter((s) => s.status === 'active').length}
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              规划中 {services.filter((s) => s.status === 'planning').length}
            </Badge>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <Collapsible
                  key={service.id}
                  open={expandedService === service.id}
                  onOpenChange={() => setExpandedService(expandedService === service.id ? null : service.id)}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              {getStatusBadge(service.status)}
                            </div>
                            <CardDescription className="text-sm">{service.description}</CardDescription>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform ${
                              expandedService === service.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {service.domain}
                          </Badge>
                          <span className="text-xs text-slate-500">{service.capabilities.length} 项核心能力</span>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <h5 className="mb-3 text-sm text-slate-700">核心能力清单</h5>
                          <ul className="space-y-2">
                            {service.capabilities.map((capability, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                <span>{capability}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
