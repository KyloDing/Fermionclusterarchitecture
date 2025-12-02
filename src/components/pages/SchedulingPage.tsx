import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock } from 'lucide-react';

export default function SchedulingPage() {
  const queue = [
    { id: 1, job: 'GPT对话模型', priority: 'high', gpu: 16, position: 1, estimatedWait: '5分钟' },
    { id: 2, job: 'YOLO目标检测', priority: 'normal', gpu: 4, position: 2, estimatedWait: '15分钟' },
    { id: 3, job: 'ResNet图像分类', priority: 'low', gpu: 2, position: 3, estimatedWait: '30分钟' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">调度中心</h1>
        <p className="text-slate-600">查看任务队列和调度策略</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>任务队列</CardTitle>
            <CardDescription>等待调度的任务列表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queue.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium mb-1">{item.job}</p>
                      <p className="text-sm text-slate-600">需要 {item.gpu} × GPU</p>
                    </div>
                    <Badge
                      className={
                        item.priority === 'high'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.priority === 'normal'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }
                    >
                      {item.priority === 'high' ? '高优先级' : item.priority === 'normal' ? '中优先级' : '低优先级'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>队列位置: #{item.position}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      预计等待: {item.estimatedWait}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>调度策略</CardTitle>
            <CardDescription>当前生效的调度规则</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="text-sm mb-1">优先级调度</h4>
                <p className="text-xs text-slate-700">
                  按照任务优先级（高/中/低）进行调度，高优先级任务优先分配资源
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="text-sm mb-1">资源碎片整理</h4>
                <p className="text-xs text-slate-700">每小时自动整理GPU资源碎片，提升资源利用率</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h4 className="text-sm mb-1">公平调度</h4>
                <p className="text-xs text-slate-700">确保各租户的资源使用量在配额范围内保持公平</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
