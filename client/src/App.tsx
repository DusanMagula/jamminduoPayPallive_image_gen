import { useState } from 'react';
import { Switch, Route } from 'wouter';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { CartItem } from '@/types/cart';
import CartDrawer from '@/components/CartDrawer';
import HomePage from '@/pages/HomePage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import { SessionProvider } from '@/context/SessionContext';

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const paypalOptions = {
    clientId: paypalClientId,
    currency: 'GBP',
    intent: 'capture',
    disableFunding: 'card',
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <SessionProvider>
      <div className="min-h-screen bg-white relative">
        <Switch>
          <Route path="/">
            <HomePage
              cart={cart}
              onAddToCart={addToCart}
              onCartOpen={() => setIsCartOpen(true)}
            />
          </Route>
          <Route path="/confirmation">
            <ConfirmationPage />
          </Route>
        </Switch>

        <CartDrawer
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          totalAmount={totalAmount}
          paypalClientId={paypalClientId}
          paymentError={paymentError}
          onPaymentError={setPaymentError}
          onPaymentSuccess={() => {
            setCart([]);
            setIsCartOpen(false);
          }}
        />
      </div>
      </SessionProvider>
    </PayPalScriptProvider>
  );
}

export default App;
