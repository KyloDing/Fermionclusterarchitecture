import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Globe,
  Shield,
  Share2,
  ArrowRight,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  HardDrive,
  Zap,
  Network,
  Lock,
  Server,
  Cloud,
  Building,
  Wifi,
  WifiOff,
  TrendingUp,
  FileText,
  Settings,
} from 'lucide-react';

export default function FileSharesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟统计数据
  const stats = {
    webdav: {
      total: 5,
      active: 4,
      connections: 519,
      traffic: '14.3 TB',
    },
    smb: {
      total: 8,
      active: 6,
      connections: 234,
      traffic: '8.7 TB',
    },
  };

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">文件共享管理中心</h1>
        <p className="text-slate-600">
          统一管理WebDAV和SMB文件共享服务，适配公有云和私有云部署场景
        </p>
      </div>

      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">共享总数</p>
                <p className="text-3xl">{stats.webdav.total + stats.smb.total}</p>
                <p className="text-sm text-green-600 mt-1">
                  活跃 {stats.webdav.active + stats.smb.active}
                </p>
              </div>
              <Share2 className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">活跃连接</p>
                <p className="text-3xl">{stats.webdav.connections + stats.smb.connections}</p>
                <p className="text-sm text-slate-600 mt-1">实时在线</p>
              </div>
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总流量</p>
                <p className="text-3xl">23.0 TB</p>
                <p className="text-sm text-slate-600 mt-1">累计传输</p>
              </div>
              <HardDrive className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">部署类型</p>
                <p className="text-3xl">2</p>
                <p className="text-sm text-slate-600 mt-1">公有云 + 私有云</p>
              </div>
              <Cloud className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            概览对比
          </TabsTrigger>
          <TabsTrigger value="scenario">
            <FileText className="w-4 h-4 mr-2" />
            场景指南
          </TabsTrigger>
          <TabsTrigger value="management">
            <Settings className="w-4 h-4 mr-2" />
            快速管理
          </TabsTrigger>
        </TabsList>

        {/* 概览对比 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 部署场景对比卡片 */}
          <div className="grid grid-cols-2 gap-6">
            {/* WebDAV共享 */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-slate-900">WebDAV共享</h3>
                      <p className="text-sm text-blue-700">公有云部署方案</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">推荐</Badge>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs text-slate-600 mb-1">共享数量</p>
                    <p className="text-2xl font-medium">{stats.webdav.total}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.webdav.active} 个活跃
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs text-slate-600 mb-1">活跃连接</p>
                    <p className="text-2xl font-medium">{stats.webdav.connections}</p>
                    <p className="text-xs text-slate-600 mt-1">实时在线</p>
                  </div>
                </div>

                {/* 特性列表 */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">基于HTTP/HTTPS协议</p>
                      <p className="text-sm text-slate-600">防火墙友好，80/443端口</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">互联网访问</p>
                      <p className="text-sm text-slate-600">支持远程访问和跨地域协作</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">跨平台原生支持</p>
                      <p className="text-sm text-slate-600">Windows/macOS/Linux无需配置</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">SSL/TLS加密</p>
                      <p className="text-sm text-slate-600">保障数据传输安全</p>
                    </div>
                  </div>
                </div>

                {/* 适用场景 */}
                <div className="p-4 bg-blue-100 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    <Wifi className="w-4 h-4 inline mr-1" />
                    适用场景
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 公有云SaaS部署</li>
                    <li>• 远程团队协作</li>
                    <li>• 跨地域文件共享</li>
                    <li>• 对外开放的资源库</li>
                  </ul>
                </div>

                {/* 操作按钮 */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/webdav-shares')}
                >
                  管理WebDAV共享
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* SMB共享 */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-slate-900">SMB共享</h3>
                      <p className="text-sm text-purple-700">私有云部署方案</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white">高性能</Badge>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-xs text-slate-600 mb-1">共享数量</p>
                    <p className="text-2xl font-medium">{stats.smb.total}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.smb.active} 个活跃
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-xs text-slate-600 mb-1">活跃连接</p>
                    <p className="text-2xl font-medium">{stats.smb.connections}</p>
                    <p className="text-xs text-slate-600 mt-1">实时在线</p>
                  </div>
                </div>

                {/* 特性列表 */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">基于SMB/CIFS协议</p>
                      <p className="text-sm text-slate-600">Windows原生协议，性能优异</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">内网高速访问</p>
                      <p className="text-sm text-slate-600">低延迟，适合大文件传输</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Windows无缝集成</p>
                      <p className="text-sm text-slate-600">资源管理器直接访问</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">企业级认证</p>
                      <p className="text-sm text-slate-600">支持Kerberos/NTLM</p>
                    </div>
                  </div>
                </div>

                {/* 适用场景 */}
                <div className="p-4 bg-purple-100 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    适用场景
                  </p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• 私有化本地部署</li>
                    <li>• 企业内网环境</li>
                    <li>• Windows主导的IT环境</li>
                    <li>• 高性能数据传输</li>
                  </ul>
                </div>

                {/* 操作按钮 */}
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/smb-shares')}
                >
                  管理SMB共享
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 对比表格 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">技术对比</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-900">对比项</th>
                      <th className="text-left py-3 px-4 font-medium text-blue-900">
                        <Globe className="w-4 h-4 inline mr-2" />
                        WebDAV共享
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-purple-900">
                        <Shield className="w-4 h-4 inline mr-2" />
                        SMB共享
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">部署场景</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-blue-100 text-blue-700">公有云</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-purple-100 text-purple-700">私有云</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">协议基础</td>
                      <td className="py-3 px-4">HTTP/HTTPS</td>
                      <td className="py-3 px-4">SMB/CIFS</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">网络环境</td>
                      <td className="py-3 px-4">
                        <Wifi className="w-4 h-4 inline text-green-600 mr-1" />
                        互联网访问
                      </td>
                      <td className="py-3 px-4">
                        <WifiOff className="w-4 h-4 inline text-orange-600 mr-1" />
                        内网环境
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">端口</td>
                      <td className="py-3 px-4">80/443（防火墙友好）</td>
                      <td className="py-3 px-4">445（常被封禁）</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">跨平台支持</td>
                      <td className="py-3 px-4">
                        <CheckCircle className="w-4 h-4 inline text-green-600 mr-1" />
                        原生支持所有平台
                      </td>
                      <td className="py-3 px-4">
                        Windows原生，其他需配置
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">性能</td>
                      <td className="py-3 px-4">中等（HTTP开销）</td>
                      <td className="py-3 px-4">
                        <Zap className="w-4 h-4 inline text-orange-600 mr-1" />
                        高性能（内网直连）
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">安全性</td>
                      <td className="py-3 px-4">SSL/TLS加密</td>
                      <td className="py-3 px-4">Kerberos/NTLM</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-700">认证方式</td>
                      <td className="py-3 px-4">Basic/Digest/None</td>
                      <td className="py-3 px-4">域账号/本地账号</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-700">典型延迟</td>
                      <td className="py-3 px-4">50-200ms（取决于网络）</td>
                      <td className="py-3 px-4">&lt;10ms（内网环境）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 场景指南 */}
        <TabsContent value="scenario" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 场景1：公有云SaaS */}
            <Card className="border-2 border-blue-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">公有云SaaS部署</h3>
                    <p className="text-sm text-slate-600">互联网服务模式</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700"><strong>业务需求：</strong></p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• 为用户提供AI模型下载服务</li>
                    <li>• 支持远程团队文件协作</li>
                    <li>• 需要跨地域访问</li>
                  </ul>
                  <p className="text-slate-700 mt-3"><strong>推荐方案：</strong></p>
                  <Badge className="bg-blue-600 text-white">WebDAV共享</Badge>
                  <p className="text-slate-600 mt-2">
                    ✓ 基于HTTPS，互联网友好<br />
                    ✓ 跨平台无缝访问<br />
                    ✓ 易于集成到Web应用
                  </p>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/webdav-shares')}
                >
                  配置WebDAV共享
                </Button>
              </CardContent>
            </Card>

            {/* 场景2：私有云本地部署 */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">私有云本地部署</h3>
                    <p className="text-sm text-slate-600">企业内网环境</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700"><strong>业务需求：</strong></p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• 企业内部数据共享</li>
                    <li>• 高性能文件传输</li>
                    <li>• Windows域集成</li>
                  </ul>
                  <p className="text-slate-700 mt-3"><strong>推荐方案：</strong></p>
                  <Badge className="bg-purple-600 text-white">SMB共享</Badge>
                  <p className="text-slate-600 mt-2">
                    ✓ Windows原生协议，性能优异<br />
                    ✓ 支持域账号认证<br />
                    ✓ 内网低延迟访问
                  </p>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/smb-shares')}
                >
                  配置SMB共享
                </Button>
              </CardContent>
            </Card>

            {/* 场景3：混合云部署 */}
            <Card className="border-2 border-green-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Network className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">混合云部署</h3>
                    <p className="text-sm text-slate-600">内外网结合</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700"><strong>业务需求：</strong></p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• 对内：高性能内网共享</li>
                    <li>• 对外：互联网文件访问</li>
                    <li>• 灵活的访问控制</li>
                  </ul>
                  <p className="text-slate-700 mt-3"><strong>推荐方案：</strong></p>
                  <div className="flex gap-2">
                    <Badge className="bg-purple-600 text-white">SMB</Badge>
                    <span className="text-slate-400">+</span>
                    <Badge className="bg-blue-600 text-white">WebDAV</Badge>
                  </div>
                  <p className="text-slate-600 mt-2">
                    ✓ 内网使用SMB高性能访问<br />
                    ✓ 外网使用WebDAV安全访问<br />
                    ✓ 统一管理，灵活切换
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="border-purple-200"
                    onClick={() => navigate('/smb-shares')}
                  >
                    SMB
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200"
                    onClick={() => navigate('/webdav-shares')}
                  >
                    WebDAV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 场景4：跨地域团队协作 */}
            <Card className="border-2 border-orange-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">跨地域团队协作</h3>
                    <p className="text-sm text-slate-600">分布式办公</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700"><strong>业务需求：</strong></p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• 多地团队文件共享</li>
                    <li>• 移动办公支持</li>
                    <li>• 简单易用的访问方式</li>
                  </ul>
                  <p className="text-slate-700 mt-3"><strong>推荐方案：</strong></p>
                  <Badge className="bg-blue-600 text-white">WebDAV共享</Badge>
                  <p className="text-slate-600 mt-2">
                    ✓ URL访问，无需VPN<br />
                    ✓ 移动设备友好<br />
                    ✓ 浏览器直接访问
                  </p>
                </div>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/webdav-shares')}
                >
                  配置WebDAV共享
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 快速管理 */}
        <TabsContent value="management" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* WebDAV管理入口 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-slate-900">WebDAV共享</h3>
                    <p className="text-slate-600">公有云部署方案</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-medium text-blue-600">{stats.webdav.total}</p>
                    <p className="text-sm text-slate-600 mt-1">共享总数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-medium text-green-600">{stats.webdav.active}</p>
                    <p className="text-sm text-slate-600 mt-1">活跃中</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-medium text-orange-600">{stats.webdav.connections}</p>
                    <p className="text-sm text-slate-600 mt-1">连接数</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">总流量</span>
                    <span className="font-medium text-slate-900">{stats.webdav.traffic}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">协议</span>
                    <Badge className="bg-blue-100 text-blue-700">HTTP/HTTPS</Badge>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={() => navigate('/webdav-shares')}
                >
                  进入WebDAV管理
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* SMB管理入口 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-slate-900">SMB共享</h3>
                    <p className="text-slate-600">私有云部署方案</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-medium text-purple-600">{stats.smb.total}</p>
                    <p className="text-sm text-slate-600 mt-1">共享总数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-medium text-green-600">{stats.smb.active}</p>
                    <p className="text-sm text-slate-600 mt-1">活跃中</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-medium text-orange-600">{stats.smb.connections}</p>
                    <p className="text-sm text-slate-600 mt-1">连接数</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">总流量</span>
                    <span className="font-medium text-slate-900">{stats.smb.traffic}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">协议</span>
                    <Badge className="bg-purple-100 text-purple-700">SMB/CIFS</Badge>
                  </div>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  onClick={() => navigate('/smb-shares')}
                >
                  进入SMB管理
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 快速操作 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">快速操作</h3>
              <div className="grid grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate('/webdav-shares')}
                >
                  <Globe className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">创建WebDAV共享</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate('/smb-shares')}
                >
                  <Shield className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">创建SMB共享</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate('/storage-backends')}
                >
                  <Server className="w-6 h-6 text-green-600" />
                  <span className="text-sm">存储后端配置</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate('/storage-volumes')}
                >
                  <HardDrive className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">存储卷管理</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
