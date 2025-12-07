import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react';
import { VerificationApplicationDialog } from '../dialogs/VerificationApplicationDialog';
import { verificationService, VerificationApplication } from '../../services/verificationService';

export default function MyVerificationPage() {
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // 实际应该从认证上下文获取当前用户ID
      const data = await verificationService.getUserVerifications('current-user-id');
      setApplications(data);
    } catch (error) {
      console.error('加载认证记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: {
        label: '待审核',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock,
      },
      approved: {
        label: '已通过',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
      },
      rejected: {
        label: '已驳回',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
      },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type === 'enterprise') {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          <Building2 className="w-3 h-3 mr-1" />
          企业认证
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-purple-600 border-purple-300">
        <User className="w-3 h-3 mr-1" />
        个人认证
      </Badge>
    );
  };

  // 检查是否有待审核的申请
  const hasPendingApplication = applications.some(app => app.status === 'pending');

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-slate-900 mb-2">我的认证</h1>
          <p className="text-slate-600">查看您的实名认证记录和当前状态</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={hasPendingApplication}>
          <Plus className="w-4 h-4 mr-2" />
          申请认证
        </Button>
      </div>

      {/* 提示信息 */}
      {applications.length === 0 && !loading && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <AlertDescription>
            <strong className="text-blue-900">您还未进行实名认证</strong>
            <div className="mt-2 text-slate-700 space-y-1">
              <p>• 完成实名认证后，您将获得更多业务权限和资源访问能力</p>
              <p>• 支持企业认证和个人认证两种方式</p>
              <p>• 认证信息将被加密存储，严格保护您的隐私</p>
            </div>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => setDialogOpen(true)}
            >
              立即认证
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {hasPendingApplication && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Clock className="w-5 h-5 text-yellow-600" />
          <AlertDescription>
            <strong className="text-yellow-900">您有认证申请正在审核中</strong>
            <p className="mt-1 text-slate-700">
              管理员正在审核您的认证申请，请耐心等待。审核结果将通过系统消息通知您。
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* 认证记录列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-600">加载中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {app.type === 'enterprise'
                          ? app.enterpriseData?.companyName
                          : app.personalData?.realName}
                      </CardTitle>
                      {getTypeBadge(app.type)}
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>申请ID: {app.id}</span>
                      <span>提交时间: {app.submittedAt}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 认证信息 */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-900">认证信息</span>
                  </div>
                  {app.type === 'enterprise' && app.enterpriseData && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">统一社会信用代码：</span>
                        <span className="text-slate-900">{app.enterpriseData.creditCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">公司名称：</span>
                        <span className="text-slate-900">{app.enterpriseData.companyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">联系人：</span>
                        <span className="text-slate-900">{app.enterpriseData.contactName}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">联系电话：</span>
                        <span className="text-slate-900">{app.enterpriseData.contactPhone}</span>
                      </div>
                    </div>
                  )}
                  {app.type === 'personal' && app.personalData && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">真实姓名：</span>
                        <span className="text-slate-900">{app.personalData.realName}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">身份证号：</span>
                        <span className="text-slate-900">
                          {app.personalData.idNumber.replace(/^(.{6})(.*)(.{4})$/, '$1********$3')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">联系电话：</span>
                        <span className="text-slate-900">{app.personalData.contactPhone}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 审核信息 */}
                {app.status === 'approved' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-sm">
                      <strong className="text-green-900">认证已通过</strong>
                      <div className="mt-1 text-slate-700 space-y-0.5">
                        <p>审核时间：{app.reviewedAt}</p>
                        <p>审核人员：{app.reviewedBy}</p>
                        <p className="text-green-700 mt-2">
                          ✓ 您已自动加入{' '}
                          <strong>
                            {app.type === 'enterprise'
                              ? `/company/${app.enterpriseData?.companyName}`
                              : `/person/${app.personalData?.realName}`}
                          </strong>{' '}
                          工作组
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {app.status === 'rejected' && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-sm">
                      <strong className="text-red-900">认证已驳回</strong>
                      <div className="mt-1 text-slate-700 space-y-0.5">
                        <p>审核时间：{app.reviewedAt}</p>
                        <p>审核人员：{app.reviewedBy}</p>
                        {app.rejectionReason && (
                          <p className="text-red-700 mt-2">
                            <strong>驳回原因：</strong>
                            {app.rejectionReason}
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {app.status === 'pending' && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-sm">
                      <strong className="text-yellow-900">等待管理员审核</strong>
                      <p className="mt-1 text-slate-700">
                        您的认证申请已提交，管理员将在1-3个工作日内完成审核。
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 认证申请对话框 */}
      <VerificationApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadApplications}
      />
    </div>
  );
}
