import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';

export default function MonitoringPage() {
  const alerts = [
    {
      id: 1,
      level: 'warning',
      title: 'GPU-Node-03 资源使用率过高',
      message: 'GPU使用率达到95%，建议检查任务分配',
      time: '5分钟前',
    },
    {
      id: 2,
      level: 'info',
      title: '训练任务 job-2024-001 即将完成',
      message: '预计还需15分钟完成训练',
      time: '10分钟前',
    },
    {
      id: 3,
      level: 'error',
      title: 'GPU-Node-04 离线',
      message: '节点失去心跳连接，请立即检查',
      time: '20分钟前',
    },
  ];

  const metrics = [
    { name: '集群CPU使用率', value: '65%', status: 'normal', trend: 'stable' },
    { name: '集群GPU使用率', value: '78%', status: 'warning', trend: 'up' },
    { name: '内存使用率', value: '72%', status: 'normal', trend: 'stable' },
    { name: '网络吞吐量', value: '2.3GB/s', status: 'normal', trend: 'down' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">监控告警</h1>
        <p className="text-slate-600">实时监控集群状态和告警信息</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">{metric.name}</p>
                {metric.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
              <p className="text-2xl mb-1">{metric.value}</p>
              <p className="text-xs text-slate-500">
                {metric.trend === 'up' ? '↗ 上升' : metric.trend === 'down' ? '↘ 下降' : '→ 稳定'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近告警</CardTitle>
            <CardDescription>系统产生的告警信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex items-start gap-3">
                    {alert.level === 'error' ? (
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                    ) : alert.level === 'warning' ? (
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm">{alert.title}</h5>
                        <Badge
                          variant="outline"
                          className={
                            alert.level === 'error'
                              ? 'text-red-600 border-red-200'
                              : alert.level === 'warning'
                              ? 'text-orange-600 border-orange-200'
                              : 'text-blue-600 border-blue-200'
                          }
                        >
                          {alert.level === 'error' ? '错误' : alert.level === 'warning' ? '警告' : '信息'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                      <p className="text-xs text-slate-500">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>告警统计</CardTitle>
            <CardDescription>过去24小时</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">错误</span>
                  <span className="text-xl text-red-600">3</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">警告</span>
                  <span className="text-xl text-orange-600">12</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">信息</span>
                  <span className="text-xl text-blue-600">45</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
