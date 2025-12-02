import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/permissions';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // true表示需要所有权限，false表示只需要任意一个
  fallback?: ReactNode; // 无权限时显示的内容
  redirectTo?: string; // 无权限时重定向的路径
  showAlert?: boolean; // 是否显示无权限提示
}

/**
 * 权限保护组件
 * 用于保护需要特定权限才能访问的内容
 */
export default function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
  redirectTo,
  showAlert = true,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // 检查权限
  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // 有权限，显示内容
  if (hasAccess) {
    return <>{children}</>;
  }

  // 无权限，重定向
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // 无权限，显示自定义fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // 无权限，显示提示
  if (showAlert) {
    return (
      <div className="p-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">
            您没有权限访问此功能。如需帮助，请联系系统管理员。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 无权限，不显示任何内容
  return null;
}

/**
 * 功能按钮权限保护组件
 * 用于根据权限显示/隐藏按钮或操作
 */
interface PermissionButtonProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionButton({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
}: PermissionButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * 资源操作权限保护组件
 * 用于根据资源所有权和权限显示/隐藏操作按钮
 */
interface ResourcePermissionProps {
  children: ReactNode;
  resourceType: 'instances' | 'jobs' | 'volumes' | 'files' | 'datasets' | 'models';
  resourceOwnerId?: string;
  fallback?: ReactNode;
}

export function ResourcePermission({
  children,
  resourceType,
  resourceOwnerId,
  fallback,
}: ResourcePermissionProps) {
  const { canManageResource } = usePermissions();

  const canManage = canManageResource(resourceType, resourceOwnerId);

  if (canManage) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
