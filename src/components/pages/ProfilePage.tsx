import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  GraduationCap,
  Briefcase,
  Camera,
  Key,
  Bell,
  Globe,
  Edit,
  Save,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';

// 认证状态枚举
enum CertificationStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// 认证类型
enum CertificationType {
  EDUCATION = 'education',
  ENTERPRISE = 'enterprise',
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  
  // 用户基本信息
  const [profile, setProfile] = useState({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    department: 'AI研发部',
    position: '算法工程师',
    location: '北京市海淀区',
    joinDate: '2023-06-15',
    bio: '专注于深度学习和计算机视觉研究，拥有5年AI算法开发经验。',
    avatar: '',
  });

  // 认证信息
  const [certification, setCertification] = useState({
    type: CertificationType.EDUCATION,
    status: CertificationStatus.APPROVED,
    organizationName: '清华大学',
    organizationType: '985高校',
    department: '计算机科学与技术系',
    position: '博士研究生',
    studentId: '2020310001',
    email: 'zhangsan@tsinghua.edu.cn',
    submitDate: '2024-01-15',
    approveDate: '2024-01-18',
    documents: ['student_id.pdf', 'enrollment_cert.pdf'],
    rejectReason: '',
  });

  // 新认证申请表单
  const [certForm, setCertForm] = useState({
    type: CertificationType.EDUCATION,
    organizationName: '',
    organizationType: '',
    department: '',
    position: '',
    idNumber: '',
    email: '',
    documents: [] as File[],
    additionalInfo: '',
  });

  // 保存个人信息
  const handleSaveProfile = () => {
    toast.success('个人信息已更新');
    setIsEditing(false);
  };

  // 提交认证申请
  const handleSubmitCertification = () => {
    if (!certForm.organizationName || !certForm.email) {
      toast.error('请填写必填信息');
      return;
    }

    toast.success('认证申请已提交，预计3个工作日内完成审核');
    setShowCertDialog(false);
    setCertification({
      ...certForm,
      status: CertificationStatus.PENDING,
      submitDate: new Date().toISOString().split('T')[0],
      approveDate: '',
      documents: certForm.documents.map(f => f.name),
      rejectReason: '',
    });
  };

