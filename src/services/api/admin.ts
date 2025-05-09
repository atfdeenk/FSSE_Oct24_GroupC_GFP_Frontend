// src/services/api/admin.ts
import axiosInstance from './axios';
import { API_CONFIG } from './config';
import { UserProfile } from '@/types/apiResponses';

// Types for admin service
export interface AdminDashboardStats {
  totalUsers: number;
  totalAdmins: number;
  pendingProducts: number;
  totalTransactions: number;
  totalRevenue: number;
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  description: string;
  date: string;
  admin: string | null;
}

export interface ProductApprovalItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: {
    id: number;
    name: string;
    email: string;
  };
  images: string[];
  status: string;
  created_at: string;
  stock_quantity?: number;
  currency?: string;
  location?: string;
  unit_quantity?: string;
}

// Admin service with Axios
export const adminService = {
  // Create a new user
  createUser: async (userData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.auth.register,
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },
  
  // Get dashboard statistics
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    try {
      // Get all users from the main endpoint
      const allUsersResponse = await adminService.getUsers();
      
      // Get admin users specifically from the admin endpoint
      const adminUsersResponse = await adminService.getAdminUsers();
      
      // Create a map of existing user IDs to avoid duplicates
      const userMap = new Map();
      
      // Add all users from the main endpoint first
      allUsersResponse.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Then add admin users, which might not be included in the main endpoint
      adminUsersResponse.forEach(admin => {
        userMap.set(admin.id, admin);
      });
      
      // Convert the map back to an array
      const users = Array.from(userMap.values());
      
      // Filter admin users
      const adminUsers = users.filter(user => user.role === 'admin');
      
      // Use the products endpoint to get product count
      const productsResponse = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.products.list
      );
      
      // Use the orders endpoint to get transaction count
      const ordersResponse = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.orders.list
      );
      
      // Extract products array from response
      const productsData = productsResponse.data;
      const productsArray = Array.isArray(productsData) ? productsData : 
                           (productsData?.products ? productsData.products : []);
      
      // Filter pending products
      const pendingProducts = productsArray.filter((product: any) => product.status === 'pending');
      
      // Extract orders array from response
      const ordersData = ordersResponse.data;
      const ordersArray = Array.isArray(ordersData) ? ordersData : 
                         (ordersData?.orders ? ordersData.orders : []);
      
      // Calculate total revenue from all orders
      const totalRevenue = ordersArray.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.total_amount) || 0);
      }, 0);
      
      // Get recent transactions from orders
      const recentTransactions = ordersArray.slice(0, 5).map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        amount: parseFloat(order.total_amount) || 0,
        type: 'purchase',
        description: `Order #${order.id}`,
        date: order.created_at || new Date().toISOString().split('T')[0],
        admin: null
      }));
      
      return {
        totalUsers: users.length,
        totalAdmins: adminUsers.length,
        pendingProducts: pendingProducts.length,
        totalTransactions: ordersArray.length,
        totalRevenue,
        recentTransactions
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if API call fails
      return {
        totalUsers: 0,
        totalAdmins: 0,
        pendingProducts: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        recentTransactions: []
      };
    }
  },
  
  // Get all users by combining data from multiple endpoints
  getUsers: async (): Promise<UserProfile[]> => {
    try {
      console.log('Fetching users from all endpoints...');
      
      // Fetch data from all three endpoints in parallel for better performance
      const [allUsersResponse, usersResponse, adminsResponse] = await Promise.all([
        axiosInstance.get(API_CONFIG.ENDPOINTS.auth.allUsers),
        axiosInstance.get(API_CONFIG.ENDPOINTS.auth.users),
        axiosInstance.get(API_CONFIG.ENDPOINTS.auth.admins)
      ]);
      
      // Extract data from responses
      const allUsers = allUsersResponse.data || [];
      const users = usersResponse.data || [];
      const admins = adminsResponse.data || [];
      
      console.log(`Received data: ${allUsers.length} users from /users/all, ${users.length} from /users, ${admins.length} from /users/admins`);
      
      // Create a map for location data lookup (from /users and /users/admins endpoints)
      const locationDataMap = new Map();
      [...users, ...admins].forEach((userData: any) => {
        locationDataMap.set(userData.id, userData);
      });
      
      // Combine the data using the same logic that worked with mock data
      const combinedUsers = allUsers.map((user: any) => {
        // Get location data for this user if available
        const locationData = locationDataMap.get(user.id) || {};
        
        // Combine all data into a complete user profile
        return {
          // Basic user info from /users/all endpoint
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          
          // Location data from /users or /users/admins endpoints
          city: locationData.city || '',
          image_url: locationData.image_url || '',
          
          // Default values for required UserProfile fields
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          address: user.address || '',
          state: user.state || '',
          country: user.country || 'Indonesia',
          zip_code: user.zip_code || '',
          balance: user.balance || 0,
          status: user.is_active ? 'active' : 'inactive'
        };
      });
      
      console.log(`Combined ${combinedUsers.length} users with complete information`);
      return combinedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get admin users
  getAdminUsers: async (): Promise<UserProfile[]> => {
    try {
      // Try to use the specific admin endpoint
      try {
        const response = await axiosInstance.get<UserProfile[]>(
          API_CONFIG.ENDPOINTS.auth.admins
        );
        return response.data;
      } catch (adminEndpointError) {
        // Fallback: If the specific endpoint fails, get all users and filter
        console.warn('Admin-specific endpoint failed, falling back to filtering all users');
        const allUsers = await adminService.getUsers();
        return allUsers.filter(user => user.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  },

  // Get customer users
  getCustomerUsers: async (): Promise<UserProfile[]> => {
    try {
      // Try to use the specific customer endpoint
      try {
        const response = await axiosInstance.get<UserProfile[]>(
          API_CONFIG.ENDPOINTS.auth.customers
        );
        return response.data;
      } catch (customerEndpointError) {
        // Fallback: If the specific endpoint fails, get all users and filter
        console.warn('Customer-specific endpoint failed, falling back to filtering all users');
        const allUsers = await adminService.getUsers();
        return allUsers.filter(user => user.role === 'customer');
      }
    } catch (error) {
      console.error('Error fetching customer users:', error);
      return [];
    }
  },

  // Get seller users
  getSellerUsers: async (): Promise<UserProfile[]> => {
    try {
      // Try to use the specific seller endpoint
      try {
        const response = await axiosInstance.get<UserProfile[]>(
          API_CONFIG.ENDPOINTS.auth.sellers
        );
        return response.data;
      } catch (sellerEndpointError) {
        // Fallback: If the specific endpoint fails, get all users and filter
        console.warn('Seller-specific endpoint failed, falling back to filtering all users');
        const allUsers = await adminService.getUsers();
        return allUsers.filter(user => user.role === 'seller');
      }
    } catch (error) {
      console.error('Error fetching seller users:', error);
      return [];
    }
  },
  
  // Get user by ID
  getUserById: async (id: number): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.auth.user(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },
  
  // Update user
  updateUser: async (id: number, userData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.auth.user(id),
        userData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return null;
    }
  },
  
  // Delete user
  deleteUser: async (id: number): Promise<boolean> => {
    try {
      await axiosInstance.delete(
        API_CONFIG.ENDPOINTS.auth.user(id)
      );
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  },
  
  // Get products pending approval
  getPendingProducts: async (): Promise<ProductApprovalItem[]> => {
  try {
    const response = await axiosInstance.get('/products?include_unapproved=true');

    const productsResponse = response.data;
    const productsArray = Array.isArray(productsResponse)
      ? productsResponse
      : productsResponse?.products || [];

    // Filter based on is_approved === false
    return productsArray
      .filter((product: any) => product.is_approved === false)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: (product.categories?.[0]?.name || 'Uncategorized'),
        seller: {
          id: product.vendor_id || product.user_id,
          name: product.vendor_name || 'Unknown Seller',
          email: product.seller_email || 'unknown@example.com'
        },
        images: product.images || [product.image_url].filter(Boolean),
        status: 'pending', // You can hardcode this if needed for UI display
        created_at: product.created_at,
        stock_quantity: product.stock_quantity || 0,
        currency: product.currency || 'USD',
        location: product.location || 'Unknown',
        unit_quantity: product.unit_quantity || '1 unit'
      }));
  } catch (error) {
    console.error('Error fetching pending products:', error);
    return [];
  }
},

  // Approve product
 approveProduct: async (id: number): Promise<boolean> => {
  try {
    await axiosInstance.patch(`/products/${id}/approve`);
    return true;
  } catch (error) {
    console.error(`Error approving product ${id}:`, error);
    return false;
  }
},

  // Reject product
  rejectProduct: async (id: number, reason: string): Promise<boolean> => {
  try {
    await axiosInstance.patch(`/products/${id}/reject`, {
      reason
    });
    return true;
  } catch (error) {
    console.error(`Error rejecting product ${id}:`, error);
    return false;
  }
},

  
  // Update user balance
  updateUserBalance: async (userId: number, amount: number, description: string): Promise<boolean> => {
    try {
      // In a real API, you would have a specific endpoint for updating user balance
      await axiosInstance.post(
        API_CONFIG.ENDPOINTS.auth.balance,
        { 
          user_id: userId,
          amount,
          description
        }
      );
      return true;
    } catch (error) {
      console.error(`Error updating balance for user ${userId}:`, error);
      return false;
    }
  },
  
  // Get user transaction history
  getUserTransactions: async (userId: number): Promise<Transaction[]> => {
    try {
      // In a real API, you would have a specific endpoint for user transactions
      // For now, we'll use the orders endpoint as a proxy
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.orders.list,
        { params: { user_id: userId } }
      );
      
      const orders = response.data || [];
      return orders.map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        amount: order.total || 0,
        type: 'purchase',
        description: `Order #${order.id}`,
        date: order.created_at || new Date().toISOString().split('T')[0],
        admin: null
      }));
    } catch (error) {
      console.error(`Error fetching transactions for user ${userId}:`, error);
      return [];
    }
  }
};

export default adminService;
