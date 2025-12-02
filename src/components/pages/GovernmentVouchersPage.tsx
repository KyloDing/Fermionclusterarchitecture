import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
  Building2,
  Download,
  Eye,
  Send,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Voucher {
  id: string;
  voucherCode: string;
  programName: string;
  issuer: string; // 发放单位
  category: 'national' | 'provincial' | 'municipal' | 'special'; // 国家级、省级、市级、专项
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'used' | 'frozen';
  applicableScopes: string[]; // 适用范围
  restrictions: string; // 使用限制说明
  appliedDate: string;
  approvedDate?: string;
  notes?: string;
}

interface VoucherApplication {
  id: string;
  programName: string;
  programCode: string;
  category: string;
  requestedAmount: number;
  projectName: string;
  projectDescription: string;
  organization: string;
  applicant: string;
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submitDate?: string;
  reviewDate?: string;
  rejectReason?: string;
  expectedUsage: string;
}

interface VoucherUsageRecord {
  id: string;
  voucherCode: string;
  programName: string;
  amount: number;
  resourceType: string;
  orderNo: string;
  usageDate: string;
  description: string;
}

export default function GovernmentVouchersPage() {
  const [activeTab, setActiveTab] = useState('my-vouchers');
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock数据 - 我的算力券
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([
    {
      id: '1',
      voucherCode: 'GOV-2024-AI-001',
      programName: '国家人工智能算力支持计划',
      issuer: '国家科技部',
      category: 'national',
      totalAmount: 100000,
      usedAmount: 35000,
      remainingAmount: 65000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      applicableScopes: ['AI训练', '模型推理', '数据处理'],
      restrictions: '仅限用于人工智能相关计算任务，不可转让',
      appliedDate: '2023-12-01',
      approvedDate: '2023-12-15',
    },
    {
      id: '2',
      voucherCode: 'GOV-2024-EDU-023',
      programName: '高校科研算力补贴项目',
      issuer: '教育部',
      category: 'provincial',
      totalAmount: 50000,
      usedAmount: 48000,
      remainingAmount: 2000,
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      status: 'active',
      applicableScopes: ['科研计算', '数据分析'],
      restrictions: '限高校科研项目使用',
      appliedDate: '2024-02-10',
      approvedDate: '2024-02-20',
    },
    {
      id: '3',
      voucherCode: 'GOV-2023-TECH-156',
      programName: '科技创新企业扶持计划',
      issuer: '省科技厅',
      category: 'provincial',
      totalAmount: 30000,
      usedAmount: 30000,
      remainingAmount: 0,
      startDate: '2023-07-01',
      endDate: '2023-12-31',
      status: 'used',
      applicableScopes: ['技术研发', 'AI训练'],
      restrictions: '限科技型中小企业使用',
      appliedDate: '2023-06-01',
      approvedDate: '2023-06-20',
    },
  ]);

  // Mock数据 - 可申请的项目
  const availablePrograms = [
    {
      id: '1',
      name: '2024年度国家算力补贴计划',
      code: 'NATIONAL-2024-AI',
      category: 'national',
      issuer: '国家发改委',
      maxAmount: 200000,
      deadline: '2024-12-31',
      status: 'open',
      description: '面向全国高新技术企业和科研机构，支持人工智能、大数据等领域的算力需求',
      requirements: ['国家高新技术企业认证', '拥有明确的研发项目计划', '提供详细的算力使用方案'],
    },
    {
      id: '2',
      name: '智能制造算力支持专项',
      code: 'SPECIAL-2024-MANU',
      category: 'special',
      issuer: '工信部',
      maxAmount: 150000,
      deadline: '2024-09-30',
      status: 'open',
      description: '专项支持智能制造领域的算力需求，包括工业视觉、预测性维护等应用场景',
      requirements: ['制造业相关企业', '智能制造项目立项文件', '技术方案说明'],
    },
    {
      id: '3',
      name: '医疗健康AI算力券项目',
      code: 'HEALTH-2024-AI',
      category: 'municipal',
      issuer: '市卫健委',
      maxAmount: 80000,
      deadline: '2024-08-31',
      status: 'open',
      description: '支持医疗健康领域的AI研发和应用，包括医学影像分析、药物研发等',
      requirements: ['医疗相关资质', '医疗AI项目证明', '数据安全保障方案'],
    },
  ];

  // Mock数据 - 申请记录
  const [applications, setApplications] = useState<VoucherApplication[]>([
    {
      id: '1',
      programName: '2024年度国家算力补贴计划',
      programCode: 'NATIONAL-2024-AI',
      category: 'national',
      requestedAmount: 100000,
      projectName: '大规模语言模型训练项目',
      projectDescription: '基于Transformer架构的中文大语言模型预训练和微调研究',
      organization: '费米科技有限公司',
      applicant: '张三',
      status: 'reviewing',
      submitDate: '2024-11-01',
    },
    {
      id: '2',
      programName: '智能制造算力支持专项',
      programCode: 'SPECIAL-2024-MANU',
      category: 'special',
      requestedAmount: 80000,
      projectName: '工业质检AI系统',
      projectDescription: '基于计算机视觉的工业产品质量检测系统研发',
      organization: '费米科技有限公司',
      applicant: '李四',
      status: 'approved',
      submitDate: '2024-10-15',
      reviewDate: '2024-10-25',
    },
  ]);

  // Mock数据 - 使用记录
  const usageRecords: VoucherUsageRecord[] = [
    {
      id: '1',
      voucherCode: 'GOV-2024-AI-001',
      programName: '国家人工智能算力支持计划',
      amount: 5000,
      resourceType: 'GPU训练任务',
      orderNo: 'ORD-2024110101',
      usageDate: '2024-11-01',
      description: 'BERT模型训练任务，使用8卡A100 GPU，运行时间12小时',
    },
    {
      id: '2',
      voucherCode: 'GOV-2024-AI-001',
      programName: '国家人工智能算力支持计划',
      amount: 12000,
      resourceType: '推理服务',
      orderNo: 'ORD-2024110215',
      usageDate: '2024-11-02',
      description: '图像识别推理服务部署，使用4卡T4 GPU，运行时间24小时',
    },
    {
      id: '3',
      voucherCode: 'GOV-2024-EDU-023',
      programName: '高校科研算力补贴项目',
      amount: 8000,
      resourceType: '数据处理',
      orderNo: 'ORD-2024110320',
      usageDate: '2024-11-03',
      description: '大规模数据集预处理，使用32核CPU集群',
    },
  ];

  // 申请表单状态
  const [applicationForm, setApplicationForm] = useState({
    programId: '',
    requestedAmount: '',
    projectName: '',
    projectDescription: '',
    organization: '',
    applicant: '',
    contactPhone: '',
    contactEmail: '',
    expectedUsage: '',
    attachments: [] as File[],
  });

  const handleApplyVoucher = () => {
    // 模拟提交申请
    const newApplication: VoucherApplication = {
      id: Date.now().toString(),
      programName: availablePrograms.find(p => p.id === applicationForm.programId)?.name || '',
      programCode: availablePrograms.find(p => p.id === applicationForm.programId)?.code || '',
      category: 'national',
      requestedAmount: parseFloat(applicationForm.requestedAmount),
      projectName: applicationForm.projectName,
      projectDescription: applicationForm.projectDescription,
      organization: applicationForm.organization,
      applicant: applicationForm.applicant,
      status: 'submitted',
      submitDate: new Date().toISOString().split('T')[0],
      expectedUsage: applicationForm.expectedUsage,
    };

    setApplications([newApplication, ...applications]);
    setShowApplyDialog(false);
    
    // 重置表单
    setApplicationForm({
      programId: '',
      requestedAmount: '',
      projectName: '',
      projectDescription: '',
      organization: '',
      applicant: '',
      contactPhone: '',
      contactEmail: '',
      expectedUsage: '',
      attachments: [],
    });

    toast.success('算力券申请已提交，请等待审核');
  };

  const getCategoryBadge = (category: string) => {
    const configs = {
      national: { label: '国家级', className: 'bg-red-100 text-red-700 border-red-200' },
      provincial: { label: '省级', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      municipal: { label: '市级', className: 'bg-green-100 text-green-700 border-green-200' },
      special: { label: '专项', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    };
    const config = configs[category as keyof typeof configs] || configs.municipal;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: '使用中', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      expired: { label: '已过期', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
      used: { label: '已用完', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
      frozen: { label: '已冻结', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
      submitted: { label: '已提交', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send },
      reviewing: { label: '审核中', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      approved: { label: '已批准', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      rejected: { label: '已拒绝', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      open: { label: '开放申请', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      closed: { label: '已截止', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
    };
    const config = configs[status as keyof typeof configs] || configs.draft;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 过滤算力券
  const filteredVouchers = myVouchers.filter(voucher => {
    const matchSearch = voucher.voucherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       voucher.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || voucher.status === filterStatus;
    const matchCategory = filterCategory === 'all' || voucher.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  // 统计数据
  const stats = {
    totalVouchers: myVouchers.filter(v => v.status === 'active').length,
    totalAmount: myVouchers.reduce((sum, v) => sum + v.totalAmount, 0),
    remainingAmount: myVouchers.reduce((sum, v) => sum + v.remainingAmount, 0),
    usedAmount: myVouchers.reduce((sum, v) => sum + v.usedAmount, 0),
  };

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">政府算力券管理</h1>
          <p className="text-slate-600">管理和使用政府提供的算力补贴券</p>
        </div>
        <Button onClick={() => setShowApplyDialog(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          申请算力券
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">有效算力券</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.totalVouchers}</p>
            <p className="text-xs text-slate-500 mt-1">张</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">总补贴额度</p>
            <p className="text-2xl font-semibold text-blue-600">{formatCurrency(stats.totalAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">可用余额</p>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(stats.remainingAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">已使用金额</p>
            <p className="text-2xl font-semibold text-orange-600">{formatCurrency(stats.usedAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区 - 标签页 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="my-vouchers">我的算力券</TabsTrigger>
              <TabsTrigger value="available-programs">可申请项目</TabsTrigger>
              <TabsTrigger value="applications">申请记录</TabsTrigger>
              <TabsTrigger value="usage-history">使用记录</TabsTrigger>
            </TabsList>

            {/* 我的算力券 */}
            <TabsContent value="my-vouchers" className="space-y-4">
              {/* 搜索和筛选 */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索算力券代码或项目名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">使用中</SelectItem>
                    <SelectItem value="used">已用完</SelectItem>
                    <SelectItem value="expired">已过期</SelectItem>
                    <SelectItem value="frozen">已冻结</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="类别筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    <SelectItem value="national">国家级</SelectItem>
                    <SelectItem value="provincial">省级</SelectItem>
                    <SelectItem value="municipal">市级</SelectItem>
                    <SelectItem value="special">专项</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 算力券列表 */}
              <div className="space-y-3">
                {filteredVouchers.map((voucher) => (
                  <Card key={voucher.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{voucher.programName}</h3>
                            {getCategoryBadge(voucher.category)}
                            {getStatusBadge(voucher.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Ticket className="w-4 h-4" />
                              {voucher.voucherCode}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {voucher.issuer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              有效期至 {voucher.endDate}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVoucher(voucher);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          详情
                        </Button>
                      </div>

                      {/* 使用进度 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">使用进度</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(voucher.usedAmount)} / {formatCurrency(voucher.totalAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(voucher.usedAmount / voucher.totalAmount) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>已使用 {((voucher.usedAmount / voucher.totalAmount) * 100).toFixed(1)}%</span>
                          <span>剩余 {formatCurrency(voucher.remainingAmount)}</span>
                        </div>
                      </div>

                      {/* 适用范围 */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {voucher.applicableScopes.map((scope, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredVouchers.length === 0 && (
                  <div className="text-center py-12">
                    <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">暂无算力券</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 可申请项目 */}
            <TabsContent value="available-programs" className="space-y-4">
              <div className="grid gap-4">
                {availablePrograms.map((program) => (
                  <Card key={program.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{program.name}</h3>
                            {getCategoryBadge(program.category)}
                            {getStatusBadge(program.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {program.code}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {program.issuer}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              最高 {formatCurrency(program.maxAmount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              截止 {program.deadline}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{program.description}</p>
                          
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-700 mb-2">申请要求：</p>
                            <ul className="space-y-1">
                              {program.requirements.map((req, index) => (
                                <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setApplicationForm({ ...applicationForm, programId: program.id });
                            setShowApplyDialog(true);
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          立即申请
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          下载申请表
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 申请记录 */}
            <TabsContent value="applications" className="space-y-4">
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{app.programName}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600">项目名称：</span>
                              <span className="text-slate-900">{app.projectName}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">申请金额：</span>
                              <span className="font-medium text-blue-600">{formatCurrency(app.requestedAmount)}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">申请单位：</span>
                              <span className="text-slate-900">{app.organization}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">申请人：</span>
                              <span className="text-slate-900">{app.applicant}</span>
                            </div>
                            {app.submitDate && (
                              <div>
                                <span className="text-slate-600">提交时间：</span>
                                <span className="text-slate-900">{app.submitDate}</span>
                              </div>
                            )}
                            {app.reviewDate && (
                              <div>
                                <span className="text-slate-600">审核时间：</span>
                                <span className="text-slate-900">{app.reviewDate}</span>
                              </div>
                            )}
                          </div>
                          {app.rejectReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-xs font-medium text-red-700 mb-1">拒绝原因：</p>
                              <p className="text-xs text-red-600">{app.rejectReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {applications.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">暂无申请记录</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 使用记录 */}
            <TabsContent value="usage-history" className="space-y-4">
              <div className="space-y-3">
                {usageRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{record.programName}</h4>
                              <p className="text-sm text-slate-600">{record.voucherCode}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-slate-600">使用金额：</span>
                              <span className="font-medium text-purple-600">{formatCurrency(record.amount)}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">资源类型：</span>
                              <span className="text-slate-900">{record.resourceType}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">订单号：</span>
                              <span className="text-slate-900">{record.orderNo}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">使用时间：</span>
                              <span className="text-slate-900">{record.usageDate}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-600">{record.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {usageRecords.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">暂无使用记录</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* 申请对话框 */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>申请政府算力券</DialogTitle>
            <DialogDescription>
              请填写完整的申请信息，审核通过后算力券将自动发放到您的账户
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择申请项目 *</Label>
              <Select
                value={applicationForm.programId}
                onValueChange={(value) => setApplicationForm({ ...applicationForm, programId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择申请项目" />
                </SelectTrigger>
                <SelectContent>
                  {availablePrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name} - {program.issuer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>申请单位 *</Label>
                <Input
                  placeholder="请输入申请单位名称"
                  value={applicationForm.organization}
                  onChange={(e) => setApplicationForm({ ...applicationForm, organization: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>申请金额 *</Label>
                <Input
                  type="number"
                  placeholder="请输入申请金额"
                  value={applicationForm.requestedAmount}
                  onChange={(e) => setApplicationForm({ ...applicationForm, requestedAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>申请人 *</Label>
                <Input
                  placeholder="请输入申请人姓名"
                  value={applicationForm.applicant}
                  onChange={(e) => setApplicationForm({ ...applicationForm, applicant: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>联系电话 *</Label>
                <Input
                  placeholder="请输入联系电话"
                  value={applicationForm.contactPhone}
                  onChange={(e) => setApplicationForm({ ...applicationForm, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>联系邮箱 *</Label>
              <Input
                type="email"
                placeholder="请输入联系邮箱"
                value={applicationForm.contactEmail}
                onChange={(e) => setApplicationForm({ ...applicationForm, contactEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>项目名称 *</Label>
              <Input
                placeholder="请输入项目名称"
                value={applicationForm.projectName}
                onChange={(e) => setApplicationForm({ ...applicationForm, projectName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>项目描述 *</Label>
              <Textarea
                placeholder="请详细描述项目背景、目标和技术方案"
                rows={4}
                value={applicationForm.projectDescription}
                onChange={(e) => setApplicationForm({ ...applicationForm, projectDescription: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>预期使用说明 *</Label>
              <Textarea
                placeholder="请说明算力的预期使用场景、资源需求和使用计划"
                rows={3}
                value={applicationForm.expectedUsage}
                onChange={(e) => setApplicationForm({ ...applicationForm, expectedUsage: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>申请材料</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-1">点击上传或拖拽文件至此处</p>
                <p className="text-xs text-slate-500">支持 PDF、Word、图片格式，单个文件不超过 10MB</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">申请提示</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 请确保填写的信息真实准确，虚假信息将导致申请被拒绝</li>
                    <li>• 申请提交后将进入审核流程，通常需要 5-10 个工作日</li>
                    <li>• 审核结果将通过邮件和站内消息通知</li>
                    <li>• 如有疑问，请联系客服：400-xxx-xxxx</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleApplyVoucher}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={
                !applicationForm.programId ||
                !applicationForm.organization ||
                !applicationForm.requestedAmount ||
                !applicationForm.applicant ||
                !applicationForm.contactPhone ||
                !applicationForm.contactEmail ||
                !applicationForm.projectName ||
                !applicationForm.projectDescription ||
                !applicationForm.expectedUsage
              }
            >
              提交申请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 算力券详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>算力券详情</DialogTitle>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">算力券代码：</span>
                    <span className="text-slate-900 font-mono">{selectedVoucher.voucherCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">项目名称：</span>
                    <span className="text-slate-900">{selectedVoucher.programName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">发放单位：</span>
                    <span className="text-slate-900">{selectedVoucher.issuer}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">级别类别：</span>
                    {getCategoryBadge(selectedVoucher.category)}
                  </div>
                  <div>
                    <span className="text-slate-600">当前状态：</span>
                    {getStatusBadge(selectedVoucher.status)}
                  </div>
                  <div>
                    <span className="text-slate-600">有效期：</span>
                    <span className="text-slate-900">{selectedVoucher.startDate} 至 {selectedVoucher.endDate}</span>
                  </div>
                </div>
              </div>

              {/* 额度信息 */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">额度信息</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">总额度</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(selectedVoucher.totalAmount)}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">已使用</p>
                      <p className="font-semibold text-orange-600">{formatCurrency(selectedVoucher.usedAmount)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">剩余</p>
                      <p className="font-semibold text-green-600">{formatCurrency(selectedVoucher.remainingAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 适用范围 */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">适用范围</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVoucher.applicableScopes.map((scope, index) => (
                    <Badge key={index} variant="secondary">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 使用限制 */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">使用限制</h3>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{selectedVoucher.restrictions}</p>
                </div>
              </div>

              {/* 申请信息 */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">申请信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">申请日期：</span>
                    <span className="text-slate-900">{selectedVoucher.appliedDate}</span>
                  </div>
                  {selectedVoucher.approvedDate && (
                    <div>
                      <span className="text-slate-600">批准日期：</span>
                      <span className="text-slate-900">{selectedVoucher.approvedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Upload icon component (missing from lucide-react import)
function Upload({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
