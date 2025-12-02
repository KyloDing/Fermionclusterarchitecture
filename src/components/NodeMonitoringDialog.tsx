import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Cpu, HardDrive, Network, Server } from 'lucide-react';
import { NodeMetrics, getNodeMetrics } from '../services/mockDataService';

interface NodeMonitoringDialogProps {
  nodeId: string | null;
  nodeName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NodeMonitoringDialog({
  nodeId,
  nodeName,
  open,
  onOpenChange,
}: NodeMonitoringDialogProps) {
  const [metrics, setMetrics] = useState<NodeMetrics[]>([]);
  const [timeRange, setTimeRange] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && nodeId) {
      loadMetrics();
      // 每30秒刷新一次数据
      const interval = setInterval(loadMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [open, nodeId, timeRange]);

  const loadMetrics = async () => {
    if (!nodeId) return;
    setLoading(true);
    try {
      const data = await getNodeMetrics(nodeId, parseInt(timeRange));
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 准备CPU图表数据
  const cpuData = metrics.map((m) => ({
    time: formatTime(m.timestamp),
    usage: m.cpu.usage.toFixed(1),
  }));

  // 准备内存图表数据
  const memoryData = metrics.map((m) => ({
    time: formatTime(m.timestamp),
    used: m.memory.used,
    total: m.memory.total,
    percentage: ((m.memory.used / m.memory.total) * 100).toFixed(1),
  }));

  // 准备GPU图表数据 - 只显示前4个GPU
  const gpuData = metrics.map((m) => ({
    time: formatTime(m.timestamp),
    ...Object.fromEntries(
      m.gpus.slice(0, 4).map((gpu, idx) => [`gpu${idx}`, gpu.utilization.toFixed(1)])
    ),
  }));

  // 准备GPU温度数据
  const gpuTempData = metrics.map((m) => ({
    time: formatTime(m.timestamp),
    ...Object.fromEntries(
      m.gpus.slice(0, 4).map((gpu, idx) => [`gpu${idx}`, gpu.temperature])
    ),
  }));

  // 准备网络数据
  const networkData = metrics.map((m, idx) => {
    const prevMetric = idx > 0 ? metrics[idx - 1] : m;
    const rxRate = ((m.network.rxBytes - prevMetric.network.rxBytes) / 60 / 1024 / 1024).toFixed(2);
    const txRate = ((m.network.txBytes - prevMetric.network.txBytes) / 60 / 1024 / 1024).toFixed(2);
    return {
      time: formatTime(m.timestamp),
      rx: rxRate,
      tx: txRate,
    };
  });

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                节点监控
              </DialogTitle>
              <DialogDescription>{nodeName || '查看节点实时监控数据'}</DialogDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">最近1小时</SelectItem>
                <SelectItem value="3">最近3小时</SelectItem>
                <SelectItem value="6">最近6小时</SelectItem>
                <SelectItem value="12">最近12小时</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {loading && metrics.length === 0 ? (
          <div className="py-12 text-center text-slate-600">加载中...</div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-4 pr-4">
              {/* CPU使用率 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    CPU 使用率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={cpuData}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                        domain={[0, 100]}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                        formatter={(value: any) => [`${value}%`, 'CPU使用率']}
                      />
                      <Area
                        type="monotone"
                        dataKey="usage"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCpu)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 内存使用 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    内存使用
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={memoryData}>
                      <defs>
                        <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                        domain={[0, 100]}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'percentage') return [`${value}%`, '使用率'];
                          return value;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorMemory)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* GPU使用率 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    GPU 使用率 (前4个GPU)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={gpuData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                        domain={[0, 100]}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                        formatter={(value: any) => [`${value}%`, '']}
                      />
                      <Legend />
                      {[0, 1, 2, 3].map((idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={`gpu${idx}`}
                          stroke={colors[idx]}
                          strokeWidth={2}
                          name={`GPU ${idx}`}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* GPU温度 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    GPU 温度 (前4个GPU)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={gpuTempData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                        domain={[0, 100]}
                        label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                        formatter={(value: any) => [`${value}°C`, '']}
                      />
                      <Legend />
                      {[0, 1, 2, 3].map((idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={`gpu${idx}`}
                          stroke={colors[idx]}
                          strokeWidth={2}
                          name={`GPU ${idx}`}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 网络流量 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    网络流量
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={networkData}>
                      <defs>
                        <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#64748b' }}
                        label={{ value: 'MB/s', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                        formatter={(value: any, name: string) => [
                          `${value} MB/s`,
                          name === 'rx' ? '接收' : '发送',
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="rx"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRx)"
                        name="接收"
                      />
                      <Area
                        type="monotone"
                        dataKey="tx"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTx)"
                        name="发送"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
