import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuthUser } from '@/hooks/useAuthUser';
import { CartItemWithDetails } from '@/types/cart';
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/utils/cartUtils';
import { formatCurrency } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { ordersService } from '@/services/api/orders';
import { roleBasedCartService as cartService } from '@/services/roleBasedServices';
import { roleBasedBalanceService as balanceService } from '@/services/roleBasedBalanceService';
import { refreshCart, refreshBalance } from '@/utils/events';
import { CheckoutFormData } from '@/components/checkout/CheckoutForm';
import voucherService from '@/services/vouchers';

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
  useSellerVouchers: boolean;
  voucherDiscount: number;
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
  setUseSellerVouchers: (use: boolean) => void;
  updateVoucherDiscount: () => void;
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
  const [useSellerVouchers, setUseSellerVouchers] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  

  
  // Listen for custom event to reset promo discount
  const handleSetPromoDiscount = (event: CustomEvent) => {
    if (event.detail && typeof event.detail.amount === 'number') {
      setPromoDiscount(event.detail.amount);
    }
  };
  
  // Listen for vouchers applied event
  const handleVouchersApplied = () => {
    if (!useSellerVouchers) {
      setUseSellerVouchers(true);
    }
    
    // Update voucher discount
    updateVoucherDiscount();
  };
  
  // Listen for voucher changes event
  const handleVouchersChanged = () => {
    // Check if there are any applied vouchers
    const appliedVouchers = voucherService.getAppliedVouchers();
    if (Object.keys(appliedVouchers).length === 0) {
      // No vouchers applied, reset to promo code mode
      setUseSellerVouchers(false);
      setVoucherDiscount(0);
    } else {
      // Update voucher discount
      updateVoucherDiscount();
    }
  };
  
  // Add event listeners for voucher events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('vouchersApplied', handleVouchersApplied);
      window.addEventListener('vouchersChanged', handleVouchersChanged);
      window.addEventListener('setPromoDiscount', handleSetPromoDiscount as EventListener);
      window.addEventListener('voucherDiscountCalculated', ((event: CustomEvent) => {
        if (event.detail && typeof event.detail.amount === 'number') {
          setVoucherDiscount(event.detail.amount);
        }
      }) as EventListener);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('vouchersApplied', handleVouchersApplied);
        window.removeEventListener('vouchersChanged', handleVouchersChanged);
        window.removeEventListener('setPromoDiscount', handleSetPromoDiscount as EventListener);
        window.removeEventListener('voucherDiscountCalculated', (() => {}) as EventListener);
      }
    };
  }, []);
  
  // Load promo code and voucher settings from localStorage (synced with cart page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're using seller vouchers or standard promo code
      const useSellerVouchersStr = localStorage.getItem('useSellerVouchers');
      const useVouchers = useSellerVouchersStr === 'true';
      setUseSellerVouchers(useVouchers);
      if (useVouchers) {
        // Check if there are any applied vouchers
        const appliedVouchers = voucherService.getAppliedVouchers();
        if (Object.keys(appliedVouchers).length > 0) {
          // Load voucher discount
          const savedVoucherDiscount = localStorage.getItem('voucherDiscount');
          if (savedVoucherDiscount) {
            setVoucherDiscount(Number(savedVoucherDiscount));
          } else {
            // If no saved discount but vouchers are applied, recalculate
            updateVoucherDiscount();
          }
        } else {
          // No vouchers applied, reset to promo code mode
          setUseSellerVouchers(false);
          voucherService.resetVoucherDiscounts();
        }
      } else {
        // Load promo code and discount
        const savedPromoCode = localStorage.getItem('promoCode');
        const savedPromoDiscount = localStorage.getItem('promoDiscount');

        if (savedPromoCode) {
          setPromoCode(savedPromoCode);
        }

        if (savedPromoDiscount) {
          setPromoDiscount(Number(savedPromoDiscount));
        }
      }
    }
  }, []);

  // Update voucher discount based on applied vouchers
  const updateVoucherDiscount = () => {
    const totalVoucherDiscount = voucherService.calculateTotalVoucherDiscount(selectedCartItems);
    setVoucherDiscount(totalVoucherDiscount);
    console.log('Updated voucher discount:', totalVoucherDiscount);
  };

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
      // When setting a promo discount, ensure we're in promo code mode
      setUseSellerVouchers(false);
      localStorage.setItem('useSellerVouchers', 'false');
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

  // Recalculate voucher discount when selected cart items change
  useEffect(() => {
    if (useSellerVouchers && selectedCartItems.length > 0) {
      // Calculate discount from applied vouchers
      const discount = voucherService.calculateTotalVoucherDiscount(selectedCartItems);

      // Only update if the discount has changed
      if (discount !== voucherDiscount) {
        setVoucherDiscount(discount);

        // Apply vouchers to cart items
        const updatedItems = voucherService.applyAllVouchersToCartItems(selectedCartItems);

        // Store in localStorage for synchronization with checkout
        localStorage.setItem('voucherDiscount', discount.toString());
        localStorage.setItem('useSellerVouchers', 'true');

        // Log to verify discount is being calculated correctly
        console.log('Checkout: Voucher discount recalculated', {
          discount,
          previousDiscount: voucherDiscount,
          selectedItemsCount: selectedCartItems.length,
          appliedVouchers: voucherService.getAppliedVouchers()
        });
      }
    }
  }, [selectedCartItems, useSellerVouchers, voucherDiscount]);

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

  // Calculate subtotal and total
  const ecoPackagingCost = Object.values(ecoPackaging).filter(Boolean).length * 5000; // 5000 per item
  const carbonOffsetCost = carbonOffset ? 3800 : 0; // 3800 for carbon offset

  // Allow both voucher and promo code discounts to stack together
  const discount = useMemo(() => {
    // Stack both discount types together
    return promoDiscount + voucherDiscount;
  }, [voucherDiscount, promoDiscount]);

  // Ensure discount is properly applied
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const total = discountedSubtotal + ecoPackagingCost + carbonOffsetCost;

  // Log the calculation for debugging
  console.log('Checkout calculation:', {
    subtotal,
    voucherDiscount,
    promoDiscount,
    appliedDiscount: discount,
    discountedSubtotal,
    ecoPackagingCost,
    carbonOffsetCost,
    total
  });
  
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
      
      // Check if user has sufficient balance when using balance payment method
      if (formData.paymentMethod === 'balance') {
        const balanceResponse = await balanceService.getUserBalance();
        if (!balanceResponse.success) {
          toast.error('Unable to verify your balance. Please try again.');
          setIsSubmitting(false);
          return;
        }
        
        if (balanceResponse.balance < total) {
          toast.error(`Insufficient balance. You need ${formatCurrency(total)} but your balance is ${formatCurrency(balanceResponse.balance)}`);
          setIsSubmitting(false);
          return;
        }
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
      
      // Deduct balance and refresh if payment method is balance
      if (formData.paymentMethod === 'balance') {
        // Deduct the total amount from the user's balance (negative amount for deduction)
        await balanceService.updateBalance(-total);
        // Refresh the balance display
        refreshBalance();
      }
      
      // Store checkout data in localStorage for the success page
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
        discount: discount,
        eco_packaging_cost: ecoPackagingCost,
        carbon_offset_cost: carbonOffsetCost,
        // Include detailed product information for reviews
        items: selectedCartItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || item.unit_price || item.price || 0,
          discount_percentage: item.discount_percentage || 0,
          product: {
            id: item.product?.id || item.product_id,
            name: item.product?.name || item.name || `Product #${item.product_id}`,
            price: item.product?.price || item.unit_price || item.price || 0,
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
    useSellerVouchers,
    voucherDiscount,
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
    setUseSellerVouchers,
    updateVoucherDiscount,
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
