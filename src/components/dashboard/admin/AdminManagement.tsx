'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { FaUserShield, FaSearch, FaEdit, FaTrash, FaPlus, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { adminService } from '@/services/api/admin';
import { UserProfile } from '@/types/apiResponses';

// Extend UserProfile with admin-specific properties
interface AdminUser extends UserProfile {
  permissions?: string[];
  status?: string;
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
    status: 'active'
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
  
  const handleAdd = () => {
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
      const permissions = [...prev.permissions];
      const index = permissions.indexOf(permissionId);
      
      if (index === -1) {
        permissions.push(permissionId);
      } else {
        permissions.splice(index, 1);
      }
      
      return {
        ...prev,
        permissions
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
      
      // In a real app, you would update the admin user via API
      // await adminService.updateUser(currentAdmin.id, updatedAdmin);
      
      // Update local state
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === currentAdmin.id ? updatedAdmin : admin
        )
      );
      
      setIsEditModalOpen(false);
      toast.success('Admin updated successfully');
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin');
    }
  };
  
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create new admin user
      const newAdminData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: 'admin',
        permissions: formData.permissions,
        status: formData.status
      };
      
      // Call API to create admin
      const newAdmin = await adminService.createUser(newAdminData);
      
      // Ensure we have a valid admin object with required properties
      const adminWithPermissions: AdminUser = {
        // Use nullish coalescing to provide fallbacks for all required fields
        id: typeof newAdmin?.id === 'number' ? newAdmin.id : Math.floor(Math.random() * 1000),
        permissions: formData.permissions,
        status: formData.status || 'active',
        // Add default values for required UserProfile properties
        first_name: newAdmin?.first_name || formData.first_name,
        last_name: newAdmin?.last_name || formData.last_name,
        email: newAdmin?.email || formData.email,
        username: newAdmin?.username || formData.email.split('@')[0],
        phone: newAdmin?.phone || '',
        address: newAdmin?.address || '',
        city: newAdmin?.city || '',
        state: newAdmin?.state || '',
        country: newAdmin?.country || '',
        zip_code: newAdmin?.zip_code || '',
        role: newAdmin?.role || 'admin',
        image_url: newAdmin?.image_url || ''
      };
      
      // Update local state
      setAdmins(prevAdmins => [...prevAdmins, adminWithPermissions]);
      
      setIsAddModalOpen(false);
      toast.success('Admin added successfully');
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!currentAdmin) return;
    
    try {
      // Call API to delete admin
      // await adminService.deleteUser(currentAdmin.id);
      
      // Update local state
      setAdmins(prevAdmins => 
        prevAdmins.filter(admin => admin.id !== currentAdmin.id)
      );
      
      setIsDeleteModalOpen(false);
      toast.success(`${currentAdmin.first_name} ${currentAdmin.last_name} has been removed`);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaUserShield className="mr-2 text-amber-600" />
          Admin Management
        </h2>
        
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FaUserPlus className="mr-2" />
            Add Admin
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
          <p className="mt-2 text-gray-500">Loading admins...</p>
        </div>
      ) : (
        <>
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No admin users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={admin.image_url || "https://via.placeholder.com/40"}
                              alt={`${admin.first_name} ${admin.last_name}`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.first_name} {admin.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {admin.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions?.map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FaEdit className="inline" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Edit Modal */}
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Edit Admin
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmitEdit} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        id="role"
                        value="admin"
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                        disabled
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Permissions
                      </label>
                      <div className="mt-2 space-y-2">
                        {availablePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`permission-${permission.id}`}
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
      
      {/* Add Modal */}
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Add New Admin
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmitAdd} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label htmlFor="add_first_name" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="add_first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label htmlFor="add_last_name" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="add_last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="add_email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="add_email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="add_password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="add_password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="add_role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        id="add_role"
                        value="admin"
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                        disabled
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Permissions
                      </label>
                      <div className="mt-2 space-y-2">
                        {availablePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`add-permission-${permission.id}`}
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`add-permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
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
      
      {/* Delete Confirmation Modal */}
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Delete
                  </Dialog.Title>
                  
                  {currentAdmin && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the admin user <span className="font-semibold">{currentAdmin.first_name} {currentAdmin.last_name}</span>? This action cannot be undone.
                      </p>
                      
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
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
