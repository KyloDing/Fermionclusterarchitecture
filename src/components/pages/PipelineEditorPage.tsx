import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import PipelineEditor from '../PipelineEditor';
import {
  getPipeline,
  createPipeline,
  updatePipeline,
  runPipeline,
  type Pipeline,
} from '../../services/pipelineService';
import { toast } from 'sonner@2.0.3';

export default function PipelineEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pipelineId = searchParams.get('id');

  const [pipeline, setPipeline] = useState<Pipeline | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pipelineId) {
      loadPipeline(pipelineId);
    }
  }, [pipelineId]);

  const loadPipeline = async (id: string) => {
    try {
      setLoading(true);
      const data = await getPipeline(id);
      if (data) {
        setPipeline(data);
      } else {
        toast.error('流水线不存在');
        navigate('/pipeline-orchestration');
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pipelineData: Pipeline) => {
    try {
      setLoading(true);
      if (pipelineId) {
        // 更新现有流水线
        await updatePipeline(pipelineId, pipelineData);
        toast.success('流水线已更新');
      } else {
        // 创建新流水线
        await createPipeline(pipelineData);
        toast.success('流水线已创建');
      }
      navigate('/pipeline-orchestration');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (pipelineData: Pipeline) => {
    try {
      setLoading(true);
      // 先保存
      let savedPipeline: Pipeline;
      if (pipelineId) {
        const updated = await updatePipeline(pipelineId, pipelineData);
        if (!updated) throw new Error('更新失败');
        savedPipeline = updated;
      } else {
        savedPipeline = await createPipeline(pipelineData);
      }
      
      // 然后运行
      await runPipeline(savedPipeline.id);
      toast.success('流水线已开始运行');
      navigate('/pipeline-orchestration');
    } catch (error) {
      toast.error('运行失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && pipelineId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/pipeline-orchestration')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="text-slate-900">
          {pipelineId ? '编辑流水线' : '创建流水线'}
        </h1>
        <p className="text-slate-600 mt-2">
          拖拽左侧步骤到画布创建流水线，点击步骤可以配置详细参数
        </p>
      </div>

      {/* Pipeline Editor */}
      <PipelineEditor
        pipeline={pipeline}
        onSave={handleSave}
        onRun={handleRun}
      />
    </div>
  );
}
