import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Building2, User, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { verificationService } from '../../services/verificationService';

interface VerificationApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VerificationApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
}: VerificationApplicationDialogProps) {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'personal'>('enterprise');
  const [loading, setLoading] = useState(false);

  // 企业认证表单
  const [enterpriseForm, setEnterpriseForm] = useState({
    creditCode: '',
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  // 个人认证表单
  const [personalForm, setPersonalForm] = useState({
    realName: '',
    idNumber: '',
    contactPhone: '',
    contactEmail: '',
  });

  // 提交企业认证
  const handleSubmitEnterprise = async () => {
    // 表单验证
    if (!enterpriseForm.creditCode.trim()) {
      toast.error('请输入统一社会信用代码');
      return;
    }
    if (!enterpriseForm.companyName.trim()) {
      toast.error('请输入公司名称');
      return;
    }
    if (!enterpriseForm.contactName.trim()) {
      toast.error('请输入联系人');
      return;
    }
    if (!enterpriseForm.contactPhone.trim()) {
      toast.error('请输入联系电话');
      return;
    }

    // 验证统一社会信用代码格式（18位）
    if (!/^[0-9A-Z]{18}$/.test(enterpriseForm.creditCode)) {
      toast.error('统一社会信用代码格式错误（应为18位数字或大写字母）');
      return;
    }

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(enterpriseForm.contactPhone)) {
      toast.error('联系电话格式错误');
      return;
    }

    setLoading(true);
    try {
      await verificationService.submitEnterpriseVerification(enterpriseForm);
      toast.success('企业认证申请已提交，请等待管理员审核');
      onOpenChange(false);
      onSuccess?.();
      
      // 重置表单
      setEnterpriseForm({
        creditCode: '',
        companyName: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
      });
    } catch (error) {
      toast.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 提交个人认证
  const handleSubmitPersonal = async () => {
    // 表单验证
    if (!personalForm.realName.trim()) {
      toast.error('请输入真实姓名');
      return;
    }
    if (!personalForm.idNumber.trim()) {
      toast.error('请输入身份证号');
      return;
    }
    if (!personalForm.contactPhone.trim()) {
      toast.error('请输入联系电话');
      return;
    }

    // 验证身份证号格式（18位）
    if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(personalForm.idNumber)) {
      toast.error('身份证号格式错误');
      return;
    }

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(personalForm.contactPhone)) {
      toast.error('联系电话格式错误');
      return;
    }

    setLoading(true);
    try {
      await verificationService.submitPersonalVerification(personalForm);
      toast.success('个人认证申请已提交，请等待管理员审核');
      onOpenChange(false);
      onSuccess?.();
      
      // 重置表单
      setPersonalForm({
        realName: '',
        idNumber: '',
        contactPhone: '',
        contactEmail: '',
      });
    } catch (error) {
      toast.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>实名认证</DialogTitle>
          <DialogDescription>
            完成实名认证后，您将获得更多业务权限和资源访问能力
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-slate-700">
            <strong className="text-blue-900">认证说明：</strong>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>提交认证申请后，系统将进入"待审核"状态</li>
              <li>管理员审核通过后，您将自动获得相应的业务权限</li>
              <li>请确保填写的信息真实有效，虚假信息将被驳回</li>
              <li>认证信息仅用于身份验证，平台将严格保护您的隐私</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enterprise" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              企业认证
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              个人认证
            </TabsTrigger>
          </TabsList>

          {/* 企业认证表单 */}
          <TabsContent value="enterprise" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="creditCode">
                统一社会信用代码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="creditCode"
                placeholder="请输入18位统一社会信用代码"
                value={enterpriseForm.creditCode}
                onChange={(e) =>
                  setEnterpriseForm({ ...enterpriseForm, creditCode: e.target.value.toUpperCase() })
                }
                maxLength={18}
              />
              <p className="text-xs text-slate-500">
                示例：91110000MA01234567（18位数字或大写字母）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">
                公司名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="请输入公司全称"
                value={enterpriseForm.companyName}
                onChange={(e) =>
                  setEnterpriseForm({ ...enterpriseForm, companyName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">
                  联系人 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactName"
                  placeholder="请输入联系人姓名"
                  value={enterpriseForm.contactName}
                  onChange={(e) =>
                    setEnterpriseForm({ ...enterpriseForm, contactName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  联系电话 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="请输入手机号"
                  value={enterpriseForm.contactPhone}
                  onChange={(e) =>
                    setEnterpriseForm({ ...enterpriseForm, contactPhone: e.target.value })
                  }
                  maxLength={11}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmailEnt">联系邮箱（选填）</Label>
              <Input
                id="contactEmailEnt"
                type="email"
                placeholder="请输入联系邮箱"
                value={enterpriseForm.contactEmail}
                onChange={(e) =>
                  setEnterpriseForm({ ...enterpriseForm, contactEmail: e.target.value })
                }
              />
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-sm text-slate-700">
                <strong className="text-green-900">企业认证优势：</strong>
                <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                  <li>创建企业专属工作组：/company/公司名</li>
                  <li>获得企业级资源配额和优先调度权限</li>
                  <li>支持团队协作和资源共享</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* 个人认证表单 */}
          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="realName">
                真实姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="realName"
                placeholder="请输入真实姓名"
                value={personalForm.realName}
                onChange={(e) => setPersonalForm({ ...personalForm, realName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">
                身份证号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="idNumber"
                placeholder="请输入18位身份证号"
                value={personalForm.idNumber}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, idNumber: e.target.value.toUpperCase() })
                }
                maxLength={18}
              />
              <p className="text-xs text-slate-500">
                您的身份证信息将被加密存储，仅用于实名认证
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhonePer">
                联系电话 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPhonePer"
                placeholder="请输入手机号"
                value={personalForm.contactPhone}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, contactPhone: e.target.value })
                }
                maxLength={11}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmailPer">联系邮箱（选填）</Label>
              <Input
                id="contactEmailPer"
                type="email"
                placeholder="请输入联系邮箱"
                value={personalForm.contactEmail}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, contactEmail: e.target.value })
                }
              />
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-sm text-slate-700">
                <strong className="text-green-900">个人认证优势：</strong>
                <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                  <li>创建个人工作组：/person/真实姓名</li>
                  <li>获得个人资源配额和计算权限</li>
                  <li>支持个人项目开发和模型训练</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={activeTab === 'enterprise' ? handleSubmitEnterprise : handleSubmitPersonal}
            disabled={loading}
          >
            {loading ? '提交中...' : '提交认证申请'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
