// src/scripts/testApi.ts
// Script to test login for admin, vendor, and customer using centralized API
import { api, apiPost } from '../lib/api';
import type {
  MeResponse,
  ProductsResponse,
  OrdersResponse,
  CategoriesResponse,
  CartResponse,
  CartItemsResponse,
  FeedbackResponse,
  AssignProductCategoryResponse,
  DeleteProductCategoryResponse,
  RegisterResponse,
  UsersResponse,
  UserByIdResponse,
  CategoryByIdResponse,
  ProductByIdResponse,
  ProductImagesResponse,
  FeedbackByIdResponse,
  UpdateOrderStatusResponse,
  CartItem
} from './types/apiResponses';

const users = [
  {
    role: 'Admin',
    email: 'admintest1@example.com',
    password: 'adminpass123',
  },
  {
    role: 'Seller',
    email: 'vendortest1@example.com',
    password: 'pass123',
  },
  {
    role: 'Customer',
    email: 'customertest1@example.com',
    password: 'customerpass123',
  },
];

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function testMeEndpoint(token: string, role: string) {
  try {
    const me = await api.me({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /me:`, me);
  } catch (err) {
    console.error(`  [${role}] /me failed:`, err);
  }
}

async function testProductsEndpoint(token: string, role: string) {
  try {
    const products = await api.products({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /products:`, products);
  } catch (err) {
    console.error(`  [${role}] /products failed:`, err);
  }
}

async function testOrdersEndpoint(token: string, role: string) {
  try {
    const orders = await api.orders({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /orders:`, orders);
  } catch (err) {
    console.error(`  [${role}] /orders failed:`, err);
  }
}

async function testCategoriesEndpoint(token: string, role: string) {
  try {
    const categories = await api.categories({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /categories:`, categories);
  } catch (err) {
    console.error(`  [${role}] /categories failed:`, err);
  }
}

async function testCartEndpoint(token: string, role: string) {
  try {
    const cart = await api.cart({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /cart:`, cart);
  } catch (err) {
    console.error(`  [${role}] /cart failed:`, err);
  }
}

async function testFeedbackEndpoint(token: string, role: string) {
  try {
    const feedback = await api.feedback({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /feedback:`, feedback);
  } catch (err) {
    console.error(`  [${role}] /feedback failed:`, err);
  }
}

async function testCartItemsEndpoint(token: string, role: string) {
  try {
    const items = await api.cartItems({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /cart/items:`, items);
  } catch (err) {
    console.error(`  [${role}] /cart/items failed:`, err);
  }
}

async function testAddCartItem(token: string, role: string) {
  try {
    // Use dummy data for adding a cart item
    const body = { product_id: 3, quantity: 1 };
    const res = await apiPost('/cart/items', body, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    console.log(`  [${role}] POST /cart/items:`, res);
  } catch (err) {
    console.error(`  [${role}] POST /cart/items failed:`, err);
  }
}

async function testDeleteCartItem(token: string, role: string) {
  try {
    // Try deleting cart item with id 1 (dummy)
    const res = await fetch('https://indirect-yasmin-ananana-483e9951.koyeb.app/cart/items/1', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] DELETE /cart/items/1:`, await res.text());
  } catch (err) {
    console.error(`  [${role}] DELETE /cart/items/1 failed:`, err);
  }
}

async function testAssignProductCategory(token: string, role: string) {
  try {
    // Use dummy data for product/category assignment
    const res = await api.assignProductCategory('3', { category_id: 2 }, { headers: { Authorization: `Bearer ${token}` } }) as AssignProductCategoryResponse;
    console.log(`  [${role}] POST /products/3/categories:`, res);
  } catch (err) {
    console.error(`  [${role}] POST /products/3/categories failed:`, err);
  }
}

async function testDeleteProductCategory(token: string, role: string) {
  try {
    const res = await api.deleteProductCategory('3', '2', { headers: { Authorization: `Bearer ${token}` } });
    // Handle the response appropriately based on its type
    console.log(`  [${role}] DELETE /products/3/categories/2:`, res);
  } catch (err) {
    console.error(`  [${role}] DELETE /products/3/categories/2 failed:`, err);
  }
}

async function testFeedbackByProduct(token: string, role: string) {
  try {
    const res = await api.feedbackByProduct('3', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /feedback/product/3:`, res);
  } catch (err) {
    console.error(`  [${role}] /feedback/product/3 failed:`, err);
  }
}

async function testFeedbackByUser(token: string, role: string) {
  try {
    const res = await api.feedbackByUser('10', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /feedback/user/10:`, res);
  } catch (err) {
    console.error(`  [${role}] /feedback/user/10 failed:`, err);
  }
}

async function testUpdateOrderStatus(token: string, role: string) {
  try {
    // Dummy order id and status
    const res = await api.updateOrderStatus('1', { status: 'completed' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] POST /orders/1/status:`, res);
  } catch (err) {
    console.error(`  [${role}] POST /orders/1/status failed:`, err);
  }
}

async function testRegisterEndpoint(token: string, role: string) {
  try {
    // Dummy registration data (randomized email)
    const body = { email: `testuser_${Date.now()}@example.com`, password: 'Password123!', first_name: 'Test', last_name: 'User', role: 'customer' };
    const res = await api.register(body, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] POST /register:`, res);
  } catch (err) {
    console.error(`  [${role}] POST /register failed:`, err);
  }
}

async function testUsersEndpoint(token: string, role: string) {
  try {
    const res = await api.users({ headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /users:`, res);
  } catch (err) {
    console.error(`  [${role}] /users failed:`, err);
  }
}

async function testUserByIdEndpoint(token: string, role: string) {
  try {
    const res = await api.userById('10', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /users/10:`, res);
  } catch (err) {
    console.error(`  [${role}] /users/10 failed:`, err);
  }
}

async function testCategoryByIdEndpoint(token: string, role: string) {
  try {
    const res = await api.categoryById('2', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /categories/2:`, res);
  } catch (err) {
    console.error(`  [${role}] /categories/2 failed:`, err);
  }
}

async function testProductByIdEndpoint(token: string, role: string) {
  try {
    const res = await api.productById('3', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /products/3:`, res);
  } catch (err) {
    console.error(`  [${role}] /products/3 failed:`, err);
  }
}

async function testProductImagesEndpoint(token: string, role: string) {
  try {
    const res = await api.productImages('3', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /products/3/images:`, res);
  } catch (err) {
    console.error(`  [${role}] /products/3/images failed:`, err);
  }
}

async function testFeedbackByIdEndpoint(token: string, role: string) {
  try {
    const res = await api.feedbackById('2', { headers: { Authorization: `Bearer ${token}` } });
    console.log(`  [${role}] /feedback/2:`, res);
  } catch (err) {
    console.error(`  [${role}] /feedback/2 failed:`, err);
  }
}

async function tryLoginAndTestEndpoints(user: typeof users[number], maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await api.login({ email: user.email, password: user.password }) as { access_token: string };
      const token = res.access_token;
      console.log(`✅ ${user.role} login success (attempt ${attempt}):`, res);
      await testMeEndpoint(token, user.role);
      await testProductsEndpoint(token, user.role);
      await testOrdersEndpoint(token, user.role);
      await testCategoriesEndpoint(token, user.role);
      await testCartEndpoint(token, user.role);
      await testFeedbackEndpoint(token, user.role);
      await testCartItemsEndpoint(token, user.role);
      await testAddCartItem(token, user.role);
      await testDeleteCartItem(token, user.role);
      await testAssignProductCategory(token, user.role);
      await testDeleteProductCategory(token, user.role);
      await testFeedbackByProduct(token, user.role);
      await testFeedbackByUser(token, user.role);
      await testUpdateOrderStatus(token, user.role);
      await testRegisterEndpoint(token, user.role);
      await testUsersEndpoint(token, user.role);
      await testUserByIdEndpoint(token, user.role);
      await testCategoryByIdEndpoint(token, user.role);
      await testProductByIdEndpoint(token, user.role);
      await testProductImagesEndpoint(token, user.role);
      await testFeedbackByIdEndpoint(token, user.role);
      return;
    } catch (err) {
      lastError = err;
      console.error(`❌ ${user.role} login failed (attempt ${attempt}):`, err);
      if (attempt < maxAttempts) await delay(1000);
    }
  }
  console.error(`❌ ${user.role} login failed after ${maxAttempts} attempts. Last error:`, lastError);
}

async function testLogins() {
  for (const user of users) {
    await tryLoginAndTestEndpoints(user, 3);
  }
}

testLogins();
