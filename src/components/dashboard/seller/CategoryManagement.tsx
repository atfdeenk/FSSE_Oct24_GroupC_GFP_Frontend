"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

// Define category interface
import { Category as ApiCategory } from '@/types';
import categoryService from '@/services/api/categories';

interface Category extends ApiCategory {
  status: 'active' | 'inactive';
  product_count?: number;
}


export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Category & { image: string }>>({
    name: '',
    description: '',
    slug: '',
    image: '', // For UI binding only, will be mapped to image_url
    status: 'active'
  });

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      if (response && Array.isArray(response.categories)) {
        setCategories(response.categories as Category[]);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug when name changes
    if (name === 'name') {
      setFormData({
        ...formData,
        name: value,
        slug: generateSlug(value)
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
      if (!formData.name) {
        toast.error('Category name is required');
        setIsSubmitting(false);
        return;
      }
      // Prepare payload for API (map image -> image_url)
      const payload: any = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        image_url: formData.image,
        status: formData.status,
      };
      let apiResponse;
      if (editingCategory) {
        apiResponse = await categoryService.updateCategory(editingCategory.id, payload);
      } else {
        apiResponse = await categoryService.createCategory(payload);
      }
      // Type guard for BaseResponse (has 'success' and 'message')
      const isBaseResponse = (resp: any): resp is { success: boolean; message?: string } =>
        typeof resp === 'object' && 'success' in resp;

      if (!apiResponse || (isBaseResponse(apiResponse) && apiResponse.success === false)) {
        toast.error((isBaseResponse(apiResponse) ? apiResponse.message : undefined) || 'Failed to save category');
      } else {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        void fetchCategories(); // Refresh list
        resetForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Handle category edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      image: category.image_url || '',
      status: category.status,
      vendor_id: category.vendor_id,
    });
    setShowForm(true);
  };

  // Handle category delete
  const handleDelete = async (categoryId: number) => {
    // Find the category to check if it has products
    const category = categories.find(c => c.id === categoryId);
    
    if (category?.product_count && category.product_count > 0) {
      toast.error(`Cannot delete category with ${category.product_count} products. Remove products first.`);
      return;
    }
    
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    setLoading(true);
    try {
      // In a real application, you would send this request to your API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove category from state
      setCategories(categories.filter(category => category.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      image: '',
      status: 'active'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading && categories.length === 0) {
    return <LoadingOverlay message="Loading categories..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Category Management</h2>
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
              Add Category
            </>
          )}
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-neutral-900/50 rounded-lg border border-white/10 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
                  Category Name*
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
                <label htmlFor="slug" className="block text-sm font-medium text-white/70 mb-1">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  readOnly
                />
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
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-800 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <svg className="w-5 h-5 text-white/50 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-neutral-900/50 rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-neutral-800/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Products
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
                  <td colSpan={5} className="px-6 py-4 text-center text-white/50">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-white/50">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-neutral-800 overflow-hidden">
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name} 
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Category';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-white/30 text-xs">
                              No image
                            </div>
                          )} 
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{category.name}</div>
                          <div className="text-xs text-white/50">{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white truncate max-w-xs">{category.description || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{category.product_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(Number(category.id))}
                          className={`text-red-500 hover:text-red-400 transition-colors ${
                            category.product_count && category.product_count > 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={category.product_count ? category.product_count > 0 : false}
                          title={category.product_count && category.product_count > 0 ? 'Cannot delete category with products' : 'Delete category'}
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
