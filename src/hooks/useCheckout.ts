import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuthUser } from '@/hooks/useAuthUser';
import { CartItemWithDetails } from '@/types/cart';
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/utils/cartUtils';
import { toast } from 'react-hot-toast';
import { ordersService } from '@/services/api/orders';
import cartService from '@/services/api/cart';
import { refreshCart, refreshBalance } from '@/utils/events';
import { CheckoutFormData } from '@/components/checkout/CheckoutForm';

export interface Address {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface UseCheckoutReturn {
  selectedCartItems: CartItemWithDetails[];
  isSubmitting: boolean;
  loading: boolean; // Added loading state from useCart
  promoCode: string;
  promoDiscount: number;
  promoError: string;
  showNewAddressForm: boolean;
  showSavedAddresses: boolean;
  newAddress: Address;
  savedAddresses: Address[];
  selectedAddress: Address;
  ecoPackaging: Record<string | number, boolean>;
  productNotes: Record<string | number, string>;
  carbonOffset: boolean;
  paymentMethod: 'balance' | 'cod' | 'bank';
  subtotal: number;
  ecoPackagingCost: number;
  carbonOffsetCost: number;
  discount: number;
  total: number;
  setPromoCode: (code: string) => void;
  setPromoDiscount: (amount: number) => void;
  setPromoError: (error: string) => void;
  setShowNewAddressForm: (show: boolean) => void;
  setShowSavedAddresses: (show: boolean) => void;
  setNewAddress: (address: Address) => void;
  setSavedAddresses: (addresses: Address[]) => void;
  setSelectedAddress: (address: Address) => void;
  setEcoPackaging: (packaging: Record<string | number, boolean>) => void;
  setProductNotes: (notes: Record<string | number, string>) => void;
  setCarbonOffset: (offset: boolean) => void;
  setPaymentMethod: (method: 'balance' | 'cod') => void;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  saveNewAddress: () => void;
  handleCheckout: (formData: CheckoutFormData) => Promise<void>;
  groupItemsBySeller: (items: CartItemWithDetails[]) => Record<string, CartItemWithDetails[]>;
}

export function useCheckout(): UseCheckoutReturn {
  const router = useRouter();
  const { cartItems, selectedItems, loading: cartLoading, setSelectedItems } = useCart();
  const { user } = useAuthUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  
  // Load promo code from localStorage (synced with cart page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPromoCode = localStorage.getItem('promoCode');
      const savedPromoDiscount = localStorage.getItem('promoDiscount');
      
      if (savedPromoCode) {
        setPromoCode(savedPromoCode);
      }
      
      if (savedPromoDiscount) {
        setPromoDiscount(Number(savedPromoDiscount));
      }
      
      // Listen for custom event to reset promo discount
      const handleSetPromoDiscount = (event: CustomEvent) => {
        if (event.detail && typeof event.detail.amount === 'number') {
          setPromoDiscount(event.detail.amount);
        }
      };
      
      window.addEventListener('setPromoDiscount', handleSetPromoDiscount as EventListener);
      
      return () => {
        window.removeEventListener('setPromoDiscount', handleSetPromoDiscount as EventListener);
      };
    }
  }, []);
  
  // Custom setPromoCode function that also updates localStorage
  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    if (code) {
      localStorage.setItem('promoCode', code);
    } else {
      localStorage.removeItem('promoCode');
    }
  };
  
  // Custom setPromoDiscount function that also updates localStorage
  const handlePromoDiscountChange = (amount: number) => {
    setPromoDiscount(amount);
    if (amount > 0) {
      localStorage.setItem('promoDiscount', amount.toString());
    } else {
      localStorage.removeItem('promoDiscount');
    }
  };
  
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
  
  // State for new address form
  const [newAddress, setNewAddress] = useState({
    id: Date.now(),
    fullName: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.zip_code || ''
  });
  
  // State for eco-friendly packaging options
  const [ecoPackaging, setEcoPackaging] = useState<Record<string | number, boolean>>({});
  
  // State for product notes
  const [productNotes, setProductNotes] = useState<Record<string | number, string>>({});
  const [carbonOffset, setCarbonOffset] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'cod'>('balance');
  
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
  
  // Filter cart items based on selected items
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  
  // Helper function to group cart items by seller
  const groupItemsBySeller = (items: CartItemWithDetails[]) => {
    const grouped: Record<string, CartItemWithDetails[]> = {};
    
    items.forEach(item => {
      // Try to get seller ID from different possible locations
      // Using type assertions to handle potential missing properties
      const sellerId = item.product?.vendor_id || 
                       item.vendor_id || 
                       (item.product && 'vendor_name' in item.product ? `vendor_${(item.product as any).vendor_name}` : null) ||
                       ('vendor_name' in item ? `vendor_${(item as any).vendor_name}` : null) ||
                       'unknown';
      
      if (!grouped[sellerId]) {
        grouped[sellerId] = [];
      }
      
      grouped[sellerId].push(item);
    });
    
    return grouped;
  };
  
  // Initialize eco-packaging state based on selected items grouped by seller
  useEffect(() => {
    if (selectedCartItems.length > 0) {
      // Group items by seller
      const grouped = groupItemsBySeller(selectedCartItems);
      
      // Check if we need to update the eco-packaging state
      let needsUpdate = false;
      const newEcoPackaging = { ...ecoPackaging };
      
      // Add missing sellers to eco-packaging state
      Object.keys(grouped).forEach(sellerId => {
        if (ecoPackaging[sellerId] === undefined) {
          newEcoPackaging[sellerId] = false;
          needsUpdate = true;
        }
      });
      
      // Remove sellers that are no longer in the cart
      Object.keys(ecoPackaging).forEach(sellerId => {
        if (!grouped[sellerId]) {
          delete newEcoPackaging[sellerId];
          needsUpdate = true;
        }
      });
      
      // Only update state if needed to avoid infinite loops
      if (needsUpdate) {
        console.log('Updating eco-packaging state by seller:', newEcoPackaging);
        setEcoPackaging(newEcoPackaging);
      }
    } else if (Object.keys(ecoPackaging).length > 0 && selectedCartItems.length === 0) {
      // Clear eco-packaging if no items are selected
      setEcoPackaging({});
    }
  }, [selectedCartItems, ecoPackaging]);
  
  // Calculate totals
  const subtotal = calculateSubtotal(selectedCartItems);
  
  // Calculate eco-packaging cost based on selected seller options
  const ecoPackagingCount = Object.values(ecoPackaging).filter(Boolean).length;
  const ecoPackagingCost = 5000 * ecoPackagingCount; // 5000 IDR per seller
  
  // Calculate carbon offset cost
  const carbonOffsetCost = carbonOffset ? 3800 : 0; // 3800 IDR for carbon offset
  
  // Use promoDiscount directly as it's already the calculated amount, not a percentage
  const discount = promoDiscount;
  
  // Calculate total
  const total = calculateTotal(subtotal, discount) + ecoPackagingCost + carbonOffsetCost;
  
  // Handle changes to the new address form
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
  
  // Handle checkout
  const handleCheckout = async (formData: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.phone || 
          !formData.address || !formData.city || !formData.postalCode) {
        toast.error('Please fill in all required shipping information');
        setIsSubmitting(false);
        return;
      }
      
      // Validate that items are selected
      if (selectedCartItems.length === 0) {
        toast.error('Please select at least one item to checkout');
        setIsSubmitting(false);
        return;
      }
      
      // Create order notes combining eco-packaging, carbon offset, and customer notes
      const orderNotes = [
        Object.values(ecoPackaging).filter(Boolean).length > 0 ? `Eco-friendly packaging for ${Object.values(ecoPackaging).filter(Boolean).length} items.` : '',
        carbonOffset ? 'Carbon offset for delivery included.' : '',
        formData.notes ? `Customer notes: ${formData.notes}` : ''
      ].filter(Boolean).join(' ');
      
      // Get the vendor ID from the first item (assuming all items are from the same vendor)
      // In a multi-vendor scenario, we would need to create separate orders for each vendor
      const vendor_id = selectedCartItems[0]?.product?.vendor_id || 
                       selectedCartItems[0]?.vendor_id || 
                       // Type assertion with unknown as intermediate step to avoid direct any cast
                       (selectedCartItems[0] && 'seller_id' in selectedCartItems[0] ? 
                         (selectedCartItems[0] as unknown as { seller_id: number }).seller_id : 
                         19); // Fallback to 19 if no vendor ID found
      
      // Simplify the order items to exactly match the required API format
      const simplifiedOrderItems = selectedCartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price || item.unit_price || item.price || 0
      }));
      
      // Create the order payload according to the API requirements
      // Using a type assertion to match the expected API format
      const orderPayload: any = {
        vendor_id,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email
        },
        shipping_city: formData.city,
        shipping_postal_code: formData.postalCode,
        payment_method: formData.paymentMethod,
        notes: orderNotes,
        items: simplifiedOrderItems,
        total_amount: total,
        eco_packaging: Object.values(ecoPackaging).filter(Boolean).length > 0,
        carbon_offset: carbonOffset
      };
      
      console.log('Creating order with payload:', orderPayload);
      
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
        const data = orderResponse.data as Record<string, unknown>;
        orderId = (data.id as string | number) || (data.order_id as string | number) || 0;
      } else if ('id' in orderResponse && orderResponse.id) {
        // Direct ID in response
        orderId = orderResponse.id as string | number;
      } else {
        // Fallback to 0 if no ID found
        console.warn('Could not find order ID in response:', orderResponse);
        orderId = 0;
      }
      
      // Clear selected items from cart
      await Promise.all(selectedCartItems.map(item => 
        cartService.removeFromCart(item.id)
      ));
      
      // Refresh cart
      refreshCart();
      
      // Refresh balance if payment method is balance
      if (formData.paymentMethod === 'balance') {
        refreshBalance();
      }
      
      // Store additional order data in localStorage for the success page
      const checkoutAdditionalData = {
        shipping_address: {
          full_name: formData.fullName,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          email: formData.email
        },
        payment_method: formData.paymentMethod,
        total_amount: total,
        subtotal: subtotal,
        discount: promoDiscount,
        // Include detailed product information for reviews
        items: selectedCartItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || item.unit_price || item.price || 0,
          product: {
            id: item.product?.id || item.product_id,
            name: item.product?.name || item.name || `Product #${item.product_id}`,
            price: item.product?.price || item.unit_price || item.price || 0,
            // Use type assertion to handle properties not in the type definition
            image: (item.product as any)?.image || (item as any).image_url || '',
            description: (item.product as any)?.description || '',
            vendor_id: item.product?.vendor_id || item.vendor_id || 0,
            vendor_name: (item.product as any)?.vendor_name || (item as any).seller || 'Local Producer'
          }
        }))
      };
      
      localStorage.setItem('checkout_additional_data', JSON.stringify(checkoutAdditionalData));
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to success page
      router.push(`/checkout/success?order_id=${orderId}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    selectedCartItems,
    isSubmitting,
    loading: cartLoading, // Expose the loading state from useCart
    promoCode,
    promoDiscount,
    promoError,
    showNewAddressForm,
    showSavedAddresses,
    newAddress,
    savedAddresses,
    selectedAddress,
    ecoPackaging,
    productNotes,
    carbonOffset,
    paymentMethod,
    subtotal,
    ecoPackagingCost,
    carbonOffsetCost,
    discount,
    total,
    setPromoCode: handlePromoCodeChange,
    setPromoDiscount: handlePromoDiscountChange,
    setPromoError,
    setShowNewAddressForm,
    setShowSavedAddresses,
    setNewAddress,
    setSavedAddresses,
    setSelectedAddress,
    setEcoPackaging,
    setProductNotes,
    setCarbonOffset,
    setPaymentMethod,
    handleAddressChange,
    saveNewAddress,
    handleCheckout,
    groupItemsBySeller
  };
}
