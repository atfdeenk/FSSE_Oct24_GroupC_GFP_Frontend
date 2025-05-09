"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/format';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import productService, { CreateProductData, UpdateProductData } from '@/services/api/products';
import categoryService from '@/services/api/categories';
import { useAuthUser } from '@/hooks/useAuthUser';
import { usePolling } from '@/hooks/usePolling';
import { Category as ApiCategory, Product as ApiProduct, BaseResponse } from '@/types/apiResponses';

// Define product interface for local use, extending the API type
interface Product {
  id: number; // Ensure id is always number for consistency
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  currency: string;
  image_url: string;
  location?: string;
  vendor_id?: number | string;
  slug?: string;
  unit_quantity: string;
  discount_percentage?: number;
  featured?: boolean;
  flash_sale?: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: ApiCategory[];
  category_ids?: number[]; // Use category_ids array format as required by the API
  category_id?: number; // Keep for backward compatibility with existing code
  is_approved?: boolean;
  rejected?: boolean | null;
  vendor_name?: string;
}

// Define category interface for local use
type Category = ApiCategory;

// Helper function to generate a unique slug with timestamp suffix
const generateUniqueSlug = (name: string) => {
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${baseSlug}-${Date.now().toString().slice(-6)}`;
};

export default function ProductManagement() {
  const { user } = useAuthUser();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category_ids: [], // Changed from category_id to category_ids array
    stock_quantity: 0,
    is_approved: true,
    rejected: false,
    currency: 'IDR',
    unit_quantity: 'g', // Default to grams
    slug: '' // Added slug field
  });

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parent_id: null as number | null,
    image_url: ''
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);

  // Fetch products and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories from API
      try {
        const categoriesResponse = await categoryService.getCategories();

        // Based on the actual API response format which has a categories array property
        if (categoriesResponse &&
          typeof categoriesResponse === 'object' &&
          'categories' in categoriesResponse &&
          Array.isArray((categoriesResponse as any).categories)) {
          // Get categories from the categories property
          const categoriesArray = (categoriesResponse as any).categories;

          // Filter categories by the current seller's vendor_id if user is logged in
          if (user && user.id) {
            const filteredCategories = categoriesArray.filter((category: any) => {
              const categoryVendorId = typeof category.vendor_id === 'string' ?
                parseInt(category.vendor_id) : category.vendor_id;
              return categoryVendorId === user.id;
            });
            setCategories(filteredCategories as Category[]);
            console.log(`Loaded ${filteredCategories.length} categories for vendor ${user.id}`);
          } else {
            // If no user, show all categories (should not happen in seller dashboard)
            setCategories(categoriesArray as Category[]);
            console.log(`Loaded ${categoriesArray.length} categories (no user filter)`);
          }
        } else if (Array.isArray(categoriesResponse)) {
          // Handle direct array response (fallback)
          setCategories(categoriesResponse as Category[]);
          console.log(`Loaded ${categoriesResponse.length} categories (array format)`);
        } else {
          // Fallback to empty array
          setCategories([]);
          console.warn('Categories response format not recognized, using empty array');
        }
      } catch (categoryError) {
        console.error('Error fetching categories:', categoryError);
        setCategories([]);
        toast.error('Failed to load categories');
      }

      // Fetch products from API - always filter by the current seller's vendor_id
      console.log('=== ProductManagement: Starting product fetch ===');
      let productsResponse;
      
      if (user && user.id) {
        console.log(`ProductManagement: Fetching products for vendor ID: ${user.id} (${typeof user.id})`);
        // Use the getProductsByVendor method to get only this seller's products
        productsResponse = await productService.getProductsByVendor(user.id);
      } else {
        // Fallback - should not happen in seller dashboard
        console.warn('ProductManagement: No user ID found, fetching all products');
        productsResponse = await productService.getProducts();
      }

      console.log('ProductManagement: Products response received:', productsResponse);
      
      if (productsResponse && Array.isArray(productsResponse.products)) {
        // Log the raw products data
        console.log(`ProductManagement: Raw products count: ${productsResponse.products.length}`);
        
        // Convert API products to our local Product type
        const formattedProducts = productsResponse.products.map(p => {
          // Ensure consistent ID format
          const formattedProduct = {
            ...p,
            id: typeof p.id === 'string' ? parseInt(p.id) : p.id as number
          };
          
          // Log the first few products for debugging
          if (productsResponse.products.indexOf(p) < 3) {
            console.log(`ProductManagement: Formatted product ${formattedProduct.id}:`, formattedProduct);
          }
          
          return formattedProduct;
        });

        // Apply additional vendor ID filtering to ensure we only show this user's products
        if (user && user.id) {
          // Convert user.id to number for consistent comparison
          const numericUserId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          
          // Filter products to only include those with matching vendor_id
          const vendorFilteredProducts = formattedProducts.filter(product => {
            // Convert product vendor_id to number for consistent comparison
            const productVendorId = typeof product.vendor_id === 'string' ? 
              parseInt(product.vendor_id) : product.vendor_id;
            
            const isMatch = productVendorId === numericUserId;
            if (!isMatch) {
              console.log(`Filtering out product ${product.id} (${product.name}) with vendor_id ${productVendorId} != ${numericUserId}`);
            }
            return isMatch;
          });
          
          console.log(`ProductManagement: Filtered from ${formattedProducts.length} to ${vendorFilteredProducts.length} products for vendor ${user.id}`);
          
          // Store the filtered products in state
          setProducts(vendorFilteredProducts as Product[]);
          
          // Show success message
          toast.success(`Loaded ${vendorFilteredProducts.length} products for your store`);
        } else {
          // If no user, just use the formatted products (shouldn't happen in seller dashboard)
          setProducts(formattedProducts as Product[]);
          toast.success(`Loaded ${formattedProducts.length} products`);
        }
      } else {
        setProducts([]);
        console.error('ProductManagement: Invalid products response:', productsResponse);
        toast.error('Failed to load products');
      }
      
      console.log('=== ProductManagement: Completed product fetch ===');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch when component mounts or user changes
  // This ensures we only fetch products when user authentication is complete
  useEffect(() => {
    console.log('User changed or component mounted, user:', user);
    if (user) {
      // Only fetch data if we have a user object with an ID
      console.log('User authenticated, fetching data for vendor ID:', user.id);
      fetchData();
    } else {
      console.log('Waiting for user authentication...');
      // Show loading state while waiting for authentication
      setLoading(true);
    }
  }, [user]); // Dependency on user ensures this runs when user auth completes

  // Disable automatic polling for now to debug the inconsistent product counts
  // Instead, we'll use a manual refresh button
  // usePolling(
  //   () => {
  //     console.log('Polling: refreshing product and category data');
  //     fetchData();
  //   },
  //   10000, // 10 seconds
  //   true // enabled by default
  // );
  
  // Function to manually refresh data
  const handleManualRefresh = async () => {
    try {
      toast.loading('Refreshing data...', { id: 'refresh-toast' });
      
      // Clear existing data first to avoid stale data display
      setProducts([]);
      
      // Force browser cache refresh by adding timestamp
      console.log('=== Manual refresh initiated ===');
      
      // Wait for data to be fetched
      await fetchData();
      
      // Show success toast
      toast.success('Data refreshed successfully!', { id: 'refresh-toast' });
      console.log('=== Manual refresh completed ===');
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast.error('Failed to refresh data. Please try again.', { id: 'refresh-toast' });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
      // Handle file input separately
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
      }
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
      // Validate form
      if (!formData.name || !formData.description || !formData.price) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Handle image - could be a file upload or direct URL
      let imageUrl = formData.image_url;
      
      // If there's a file upload, process it
      if (imageFile) {
        try {
          const uploadResponse = await productService.uploadProductImage(imageFile);
          if (uploadResponse && uploadResponse.image_url) {
            imageUrl = uploadResponse.image_url;
          }
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast.error('Failed to upload image, but continuing with product save');
        }
      } 
      // If there's a direct URL input but no file upload, use that
      else if (formData.image_url && formData.image_url.trim() !== '') {
        // Use the URL directly
        imageUrl = formData.image_url.trim();
        console.log('Using direct image URL:', imageUrl);
      }

      if (editingProduct) {
        // Update existing product
        const updateData: UpdateProductData = {
          name: formData.name,
          description: formData.description,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
          stock_quantity: typeof formData.stock_quantity === 'string' ? parseInt(formData.stock_quantity) : formData.stock_quantity || 0,
          currency: formData.currency || 'IDR',
          unit_quantity: formData.unit_quantity || 'piece',
          is_approved: formData.is_approved !== undefined ? formData.is_approved : true,
          rejected: formData.rejected !== undefined ? formData.rejected : false,
          // Generate a slug from the product name
          slug: formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ''
        };

        // Only include image_url if we have one and it's not empty
        if (imageUrl && imageUrl.trim() !== '') {
          updateData.image_url = imageUrl.trim();
        }
        
        // Add category if selected - use category_ids array format as required by the API
        if (formData.category_id && formData.category_id !== 0) {
          updateData.category_ids = [Number(formData.category_id)];
        } else if (formData.category_ids && formData.category_ids.length > 0) {
          updateData.category_ids = formData.category_ids.map(id => Number(id));
        }

        console.log('Updating product with data:', updateData);
        const response = await productService.updateProduct(editingProduct.id, updateData);

        if (response) {
          // Update local state
          const updatedProducts = products.map(product =>
            product.id === editingProduct.id
              ? { ...product, ...updateData, image_url: imageUrl || product.image_url } as Product
              : product
          );
          setProducts(updatedProducts);
          toast.success('Product updated successfully');

          // If category changed, handle that separately
          if (formData.category_id && formData.category_id !== editingProduct.category_id) {
            try {
              // First remove existing categories if any
              if (editingProduct.categories && editingProduct.categories.length > 0) {
                await Promise.all(editingProduct.categories.map(cat =>
                  productService.removeCategoryFromProduct(editingProduct.id, cat.id)
                ));
              }

              // Then add the new category
              await productService.addCategoryToProduct(editingProduct.id, formData.category_id);
            } catch (categoryError) {
              console.error('Error updating product category:', categoryError);
              toast.error('Product updated but category assignment failed');
            }
          }
        }
      } else {
        // Create new product
        const createData: CreateProductData = {
          name: formData.name || '',
          description: formData.description || '',
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price || 0,
          stock_quantity: typeof formData.stock_quantity === 'string' ? parseInt(formData.stock_quantity) : formData.stock_quantity || 0,
          currency: formData.currency || 'IDR',
          unit_quantity: formData.unit_quantity || 'piece',
          // Generate a slug from the product name
          slug: formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ''
        };

        // Only include image_url if we have one and it's not empty
        if (imageUrl && imageUrl.trim() !== '') {
          createData.image_url = imageUrl.trim();
        }

        // Add category if selected - use category_ids array format as required by the API
        if (formData.category_id && formData.category_id !== 0) {
          createData.category_ids = [Number(formData.category_id)];
        } else if (formData.category_ids && formData.category_ids.length > 0) {
          createData.category_ids = formData.category_ids.map(id => Number(id));
        }
        
        // Remove any undefined or null values to keep the request clean
        Object.keys(createData).forEach(key => {
          if (createData[key as keyof CreateProductData] === undefined || 
              createData[key as keyof CreateProductData] === null) {
            delete createData[key as keyof CreateProductData];
          }
        });
        
        // Log the data being sent to help debug the 400 error
        console.log('Sending product data to API:', JSON.stringify(createData, null, 2));

        console.log('Creating product with data:', createData);
        const response = await productService.createProduct(createData);

        if (response && response.id) {
          // Use the response data directly instead of fetching the product again
          // This avoids the 404 error if the product is not immediately available
          const newProduct = {
            ...response,
            id: typeof response.id === 'string' ?
              parseInt(response.id) : response.id as number,
            // Include any other fields that might be needed
            category_ids: createData.category_ids || [],
            unit_quantity: createData.unit_quantity || 'piece',
            currency: createData.currency || 'IDR',
            image_url: imageUrl || ''
          };
          
          setProducts([...products, newProduct as Product]);
          toast.success('Product created successfully');
          
          // Refresh the product list to get the latest data
          setTimeout(() => {
            fetchData();
          }, 1000); // Wait a second before refreshing to allow the server to process
        }
      }

      // Reset form and hide it
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Extract category IDs from the product's categories array
    const categoryIds = product.categories ? 
      product.categories.map(cat => typeof cat.id === 'string' ? parseInt(cat.id) : cat.id as number) : 
      [];
    
    // Set the first category as the selected category_id for the dropdown (for backward compatibility)
    const firstCategoryId = categoryIds.length > 0 ? categoryIds[0] : 0;
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category_id: firstCategoryId,
      category_ids: categoryIds, // Set all categories in the category_ids array
      stock_quantity: product.stock_quantity,
      is_approved: product.is_approved !== undefined ? product.is_approved : true,
      rejected: product.rejected !== undefined ? product.rejected : false,
      currency: product.currency || 'IDR',
      unit_quantity: product.unit_quantity || 'piece',
      slug: product.slug || '',
      flash_sale: product.flash_sale,
      featured: product.featured
    });
    setImageFile(null); // Reset image file when editing
    setShowForm(true);
  };
  
  // Handle toggle flash sale status
  const handleToggleFlashSale = async (product: Product) => {
    try {
      const updatedFlashSale = !product.flash_sale;
      toast.loading(`${updatedFlashSale ? 'Enabling' : 'Disabling'} flash sale...`, { id: 'flash-sale-toast' });
      
      // Update product with toggled flash sale status
      const response = await productService.updateProduct(product.id, {
        flash_sale: updatedFlashSale
      });
      
      if (response) {
        // Update local state
        const updatedProducts = products.map(p =>
          p.id === product.id ? { ...p, flash_sale: updatedFlashSale } : p
        );
        setProducts(updatedProducts);
        
        toast.success(
          `Flash sale ${updatedFlashSale ? 'enabled' : 'disabled'} for ${product.name}`,
          { id: 'flash-sale-toast' }
        );
      }
    } catch (error) {
      console.error('Error toggling flash sale status:', error);
      toast.error('Failed to update flash sale status', { id: 'flash-sale-toast' });
    }
  };
  
  // Handle toggle featured status
  const handleToggleFeatured = async (product: Product) => {
    try {
      const updatedFeatured = !product.featured;
      toast.loading(`${updatedFeatured ? 'Setting as' : 'Removing from'} featured products...`, { id: 'featured-toast' });
      
      // Update product with toggled featured status
      const response = await productService.updateProduct(product.id, {
        featured: updatedFeatured
      });
      
      if (response) {
        // Update local state
        const updatedProducts = products.map(p =>
          p.id === product.id ? { ...p, featured: updatedFeatured } : p
        );
        setProducts(updatedProducts);
        
        toast.success(
          `Product ${updatedFeatured ? 'added to' : 'removed from'} featured products`,
          { id: 'featured-toast' }
        );
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status', { id: 'featured-toast' });
    }
  };

  // Handle product delete
  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Find the product in our local state to get all its details
        const productToDelete = products.find(p => p.id === productId);
        
        if (!productToDelete) {
          toast.error('Product not found in local state');
          return;
        }
        
        console.log('Deleting product:', productToDelete);
        
        // Call API to delete the product
        // Ensure we're using the correct ID format that the API expects
        const response = await productService.deleteProduct(productToDelete.id);

        if (response) {
          // Update local state
          const updatedProducts = products.filter(product => product.id !== productId);
          setProducts(updatedProducts);
          toast.success('Product deleted successfully');

          // If we're editing this product, reset the form
          if (editingProduct && editingProduct.id === productId) {
            resetForm();
          }
        }
      } catch (error: any) {
        console.error('Error deleting product:', error);
        
        // Provide more detailed error message
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', error.response.data);
          
          if (error.response.status === 404) {
            toast.error('Product not found on the server. It may have been already deleted.');
          } else {
            toast.error(`Failed to delete product: ${error.response.data?.message || error.message}`);
          }
        } else {
          toast.error(`Failed to delete product: ${error.message}`);
        }
      }
    }
  };

  // Reset product form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category_id: 0,
      category_ids: [], // Reset category_ids array
      stock_quantity: 0,
      is_approved: true,
      rejected: false,
      currency: 'IDR',
      unit_quantity: 'g', // Default to grams
      slug: '' // Reset slug
    });
    setImageFile(null);
    setEditingProduct(null);
    // Don't hide the form when resetting if we're adding a new product
    // Only hide it after successful submission
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      parent_id: null,
      image_url: ''
    });
    setEditingCategory(null);
    setCategoryImageFile(null);
    setShowForm(false);
  };

  // Handle category form input change
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: name === 'parent_id' ? (value === '' ? null : parseInt(value)) : value
    }));
  };

  // Handle category image upload
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCategoryImageFile(e.target.files[0]);
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;

      // Upload image if provided
      if (categoryImageFile) {
        try {
          // Use the same image upload endpoint as products
          // Pass the file directly to the upload function
          const uploadResponse = await productService.uploadProductImage(categoryImageFile);
          if (uploadResponse && uploadResponse.image_url) {
            setCategoryFormData(prev => ({ ...prev, image_url: uploadResponse.image_url }));
          }
        } catch (error) {
          console.error('Error uploading category image:', error);
          toast.error('Failed to upload image');
          // Continue without image
        }
      }

      if (editingCategory) {
        // Update existing category
        response = await categoryService.updateCategory(editingCategory.id, categoryFormData);
        if (response) {
          // Check if response is CategoryResponse (has id) or BaseResponse (has success)
          if ('id' in response) {
            // Refresh categories list
            const updatedCategories = categories.map(cat =>
              cat.id === editingCategory.id ? { ...cat, ...categoryFormData } : cat
            );
            setCategories(updatedCategories);
            toast.success('Category updated successfully');
            resetCategoryForm();
          } else if (response.success) {
            // Handle success response without category data
            toast.success('Category updated successfully');
            // Refresh categories from API
            const refreshedCategories = await categoryService.getCategories();
            if (Array.isArray(refreshedCategories)) {
              setCategories(refreshedCategories as Category[]);
            }
            resetCategoryForm();
          } else {
            toast.error(response.message || 'Failed to update category');
          }
        }
      } else {
        // Create new category
        response = await categoryService.createCategory(categoryFormData);
        // Check if response is CategoryResponse (has id) or BaseResponse (has success)
        if (response && 'id' in response) {
          // Add the new category to the list
          const newCategory = {
            ...response,
            id: typeof response.id === 'string' ? parseInt(response.id) : response.id as number
          };
          setCategories([...categories, newCategory as Category]);
          toast.success('Category created successfully');
          resetCategoryForm();
        } else if (response && response.success) {
          toast.success('Category created successfully');
          // Refresh categories from API
          const refreshedCategories = await categoryService.getCategories();
          if (Array.isArray(refreshedCategories)) {
            setCategories(refreshedCategories as Category[]);
          }
          resetCategoryForm();
        } else {
          toast.error((response as BaseResponse)?.message || 'Failed to create category');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category edit
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      parent_id: typeof category.parent_id === 'string' ?
        parseInt(category.parent_id) : category.parent_id,
      image_url: category.image_url || ''
    });
    setCategoryImageFile(null);
    setShowForm(true);
  };

  // Handle category delete
  const handleDeleteCategory = async (categoryId: number | string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await categoryService.deleteCategory(categoryId);
        if (response && response.success) {
          // Remove the category from the list
          const idToDelete = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
          setCategories(categories.filter(cat => {
            const catId = typeof cat.id === 'string' ? parseInt(cat.id) : cat.id as number;
            return catId !== idToDelete;
          }));
          toast.success('Category deleted successfully');
        } else {
          toast.error(response?.message || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  // Extract unique categories from all products
  const extractUniqueCategories = () => {
    const uniqueCategories = new Map();
    
    // First add seller's own categories
    categories.forEach(category => {
      uniqueCategories.set(category.id, category);
    });
    
    // Then add categories from products
    products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(category => {
          if (!uniqueCategories.has(category.id)) {
            uniqueCategories.set(category.id, category);
          }
        });
      }
    });
    
    return Array.from(uniqueCategories.values());
  };
  
  // Get all unique categories for the filter dropdown
  const allCategories = extractUniqueCategories();
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      (product.categories && product.categories.some(cat => cat.id === selectedCategory));

    return matchesSearch && matchesCategory;
  });

  if (loading && products.length === 0) {
    return <LoadingOverlay message="Loading products..." />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {activeTab === 'products' ? 'Product Management' : 'Category Management'}
            </h2>
          </div>
          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="bg-blue-600 text-white px-3 py-1 rounded-md font-medium hover:bg-blue-500 transition-all flex items-center gap-1 text-sm whitespace-nowrap"
            title="Manually refresh data"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              // If form is already showing, this acts as a cancel button
              if (activeTab === 'products') {
                resetForm();
              } else {
                resetCategoryForm();
              }
            }
            setShowForm(!showForm);
          }}
          className="bg-amber-500 text-black px-4 py-2 rounded-md font-medium hover:bg-amber-400 transition-all flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{activeTab === 'products' ? 'Add Product' : 'Add Category'}</span>
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-white/70 hover:text-white'}`}
          onClick={() => {
            setActiveTab('products');
            setShowForm(false);
          }}
        >
          Products
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'categories' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-white/70 hover:text-white'}`}
          onClick={() => {
            setActiveTab('categories');
            setShowForm(false);
          }}
        >
          Categories
        </button>
      </div>

      {/* Product Form */}
      {showForm && activeTab === 'products' && (
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
                <label htmlFor="category_ids" className="block text-sm font-medium text-white/70 mb-1">
                  Categories*
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-white/50 mb-1">Selected categories:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.category_ids && formData.category_ids.length > 0 ? (
                    formData.category_ids.map((catId) => {
                      const category = categories.find(c => Number(c.id) === Number(catId));
                      return category ? (
                        <div key={catId} className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-md text-sm flex items-center">
                          {category.name}
                          <button 
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                category_ids: formData.category_ids?.filter(id => id !== catId)
                              });
                            }}
                            className="ml-2 text-amber-300 hover:text-amber-100"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="text-white/50 text-sm">No categories selected</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.category_id && formData.category_id !== 0) {
                      // Add the selected category to the category_ids array if it's not already there
                      const categoryId = Number(formData.category_id);
                      if (!formData.category_ids?.includes(categoryId)) {
                        setFormData({
                          ...formData,
                          category_ids: [...(formData.category_ids || []), categoryId],
                          category_id: 0 // Reset the dropdown
                        });
                      }
                    }
                  }}
                  className="text-sm text-amber-500 hover:text-amber-400 flex items-center"
                  disabled={!formData.category_id || formData.category_id === 0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Category
                </button>
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

              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-white/70 mb-1">
                    Stock*
                  </label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <label htmlFor="unit_quantity" className="block text-sm font-medium text-white/70 mb-1">
                    Unit*
                  </label>
                  <select
                    id="unit_quantity"
                    name="unit_quantity"
                    value={formData.unit_quantity || 'g'}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  >
                    <option value="g">g (gram)</option>
                    <option value="kg">kg (kilogram)</option>
                    <option value="piece">piece</option>
                    <option value="pack">pack</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-white/70 mb-1">
                  Product Image
                </label>
                {formData.image_url && (
                  <div className="mb-2">
                    <img
                      src={formData.image_url}
                      alt="Product preview"
                      className="h-20 w-20 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Preview';
                      }}
                    />
                  </div>
                )}
                <div className="mb-2">
                  <p className="text-xs text-white/50 mb-1">Upload an image file:</p>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">OR enter an image URL:</p>
                  <input
                    type="text"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="is_approved" className="block text-sm font-medium text-white/70 mb-1">
                  Status
                </label>
                <select
                  id="is_approved"
                  name="is_approved"
                  value={formData.is_approved ? 'true' : 'false'}
                  onChange={(e) => {
                    const isApproved = e.target.value === 'true';
                    setFormData(prev => ({
                      ...prev,
                      is_approved: isApproved,
                      rejected: !isApproved
                    }));
                  }}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.flash_sale || false}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          flash_sale: e.target.checked
                        }));
                      }}
                      className="form-checkbox h-4 w-4 text-amber-500 rounded focus:ring-amber-500/50"
                    />
                    <span className="text-sm font-medium text-white/70">Flash Sale</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          featured: e.target.checked
                        }));
                      }}
                      className="form-checkbox h-4 w-4 text-amber-500 rounded focus:ring-amber-500/50"
                    />
                    <span className="text-sm font-medium text-white/70">Featured Product</span>
                  </label>
                </div>
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

      {/* Category Form */}
      {showForm && activeTab === 'categories' && (
        <div className="bg-neutral-900/50 rounded-lg border border-white/10 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          <form onSubmit={handleCategorySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
                  Category Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="parent_id" className="block text-sm font-medium text-white/70 mb-1">
                  Parent Category
                </label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={categoryFormData.parent_id === null ? '' : categoryFormData.parent_id}
                  onChange={handleCategoryInputChange}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(cat => !editingCategory || cat.id !== editingCategory.id).map(category => (
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
                  value={categoryFormData.description}
                  onChange={handleCategoryInputChange}
                  rows={3}
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="category_image" className="block text-sm font-medium text-white/70 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  id="category_image"
                  onChange={handleCategoryImageChange}
                  accept="image/*"
                  className="w-full bg-neutral-800 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {(categoryFormData.image_url || (editingCategory && editingCategory.image_url)) && (
                  <div className="mt-2">
                    <p className="text-sm text-white/70 mb-1">Current Image:</p>
                    <img
                      src={categoryFormData.image_url || (editingCategory ? editingCategory.image_url || '' : '')}
                      alt="Category Preview"
                      className="h-20 w-auto object-contain rounded-md border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetCategoryForm}
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

      {/* Filters - Only show in Products tab */}
      {activeTab === 'products' && (
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
              {allCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Products Table - Only show in Products tab */}
      {activeTab === 'products' && (
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                    Flash Sale
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-neutral-800">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center bg-neutral-700 text-white/50">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {product.name} 
                              <span className="text-xs text-amber-500 ml-1">
                                (Vendor ID: {product.vendor_id || 'N/A'})
                              </span>
                            </div>
                            <div className="text-xs text-white/50 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {product.categories && product.categories.length > 0
                            ? product.categories.map(cat => cat.name).join(', ')
                            : 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{formatCurrency(product.price, product.currency || 'IDR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{product.stock_quantity} {product.unit_quantity || 'piece'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.is_approved ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFlashSale(product)}
                          className={`px-2 py-1 rounded-md text-xs font-medium ${product.flash_sale ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-white/70'}`}
                        >
                          {product.flash_sale ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`px-2 py-1 rounded-md text-xs font-medium ${product.featured ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-white/70'}`}
                        >
                          {product.featured ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-amber-500 hover:text-amber-400 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-white/50">
                      {loading ? 'Loading products...' : 'No products found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Table - Only show in Categories tab */}
      {activeTab === 'categories' && (
        <div className="bg-neutral-900/50 rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-neutral-800/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Parent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <tr key={category.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-neutral-800">
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center bg-neutral-700 text-white/50">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {category.parent_id ?
                            categories.find(c => {
                              const parentId = typeof category.parent_id === 'string' ?
                                parseInt(category.parent_id) : category.parent_id;
                              const categoryId = typeof c.id === 'string' ?
                                parseInt(c.id) : c.id as number;
                              return categoryId === parentId;
                            })?.name || 'Unknown'
                            : 'None (Top Level)'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white truncate max-w-xs">{category.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-amber-500 hover:text-amber-400 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-white/50">
                      {loading ? 'Loading categories...' : 'No categories found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
