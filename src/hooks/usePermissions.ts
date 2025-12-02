import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, RolePermissions, UserRole } from '../config/permissions';

/**
 * 权限检查Hook
 */
export function usePermissions() {
  const { user } = useAuth();

  // 获取用户的所有权限
  const userPermissions = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) {
      return [];
    }

    const permissionSet = new Set<Permission>();

    // 合并所有角色的权限
    user.roles.forEach((role) => {
      const rolePermissions = RolePermissions[role as UserRole];
      if (rolePermissions) {
        rolePermissions.forEach((permission) => {
          permissionSet.add(permission);
        });
      }
    });

    return Array.from(permissionSet);
  }, [user]);

  // 检查是否有指定权限
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  // 检查是否有任意一个权限
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => userPermissions.includes(permission));
  };

  // 检查是否有所有权限
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => userPermissions.includes(permission));
  };

  // 检查是否是管理员
  const isAdmin = useMemo(() => {
    return user?.roles?.includes(UserRole.ADMIN) || false;
  }, [user]);

  // 检查是否是运维人员
  const isOperator = useMemo(() => {
    return user?.roles?.includes(UserRole.OPERATOR) || false;
  }, [user]);

  // 检查是否是开发者
  const isDeveloper = useMemo(() => {
    return user?.roles?.includes(UserRole.DEVELOPER) || false;
  }, [user]);

  // 检查是否是普通用户
  const isRegularUser = useMemo(() => {
    return user?.roles?.includes(UserRole.USER) || false;
  }, [user]);

  // 检查是否有指定角色
  const hasRole = (role: UserRole): boolean => {
    return user?.roles?.includes(role) || false;
  };

  // 检查是否可以管理所有资源（而非仅自己的）
  const canManageAll = (resourceType: 'instances' | 'jobs' | 'volumes' | 'files' | 'datasets' | 'models'): boolean => {
    const permissionMap = {
      instances: Permission.MANAGE_ALL_INSTANCES,
      jobs: Permission.MANAGE_ALL_TRAINING_JOBS,
      volumes: Permission.MANAGE_ALL_STORAGE_VOLUMES,
      files: Permission.MANAGE_ALL_FILES,
      datasets: Permission.MANAGE_ALL_DATASETS,
      models: Permission.MANAGE_ALL_MODELS,
    };

    return hasPermission(permissionMap[resourceType]);
  };

  // 检查资源所有权（用于判断是否可以操作某个资源）
  const canManageResource = (
    resourceType: 'instances' | 'jobs' | 'volumes' | 'files' | 'datasets' | 'models',
    resourceOwnerId?: string
  ): boolean => {
    // 如果有管理所有资源的权限
    if (canManageAll(resourceType)) {
      return true;
    }

    // 如果是资源所有者
    if (resourceOwnerId && user?.id === resourceOwnerId) {
      const ownPermissionMap = {
        instances: Permission.MANAGE_OWN_INSTANCES,
        jobs: Permission.MANAGE_OWN_TRAINING_JOBS,
        volumes: Permission.MANAGE_OWN_STORAGE_VOLUMES,
        files: Permission.MANAGE_OWN_FILES,
        datasets: Permission.MANAGE_OWN_DATASETS,
        models: Permission.MANAGE_OWN_MODELS,
      };

      return hasPermission(ownPermissionMap[resourceType]);
    }

    return false;
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isOperator,
    isDeveloper,
    isRegularUser,
    hasRole,
    canManageAll,
    canManageResource,
  };
}
