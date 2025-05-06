"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components';
import CheckoutForm, { CheckoutFormData } from '@/components/checkout/CheckoutForm';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import { useCart } from '@/hooks/useCart';
import { useBalance } from '@/hooks/useBalance';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isAuthenticated } from '@/lib/auth';
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/utils/cartUtils';
import { formatCurrency } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { ordersService } from '@/services/api/orders';
import usersService from '@/services/api/users';
import cartService from '@/services/api/cart';
import { refreshCart, refreshBalance } from '@/utils/events';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { CartItemWithDetails } from '@/types/cart';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, selectedItems, loading: cartLoading, setSelectedItems } = useCart();
  const { user } = useAuthUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [newAddress, setNewAddress] = useState({
    id: Date.now(),
    fullName: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.zip_code || ''
  });
  
  // Create a default address from user profile
  const defaultAddress = {
    id: 0,
    fullName: user ? `${user.first_name} ${user.last_name}` : 'Local Artisan Shop',
    email: user?.email || 'customer@example.com',
    phone: user?.phone || '1234567890',
    address: user?.address || '123 Sustainable Lane, Eco Village',
    city: user?.city || 'Green District',
    postalCode: user?.zip_code || '12345'
  };
  
  // Initialize saved addresses with the default address
  const [savedAddresses, setSavedAddresses] = useState([defaultAddress]);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);
  
  // Update default address and selected address when user data changes
  useEffect(() => {
    if (user) {
      const updatedDefaultAddress = {
        id: 0,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postalCode: user.zip_code
      };
      
      // Update the default address in the saved addresses list
      setSavedAddresses(prev => {
        const filtered = prev.filter(addr => addr.id !== 0);
        return [updatedDefaultAddress, ...filtered];
      });
      
      // If the currently selected address is the default address (id=0), update it
      if (selectedAddress.id === 0) {
        setSelectedAddress(updatedDefaultAddress);
      }
    }
  }, [user]);
  
  // State for eco-friendly packaging options
  const [ecoPackaging, setEcoPackaging] = useState<Record<string | number, boolean>>({});
  
  // State for product notes
  const [productNotes, setProductNotes] = useState<Record<string | number, string>>({});
  const [carbonOffset, setCarbonOffset] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'cod'>('balance');
  
  // Helper function to group cart items by seller
  const groupItemsBySeller = (items: CartItemWithDetails[]) => {
    return items.reduce<Record<string, CartItemWithDetails[]>>((groups, item) => {
      // Get seller name from available properties with fallbacks
      // The Product type doesn't have a seller property, so we need to check location
      const sellerName = (
        // Try to get from cart item first
        (item as any).seller || 
        // Then try product location
        item.product?.location || 
        // Fallback to a default
        'Local Artisan'
      );
      
      // Create the group if it doesn't exist
      if (!groups[sellerName]) {
        groups[sellerName] = [];
      }
      
      // Add the item to the group
      groups[sellerName].push(item);
      
      return groups;
    }, {});
  };

  // State to track our filtered cart items
  const [selectedCartItems, setSelectedCartItems] = useState<CartItemWithDetails[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Force cart refresh when component mounts to ensure we have the latest data
  useEffect(() => {
    const refreshCartData = async () => {
      try {
        // Force a cart refresh to ensure we have the latest items
        console.log('Forcing cart refresh on checkout page load');
        refreshCart({ preserveSelections: true });
      } catch (error) {
        console.error('Error refreshing cart:', error);
      }
    };
    
    refreshCartData();
  }, []);
  
  // Load selected items from localStorage and sync with cart
  useEffect(() => {
    const syncSelectedItems = async () => {
      // Skip if cart is still loading
      if (cartLoading) {
        console.log('Cart is still loading, skipping sync');
        return;
      }
      
      // Get current selected items from context for logging only
      const currentSelectedCount = selectedItems.size;
      console.log('Syncing selected items. Cart items:', cartItems.length, 'Selected items:', currentSelectedCount);
      
      // Check both localStorage keys for selected items
      if (typeof window !== 'undefined') {
        try {
          // Try cartSelectedItems first (our new standard)
          let storedSelectedItems = localStorage.getItem('cartSelectedItems');
          
          // Fall back to checkoutSelectedItems if needed
          if (!storedSelectedItems) {
            storedSelectedItems = localStorage.getItem('checkoutSelectedItems');
          }
          
          if (storedSelectedItems) {
            const parsedItems = JSON.parse(storedSelectedItems);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              console.log('Found stored selected items:', parsedItems);
              
              // Filter cart items that match the IDs (handle both string and number types)
              const filtered = cartItems.filter(item => {
                return parsedItems.some(id => 
                  item.id === id || 
                  String(item.id) === String(id) || 
                  Number(item.id) === Number(id)
                );
              });
              
              console.log('Filtered items from localStorage:', filtered.length);
              
              if (filtered.length > 0) {
                console.log('Setting selected cart items from localStorage:', filtered.map(i => i.id));
                setSelectedCartItems(filtered);
                
                // Update the selected items in the cart context
                // Only update localStorage if we're initializing to avoid infinite loops
                if (!hasInitialized) {
                  setSelectedItems(new Set(filtered.map(item => item.id)));
                }
              } else if (cartItems.length > 0) {
                // If no items match but we have cart items, select all cart items
                console.log('No matching items found, using all cart items');
                const allIds = cartItems.map(item => item.id);
                setSelectedCartItems(cartItems);
                
                // Only update selected items and localStorage if we're initializing
                if (!hasInitialized) {
                  setSelectedItems(new Set(allIds));
                  localStorage.setItem('cartSelectedItems', JSON.stringify(allIds));
                }
              }
            } else if (cartItems.length > 0 && !hasInitialized) {
              // If no valid items in localStorage but we have cart items, select all
              // Only do this during initialization
              console.log('No valid items in localStorage, using all cart items');
              const allIds = cartItems.map(item => item.id);
              setSelectedCartItems(cartItems);
              setSelectedItems(new Set(allIds));
              localStorage.setItem('cartSelectedItems', JSON.stringify(allIds));
            }
          } else if (currentSelectedCount > 0) {
            // If no localStorage entry but we have selected items in context
            console.log('No localStorage entry, using selectedItems from context');
            const filtered = cartItems.filter(item => {
              return Array.from(selectedItems).some(id => 
                item.id === id || 
                String(item.id) === String(id) || 
                Number(id) === item.id || 
                id === item.id
              );
            });
            
            if (filtered.length > 0) {
              console.log('Setting selected cart items from context:', filtered.map(i => i.id));
              setSelectedCartItems(filtered);
              
              // Only update localStorage during initialization
              if (!hasInitialized) {
                localStorage.setItem('cartSelectedItems', JSON.stringify(filtered.map(item => item.id)));
              }
            } else if (cartItems.length > 0 && !hasInitialized) {
              // If no selected items in context but we have cart items, select all
              // Only do this during initialization
              console.log('No selected items in context, using all cart items');
              const allIds = cartItems.map(item => item.id);
              setSelectedCartItems(cartItems);
              setSelectedItems(new Set(allIds));
              localStorage.setItem('cartSelectedItems', JSON.stringify(allIds));
            }
          } else if (cartItems.length > 0 && !hasInitialized) {
            // If no selected items anywhere but we have cart items, select all
            // Only do this during initialization
            console.log('No selected items anywhere, using all cart items');
            const allIds = cartItems.map(item => item.id);
            setSelectedCartItems(cartItems);
            setSelectedItems(new Set(allIds));
            localStorage.setItem('cartSelectedItems', JSON.stringify(allIds));
          }
        } catch (error) {
          console.error('Error parsing selected items from localStorage:', error);
          // Fallback to all cart items if we have any, but only during initialization
          if (cartItems.length > 0 && !hasInitialized) {
            const allIds = cartItems.map(item => item.id);
            setSelectedCartItems(cartItems);
            setSelectedItems(new Set(allIds));
            localStorage.setItem('cartSelectedItems', JSON.stringify(allIds));
          }
        }
      }
      
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    };
    
    // Run the sync function whenever cart items or cart loading changes
    syncSelectedItems();
  }, [cartItems, cartLoading, hasInitialized]);

  // Redirect if not authenticated or if no items in cart
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=checkout');
      return;
    }
    
    // Redirect if no items in cart and we've initialized
    if (hasInitialized && selectedCartItems.length === 0 && cartItems.length === 0) {
      console.log('No items in cart, redirecting to cart page');
      router.push('/cart');
    }
  }, [hasInitialized, selectedCartItems, cartItems, router]);
  
  // Synchronize selected items between context and cart items
  useEffect(() => {
    if (!hasInitialized || cartLoading) {
      return;
    }

    // If we have selectedCartItems but the context selectedItems doesn't match
    if (selectedCartItems.length > 0 && selectedCartItems.length !== selectedItems.size) {
      console.log('Synchronizing selected items with cart items');
      // Update the selected items in context to match the selected cart items
      const selectedCartIds = selectedCartItems.map(item => item.id);
      setSelectedItems(new Set(selectedCartIds));
      
      // Update localStorage with the correct IDs
      localStorage.setItem('cartSelectedItems', JSON.stringify(selectedCartIds));
    }
  }, [selectedCartItems, selectedItems, hasInitialized, cartLoading, setSelectedItems]);

  // Add a separate effect with a delay to check for selected items
  useEffect(() => {
    // Only run this check after we've tried to initialize the selected items
    if (!hasInitialized) {
      return;
    }
    
    // Don't check immediately to allow time for items to load from localStorage
    const timer = setTimeout(() => {
      // Only check once cart is loaded and not on first render
      // Only redirect if we have cart items but none are selected
      if (!cartLoading && selectedCartItems.length === 0 && cartItems.length > 0) {
        // Check localStorage one more time before redirecting
        const storedItems = localStorage.getItem('cartSelectedItems');
        if (!storedItems || JSON.parse(storedItems).length === 0) {
          console.log('No items selected, redirecting to cart');
          toast.error('Please select items to checkout first');
          router.push('/cart');
        }
      }
    }, 3000); // Increased timeout to ensure everything has loaded
    
    return () => clearTimeout(timer);
  }, [cartLoading, selectedCartItems.length, cartItems.length, router, hasInitialized]);
  
  // Keep selected items in localStorage when component unmounts
  // but remove the old format key to avoid confusion
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        // Only remove the old format key, keep the new one (cartSelectedItems)
        localStorage.removeItem('checkoutSelectedItems');
      }
    };
  }, []);

  // Handle address form changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new address
  const saveNewAddress = () => {
    // Validate required fields
    if (!newAddress.fullName || !newAddress.email || !newAddress.phone || 
        !newAddress.address || !newAddress.city || !newAddress.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Add the new address to the saved addresses list
    const addressToSave = { ...newAddress, id: Date.now() };
    setSavedAddresses(prev => [...prev, addressToSave]);
    setSelectedAddress(addressToSave);
    
    // Here you would typically save the address to your backend as well
    toast.success('Address saved successfully');
    setShowNewAddressForm(false);
    
    // Reset the new address form
    setNewAddress({
      id: Date.now(),
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: ''
    });
  };

  // Initialize eco-packaging state based on selected items
  useEffect(() => {
    if (selectedCartItems.length > 0) {
      // Check if we need to update eco-packaging state
      let needsUpdate = false;
      const newEcoPackaging = { ...ecoPackaging };
      
      // Add any missing items
      selectedCartItems.forEach(item => {
        // Convert item.id to string for consistent key access
        const itemId = String(item.id);
        if (newEcoPackaging[itemId] === undefined) {
          newEcoPackaging[itemId] = false;
          needsUpdate = true;
        }
      });
      
      // Remove any items that are no longer selected
      Object.keys(newEcoPackaging).forEach(id => {
        // Check if this id exists in selectedCartItems
        const exists = selectedCartItems.some(item => {
          return String(item.id) === id || 
                 Number(id) === item.id || 
                 id === item.id;
        });
        
        if (!exists) {
          delete newEcoPackaging[id];
          needsUpdate = true;
        }
      });
      
      // Only update state if needed to avoid infinite loops
      if (needsUpdate) {
        console.log('Updating eco-packaging state:', newEcoPackaging);
        setEcoPackaging(newEcoPackaging);
      }
    } else if (Object.keys(ecoPackaging).length > 0 && selectedCartItems.length === 0) {
      // Clear eco-packaging if no items are selected
      setEcoPackaging({});
    }
  }, [selectedCartItems, ecoPackaging]);
  
  // Calculate totals
  const subtotal = calculateSubtotal(selectedCartItems);
  const ecoPackagingCost = Object.values(ecoPackaging).filter(Boolean).length * 2000;
  const carbonOffsetCost = carbonOffset ? 800 : 0;
  const discount = calculateDiscount(subtotal, promoDiscount);
  const total = calculateTotal(subtotal + ecoPackagingCost + carbonOffsetCost, discount);

  const handleCheckout = async (formData: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      // Double-check we have selected items to checkout
      if (selectedCartItems.length === 0) {
        toast.error('Please select items to checkout first');
        router.push('/cart');
        return;
      }
      
      // Check if payment method is balance and if balance is sufficient
      if (formData.paymentMethod === 'balance') {
        // Get current balance
        const balanceResponse = await usersService.getUserBalance();
        const currentBalance = balanceResponse.success ? balanceResponse.balance : 0;
        
        // Calculate total with all additional costs
        const finalSubtotal = calculateSubtotal(selectedCartItems);
        const finalEcoPackagingCost = Object.values(ecoPackaging).filter(Boolean).length * 2000;
        const finalCarbonOffsetCost = carbonOffset ? 800 : 0;
        const finalDiscount = calculateDiscount(finalSubtotal, promoDiscount);
        const finalTotal = calculateTotal(finalSubtotal + finalEcoPackagingCost + finalCarbonOffsetCost, finalDiscount);
        
        // Check if balance is sufficient
        if (currentBalance < finalTotal) {
          toast.error('Insufficient balance for this purchase. Please use Cash on Delivery or add funds to your balance.');
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log('Processing checkout with selected items:', selectedCartItems);
      
      // Initialize eco-packaging for any items that don't have it yet
      const updatedEcoPackaging = { ...ecoPackaging };
      selectedCartItems.forEach(item => {
        if (updatedEcoPackaging[item.id] === undefined) {
          updatedEcoPackaging[item.id] = false;
        }
      });
      
      // Create order items from selected cart items with eco-packaging info and notes
      const orderItems = selectedCartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price || item.unit_price || item.price || 0,
        // Include eco-packaging info for each item
        eco_packaging: updatedEcoPackaging[item.id] || false,
        // Include product notes if any
        note: productNotes[item.id] || ''
      }));
      
      // Calculate accurate totals including eco-packaging and carbon offset
      const finalSubtotal = calculateSubtotal(selectedCartItems);
      const finalEcoPackagingCost = Object.values(updatedEcoPackaging).filter(Boolean).length * 2000;
      const finalCarbonOffsetCost = carbonOffset ? 800 : 0;
      const finalDiscount = calculateDiscount(finalSubtotal, promoDiscount);
      const finalTotal = calculateTotal(finalSubtotal + finalEcoPackagingCost + finalCarbonOffsetCost, finalDiscount);
      
      // Build comprehensive order notes
      const orderNotes = [
        Object.values(updatedEcoPackaging).filter(Boolean).length > 0 ? `Eco-friendly packaging for ${Object.values(updatedEcoPackaging).filter(Boolean).length} items.` : '',
        carbonOffset ? 'Carbon offset for delivery included.' : '',
        formData.notes ? `Customer notes: ${formData.notes}` : ''
      ].filter(Boolean).join(' ');
      
      // Get the vendor ID from the first item (assuming all items are from the same vendor)
      // In a multi-vendor scenario, we would need to create separate orders for each vendor
      const vendor_id = selectedCartItems[0]?.product?.vendor_id || 
                       selectedCartItems[0]?.vendor_id || 
                       (selectedCartItems[0] as any)?.seller_id || 19; // Fallback to 19 if no vendor ID found
      
      // Simplify the order items to exactly match the required API format
      const simplifiedOrderItems = selectedCartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price || item.unit_price || item.price || 0
      }));
      
      // Create the order payload according to the API requirements
      const orderPayload = {
        vendor_id,
        items: simplifiedOrderItems
      };
      
      // Store additional order data for the success page
      if (typeof window !== 'undefined') {
        localStorage.setItem('checkout_additional_data', JSON.stringify({
          shipping_address: {
            full_name: formData.fullName,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            phone: formData.phone,
            email: formData.email
          },
          payment_method: formData.paymentMethod,
          notes: orderNotes,
          eco_packaging: updatedEcoPackaging,
          product_notes: productNotes
        }));
      }
      
      console.log('Creating order with data:', orderPayload);
      
      // Create the order
      const orderResponse = await ordersService.createOrder(orderPayload);
      
      console.log('Order API response:', orderResponse);
      
      // Check if order was created successfully
      // The API returns { msg: "Order created", order_id: number, items: [...] }
      if (!orderResponse) {
        throw new Error('Failed to create order - no response');
      }
      
      // Handle different response formats
      let orderId: string | number;
      
      if ('order_id' in orderResponse && orderResponse.order_id) {
        // New API format
        orderId = orderResponse.order_id as string | number;
      } else if ('data' in orderResponse && orderResponse.data && typeof orderResponse.data === 'object') {
        // Old format with data property
        const data = orderResponse.data as any;
        orderId = data.id || data.order_id || 0;
      } else if ('id' in orderResponse && orderResponse.id) {
        // Direct ID in response
        orderId = orderResponse.id as string | number;
      } else {
        console.error('Unexpected order response format:', orderResponse);
        throw new Error('Failed to create order - could not find order ID in response');
      }
      
      if (!orderId) {
        throw new Error('Order created but no ID returned');
      }
      
      console.log('Order created successfully with ID:', orderId);
      
      // If payment method is balance, process the actual balance payment
      if (formData.paymentMethod === 'balance') {
        try {
          // Calculate the final total with all costs
          const finalSubtotal = calculateSubtotal(selectedCartItems);
          const finalEcoPackagingCost = Object.values(ecoPackaging).filter(Boolean).length * 2000;
          const finalCarbonOffsetCost = carbonOffset ? 800 : 0;
          const finalDiscount = calculateDiscount(finalSubtotal, promoDiscount);
          const finalTotal = calculateTotal(finalSubtotal + finalEcoPackagingCost + finalCarbonOffsetCost, finalDiscount);
          
          console.log('Processing balance payment for order:', orderId, 'with amount:', finalTotal);
          
          // Deduct the amount from the user's balance (negative amount for payment)
          const paymentResult = await usersService.updateBalance(-finalTotal);
          
          if (!paymentResult.success) {
            throw new Error(paymentResult.error || 'Failed to process payment');
          }
          
          console.log('Balance payment processed successfully for order:', orderId);
          console.log('New balance after payment:', paymentResult.balance);
          
          // Refresh balance display
          refreshBalance();
        } catch (paymentError) {
          console.error('Payment processing error:', paymentError);
          throw new Error('Payment processing failed. Please try again.');
        }
      }
      
      // Clear cart after successful order - remove selected items
      try {
        console.log('Removing selected items from cart:', selectedCartItems.map(item => item.id));
        
        // Create a copy of the selected cart items to avoid issues during iteration
        const itemsToRemove = [...selectedCartItems];
        
        // Remove items one by one with proper error handling
        for (const item of itemsToRemove) {
          try {
            console.log(`Removing item ${item.id} from cart`);
            await cartService.removeFromCart(item.id);
          } catch (itemError) {
            console.error(`Error removing item ${item.id} from cart:`, itemError);
            // Continue with other items even if one fails
          }
        }
        
        // Clear the localStorage
        localStorage.removeItem('checkoutSelectedItems');
        
        // Trigger cart refresh event - we don't need to preserve selections after checkout
        refreshCart({ preserveSelections: false });
      } catch (cartError) {
        console.error('Error clearing cart items:', cartError);
        // Continue with checkout even if cart clearing fails
      }
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to success page with order ID
      router.push(`/checkout/success?order_id=${orderId}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <LoadingOverlay visible={true} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-grow py-6 px-4 md:py-8 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Checkout Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Checkout</h1>
              <div className="flex items-center text-sm text-white/70">
                <svg className="w-5 h-5 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Checkout
              </div>
            </div>
            <p className="text-white/60 mt-1">Complete your purchase by providing shipping and payment details</p>
            
            {/* Checkout Progress */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
                    1
                  </div>
                  <div className="text-sm font-medium text-white/80 mt-2">Cart</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
                    2
                  </div>
                  <div className="text-sm font-medium text-white mt-2">Checkout</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 text-white/60 w-8 h-8 rounded-full flex items-center justify-center font-medium">
                    3
                  </div>
                  <div className="text-sm font-medium text-white/60 mt-2">Complete</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* Shipping Address Section */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden mb-6">
                <div className="bg-green-900/30 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-green-500 mr-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white">SHIPPING ADDRESS</h2>
                  </div>
                  
                  {/* Toggle between saved, list, and new address */}
                  <div className="flex items-center space-x-2">
                    <button 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${!showNewAddressForm && !showSavedAddresses ? 'bg-green-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      onClick={() => {
                        setShowNewAddressForm(false);
                        setShowSavedAddresses(false);
                      }}
                    >
                      Selected
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${showSavedAddresses ? 'bg-green-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      onClick={() => {
                        setShowNewAddressForm(false);
                        setShowSavedAddresses(true);
                      }}
                    >
                      Saved ({savedAddresses.length})
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${showNewAddressForm ? 'bg-green-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      onClick={() => {
                        setShowNewAddressForm(true);
                        setShowSavedAddresses(false);
                      }}
                    >
                      New
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {!showNewAddressForm && !showSavedAddresses ? (
                    // Selected address display
                    <div className="flex items-start">
                      <div className="text-green-500 mr-2 mt-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">{selectedAddress.fullName}</div>
                        <div className="text-white/60 mt-1 text-sm">
                          {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.postalCode}
                        </div>
                        <div className="text-white/60 mt-1 text-sm">
                          {selectedAddress.email} • {selectedAddress.phone}
                        </div>
                      </div>
                      <button 
                        className="ml-auto text-sm text-green-500 font-medium hover:text-green-400 transition-colors"
                        onClick={() => setShowSavedAddresses(true)}
                      >
                        Change
                      </button>
                    </div>
                  ) : showSavedAddresses ? (
                    // Saved addresses list
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h3 className="text-white font-medium mb-2">Your Saved Addresses</h3>
                        <p className="text-white/60 text-sm">Select an address to use for this order</p>
                      </div>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {savedAddresses.map((address) => (
                          <div 
                            key={address.id}
                            className={`p-3 rounded-lg border ${selectedAddress.id === address.id ? 'border-green-500 bg-green-900/20' : 'border-white/10 bg-black/30'} hover:border-green-500 transition-colors cursor-pointer`}
                            onClick={() => {
                              setSelectedAddress(address);
                              setShowSavedAddresses(false);
                            }}
                          >
                            <div className="flex items-start">
                              <div className="text-green-500 mr-2 mt-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div className="flex-grow">
                                <div className="font-medium text-white">{address.fullName}</div>
                                <div className="text-white/60 mt-1 text-sm">
                                  {address.address}, {address.city}, {address.postalCode}
                                </div>
                                <div className="text-white/60 mt-1 text-sm">
                                  {address.email} • {address.phone}
                                </div>
                              </div>
                              {selectedAddress.id === address.id && (
                                <div className="text-green-500 ml-2">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t border-white/10">
                        <button 
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                          onClick={() => setShowSavedAddresses(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                          onClick={() => {
                            setShowNewAddressForm(true);
                            setShowSavedAddresses(false);
                          }}
                        >
                          Add New Address
                        </button>
                      </div>
                    </div>
                  ) : (
                    // New address form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fullName" className="block text-white/70 text-sm font-medium mb-2">Full Name*</label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={newAddress.fullName}
                            onChange={handleAddressChange}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-2">Email Address*</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={newAddress.email}
                            onChange={handleAddressChange}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                            placeholder="Enter your email address"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-white/70 text-sm font-medium mb-2">Phone Number*</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleAddressChange}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="city" className="block text-white/70 text-sm font-medium mb-2">City*</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressChange}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                            placeholder="Enter your city"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="postalCode" className="block text-white/70 text-sm font-medium mb-2">Postal Code*</label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={newAddress.postalCode}
                            onChange={handleAddressChange}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                            placeholder="Enter your postal code"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-white/70 text-sm font-medium mb-2">Complete Address*</label>
                        <textarea
                          id="address"
                          name="address"
                          value={newAddress.address}
                          onChange={handleAddressChange}
                          rows={3}
                          className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                          placeholder="Enter your complete address (street name, building number, etc.)"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button 
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                          onClick={saveNewAddress}
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items Section */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden mb-6">
                <div className="bg-green-900/30 px-6 py-4 border-b border-white/10 flex items-center">
                  <div className="flex items-center">
                    <div className="text-green-500 mr-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white">YOUR ORDER • Local Artisan Products</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/80 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      BumiBrew Marketplace
                    </div>
                    <div className="text-white/60 text-sm">{selectedCartItems.length} items</div>
                  </div>
                  
                  {/* Debug information - Only visible during development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-black/30 border border-white/10 rounded-lg">
                      <div className="text-white/70 text-xs mb-1">Debug Info:</div>
                      <div className="text-white/60 text-xs">Selected Cart Items: {selectedCartItems.length}</div>
                      <div className="text-white/60 text-xs">Cart Items: {cartItems.length}</div>
                      <div className="text-white/60 text-xs">Selected IDs in Context: {Array.from(selectedItems).join(', ')}</div>
                      <div className="text-white/60 text-xs">Selected IDs in Cart: {selectedCartItems.map(item => item.id).join(', ')}</div>
                    </div>
                  )}
                  
                  {/* Product list */}
                  {selectedCartItems.length === 0 ? (
                    <div className="text-center py-6 text-white/60">
                      <svg className="w-12 h-12 mx-auto text-white/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p>No products selected for checkout.</p>
                      <p className="text-sm mt-1">Please return to your cart and select items.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Group items by seller */}
                      {Object.entries(groupItemsBySeller(selectedCartItems)).map(([seller, items]) => (
                        <div key={seller} className="border border-white/10 rounded-lg overflow-hidden">
                          {/* Seller Header */}
                          <div className="bg-black/30 px-4 py-3 border-b border-white/10">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-white font-medium">{seller}</span>
                            </div>
                          </div>
                          
                          {/* Seller Items */}
                          <div className="p-4 space-y-4">
                            {items.map((item) => (
                              <div key={item.id} className="flex flex-col">
                                <div className="flex items-start pb-3 mb-2 border-b border-white/5">
                                  {/* Product Image */}
                                  <div className="w-16 h-16 rounded-md overflow-hidden bg-white/5 mr-3 flex-shrink-0">
                                    <img 
                                      src={item.product?.image_url || item.image_url || '/images/product-placeholder.png'} 
                                      alt={item.product?.name || item.name || `Product #${item.product_id}`} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/product-placeholder.png';
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Product Details */}
                                  <div className="flex-grow">
                                    <div className="text-white font-medium">
                                      {item.product?.name || item.name || `Product #${item.product_id}`}
                                    </div>
                                    <div className="flex items-center text-white/60 text-sm mt-1">
                                      <svg className="w-3 h-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      {item.product?.location || 'Local Artisan'}
                                    </div>
                                    
                                    {item.product?.categories && item.product.categories.length > 0 && (
                                      <div className="mt-1 text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full inline-block">
                                        {item.product.categories[0].name}
                                      </div>
                                    )}
                                    
                                    {/* Eco-friendly Option */}
                                    <div 
                                      className="flex items-center mt-2 cursor-pointer hover:bg-white/5 p-1.5 rounded-md transition-colors"
                                      onClick={() => {
                                        setEcoPackaging(prev => ({
                                          ...prev,
                                          [item.id]: !prev[item.id]
                                        }));
                                      }}
                                    >
                                      <input 
                                        type="checkbox" 
                                        id={`eco-${item.id}`} 
                                        className="h-4 w-4 text-green-500 border-white/30 rounded bg-black cursor-pointer"
                                        checked={!!ecoPackaging[item.id]}
                                        onChange={() => {
                                          setEcoPackaging(prev => ({
                                            ...prev,
                                            [item.id]: !prev[item.id]
                                          }));
                                        }}
                                      />
                                      <label htmlFor={`eco-${item.id}`} className="ml-2 text-sm text-white/70 cursor-pointer">
                                        Add eco-friendly packaging (+{formatCurrency(2000)})
                                      </label>
                                    </div>
                                  </div>
                                  
                                  {/* Price and Quantity */}
                                  <div className="text-right ml-4">
                                    <div className="text-white font-medium">
                                      {formatCurrency((item.product?.price || item.unit_price || item.price || 0) * item.quantity)}
                                    </div>
                                    <div className="text-white/60 text-sm mt-1">
                                      {item.quantity} × {formatCurrency(item.product?.price || item.unit_price || item.price || 0)}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Product Note */}
                                <div className="mt-1 w-full">
                                  <textarea
                                    placeholder={`Note for ${item.product?.name || item.name || 'this product'} (optional)`}
                                    className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50"
                                    rows={2}
                                    onChange={(e) => {
                                      // Update product notes in state
                                      setProductNotes(prev => ({
                                        ...prev,
                                        [item.id]: e.target.value
                                      }));
                                    }}
                                    value={productNotes[item.id] || ''}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Shipping Options */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center p-3 border border-white/10 bg-black/30 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div>
                        <div className="font-medium text-white">Shipping Method</div>
                      </div>
                      <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border border-white/10 bg-black/30 rounded-lg mt-3 cursor-pointer hover:border-green-500 transition-colors">
                      <div>
                        <div className="font-medium text-white">Local Delivery ({formatCurrency(13000)})</div>
                        <div className="text-white/60 text-sm">Estimated arrival: 2-3 business days</div>
                      </div>
                      <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {/* Carbon Offset Option */}
                    <div 
                      className="flex items-center mt-4 cursor-pointer hover:bg-white/5 p-1.5 rounded-md transition-colors"
                      onClick={() => setCarbonOffset(prev => !prev)}
                    >
                      <input 
                        type="checkbox" 
                        id="carbon-offset" 
                        className="h-4 w-4 text-green-500 border-white/30 rounded bg-black cursor-pointer"
                        checked={carbonOffset}
                        onChange={() => setCarbonOffset(prev => !prev)}
                      />
                      <label htmlFor="carbon-offset" className="ml-2 text-sm text-white/70 cursor-pointer">
                        Add carbon offset for delivery (+{formatCurrency(800)})
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="sticky top-20">
                {/* Payment Method Section */}
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden mb-6">
                  <div className="bg-green-900/30 px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Payment Options */}
                    <div 
                      className={`flex items-center p-3 border ${paymentMethod === 'balance' ? 'border-green-500' : 'border-white/10'} bg-black/30 rounded-lg hover:border-green-500 transition-colors cursor-pointer`}
                      onClick={() => setPaymentMethod('balance')}
                    >
                      <input 
                        type="radio" 
                        id="wallet-balance" 
                        name="payment" 
                        className="h-4 w-4 text-green-500 border-white/30 bg-black"
                        checked={paymentMethod === 'balance'}
                        onChange={() => setPaymentMethod('balance')}
                      />
                      <div className="ml-3 flex items-center justify-between w-full">
                        <div>
                          <label htmlFor="wallet-balance" className="font-medium text-white cursor-pointer">BumiBrew Wallet</label>
                          <p className="text-xs text-white/60">Pay using your account balance</p>
                        </div>
                        <div className="flex-shrink-0 bg-green-600 text-white p-1 rounded-full">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center p-3 border ${paymentMethod === 'cod' ? 'border-green-500' : 'border-white/10'} bg-black/30 rounded-lg hover:border-green-500 transition-colors cursor-pointer`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <input 
                        type="radio" 
                        id="cod" 
                        name="payment" 
                        className="h-4 w-4 text-green-500 border-white/30 bg-black"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div className="ml-3 flex items-center justify-between w-full">
                        <div>
                          <label htmlFor="cod" className="font-medium text-white cursor-pointer">Cash on Delivery</label>
                          <p className="text-xs text-white/60">Pay when you receive your order</p>
                        </div>
                        <div className="flex-shrink-0 bg-green-600/50 text-white p-1 rounded-full">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Promo Button */}
                    <button className="w-full flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-900/30 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>Apply sustainability discount</span>
                      </div>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 overflow-hidden">
                  <div className="bg-green-900/30 px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Order Summary</h2>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between py-3">
                      <span className="text-white/70">Product Total ({selectedCartItems.length} items)</span>
                      <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {ecoPackagingCost > 0 && (
                      <div className="flex justify-between py-3 border-t border-white/10">
                        <span className="text-white/70">Eco-friendly Packaging</span>
                        <span className="text-white font-medium">{formatCurrency(ecoPackagingCost)}</span>
                      </div>
                    )}
                    
                    {carbonOffset && (
                      <div className="flex justify-between py-3 border-t border-white/10">
                        <span className="text-white/70">Carbon Offset</span>
                        <span className="text-white font-medium">{formatCurrency(carbonOffsetCost)}</span>
                      </div>
                    )}
                    
                    {discount > 0 && (
                      <div className="flex justify-between py-3 border-t border-white/10">
                        <span className="text-white/70">Discount</span>
                        <span className="text-green-500 font-medium">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between py-3 border-t border-white/10">
                      <span className="text-white/70">Shipping</span>
                      <span className="text-white font-medium">{formatCurrency(0)}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-xl font-bold text-green-400">{formatCurrency(total + 13800)}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full py-3 mt-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium flex items-center justify-center disabled:bg-green-800/50 disabled:text-white/50"
                      onClick={() => handleCheckout({
                        fullName: selectedAddress.fullName,
                        email: selectedAddress.email,
                        phone: selectedAddress.phone,
                        address: selectedAddress.address,
                        city: selectedAddress.city,
                        postalCode: selectedAddress.postalCode,
                        paymentMethod: paymentMethod,
                        notes: `${Object.values(ecoPackaging).filter(Boolean).length > 0 ? 'Include eco-friendly packaging. ' : ''}${carbonOffset ? 'Include carbon offset for delivery. ' : ''}Additional notes: Please handle with care.`
                      })}
                      disabled={isSubmitting || (showNewAddressForm && (!newAddress.fullName || !newAddress.email || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.postalCode))}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Complete Purchase'}
                    </button>
                    
                    <p className="text-xs text-white/50 text-center mt-2">
                      By completing your purchase, you agree to our sustainable shipping and eco-friendly packaging terms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={isSubmitting} />
    </div>
  );
}
