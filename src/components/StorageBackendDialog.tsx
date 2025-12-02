import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import {
  HardDrive,
  Network,
  Database,
  FolderTree,
  GitBranch,
  Cloud,
  Box,
  Link,
  Cable,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Lock,
  Server,
} from 'lucide-react';
import {
  StorageBackendType,
  StorageBackendConfig,
  getAllStorageBackendTypes,
  testStorageBackendConnection,
} from '../services/storageBackendService';
import { toast } from 'sonner@2.0.3';

interface StorageBackendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backend?: StorageBackendConfig | null;
  onConfirm: (data: any) => void;
}

export default function StorageBackendDialog({
  open,
  onOpenChange,
  backend,
  onConfirm,
}: StorageBackendDialogProps) {
  const isEditing = !!backend;
  const backendTypes = getAllStorageBackendTypes();

  // 基本信息
  const [name, setName] = useState('');
  const [type, setType] = useState<StorageBackendType>('local');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);

  // 配置信息（根据类型不同而不同）
  const [config, setConfig] = useState<Record<string, any>>({});

  // 测试状态
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      if (backend) {
        setName(backend.name);
        setType(backend.type);
        setDescription(backend.description || '');
        setEnabled(backend.enabled);
        setConfig(backend.config);
      } else {
        // 重置表单
        setName('');
        setType('local');
        setDescription('');
        setEnabled(true);
        setConfig({});
        setTestResult(null);
      }
    }
  }, [open, backend]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testStorageBackendConnection(type, config);
      setTestResult(result);
      if (result.success) {
        toast.success('连接测试成功');
      } else {
        toast.error(result.message || '连接测试失败');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '连接测试失败',
      });
      toast.error('连接测试失败');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }

    const data = {
      name: name.trim(),
      type,
      description: description.trim(),
      enabled,
      config,
    };

    onConfirm(data);
    onOpenChange(false);
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const getTypeIcon = (type: StorageBackendType) => {
    const icons = {
      local: HardDrive,
      nfs: Network,
      ceph: Database,
      cephfs: FolderTree,
      glusterfs: GitBranch,
      s3: Cloud,
      minio: Box,
      iscsi: Link,
      fc: Cable,
    };
    return icons[type] || HardDrive;
  };

  const TypeIcon = getTypeIcon(type);

  // 渲染不同类型的配置表单
  const renderConfigForm = () => {
    switch (type) {
      case 'local':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="local-path">存储路径</Label>
              <Input
                id="local-path"
                value={config.path || ''}
                onChange={(e) => updateConfig('path', e.target.value)}
                placeholder="/var/lib/fermi/storage"
              />
            </div>
            <div>
              <Label htmlFor="local-maxsize">最大容量限制 (GB, 可选)</Label>
              <Input
                id="local-maxsize"
                type="number"
                value={config.maxSize ? config.maxSize / 1073741824 : ''}
                onChange={(e) =>
                  updateConfig('maxSize', e.target.value ? parseInt(e.target.value) * 1073741824 : undefined)
                }
                placeholder="留空表示无限制"
              />
            </div>
          </div>
        );

      case 'nfs':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nfs-server">NFS服务器地址</Label>
              <Input
                id="nfs-server"
                value={config.server || ''}
                onChange={(e) => updateConfig('server', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="nfs-export">导出路径</Label>
              <Input
                id="nfs-export"
                value={config.exportPath || ''}
                onChange={(e) => updateConfig('exportPath', e.target.value)}
                placeholder="/export/fermi"
              />
            </div>
            <div>
              <Label htmlFor="nfs-version">NFS版本</Label>
              <Select
                value={config.version || '4.1'}
                onValueChange={(v) => updateConfig('version', v)}
              >
                <SelectTrigger id="nfs-version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">NFSv3</SelectItem>
                  <SelectItem value="4">NFSv4</SelectItem>
                  <SelectItem value="4.1">NFSv4.1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nfs-options">挂载选项 (可选)</Label>
              <Input
                id="nfs-options"
                value={config.mountOptions || ''}
                onChange={(e) => updateConfig('mountOptions', e.target.value)}
                placeholder="rw,sync,hard"
              />
            </div>
          </div>
        );

      case 'ceph':
      case 'cephfs':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ceph-monitors">Monitor地址 (逗号分隔)</Label>
              <Input
                id="ceph-monitors"
                value={Array.isArray(config.monitors) ? config.monitors.join(',') : ''}
                onChange={(e) =>
                  updateConfig('monitors', e.target.value.split(',').map((s) => s.trim()))
                }
                placeholder="192.168.1.10:6789,192.168.1.11:6789"
              />
            </div>
            <div>
              <Label htmlFor="ceph-user">认证用户</Label>
              <Input
                id="ceph-user"
                value={config.user || ''}
                onChange={(e) => updateConfig('user', e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <Label htmlFor="ceph-secret">认证密钥</Label>
              <Input
                id="ceph-secret"
                type="password"
                value={config.secret || ''}
                onChange={(e) => updateConfig('secret', e.target.value)}
                placeholder="输入认证密钥"
              />
            </div>
            {type === 'ceph' ? (
              <div>
                <Label htmlFor="ceph-pool">Ceph池名称</Label>
                <Input
                  id="ceph-pool"
                  value={config.pool || ''}
                  onChange={(e) => updateConfig('pool', e.target.value)}
                  placeholder="fermi-rbd"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="cephfs-name">文件系统名称</Label>
                <Input
                  id="cephfs-name"
                  value={config.filesystem || ''}
                  onChange={(e) => updateConfig('filesystem', e.target.value)}
                  placeholder="cephfs"
                />
              </div>
            )}
          </div>
        );

      case 's3':
      case 'minio':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="s3-endpoint">端点地址</Label>
              <Input
                id="s3-endpoint"
                value={config.endpoint || ''}
                onChange={(e) => updateConfig('endpoint', e.target.value)}
                placeholder={type === 's3' ? 's3.amazonaws.com' : 'minio.local:9000'}
              />
            </div>
            <div>
              <Label htmlFor="s3-access-key">Access Key</Label>
              <Input
                id="s3-access-key"
                value={config.accessKey || ''}
                onChange={(e) => updateConfig('accessKey', e.target.value)}
                placeholder="访问密钥"
              />
            </div>
            <div>
              <Label htmlFor="s3-secret-key">Secret Key</Label>
              <Input
                id="s3-secret-key"
                type="password"
                value={config.secretKey || ''}
                onChange={(e) => updateConfig('secretKey', e.target.value)}
                placeholder="私密密钥"
              />
            </div>
            <div>
              <Label htmlFor="s3-region">区域 (可选)</Label>
              <Input
                id="s3-region"
                value={config.region || ''}
                onChange={(e) => updateConfig('region', e.target.value)}
                placeholder="us-east-1"
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <Label className="cursor-pointer">使用SSL/TLS</Label>
              </div>
              <Switch
                checked={config.useSSL !== false}
                onCheckedChange={(v) => updateConfig('useSSL', v)}
              />
            </div>
          </div>
        );

      case 'glusterfs':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gluster-servers">服务器地址 (逗号分隔)</Label>
              <Input
                id="gluster-servers"
                value={Array.isArray(config.servers) ? config.servers.join(',') : ''}
                onChange={(e) =>
                  updateConfig('servers', e.target.value.split(',').map((s) => s.trim()))
                }
                placeholder="192.168.1.10,192.168.1.11"
              />
            </div>
            <div>
              <Label htmlFor="gluster-volume">卷名称</Label>
              <Input
                id="gluster-volume"
                value={config.volume || ''}
                onChange={(e) => updateConfig('volume', e.target.value)}
                placeholder="gv0"
              />
            </div>
            <div>
              <Label htmlFor="gluster-options">挂载选项 (可选)</Label>
              <Input
                id="gluster-options"
                value={config.mountOptions || ''}
                onChange={(e) => updateConfig('mountOptions', e.target.value)}
                placeholder="backup-volfile-servers=192.168.1.11"
              />
            </div>
          </div>
        );

      case 'iscsi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="iscsi-portal">iSCSI Portal</Label>
              <Input
                id="iscsi-portal"
                value={config.portal || ''}
                onChange={(e) => updateConfig('portal', e.target.value)}
                placeholder="192.168.1.100:3260"
              />
            </div>
            <div>
              <Label htmlFor="iscsi-iqn">IQN</Label>
              <Input
                id="iscsi-iqn"
                value={config.iqn || ''}
                onChange={(e) => updateConfig('iqn', e.target.value)}
                placeholder="iqn.2024-01.com.example:storage"
              />
            </div>
            <div>
              <Label htmlFor="iscsi-lun">LUN编号</Label>
              <Input
                id="iscsi-lun"
                type="number"
                value={config.lun || 0}
                onChange={(e) => updateConfig('lun', parseInt(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="p-3 border rounded-lg space-y-3">
              <Label>CHAP认证 (可选)</Label>
              <Input
                placeholder="用户名"
                value={config.chapAuth?.username || ''}
                onChange={(e) =>
                  updateConfig('chapAuth', {
                    ...config.chapAuth,
                    username: e.target.value,
                  })
                }
              />
              <Input
                type="password"
                placeholder="密码"
                value={config.chapAuth?.password || ''}
                onChange={(e) =>
                  updateConfig('chapAuth', {
                    ...config.chapAuth,
                    password: e.target.value,
                  })
                }
              />
            </div>
          </div>
        );

      case 'beegfs':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="beegfs-mgmt">管理服务器地址</Label>
              <Input
                id="beegfs-mgmt"
                value={config.managementHost || ''}
                onChange={(e) => updateConfig('managementHost', e.target.value)}
                placeholder="192.168.1.50"
              />
            </div>
            <div>
              <Label htmlFor="beegfs-port">管理服务器端口 (可选)</Label>
              <Input
                id="beegfs-port"
                type="number"
                value={config.port || ''}
                onChange={(e) => updateConfig('port', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="8008"
              />
              <p className="text-xs text-slate-600 mt-1">默认端口: 8008</p>
            </div>
            <div>
              <Label htmlFor="beegfs-mount-opts">挂载选项 (可选)</Label>
              <Input
                id="beegfs-mount-opts"
                value={config.mountOptions || ''}
                onChange={(e) => updateConfig('mountOptions', e.target.value)}
                placeholder="cfgFile=/etc/beegfs/beegfs-client.conf"
              />
            </div>
            <div>
              <Label htmlFor="beegfs-client-cfg">客户端配置路径 (可选)</Label>
              <Input
                id="beegfs-client-cfg"
                value={config.clientConfig || ''}
                onChange={(e) => updateConfig('clientConfig', e.target.value)}
                placeholder="/etc/beegfs/beegfs-client.conf"
              />
            </div>
          </div>
        );

      case 'cubefs':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cubefs-masters">Master节点地址 (逗号分隔)</Label>
              <Input
                id="cubefs-masters"
                value={Array.isArray(config.masterAddr) ? config.masterAddr.join(',') : ''}
                onChange={(e) =>
                  updateConfig('masterAddr', e.target.value.split(',').map((s) => s.trim()))
                }
                placeholder="192.168.1.60:17010,192.168.1.61:17010"
              />
            </div>
            <div>
              <Label htmlFor="cubefs-vol">卷名称</Label>
              <Input
                id="cubefs-vol"
                value={config.volName || ''}
                onChange={(e) => updateConfig('volName', e.target.value)}
                placeholder="fermi-vol"
              />
            </div>
            <div>
              <Label htmlFor="cubefs-owner">所有者</Label>
              <Input
                id="cubefs-owner"
                value={config.owner || ''}
                onChange={(e) => updateConfig('owner', e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <Label htmlFor="cubefs-access-key">访问密钥 (可选)</Label>
              <Input
                id="cubefs-access-key"
                value={config.accessKey || ''}
                onChange={(e) => updateConfig('accessKey', e.target.value)}
                placeholder="输入访问密钥"
              />
            </div>
            <div>
              <Label htmlFor="cubefs-secret-key">私密密钥 (可选)</Label>
              <Input
                id="cubefs-secret-key"
                type="password"
                value={config.secretKey || ''}
                onChange={(e) => updateConfig('secretKey', e.target.value)}
                placeholder="输入私密密钥"
              />
            </div>
            <div>
              <Label htmlFor="cubefs-mount">挂载点 (可选)</Label>
              <Input
                id="cubefs-mount"
                value={config.mountPoint || ''}
                onChange={(e) => updateConfig('mountPoint', e.target.value)}
                placeholder="/mnt/cubefs"
              />
            </div>
          </div>
        );

      default:
        return (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>此存储类型暂无配置项</AlertDescription>
          </Alert>
        );
    }
  };

  const selectedTypeMeta = backendTypes.find((t) => t.type === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-600" />
            {isEditing ? '编辑存储后端' : '添加存储后端'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? '修改存储后端配置' : '配置新的存储后端服务'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="font-medium">基本信息</h3>

            <div>
              <Label htmlFor="backend-name">名称</Label>
              <Input
                id="backend-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: 生产环境Ceph集群"
              />
            </div>

            <div>
              <Label htmlFor="backend-type">存储类型</Label>
              <Select value={type} onValueChange={(v) => setType(v as StorageBackendType)}>
                <SelectTrigger id="backend-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backendTypes.map((bt) => {
                    const Icon = getTypeIcon(bt.type);
                    return (
                      <SelectItem key={bt.type} value={bt.type}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{bt.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedTypeMeta && (
                <p className="text-xs text-slate-600 mt-1">{selectedTypeMeta.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="backend-desc">描述 (可选)</Label>
              <Textarea
                id="backend-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述此存储后端的用途..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="cursor-pointer">启用此后端</Label>
                <p className="text-xs text-slate-600">禁用后将无法创建新的存储池</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>

          {/* 存储类型特性 */}
          {selectedTypeMeta && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <TypeIcon className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">{selectedTypeMeta.label} 特性</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTypeMeta.features.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-slate-600">
                支持的卷类型:{' '}
                {selectedTypeMeta.supportedVolumeTypes.map((vt) => {
                  const labels = { block: '块存储', file: '文件', object: '对象' };
                  return labels[vt];
                }).join(', ')}
              </div>
            </div>
          )}

          {/* 配置信息 */}
          <div className="space-y-4">
            <h3 className="font-medium">连接配置</h3>
            {renderConfigForm()}
          </div>

          {/* 测试连接 */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  测试连接中...
                </>
              ) : (
                <>
                  <Network className="w-4 h-4 mr-2" />
                  测试连接
                </>
              )}
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <AlertDescription>
                  {testResult.message || (testResult.success ? '连接成功' : '连接失败')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? '保存更改' : '添加后端'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}