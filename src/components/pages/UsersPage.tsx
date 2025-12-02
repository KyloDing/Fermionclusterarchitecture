import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users as UsersIcon, Plus, Shield } from 'lucide-react';

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
      tenant: '租户A',
      status: 'active',
      lastLogin: '2024-11-10 15:30',
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@example.com',
      role: 'user',
      tenant: '租户A',
      status: 'active',
      lastLogin: '2024-11-10 14:20',
    },
    {
      id: 3,
      name: '王五',
      email: 'wangwu@example.com',
      role: 'user',
      tenant: '租户B',
      status: 'active',
      lastLogin: '2024-11-09 18:45',
    },
  ];

  const roles = [
    { name: '系统管理员', permissions: 25, users: 2, color: 'bg-red-50 text-red-700 border-red-200' },
    { name: '租户管理员', permissions: 15, users: 5, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: '普通用户', permissions: 8, users: 35, color: 'bg-green-50 text-green-700 border-green-200' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 mb-2">用户与权限管理</h1>
          <p className="text-slate-600">管理用户、角色和权限</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            角色管理
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加用户
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {roles.map((role, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <h4 className="mb-3">{role.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">权限数量</p>
                  <p className="text-xl">{role.permissions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">用户数量</p>
                  <p className="text-xl">{role.users}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                查看权限
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>所有系统用户</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>租户</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role === 'admin' ? '管理员' : '用户'}</Badge>
                  </TableCell>
                  <TableCell>{user.tenant}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-50 text-green-700 border-green-200">活跃</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
