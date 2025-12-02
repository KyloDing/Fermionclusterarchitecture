import { useState, useRef, useCallback } from 'react';
import {
  Database,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
  Rocket,
  Settings as SettingsIcon,
  Trash2,
  Plus,
  Save,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import {
  type Pipeline,
  type PipelineStep,
  type StepType,
  getStepTypeLabel,
  getStepTypeIcon,
} from '../services/pipelineService';
import { toast } from 'sonner@2.0.3';

interface PipelineEditorProps {
  pipeline?: Pipeline;
  onSave: (pipeline: Pipeline) => void;
  onRun?: (pipeline: Pipeline) => void;
}

// 步骤类型配置
const STEP_TYPES: { type: StepType; icon: any; color: string }[] = [
  { type: 'data-preparation', icon: Database, color: 'bg-blue-500' },
  { type: 'data-augmentation', icon: RefreshCw, color: 'bg-cyan-500' },
  { type: 'model-training', icon: Target, color: 'bg-purple-500' },
  { type: 'model-evaluation', icon: TrendingUp, color: 'bg-emerald-500' },
  { type: 'model-optimization', icon: Zap, color: 'bg-amber-500' },
  { type: 'model-deployment', icon: Rocket, color: 'bg-sky-500' },
  { type: 'custom', icon: SettingsIcon, color: 'bg-slate-500' },
];

const GPU_TYPES = ['NVIDIA A100', 'NVIDIA A800', 'NVIDIA H100', 'NVIDIA V100'];

export default function PipelineEditor({ pipeline, onSave, onRun }: PipelineEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(pipeline?.steps || []);
  const [selectedStep, setSelectedStep] = useState<PipelineStep | null>(null);
  const [connections, setConnections] = useState<{ from: string; to: string }[]>([]);
  const [pipelineName, setPipelineName] = useState(pipeline?.name || '');
  const [pipelineDescription, setPipelineDescription] = useState(pipeline?.description || '');
  const [draggedStepType, setDraggedStepType] = useState<StepType | null>(null);

  // 添加步骤到画布
  const addStep = useCallback(
    (type: StepType, x: number, y: number) => {
      const newStep: PipelineStep = {
        id: `step-${Date.now()}`,
        name: getStepTypeLabel(type),
        type,
        position: { x, y },
        dependencies: [],
        config: {
          resources: {
            cpuCores: 8,
            memoryGB: 32,
            gpuCount: type === 'model-training' ? 2 : undefined,
            gpuType: type === 'model-training' ? 'NVIDIA A100' : undefined,
          },
        },
      };
      setSteps([...steps, newStep]);
      setSelectedStep(newStep);
      toast.success('步骤已添加');
    },
    [steps]
  );

  // 处理画布拖放
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedStepType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // 居中偏移
    const y = e.clientY - rect.top - 40;

    addStep(draggedStepType, x, y);
    setDraggedStepType(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 删除步骤
  const deleteStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
    setConnections(connections.filter((c) => c.from !== stepId && c.to !== stepId));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
    toast.success('步骤已删除');
  };

  // 更新步骤
  const updateStep = (stepId: string, updates: Partial<PipelineStep>) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
    if (selectedStep?.id === stepId) {
      setSelectedStep({ ...selectedStep, ...updates });
    }
  };

  // 添加依赖关系
  const addDependency = (fromStepId: string, toStepId: string) => {
    const toStep = steps.find((s) => s.id === toStepId);
    if (toStep && !toStep.dependencies.includes(fromStepId)) {
      updateStep(toStepId, {
        dependencies: [...toStep.dependencies, fromStepId],
      });
      setConnections([...connections, { from: fromStepId, to: toStepId }]);
      toast.success('依赖关系已添加');
    }
  };

  // 移除依赖关系
  const removeDependency = (fromStepId: string, toStepId: string) => {
    const toStep = steps.find((s) => s.id === toStepId);
    if (toStep) {
      updateStep(toStepId, {
        dependencies: toStep.dependencies.filter((d) => d !== fromStepId),
      });
      setConnections(connections.filter((c) => !(c.from === fromStepId && c.to === toStepId)));
      toast.success('依赖关系已移除');
    }
  };

  // 自动布局
  const autoLayout = () => {
    const arranged = [...steps];
    const levels: { [key: string]: number } = {};

    // 计算每个步骤的层级
    const calculateLevel = (stepId: string, visited = new Set<string>()): number => {
      if (visited.has(stepId)) return 0; // 防止循环依赖
      visited.add(stepId);

      const step = arranged.find((s) => s.id === stepId);
      if (!step || step.dependencies.length === 0) return 0;

      const maxDepLevel = Math.max(
        ...step.dependencies.map((depId) => calculateLevel(depId, visited))
      );
      return maxDepLevel + 1;
    };

    arranged.forEach((step) => {
      levels[step.id] = calculateLevel(step.id);
    });

    // 按层级布局
    const levelGroups: { [level: number]: PipelineStep[] } = {};
    arranged.forEach((step) => {
      const level = levels[step.id];
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(step);
    });

    const updatedSteps = arranged.map((step) => {
      const level = levels[step.id];
      const indexInLevel = levelGroups[level].indexOf(step);
      const totalInLevel = levelGroups[level].length;

      return {
        ...step,
        position: {
          x: level * 250 + 50,
          y: indexInLevel * 150 + 50 + (totalInLevel > 1 ? 0 : 0),
        },
      };
    });

    setSteps(updatedSteps);
    toast.success('自动布局完成');
  };

  // 保存 Pipeline
  const handleSave = () => {
    if (!pipelineName.trim()) {
      toast.error('请输入流水线名称');
      return;
    }
    if (steps.length === 0) {
      toast.error('请至少添加一个步骤');
      return;
    }

    const pipelineData: Pipeline = {
      id: pipeline?.id || `pipeline-${Date.now()}`,
      name: pipelineName,
      description: pipelineDescription,
      version: pipeline?.version || 'v1.0.0',
      status: 'draft',
      steps,
      config: pipeline?.config || {},
      category: 'training',
      tags: pipeline?.tags || [],
      isTemplate: false,
      runCount: pipeline?.runCount || 0,
      successCount: pipeline?.successCount || 0,
      failureCount: pipeline?.failureCount || 0,
      createdBy: pipeline?.createdBy || '当前用户',
      createdAt: pipeline?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(pipelineData);
  };

  // 运行 Pipeline
  const handleRun = () => {
    if (!pipelineName.trim() || steps.length === 0) {
      toast.error('请先保存流水线');
      return;
    }
    const pipelineData: Pipeline = {
      id: pipeline?.id || `pipeline-${Date.now()}`,
      name: pipelineName,
      description: pipelineDescription,
      version: pipeline?.version || 'v1.0.0',
      status: 'draft',
      steps,
      config: pipeline?.config || {},
      category: 'training',
      tags: pipeline?.tags || [],
      isTemplate: false,
      runCount: pipeline?.runCount || 0,
      successCount: pipeline?.successCount || 0,
      failureCount: pipeline?.failureCount || 0,
      createdBy: pipeline?.createdBy || '当前用户',
      createdAt: pipeline?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onRun?.(pipelineData);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* 左侧：步骤面板 */}
      <Card className="w-64 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">步骤类型</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-2 pb-4">
            {STEP_TYPES.map((stepType) => {
              const Icon = stepType.icon;
              return (
                <div
                  key={stepType.type}
                  draggable
                  onDragStart={() => setDraggedStepType(stepType.type)}
                  onDragEnd={() => setDraggedStepType(null)}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow"
                >
                  <div className={`w-8 h-8 rounded-lg ${stepType.color} flex items-center justify-center text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{getStepTypeLabel(stepType.type)}</span>
                </div>
              );
            })}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* 中间：画布 */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="流水线名称"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                className="font-medium"
              />
              <Input
                placeholder="流水线描述"
                value={pipelineDescription}
                onChange={(e) => setPipelineDescription(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={autoLayout}>
                <RefreshCw className="w-4 h-4 mr-2" />
                自动布局
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button size="sm" onClick={handleRun} className="bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-2" />
                运行
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative overflow-hidden">
          <div
            ref={canvasRef}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            className="w-full h-full bg-slate-50 relative"
            style={{
              backgroundImage:
                'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* 绘制连接线 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn, index) => {
                const fromStep = steps.find((s) => s.id === conn.from);
                const toStep = steps.find((s) => s.id === conn.to);
                if (!fromStep || !toStep) return null;

                const x1 = fromStep.position.x + 120;
                const y1 = fromStep.position.y + 40;
                const x2 = toStep.position.x;
                const y2 = toStep.position.y + 40;

                return (
                  <g key={index}>
                    <path
                      d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
                </marker>
              </defs>
            </svg>

            {/* 渲染步骤节点 */}
            {steps.map((step) => {
              const stepTypeConfig = STEP_TYPES.find((t) => t.type === step.type);
              const Icon = stepTypeConfig?.icon || SettingsIcon;
              const isSelected = selectedStep?.id === step.id;

              return (
                <div
                  key={step.id}
                  className={`absolute cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{
                    left: step.position.x,
                    top: step.position.y,
                    width: 120,
                  }}
                  onClick={() => setSelectedStep(step)}
                >
                  <Card className="bg-white">
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-lg ${stepTypeConfig?.color} flex items-center justify-center text-white`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-medium text-center break-words w-full">
                          {step.name}
                        </div>
                        {step.status && (
                          <Badge variant="outline" className="text-xs">
                            {step.status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* 空状态 */}
            {steps.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">拖拽左侧步骤到画布开始创建流水线</p>
                  <p className="text-sm text-slate-500">或点击"自动布局"按钮优化布局</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 右侧：属性面板 */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedStep ? '步骤配置' : '属性面板'}
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-4 pb-4">
            {selectedStep ? (
              <>
                <div>
                  <Label htmlFor="stepName">步骤名称</Label>
                  <Input
                    id="stepName"
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="stepDescription">描述</Label>
                  <Textarea
                    id="stepDescription"
                    value={selectedStep.description || ''}
                    onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>步骤类型</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{getStepTypeLabel(selectedStep.type)}</Badge>
                  </div>
                </div>

                <div>
                  <Label>依赖步骤</Label>
                  <div className="mt-2 space-y-2">
                    <Select
                      onValueChange={(value) => addDependency(value, selectedStep.id)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="添加依赖步骤" />
                      </SelectTrigger>
                      <SelectContent>
                        {steps
                          .filter(
                            (s) =>
                              s.id !== selectedStep.id &&
                              !selectedStep.dependencies.includes(s.id)
                          )
                          .map((step) => (
                            <SelectItem key={step.id} value={step.id}>
                              {step.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedStep.dependencies.map((depId) => {
                      const depStep = steps.find((s) => s.id === depId);
                      return depStep ? (
                        <div
                          key={depId}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded"
                        >
                          <span className="text-sm">{depStep.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDependency(depId, selectedStep.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-base">资源配置</Label>
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label htmlFor="cpuCores" className="text-sm">CPU 核数</Label>
                      <Input
                        id="cpuCores"
                        type="number"
                        min={1}
                        max={128}
                        value={selectedStep.config.resources?.cpuCores || 8}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            config: {
                              ...selectedStep.config,
                              resources: {
                                ...selectedStep.config.resources,
                                cpuCores: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="memoryGB" className="text-sm">内存 (GB)</Label>
                      <Input
                        id="memoryGB"
                        type="number"
                        min={1}
                        max={512}
                        value={selectedStep.config.resources?.memoryGB || 32}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            config: {
                              ...selectedStep.config,
                              resources: {
                                ...selectedStep.config.resources,
                                memoryGB: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    {(selectedStep.type === 'model-training' ||
                      selectedStep.type === 'model-evaluation') && (
                      <>
                        <div>
                          <Label htmlFor="gpuType" className="text-sm">GPU 型号</Label>
                          <Select
                            value={selectedStep.config.resources?.gpuType || 'NVIDIA A100'}
                            onValueChange={(value) =>
                              updateStep(selectedStep.id, {
                                config: {
                                  ...selectedStep.config,
                                  resources: {
                                    ...selectedStep.config.resources,
                                    gpuType: value,
                                  },
                                },
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GPU_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="gpuCount" className="text-sm">GPU 数量</Label>
                          <Input
                            id="gpuCount"
                            type="number"
                            min={1}
                            max={8}
                            value={selectedStep.config.resources?.gpuCount || 1}
                            onChange={(e) =>
                              updateStep(selectedStep.id, {
                                config: {
                                  ...selectedStep.config,
                                  resources: {
                                    ...selectedStep.config.resources,
                                    gpuCount: parseInt(e.target.value),
                                  },
                                },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteStep(selectedStep.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除步骤
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <SettingsIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">选择一个步骤来配置属性</p>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