  // 获取认证状态标识
  const getCertificationBadge = () => {
    switch (certification.status) {
      case CertificationStatus.APPROVED:
        if (certification.type === CertificationType.EDUCATION) {
          return (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <GraduationCap className="w-3 h-3 mr-1" />
              教育认证
            </Badge>
          );
        } else {
          return (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Briefcase className="w-3 h-3 mr-1" />
              企业认证
            </Badge>
          );
        }
      case CertificationStatus.PENDING:
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-700">
            <Clock className="w-3 h-3 mr-1" />
            审核中
          </Badge>
        );
      case CertificationStatus.REJECTED:
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            未通过
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            未认证
          </Badge>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl mb-2">个人资料</h1>
        <p className="text-slate-600">管理您的个人信息和账户设置</p>
      </div>

      {/* 用户概览卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl">
                {profile.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* 基本信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{profile.name}</h2>
                {getCertificationBadge()}
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.department} · {profile.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl text-purple-600 mb-1">23</p>
                <p className="text-xs text-slate-600">运行任务</p>
              </div>
              <div>
                <p className="text-2xl text-blue-600 mb-1">156</p>
                <p className="text-xs text-slate-600">已完成</p>
              </div>
              <div>
                <p className="text-2xl text-green-600 mb-1">98%</p>
                <p className="text-xs text-slate-600">成功率</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细信息标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <User className="w-4 h-4 mr-2" />
            基本信息
          </TabsTrigger>
          <TabsTrigger value="certification">
            <Award className="w-4 h-4 mr-2" />
            身份认证
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="w-4 h-4 mr-2" />
            偏好设置
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>个人信息</CardTitle>
                  <CardDescription>维护您的基本资料和联系方式</CardDescription>
                </div>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      编辑资料
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">部门</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">职位</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">所在地</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="介绍一下您的专业背景和研究方向..."
                />
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">加入时间</p>
                  <p className="text-sm text-blue-700">{profile.joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 身份认证 */}
        <TabsContent value="certification" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>身份认证</CardTitle>
                  <CardDescription>
                    完成认证后可获得专属标识，享受更高的资源配额和优先级
                  </CardDescription>
                </div>
                {certification.status === CertificationStatus.NONE && (
                  <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Award className="w-4 h-4 mr-2" />
                        申请认证
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>申请身份认证</DialogTitle>
                        <DialogDescription>
                          请根据您的身份选择认证类型并填写相关信息
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* 认证类型选择 */}
                        <div className="space-y-2">
                          <Label>认证类型 *</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Card
                              className={`cursor-pointer transition-all ${
                                certForm.type === CertificationType.EDUCATION
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'hover:border-slate-400'
                              }`}
                              onClick={() => setCertForm({ ...certForm, type: CertificationType.EDUCATION })}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <GraduationCap className="w-8 h-8 text-blue-600" />
                                <div>
                                  <p className="font-medium">教育认证</p>
                                  <p className="text-xs text-slate-600">学生、教师、科研人员</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card
                              className={`cursor-pointer transition-all ${
                                certForm.type === CertificationType.ENTERPRISE
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'hover:border-slate-400'
                              }`}
                              onClick={() => setCertForm({ ...certForm, type: CertificationType.ENTERPRISE })}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <Briefcase className="w-8 h-8 text-orange-600" />
                                <div>
                                  <p className="font-medium">企业认证</p>
                                  <p className="text-xs text-slate-600">企业员工、创业者</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* 认证信息表单 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {certForm.type === CertificationType.EDUCATION ? '学校名称' : '企业名称'} *
                            </Label>
                            <Input
                              value={certForm.organizationName}
                              onChange={(e) => setCertForm({ ...certForm, organizationName: e.target.value })}
                              placeholder={certForm.type === CertificationType.EDUCATION ? '如：清华大学' : '如：百度在线网络技术有限公司'}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>
                              {certForm.type === CertificationType.EDUCATION ? '学校类型' : '企业类型'}
                            </Label>
                            <Select
                              value={certForm.organizationType}
                              onValueChange={(value) => setCertForm({ ...certForm, organizationType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="请选择" />
                              </SelectTrigger>
                              <SelectContent>
                                {certForm.type === CertificationType.EDUCATION ? (
                                  <>
                                    <SelectItem value="985">985高校</SelectItem>
                                    <SelectItem value="211">211高校</SelectItem>
                                    <SelectItem value="double-first">双一流高校</SelectItem>
                                    <SelectItem value="other">其他高校</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="listed">上市公司</SelectItem>
                                    <SelectItem value="unicorn">独角兽</SelectItem>
                                    <SelectItem value="startup">创业公司</SelectItem>
                                    <SelectItem value="other">其他企业</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>
                              {certForm.type === CertificationType.EDUCATION ? '院系' : '部门'}
                            </Label>
                            <Input
                              value={certForm.department}
                              onChange={(e) => setCertForm({ ...certForm, department: e.target.value })}
                              placeholder={certForm.type === CertificationType.EDUCATION ? '如：计算机科学与技术系' : '如：AI研发部'}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>
                              {certForm.type === CertificationType.EDUCATION ? '身份' : '职位'}
                            </Label>
                            <Select
                              value={certForm.position}
                              onValueChange={(value) => setCertForm({ ...certForm, position: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="请选择" />
                              </SelectTrigger>
                              <SelectContent>
                                {certForm.type === CertificationType.EDUCATION ? (
                                  <>
                                    <SelectItem value="undergraduate">本科生</SelectItem>
                                    <SelectItem value="master">硕士研究生</SelectItem>
                                    <SelectItem value="phd">博士研究生</SelectItem>
                                    <SelectItem value="teacher">教师</SelectItem>
                                    <SelectItem value="researcher">科研人员</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="engineer">工程师</SelectItem>
                                    <SelectItem value="researcher">研究员</SelectItem>
                                    <SelectItem value="manager">管理者</SelectItem>
                                    <SelectItem value="executive">高管</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>
                              {certForm.type === CertificationType.EDUCATION ? '学号/工号' : '工号'} *
                            </Label>
                            <Input
                              value={certForm.idNumber}
                              onChange={(e) => setCertForm({ ...certForm, idNumber: e.target.value })}
                              placeholder="请输入"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>
                              {certForm.type === CertificationType.EDUCATION ? '学校邮箱' : '企业邮箱'} *
                            </Label>
                            <Input
                              type="email"
                              value={certForm.email}
                              onChange={(e) => setCertForm({ ...certForm, email: e.target.value })}
                              placeholder={certForm.type === CertificationType.EDUCATION ? 'name@university.edu.cn' : 'name@company.com'}
                            />
                          </div>
                        </div>

                        {/* 认证材料上传 */}
                        <div className="space-y-2">
                          <Label>认证材料</Label>
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 mb-1">
                              点击上传或拖拽文件到此处
                            </p>
                            <p className="text-xs text-slate-500">
                              {certForm.type === CertificationType.EDUCATION
                                ? '学生证、在读证明、教师证等（支持 PDF, JPG, PNG，不超过10MB）'
                                : '工作证、在职证明、名片等（支持 PDF, JPG, PNG，不超过10MB）'}
                            </p>
                          </div>
                        </div>

                        {/* 补充说明 */}
                        <div className="space-y-2">
                          <Label>补充说明</Label>
                          <Textarea
                            value={certForm.additionalInfo}
                            onChange={(e) => setCertForm({ ...certForm, additionalInfo: e.target.value })}
                            placeholder="如有需要，可以在此补充说明..."
                            rows={3}
                          />
                        </div>

                        {/* 提示信息 */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-900">
                              <p className="font-medium mb-1">认证说明</p>
                              <ul className="space-y-1 text-blue-700">
                                <li>• 审核时间：工作日通常 1-3 个工作日完成审核</li>
                                <li>• 认证有效期：认证通过后长期有效</li>
                                <li>• 资料保密：您的认证信息将被严格保密</li>
                                <li>• 认证福利：享受更高资源配额和任务优先级</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCertDialog(false)}>
                          取消
                        </Button>
                        <Button onClick={handleSubmitCertification}>
                          提交申请
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 认证状态展示 */}
              {certification.status !== CertificationStatus.NONE && (
                <div className="space-y-6">
                  {/* 状态卡片 */}
                  <div className={`p-6 rounded-lg border-2 ${
                    certification.status === CertificationStatus.APPROVED
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : certification.status === CertificationStatus.PENDING
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        certification.status === CertificationStatus.APPROVED
                          ? 'bg-green-100'
                          : certification.status === CertificationStatus.PENDING
                          ? 'bg-orange-100'
                          : 'bg-red-100'
                      }`}>
                        {certification.status === CertificationStatus.APPROVED && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                        {certification.status === CertificationStatus.PENDING && (
                          <Clock className="w-6 h-6 text-orange-600" />
                        )}
                        {certification.status === CertificationStatus.REJECTED && (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">
                            {certification.status === CertificationStatus.APPROVED && '认证已通过'}
                            {certification.status === CertificationStatus.PENDING && '认证审核中'}
                            {certification.status === CertificationStatus.REJECTED && '认证未通过'}
                          </h3>
                          {getCertificationBadge()}
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                          {certification.status === CertificationStatus.APPROVED &&
                            `恭喜！您已成功通过${certification.type === CertificationType.EDUCATION ? '教育' : '企业'}认证`}
                          {certification.status === CertificationStatus.PENDING &&
                            '我们正在审核您的认证申请，预计 1-3 个工作日内完成'}
                          {certification.status === CertificationStatus.REJECTED &&
                            '很抱歉，您的认证申请未通过审核'}
                        </p>

                        {certification.status === CertificationStatus.APPROVED && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600">认证机构：</span>
                              <span className="font-medium ml-2">{certification.organizationName}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">认证时间：</span>
                              <span className="font-medium ml-2">{certification.approveDate}</span>
                            </div>
                          </div>
                        )}

                        {certification.status === CertificationStatus.REJECTED && certification.rejectReason && (
                          <div className="p-3 bg-white border border-red-200 rounded-lg text-sm">
                            <p className="text-slate-600 mb-1">拒绝原因：</p>
                            <p className="text-red-700">{certification.rejectReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 认证详情 */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600">
                        {certification.type === CertificationType.EDUCATION ? '学校名称' : '企业名称'}
                      </Label>
                      <p className="font-medium">{certification.organizationName}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">机构类型</Label>
                      <p className="font-medium">{certification.organizationType}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">
                        {certification.type === CertificationType.EDUCATION ? '院系' : '部门'}
                      </Label>
                      <p className="font-medium">{certification.department}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">
                        {certification.type === CertificationType.EDUCATION ? '身份' : '职位'}
                      </Label>
                      <p className="font-medium">{certification.position}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">
                        {certification.type === CertificationType.EDUCATION ? '学校邮箱' : '企业邮箱'}
                      </Label>
                      <p className="font-medium">{certification.email}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">申请时间</Label>
                      <p className="font-medium">{certification.submitDate}</p>
                    </div>
                  </div>

                  {/* 认证材料 */}
                  {certification.documents.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-slate-600">认证材料</Label>
                      <div className="space-y-2">
                        {certification.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-purple-600" />
                              </div>
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              查看
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 认证权益 */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  认证权益
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: '资源配额提升', desc: 'GPU、存储等资源配额提升50%', icon: '🚀' },
                    { title: '任务优先级', desc: '训练和推理任务享受优先调度', icon: '⚡' },
                    { title: '专属标识', desc: '个人主页显示认证标识', icon: '🏆' },
                    { title: '技术支持', desc: '享受VIP技术支持服务', icon: '💬' },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{benefit.icon}</span>
                        <div>
                          <p className="font-medium mb-1">{benefit.title}</p>
                          <p className="text-xs text-slate-600">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>管理您的账户安全和登录方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 修改密码 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">登录密码</h4>
                    <p className="text-sm text-slate-600">定期更换密码可以提高账户安全性</p>
                  </div>
                  <Button variant="outline">
                    <Key className="w-4 h-4 mr-2" />
                    修改密码
                  </Button>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                  上次修改时间：2024-11-15
                </div>
              </div>

              <div className="border-t border-slate-200" />

              {/* 双因素认证 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">双因素认证（2FA）</h4>
                    <p className="text-sm text-slate-600">使用手机验证码增强账户安全</p>
                  </div>
                  <Button variant="outline">启用</Button>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-900">
                    建议启用双因素认证以提高账户安全性
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200" />

              {/* 登录设备 */}
              <div className="space-y-4">
                <h4 className="font-medium">登录设备</h4>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on macOS', location: '北京市', time: '当前设备', active: true },
                    { device: 'Safari on iPhone', location: '北京市', time: '2小时前', active: false },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{session.device}</p>
                          {session.active && (
                            <Badge variant="outline" className="border-green-500 text-green-700">
                              当前设备
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {session.location} · {session.time}
                        </p>
                      </div>
                      {!session.active && (
                        <Button variant="ghost" size="sm" className="text-red-600">
                          移除
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 偏好设置 */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>偏好设置</CardTitle>
              <CardDescription>个性化您的使用体验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 通知设置 */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  通知设置
                </h4>
                <div className="space-y-3">
                  {[
                    { label: '任务状态变更通知', desc: '训练任务完成、失败等状态变更时通知', checked: true },
                    { label: '资源配额预警', desc: '余额不足、配额即将用尽时提醒', checked: true },
                    { label: '系统公告', desc: '接收系统维护、更新等重要公告', checked: true },
                    { label: '营销推广', desc: '接收优惠活动、新功能介绍等信息', checked: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium mb-1">{item.label}</p>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200" />

              {/* 语言和时区 */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  语言和时区
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>语言</Label>
                    <Select defaultValue="zh-CN">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>时区</Label>
                    <Select defaultValue="Asia/Shanghai">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                        <SelectItem value="America/New_York">纽约时间 (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">伦敦时间 (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}