/**
 * Utility for mapping between UI role values and API role values
 */

// Map UI roles to API roles
export const mapUIRoleToAPIRole = (uiRole: string): string => {
  switch (uiRole) {
    case 'buyer':
      return 'customer';
    case 'seller':
      return 'vendor';
    default:
      return uiRole;
  }
};

// Map API roles to UI roles
export const mapAPIRoleToUIRole = (apiRole: string): string => {
  switch (apiRole) {
    case 'customer':
      return 'buyer';
    case 'vendor':
      return 'seller';
    default:
      return apiRole;
  }
};
