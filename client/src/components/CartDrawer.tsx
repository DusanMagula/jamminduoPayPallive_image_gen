import { X } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import type { CartItem } from '@/types/cart';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  totalAmount: number;
  paypalClientId: string;
  paymentError: string | null;
  onPaymentError: (error: string) => void;
  onPaymentSuccess: () => void;
}

export default function CartDrawer({
  cart,
  isOpen,
  onClose,
  onRemove,
  onUpdateQuantity,
  totalAmount,
  paymentError,
  onPaymentError,
  onPaymentSuccess,
}: CartDrawerProps) {
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

            {paymentError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {paymentError}
              </div>
            )}

            <PayPalButtons
              disabled={cart.length === 0 || totalAmount <= 0}
              createOrder={(data, actions) => {
                if (!actions.order) {
                  throw new Error('PayPal order actions are unavailable');
                }
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      amount: {
                        currency_code: 'GBP',
                        value: totalAmount.toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                if (!actions.order) {
                  throw new Error('PayPal order actions are unavailable');
                }
                return actions.order.capture().then(details => {
                  alert(`Payment completed! Thank you, ${details.payer?.name?.given_name || 'customer'}!`);
                  onPaymentSuccess();
                });
              }}
              onError={(err) => {
                console.error('PayPal error:', err);
                onPaymentError('Payment failed. Please try again.');
              }}
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                tagline: false,
              }}
              forceReRender={[totalAmount, cart.length]}
            />
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}
    </>
  );
}
