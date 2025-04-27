// src/scripts/testApi.ts
// Script to test login for admin, vendor, and customer using centralized API

// Mock localStorage for Node.js environment
if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: (key: string) => global.localStorage[key] || null,
    setItem: (key: string, value: string) => { global.localStorage[key] = value; },
    removeItem: (key: string) => { delete global.localStorage[key]; },
    clear: () => { Object.keys(global.localStorage).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete global.localStorage[key];
      }
    }); },
    key: (index: number) => Object.keys(global.localStorage)[index],
    length: 0
  } as Storage;
}

import { authService, productService, categoryService, orderService, cartService, feedbackService } from '../services/api';
import type {
  AuthResponse,
  ProductsResponse,
  OrdersResponse,
  CategoriesResponse,
  CartResponse,
  ReviewsResponse,
  Product,
  Category,
  User
} from '../types/apiResponses';

const users = [
  {
    role: 'Admin',
    email: 'admintest1@example.com',
    password: 'adminpass123',
  },
  {
    role: 'Vendor',
    email: 'vendortest1@example.com',
    password: 'vendorpass123',
  },
  {
    role: 'Customer',
    email: 'customertest1@example.com',
    password: 'customerpass123',
  },
];

// Test login for each user type
async function testLogin() {
  console.log('\n--- Testing Login ---');
  
  for (const user of users) {
    try {
      console.log(`Attempting to login as ${user.role}...`);
      const response = await authService.login({
        email: user.email,
        password: user.password
      });
      
      // The API returns { access_token: string } on success
      // Our auth service transforms this to { success: true, data: { token: string, user: null }, message: string }
      console.log(`Login successful for ${user.role}:`, response.data?.token ? 'token received' : 'no token');
      
      // Test getting user profile
      try {
        console.log(`Getting profile for ${user.role}...`);
        const userResponse = await authService.getProfile();
        // The /me endpoint returns the user object directly, not wrapped in a response object
        console.log(`Profile retrieved for ${user.role}:`, userResponse?.id ? 'success' : 'failed');
      } catch (error) {
        console.error(`Get profile error:`, error);
      }
    } catch (error) {
      console.error(`Login failed for ${user.role}:`, error);
    }
  }
}

// Test products API
async function testProducts() {
  console.log('\n--- Testing Products API ---');
  
  try {
    console.log('Getting all products...');
    const productsResponse = await productService.getProducts();
    console.log('Products retrieved:', productsResponse.products ? 'success' : 'failed');
    
    if (productsResponse.products && productsResponse.products.length > 0) {
      const productId = productsResponse.products[0].id;
      
      try {
        console.log(`Getting product by ID: ${productId}...`);
        const productResponse = await productService.getProduct(productId);
        console.log('Product retrieved:', productResponse ? 'success' : 'failed');
      } catch (error) {
        console.error('Error getting product by ID:', error);
      }
    }
  } catch (error) {
    console.error('Error getting products:', error);
  }
}

// Test categories API
async function testCategories() {
  console.log('\n--- Testing Categories API ---');
  
  try {
    console.log('Getting all categories...');
    const categories = await categoryService.getCategories();
    // The API returns an array of categories directly
    console.log('Categories retrieved:', categories.length > 0 ? 'success' : 'failed');
    
    if (categories.length > 0) {
      const categoryId = categories[0].id;
      
      try {
        console.log(`Getting category by ID: ${categoryId}...`);
        const categoryResponse = await categoryService.getCategory(categoryId);
        console.log('Category retrieved:', categoryResponse ? 'success' : 'failed');
      } catch (error) {
        console.error('Error getting category by ID:', error);
      }
    }
  } catch (error) {
    console.error('Error getting categories:', error);
  }
}

// Test orders API
async function testOrders() {
  console.log('\n--- Testing Orders API ---');
  
  try {
    console.log('Getting all orders...');
    const orders = await orderService.getOrders();
    // The API returns an array of orders directly
    console.log('Orders retrieved:', orders.length > 0 ? 'success' : 'failed');
    
    if (orders.length > 0) {
      const orderId = orders[0].id;
      
      try {
        console.log(`Getting order by ID: ${orderId}...`);
        const orderResponse = await orderService.getOrder(orderId);
        console.log('Order retrieved:', orderResponse ? 'success' : 'failed');
      } catch (error) {
        console.error('Error getting order by ID:', error);
      }
    }
  } catch (error) {
    console.error('Error getting orders:', error);
  }
}

// Test cart API
async function testCart() {
  console.log('\n--- Testing Cart API ---');
  
  try {
    console.log('Getting cart...');
    const cartResponse = await cartService.getCart();
    console.log('Cart retrieved:', cartResponse.success);
    
    // Cart items are included in the cart response
    if (cartResponse.data?.items) {
      console.log('Cart items retrieved:', cartResponse.data.items.length);
    } else {
      console.log('No cart items found');
    }
  } catch (error) {
    console.error('Error getting cart:', error);
  }
}

// Test feedback API
async function testFeedback() {
  console.log('\n--- Testing Feedback API ---');
  
  try {
    console.log('Getting all feedback...');
    const feedbackResponse = await feedbackService.getAllFeedback();
    console.log('Feedback retrieved:', feedbackResponse.success);
    
    if (feedbackResponse.data && feedbackResponse.data.length > 0) {
      const feedbackId = feedbackResponse.data[0].id;
      
      try {
        console.log(`Getting feedback by ID: ${feedbackId}...`);
        const feedbackByIdResponse = await feedbackService.getFeedback(feedbackId);
        console.log('Feedback retrieved:', feedbackByIdResponse.success);
      } catch (error) {
        console.error('Error getting feedback by ID:', error);
      }
    }
  } catch (error) {
    console.error('Error getting feedback:', error);
  }
}

// Test registration
async function testRegistration() {
  console.log('\n--- Testing Registration ---');
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpass123',
    first_name: 'Test',
    last_name: 'User',
    role: 'customer' as 'customer'
  };
  
  try {
    console.log(`Registering new user: ${testUser.email}...`);
    const registerResponse = await authService.register(testUser);
    console.log('Registration successful:', registerResponse.success);
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

// Run all tests
async function runTests() {
  try {
    await testLogin();
    await testProducts();
    await testCategories();
    await testOrders();
    await testCart();
    await testFeedback();
    await testRegistration();
    
    console.log('\n--- All tests completed ---');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();

