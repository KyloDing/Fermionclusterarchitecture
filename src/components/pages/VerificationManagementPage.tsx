import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { verificationService, VerificationApplication } from '../../services/verificationService';

export default function VerificationManagementPage() {
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VerificationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'enterprise' | 'personal'>('all');
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    enterprise: 0,
    personal: 0,
  });

  // 审核对话框
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<VerificationApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [applicationsData, statsData] = await Promise.all([
        verificationService.getAllVerifications(),
        verificationService.getVerificationStats(),
      ]);
      setApplications(applicationsData);
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let results = [...applications];

    // 状态筛选
    if (statusFilter !== 'all') {
      results = results.filter(app => app.status === statusFilter);
    }

    // 类型筛选
    if (typeFilter !== 'all') {
      results = results.filter(app => app.type === typeFilter);
    }

    // 搜索
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(app =>
        app.userName.toLowerCase().includes(search) ||
        app.userEmail.toLowerCase().includes(search) ||
        (app.enterpriseData?.companyName || '').toLowerCase().includes(search) ||
        (app.personalData?.realName || '').toLowerCase().includes(search) ||
        app.id.toLowerCase().includes(search)
      );
    }

    setFilteredApplications(results);
  };

  const handleOpenReview = (application: VerificationApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setRejectionReason('');
    setReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedApplication) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('请填写驳回原因');
      return;
    }

    setReviewing(true);
    try {
      if (reviewAction === 'approve') {
        await verificationService.approveVerification(selectedApplication.id);
        toast.success('已通过认证申请');
      } else {
        await verificationService.rejectVerification(selectedApplication.id, rejectionReason);
        toast.success('已驳回认证申请');
      }

      setReviewDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('操作失败，请稍后重试');
    } finally {
      setReviewing(false);
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

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl text-slate-900 mb-2">实名认证审核</h1>
        <p className="text-slate-600">审核用户的企业认证和个人认证申请</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">总申请数</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">待审核</p>
                <p className="text-2xl text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已通过</p>
                <p className="text-2xl text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已驳回</p>
                <p className="text-2xl text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">企业认证</p>
                <p className="text-2xl text-blue-600">{stats.enterprise}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">个人认证</p>
                <p className="text-2xl text-purple-600">{stats.personal}</p>
              </div>
              <User className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 待审核提示 */}
      {stats.pending > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Clock className="w-5 h-5 text-yellow-600" />
          <AlertDescription>
            <strong className="text-yellow-900">您有 {stats.pending} 个待审核的认证申请</strong>
            <p className="mt-1 text-slate-700">请及时处理用户的认证申请，以免影响用户使用体验</p>
          </AlertDescription>
        </Alert>
      )}

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>认证申请列表</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="rejected">已驳回</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="enterprise">企业认证</SelectItem>
                  <SelectItem value="personal">个人认证</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索用户、公司..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-slate-600">加载中...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">暂无符合条件的申请</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(app => (
                <Card key={app.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* 申请头部 */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg text-slate-900">
                              {app.type === 'enterprise'
                                ? app.enterpriseData?.companyName
                                : app.personalData?.realName}
                            </span>
                            {getTypeBadge(app.type)}
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>申请ID: {app.id}</span>
                            <span>用户: {app.userName}</span>
                            <span>邮箱: {app.userEmail}</span>
                          </div>
                          <div className="text-sm text-slate-600">
                            提交时间: {app.submittedAt}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-600 hover:bg-green-50"
                              onClick={() => handleOpenReview(app, 'approve')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              通过
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleOpenReview(app, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              驳回
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 认证详情 */}
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-900">认证信息</span>
                        </div>
                        {app.type === 'enterprise' && app.enterpriseData && (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-600">统一社会信用代码：</span>
                              <span className="text-slate-900 font-mono">{app.enterpriseData.creditCode}</span>
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
                            {app.enterpriseData.contactEmail && (
                              <div className="col-span-2">
                                <span className="text-slate-600">联系邮箱：</span>
                                <span className="text-slate-900">{app.enterpriseData.contactEmail}</span>
                              </div>
                            )}
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
                              <span className="text-slate-900 font-mono">
                                {app.personalData.idNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">联系电话：</span>
                              <span className="text-slate-900">{app.personalData.contactPhone}</span>
                            </div>
                            {app.personalData.contactEmail && (
                              <div>
                                <span className="text-slate-600">联系邮箱：</span>
                                <span className="text-slate-900">{app.personalData.contactEmail}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 审核信息 */}
                      {(app.status === 'approved' || app.status === 'rejected') && (
                        <div className="bg-slate-50 rounded-lg p-3 text-sm">
                          <div className="grid grid-cols-2 gap-2 text-slate-700">
                            <div>
                              <span className="text-slate-600">审核时间：</span>
                              {app.reviewedAt}
                            </div>
                            <div>
                              <span className="text-slate-600">审核人员：</span>
                              {app.reviewedBy}
                            </div>
                            {app.status === 'approved' && (
                              <div className="col-span-2 text-green-700">
                                <span className="text-slate-600">已加入工作组：</span>
                                <strong>
                                  {app.type === 'enterprise'
                                    ? `/company/${app.enterpriseData?.companyName}`
                                    : `/person/${app.personalData?.realName}`}
                                </strong>
                              </div>
                            )}
                            {app.status === 'rejected' && app.rejectionReason && (
                              <div className="col-span-2 text-red-700">
                                <span className="text-slate-600">驳回原因：</span>
                                {app.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 审核对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? '通过认证申请' : '驳回认证申请'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? '审核通过后，系统将自动为用户创建并加入对应的工作组'
                : '请填写驳回原因，以便用户了解并改进'}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <Alert className={reviewAction === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <AlertDescription className="text-sm">
                  <div className="space-y-1">
                    <p>
                      <strong>申请人：</strong>
                      {selectedApplication.userName} ({selectedApplication.userEmail})
                    </p>
                    <p>
                      <strong>认证类型：</strong>
                      {selectedApplication.type === 'enterprise' ? '企业认证' : '个人认证'}
                    </p>
                    <p>
                      <strong>认证名称：</strong>
                      {selectedApplication.type === 'enterprise'
                        ? selectedApplication.enterpriseData?.companyName
                        : selectedApplication.personalData?.realName}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {reviewAction === 'approve' && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-slate-700">
                    <strong className="text-blue-900">审核通过后系统将自动：</strong>
                    <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                      <li>
                        创建工作组：
                        <strong>
                          {selectedApplication.type === 'enterprise'
                            ? `/company/${selectedApplication.enterpriseData?.companyName}`
                            : `/person/${selectedApplication.personalData?.realName}`}
                        </strong>
                      </li>
                      <li>将用户加入该工作组</li>
                      <li>将用户从 visitor 组移除</li>
                      <li>用户将获得对应的业务权限</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {reviewAction === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">
                    驳回原因 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="请详细说明驳回原因，例如：信息不完整、证件不清晰等"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={reviewing}>
              取消
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewing || (reviewAction === 'reject' && !rejectionReason.trim())}
              className={reviewAction === 'approve' ? '' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewing ? '处理中...' : reviewAction === 'approve' ? '确认通过' : '确认驳回'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
