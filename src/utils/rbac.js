// Role-Based Access Control (RBAC) Module for BREEDIFY Ecosystem
export const ROLES = {
  FARMER: 'farmer',
  VETERINARIAN: 'vet',
  MILK_VENDOR: 'vendor'
};

export const ROLE_PERMISSIONS = {
  [ROLES.FARMER]: [
    'animal:create',
    'animal:read:own',
    'animal:update:own',
    'passport:read:own',
    'health:read:own',
    'consultation:create',
    'milk:read:own'
  ],
  [ROLES.VETERINARIAN]: [
    'animal:read:assigned',
    'passport:read',
    'passport:create',
    'health:create',
    'health:update',
    'vaccination:create',
    'case:create',
    'case:update',
    'consultation:manage'
  ],
  [ROLES.MILK_VENDOR]: [
    'milk:create',
    'milk:update',
    'milk:read:assigned',
    'payment:create',
    'payment:read',
    'collection:manage',
    'route:manage',
    'analytics:read'
  ]
};

export function hasPermission(userRole, permission) {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function enforcePermission(userRole, permission) {
  if (!hasPermission(userRole, permission)) {
    const errorMsg = `Access Denied: Role [${userRole?.toUpperCase()}] is not authorized for operation [${permission}]`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return true;
}

export function getRoleBadge(role) {
  switch (role) {
    case ROLES.VETERINARIAN:
      return {
        label: 'Veterinary Officer',
        code: 'VET',
        icon: '🩺',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300'
      };
    case ROLES.MILK_VENDOR:
      return {
        label: 'Milk Vendor / Dairy Operator',
        code: 'VENDOR',
        icon: '🥛',
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300'
      };
    case ROLES.FARMER:
    default:
      return {
        label: 'Farmer / Kisan',
        code: 'FARMER',
        icon: '🌾',
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300'
      };
  }
}
