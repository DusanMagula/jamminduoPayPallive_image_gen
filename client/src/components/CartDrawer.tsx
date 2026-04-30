import { useState } from 'react';
import { X } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useLocation } from 'wouter';
import type { CartItem } from '@/types/cart';
import { useSession } from '@/context/SessionContext';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  totalAmount: number;
  paypalClientId: string;
  onClearCart: () => void;
}

export default function CartDrawer({
  cart,
  isOpen,
  onClose,
  onRemove,
  onUpdateQuantity,
  totalAmount,
  onClearCart,
}: CartDrawerProps) {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { sessionId } = useSession();

  async function createPayPalOrderCallback(): Promise<string> {
    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            selected_image_id: item.selected_image_id ?? null,
            selected_image_url: item.selected_image_url ?? null,
          })),
        }),
      });
      if (!response.ok) throw new Error('Failed to create order');
      const data = await response.json();
      setCurrentOrderId(data.order_id);
      return data.paypal_order_id;
    } catch (err) {
      setCheckoutError('Could not start checkout. Please try again.');
      setIsCheckingOut(false);
      throw err;
    }
  }

  async function onApproveCallback(data: { orderID: string }) {
    try {
      const response = await fetch('/api/orders/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: currentOrderId,
          paypal_order_id: data.orderID,
        }),
      });
      if (!response.ok) throw new Error('Capture failed');
      onClearCart();
      onClose();
      setLocation(`/confirmation?order_id=${currentOrderId}`);
    } catch (err) {
      setCheckoutError('Payment was approved but could not be confirmed. Please contact support.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Shopping Cart</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 mb-6">Your cart is empty</p>
          ) : (
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-2">
                    {item.selected_image_url && (
                      <img
                        src={item.selected_image_url}
                        alt="Custom label"
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-gray-500">£{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-gray-700">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-gray-700">+</button>
                    <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">£{totalAmount.toFixed(2)}</span>
            </div>

            {checkoutError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {checkoutError}
              </div>
            )}

            <PayPalButtons
              disabled={cart.length === 0 || totalAmount <= 0 || isCheckingOut}
              createOrder={createPayPalOrderCallback}
              onApprove={onApproveCallback}
              onError={(err) => {
                console.error('PayPal error:', err);
                setCheckoutError('Payment failed. Please try again.');
                setIsCheckingOut(false);
              }}
              style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', tagline: false }}
              forceReRender={[totalAmount, cart.length]}
            />
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}
    </>
  );
}
