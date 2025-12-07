// 认证审核服务

export interface VerificationApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'enterprise' | 'personal';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  
  // 企业认证字段
  enterpriseData?: {
    creditCode: string;      // 统一社会信用代码
    companyName: string;      // 公司名称
    contactName: string;      // 联系人
    contactPhone: string;     // 联系电话
    contactEmail?: string;    // 联系邮箱
  };
  
  // 个人认证字段
  personalData?: {
    realName: string;         // 真实姓名
    idNumber: string;         // 身份证号
    contactPhone: string;     // 联系电话
    contactEmail?: string;    // 联系邮箱
  };
}

// 模拟数据
const mockApplications: VerificationApplication[] = [
  {
    id: 'ver-001',
    userId: 'user-001',
    userName: '张三',
    userEmail: 'zhangsan@example.com',
    type: 'enterprise',
    status: 'pending',
    submittedAt: '2024-12-05 10:30:00',
    enterpriseData: {
      creditCode: '91110000MA01234567',
      companyName: '北京智能科技有限公司',
      contactName: '张三',
      contactPhone: '13800138000',
      contactEmail: 'zhangsan@example.com',
    },
  },
  {
    id: 'ver-002',
    userId: 'user-002',
    userName: '李四',
    userEmail: 'lisi@example.com',
    type: 'personal',
    status: 'approved',
    submittedAt: '2024-12-04 15:20:00',
    reviewedAt: '2024-12-04 16:30:00',
    reviewedBy: 'admin',
    personalData: {
      realName: '李四',
      idNumber: '110101199001011234',
      contactPhone: '13900139000',
    },
  },
  {
    id: 'ver-003',
    userId: 'user-003',
    userName: '王五',
    userEmail: 'wangwu@example.com',
    type: 'enterprise',
    status: 'rejected',
    submittedAt: '2024-12-03 09:15:00',
    reviewedAt: '2024-12-03 14:20:00',
    reviewedBy: 'admin',
    rejectionReason: '统一社会信用代码格式错误，请核实后重新提交',
    enterpriseData: {
      creditCode: '91110000INVALID',
      companyName: '上海数据科技公司',
      contactName: '王五',
      contactPhone: '13700137000',
    },
  },
];

class VerificationService {
  private applications: VerificationApplication[] = [...mockApplications];

  // 提交企业认证申请
  async submitEnterpriseVerification(data: {
    creditCode: string;
    companyName: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
  }): Promise<VerificationApplication> {
    const application: VerificationApplication = {
      id: `ver-${Date.now()}`,
      userId: 'current-user-id', // 实际应该从认证上下文获取
      userName: '当前用户',
      userEmail: 'user@example.com',
      type: 'enterprise',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      enterpriseData: data,
    };

    this.applications.unshift(application);
    return application;
  }

  // 提交个人认证申请
  async submitPersonalVerification(data: {
    realName: string;
    idNumber: string;
    contactPhone: string;
    contactEmail?: string;
  }): Promise<VerificationApplication> {
    const application: VerificationApplication = {
      id: `ver-${Date.now()}`,
      userId: 'current-user-id',
      userName: '当前用户',
      userEmail: 'user@example.com',
      type: 'personal',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      personalData: data,
    };

    this.applications.unshift(application);
    return application;
  }

  // 获取当前用户的认证记录
  async getUserVerifications(userId: string): Promise<VerificationApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.applications
      .filter(app => app.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  // 获取待审核列表（管理员）
  async getPendingVerifications(): Promise<VerificationApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.applications
      .filter(app => app.status === 'pending')
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  // 获取所有认证记录（管理员）
  async getAllVerifications(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    type?: 'enterprise' | 'personal';
    search?: string;
  }): Promise<VerificationApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let results = [...this.applications];

    // 按状态筛选
    if (params?.status) {
      results = results.filter(app => app.status === params.status);
    }

    // 按类型筛选
    if (params?.type) {
      results = results.filter(app => app.type === params.type);
    }

    // 搜索
    if (params?.search) {
      const search = params.search.toLowerCase();
      results = results.filter(app => {
        return (
          app.userName.toLowerCase().includes(search) ||
          app.userEmail.toLowerCase().includes(search) ||
          (app.enterpriseData?.companyName || '').toLowerCase().includes(search) ||
          (app.personalData?.realName || '').toLowerCase().includes(search)
        );
      });
    }

    // 按提交时间倒序排列
    return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  // 审核通过
  async approveVerification(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const application = this.applications.find(app => app.id === id);
    if (!application) {
      throw new Error('认证申请不存在');
    }

    application.status = 'approved';
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = 'admin'; // 实际应该从认证上下文获取

    // 实际应该调用API，自动创建用户组并加入
    // 企业用户：/company/公司名
    // 个人用户：/person/真实姓名
    console.log('自动创建用户组并加入:', {
      userId: application.userId,
      groupPath: application.type === 'enterprise'
        ? `/company/${application.enterpriseData?.companyName}`
        : `/person/${application.personalData?.realName}`,
    });
  }

  // 审核驳回
  async rejectVerification(id: string, reason: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const application = this.applications.find(app => app.id === id);
    if (!application) {
      throw new Error('认证申请不存在');
    }

    application.status = 'rejected';
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = 'admin';
    application.rejectionReason = reason;
  }

  // 获取认证详情
  async getVerificationDetail(id: string): Promise<VerificationApplication | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.applications.find(app => app.id === id) || null;
  }

  // 获取统计数据
  async getVerificationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    enterprise: number;
    personal: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      total: this.applications.length,
      pending: this.applications.filter(app => app.status === 'pending').length,
      approved: this.applications.filter(app => app.status === 'approved').length,
      rejected: this.applications.filter(app => app.status === 'rejected').length,
      enterprise: this.applications.filter(app => app.type === 'enterprise').length,
      personal: this.applications.filter(app => app.type === 'personal').length,
    };
  }
}

export const verificationService = new VerificationService();
