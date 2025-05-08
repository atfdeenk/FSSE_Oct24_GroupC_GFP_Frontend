'use client';

import { useState, useEffect, Fragment } from 'react';
import { FaUserShield, FaSearch, FaEdit, FaTrash, FaPlus, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { adminService } from '@/services/api/admin';
import { UserProfile } from '@/types/apiResponses';

interface AdminUser extends UserProfile {
  permissions?: string[];
  status?: string;
}

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  permissions: string[];
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    permissions: [] as string[],
    status: 'active' // Add status property with default value
  });

  const availablePermissions = [
    { id: 'users', name: 'Users' },
    { id: 'products', name: 'Products' },
    { id: 'orders', name: 'Orders' },
    { id: 'admins', name: 'Admins' },
    { id: 'settings', name: 'Settings' },
  ];

  useEffect(() => {
    // Fetch admin users from API
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        
        // Get all users from API
        const users = await adminService.getUsers();
        
        // Filter for admin users only
        const adminUsers = users.filter(user => user.role === 'admin').map(admin => ({
          ...admin,
          // Default permissions - in a real app, these would come from the API
          permissions: ['users', 'products', 'orders']
        }));
        
        setAdmins(adminUsers);
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to load admin users');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => {
    // Safely check each property before calling toLowerCase()
    const firstNameMatch = admin.first_name ? admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const lastNameMatch = admin.last_name ? admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = admin.email ? admin.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    return firstNameMatch || lastNameMatch || emailMatch;
  });

  const handleEdit = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      password: '',
      permissions: [...(admin.permissions || [])],
      status: admin.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      permissions: [],
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => {
      // If "all" is selected, clear other permissions
      if (permissionId === 'all') {
        return {
          ...prev,
          permissions: prev.permissions.includes('all') ? [] : ['all']
        };
      }
      
      // If another permission is selected and "all" was previously selected, remove "all"
      let newPermissions = [...prev.permissions];
      if (newPermissions.includes(permissionId)) {
        newPermissions = newPermissions.filter(p => p !== permissionId);
      } else {
        newPermissions.push(permissionId);
        // Remove "all" if it was there
        newPermissions = newPermissions.filter(p => p !== 'all');
      }
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAdmin) return;
    
    try {
      // Call API to update admin
      const updatedAdmin = {
        ...currentAdmin,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        permissions: formData.permissions
      };
      
      const success = await adminService.updateUser(currentAdmin.id, updatedAdmin);
      
      if (success) {
        // Update local state
        setAdmins(prevAdmins => 
          prevAdmins.map(admin => 
            admin.id === currentAdmin.id 
              ? { 
                  ...admin, 
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  email: formData.email,
                  permissions: formData.permissions
                } 
              : admin
          )
        );
        
        toast.success(`Admin ${formData.first_name} ${formData.last_name} updated successfully`);
        setIsEditModalOpen(false);
      } else {
        throw new Error('Failed to update admin user');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin user');
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call API to add admin
      const newAdmin = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: 'admin',
        permissions: formData.permissions
      };
      
      const createdAdmin = await adminService.createUser(newAdmin);
      
      if (createdAdmin) {
        // Update local state with the returned admin that has an ID
        const adminWithPermissions: AdminUser = {
          ...createdAdmin,
          permissions: formData.permissions
        };
        
        setAdmins(prevAdmins => [...prevAdmins, adminWithPermissions]);
        
        toast.success(`Admin ${formData.first_name} ${formData.last_name} added successfully`);
        setIsAddModalOpen(false);
      } else {
        throw new Error('Failed to add admin user');
      }
    } catch (error) {
      console.error('Error adding admin user:', error);
      toast.error('Failed to add admin user');
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentAdmin) return;
    
    try {
      // Call API to delete admin
      const success = await adminService.deleteUser(currentAdmin.id);
      
      if (success) {
        // Update local state
        setAdmins(prevAdmins => 
          prevAdmins.filter(a => a.id !== currentAdmin.id)
        );
        
        toast.success(`Admin ${currentAdmin.first_name} ${currentAdmin.last_name} deleted successfully`);
        setIsDeleteModalOpen(false);
      } else {
        throw new Error('Failed to delete admin user');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FaUserPlus className="mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{admin.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{admin.first_name} {admin.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {admin.permissions?.includes('users') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Users</span>
                      )}
                      {admin.permissions?.includes('products') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Products</span>
                      )}
                      {admin.permissions?.includes('orders') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Orders</span>
                      )}
                      {admin.permissions?.includes('admins') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Admins</span>
                      )}
                      {admin.permissions?.includes('settings') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Settings</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-amber-600 hover:text-amber-900 mr-3"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Admin Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit Admin User
                  </Dialog.Title>
                  <form onSubmit={handleSubmitEdit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="space-y-2">
                        {availablePermissions.map(permission => (
                          <div key={permission.id} className="flex items-center">
                            <input
                              id={`permission-${permission.id}`}
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Add Admin Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add New Admin User
                  </Dialog.Title>
                  <form onSubmit={handleSubmitAdd} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="space-y-2">
                        {availablePermissions.map(permission => (
                          <div key={permission.id} className="flex items-center">
                            <input
                              id={`new-permission-${permission.id}`}
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`new-permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => setIsAddModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Add Admin
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Admin Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete Admin User
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {currentAdmin?.first_name} {currentAdmin?.last_name}? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleConfirmDelete}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
