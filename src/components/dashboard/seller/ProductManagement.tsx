"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

// Define product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: number;
  category_name?: string;
  stock: number;
  status: 'active' | 'inactive';
}

// Define category interface
interface Category {
  id: number;
  name: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category_id: 0,
    stock: 0,
    status: 'active'
  });

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock categories
        const mockCategories = [
          { id: 1, name: 'Coffee Beans' },
          { id: 2, name: 'Brewing Equipment' },
          { id: 3, name: 'Accessories' },
          { id: 4, name: 'Gift Sets' },
          { id: 5, name: 'Specialty Drinks' }
        ];
        
        // Mock products
        const mockProducts = [
          { 
            id: 1, 
            name: 'Arabica Premium Blend', 
            description: 'A smooth, well-balanced coffee with mild acidity and complex flavors.',
            price: 89000,
            image: 'https://via.placeholder.com/150?text=Coffee',
            category_id: 1,
            category_name: 'Coffee Beans',
            stock: 25,
            status: 'active' as const
          },
          { 
            id: 2, 
            name: 'Pour-Over Coffee Maker', 
            description: 'Elegant glass pour-over coffee maker for a clean, flavorful brew.',
            price: 350000,
            image: 'https://via.placeholder.com/150?text=Brewer',
            category_id: 2,
            category_name: 'Brewing Equipment',
            stock: 10,
            status: 'active' as const
          },
          { 
            id: 3, 
            name: 'Coffee Grinder', 
            description: 'Adjustable ceramic burr grinder for the perfect grind every time.',
            price: 450000,
            image: 'https://via.placeholder.com/150?text=Grinder',
            category_id: 2,
            category_name: 'Brewing Equipment',
            stock: 8,
            status: 'active' as const
          },
          { 
            id: 4, 
            name: 'Coffee Mug Set', 
            description: 'Set of 4 handcrafted ceramic mugs in earthy tones.',
            price: 120000,
            image: 'https://via.placeholder.com/150?text=Mugs',
            category_id: 3,
            category_name: 'Accessories',
            stock: 15,
            status: 'active' as const
          },
          { 
            id: 5, 
            name: 'Coffee Lover Gift Box', 
            description: 'Complete gift set with premium coffee, mug, and brewing accessories.',
            price: 250000,
            image: 'https://via.placeholder.com/150?text=GiftBox',
            category_id: 4,
            category_name: 'Gift Sets',
            stock: 5,
            status: 'active' as const
          },
        ];
        
        setCategories(mockCategories);
        setProducts(mockProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!formData.name || !formData.price || !formData.category_id) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // In a real application, you would send this data to your API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingProduct) {
        // Update existing product
        const updatedProducts = products.map(product => 
          product.id === editingProduct.id 
            ? { ...product, ...formData, id: editingProduct.id } as Product
            : product
        );
        setProducts(updatedProducts);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const newProduct = {
          ...formData,
          id: Math.max(0, ...products.map(p => p.id)) + 1,
          category_name: categories.find(c => c.id === Number(formData.category_id))?.name
        } as Product;
        
        setProducts([...products, newProduct]);
        toast.success('Product created successfully');
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category_id: product.category_id,
      stock: product.stock,
      status: product.status
    });
    setShowForm(true);
  };

  // Handle product delete
  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setLoading(true);
    try {
      // In a real application, you would send this request to your API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove product from state
      setProducts(products.filter(product => product.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      category_id: 0,
      stock: 0,
      status: 'active'
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Filter products based on search term and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading && products.length === 0) {
    return <LoadingOverlay message="Loading products..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Product Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-black px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-all flex items-center gap-2"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </>
          )}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-neutral-900/50 rounded-lg border border-white/10 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-white/70 mb-1">
                  Category*
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-white/70 mb-1">
                  Price (Rp)*
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-white/70 mb-1">
                  Stock*
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-white/70 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white/70 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-black rounded-md font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <svg className="w-5 h-5 text-white/50 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <select
            value={selectedCategory === 'all' ? 'all' : selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900/50 rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-neutral-800/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-900/30 divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-white/50">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-white/50">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-neutral-800 overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Product';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-white/30 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-xs text-white/50 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{product.category_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-amber-500 font-medium">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
