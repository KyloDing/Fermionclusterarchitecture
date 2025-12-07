import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Server, Cpu, HardDrive, Network, MapPin, Activity } from 'lucide-react';

interface ZoneConfig {
  zoneId: string;
  zoneName: string;
  nodeCount: number;
  gpuPerNode: number;
  totalGPUs: number;
  cpuPerNode: number;
  memoryPerNode: number;
  region: string;
  latency: number;
  status: 'healthy' | 'degraded';
}

interface MultiZoneTopologyViewProps {
  zones: ZoneConfig[];
  taskName?: string;
  taskStatus?: 'running' | 'pending' | 'completed';
}

export function MultiZoneTopologyView({ zones, taskName, taskStatus }: MultiZoneTopologyViewProps) {
  const totalNodes = zones.reduce((sum, z) => sum + z.nodeCount, 0);
  const totalGPUs = zones.reduce((sum, z) => sum + z.totalGPUs, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-600" />
              跨可用区拓扑
            </CardTitle>
            {taskName && (
              <p className="text-sm text-slate-600 mt-1">
                任务：{taskName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {zones.length} 个可用区
            </Badge>
            <Badge variant="outline">
              {totalNodes} 节点
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              {totalGPUs} GPU
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 可用区网络拓扑 */}
        <div className="space-y-6">
          {/* 区域分组 */}
          {Object.entries(
            zones.reduce((acc, zone) => {
              if (!acc[zone.region]) {
                acc[zone.region] = [];
              }
              acc[zone.region].push(zone);
              return acc;
            }, {} as Record<string, ZoneConfig[]>)
          ).map(([region, regionZones]) => (
            <div key={region} className="space-y-3">
              {/* 区域标题 */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm text-slate-900">{region}区域</h3>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* 该区域的可用区 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionZones.map((zone, index) => (
                  <Card
                    key={zone.zoneId}
                    className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50"
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* 可用区头部 */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">{zone.zoneName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Activity className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-slate-600">{zone.latency}ms</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={zone.status === 'healthy' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {zone.status === 'healthy' ? '健康' : '降级'}
                        </Badge>
                      </div>

                      {/* 节点可视化 */}
                      <div className="bg-white/80 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <span>计算节点</span>
                          <span>{zone.nodeCount} 台</span>
                        </div>

                        {/* 节点网格 */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {Array.from({ length: Math.min(zone.nodeCount, 8) }).map((_, i) => (
                            <div
                              key={i}
                              className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded border border-purple-300 flex items-center justify-center relative group"
                            >
                              <Server className="w-3 h-3 text-purple-600" />
                              
                              {/* 悬停提示 */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  节点 {i + 1}
                                  <br />
                                  {zone.gpuPerNode} GPU
                                  <br />
                                  {zone.cpuPerNode} CPU
                                </div>
                              </div>
                            </div>
                          ))}
                          {zone.nodeCount > 8 && (
                            <div className="aspect-square bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-xs text-slate-600">
                              +{zone.nodeCount - 8}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 资源统计 */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white/80 rounded p-2 text-center">
                          <Cpu className="w-3 h-3 text-purple-600 mx-auto mb-1" />
                          <p className="text-purple-600">{zone.totalGPUs}</p>
                          <p className="text-slate-600">GPU</p>
                        </div>
                        <div className="bg-white/80 rounded p-2 text-center">
                          <Cpu className="w-3 h-3 text-blue-600 mx-auto mb-1" />
                          <p className="text-blue-600">{zone.nodeCount * zone.cpuPerNode}</p>
                          <p className="text-slate-600">核心</p>
                        </div>
                        <div className="bg-white/80 rounded p-2 text-center">
                          <HardDrive className="w-3 h-3 text-green-600 mx-auto mb-1" />
                          <p className="text-green-600">{zone.nodeCount * zone.memoryPerNode}</p>
                          <p className="text-slate-600">GB</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* 网络连接示意 */}
          {zones.length > 1 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Network className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm text-slate-900">跨可用区网络</h3>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {zones.map((zone, index) => (
                    <div key={zone.zoneId} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div>
                          <p className="text-xs text-slate-900">{zone.zoneName.split('（')[0]}</p>
                          <p className="text-xs text-slate-600">{zone.latency}ms</p>
                        </div>
                      </div>
                      {index < zones.length - 1 && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <div className="w-8 h-px bg-slate-300" />
                          <Network className="w-3 h-3" />
                          <div className="w-8 h-px bg-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center text-slate-600 mt-3">
                  所有可用区通过高速专线互联，支持分布式训练和推理
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
