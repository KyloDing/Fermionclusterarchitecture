import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, FileText } from 'lucide-react';
import { useState } from 'react';

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    {
      id: 1,
      timestamp: '2024-11-10 15:45:23',
      user: '张三',
      action: '创建训练任务',
      resource: 'job-2024-001',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: 2,
      timestamp: '2024-11-10 15:30:12',
      user: '李四',
      action: '删除数据集',
      resource: 'dataset-legacy-001',
      ip: '192.168.1.105',
      status: 'success',
    },
    {
      id: 3,
      timestamp: '2024-11-10 15:15:45',
      user: '王五',
      action: '修改用户权限',
      resource: 'user-123',
      ip: '192.168.1.110',
      status: 'success',
    },
    {
      id: 4,
      timestamp: '2024-11-10 14:50:30',
      user: '赵六',
      action: '登录系统',
      resource: '-',
      ip: '192.168.1.115',
      status: 'failed',
    },
    {
      id: 5,
      timestamp: '2024-11-10 14:30:18',
      user: '系统',
      action: '节点下线',
      resource: 'GPU-Node-04',
      ip: '192.168.1.104',
      status: 'warning',
    },
  ];

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const configs = {
      success: { label: '成功', className: 'bg-green-50 text-green-700 border-green-200' },
      failed: { label: '失败', className: 'bg-red-50 text-red-700 border-red-200' },
      warning: { label: '警告', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    };
    const config = configs[status as keyof typeof configs] || configs.success;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">审计日志</h1>
        <p className="text-slate-600">查看系统操作记录和安全审计信息</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">今日操作</p>
            <p className="text-2xl">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">成功</p>
            <p className="text-2xl text-green-600">{logs.filter((l) => l.status === 'success').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">失败</p>
            <p className="text-2xl text-red-600">{logs.filter((l) => l.status === 'failed').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">警告</p>
            <p className="text-2xl text-orange-600">{logs.filter((l) => l.status === 'warning').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>操作日志</CardTitle>
              <CardDescription>系统所有操作的详细记录</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索日志..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-sm text-slate-600">{log.resource}</TableCell>
                  <TableCell className="text-sm text-slate-600">{log.ip}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
