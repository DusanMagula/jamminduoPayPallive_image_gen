import React, { useState } from 'react';
import { Car as Jar, ShoppingBasket, Phone, Mail, X } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import strawberryJamImg from '@assets/951447e8-cfe4-4ba0_1768556543588.jpg';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

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
    disableFunding: 'card'
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="min-h-screen bg-white relative">
        <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Shopping Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500 mb-6">Your cart is empty</p>
            ) : (
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-gray-500">£{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-gray-700">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-gray-700">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 ml-2">
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
                          value: totalAmount.toFixed(2)
                        }
                      }
                    ]
                  });
                }}
                onApprove={(data, actions) => {
                  if (!actions.order) {
                    throw new Error('PayPal order actions are unavailable');
                  }

                  return actions.order.capture().then(details => {
                    alert(`Payment completed! Thank you, ${details.payer?.name?.given_name || 'customer'}!`);
                    setCart([]);
                    setIsCartOpen(false);
                  });
                }}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setPaymentError('Payment failed. Please try again.');
                }}
                style={{ 
                  layout: 'vertical', 
                  color: 'gold', 
                  shape: 'rect', 
                  label: 'paypal', 
                  tagline: false 
                }}
                forceReRender={[totalAmount, cart.length]}
              />
            </div>
          </div>
        </div>

        {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsCartOpen(false)} />}

        <header className="bg-red-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex justify-between items-center mb-16">
              <h1 className="text-4xl font-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Jammin' Duo</h1>
              <div className="flex gap-8 items-center">
                <a href="#products" className="text-gray-800 hover:text-red-500">Products</a>
                <a href="#about" className="text-gray-800 hover:text-red-500">About Us</a>
                <a href="#contact" className="text-gray-800 hover:text-red-500">Contact</a>
                <button onClick={() => setIsCartOpen(true)} className="relative">
                  <ShoppingBasket className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </nav>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-1/2">
                <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Homemade Jams with Love ❤️</h2>
                <p className="text-xl mb-8">Made by two friends who love creating delicious spreads for our local community</p>
                <a href="#products" className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition">Shop Now</a>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <img src="https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Fresh berries and fruits" className="rounded-lg shadow-2xl w-full max-w-md" />
              </div>
            </div>
          </div>
        </header>

        <section id="products" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Our Jams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition">
                <div className="mb-4 flex justify-center">
                  <img src={strawberryJamImg} alt="Strawberry Jam" className="w-48 h-auto object-contain" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Strawberry</h3>
                <p className="text-gray-600 mb-4">Handcrafted with fresh local strawberries</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">£5.49</span>
                  <button onClick={() => addToCart({ id: 'strawberry', name: 'Strawberry Jam', price: 5.49 })} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                    <ShoppingBasket className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition">
                <div className="mb-4 flex justify-center">
                  <img src="https://i.imgur.com/lJcWLh7.png" alt="Blueberry Jam" className="w-48 h-auto object-contain" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Blueberry</h3>
                <p className="text-gray-600 mb-4">Handcrafted with fresh local fruits</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">£5.49</span>
                  <button onClick={() => addToCart({ id: 'blueberry', name: 'Blueberry Jam', price: 5.49 })} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                    <ShoppingBasket className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition">
                <div className="mb-4 flex justify-center">
                  <Jar className="w-24 h-24 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Mixed Berry</h3>
                <p className="text-gray-600 mb-4">Handcrafted with fresh local fruits</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">£5.49</span>
                  <button onClick={() => addToCart({ id: 'mixed-berry', name: 'Mixed Berry Jam', price: 5.49 })} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                    <ShoppingBasket className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-red-50 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16" style={{ fontFamily: 'Comic Sans MS, cursive' }}>About Us</h2>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/2">
                <img src="https://images.unsplash.com/photo-1543363950-c78545037afc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Making jam" className="rounded-lg shadow-xl w-full" />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-3xl font-bold mb-6">Two Friends, One Sweet Journey</h3>
                <p className="text-lg mb-4">We're two school friends who turned our love for making delicious jams into a small business. Every jar is carefully made using time-honoured recipes and plenty of care.</p>
                <p className="text-lg">Our mission is to share the true taste of homemade jam with our community while learning the ins and outs of running a business along the way.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Get in Touch</h2>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-red-500" />
                <span>00 44 797 997 3466</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-red-500" />
                <span>jammin.duo.woking@gmail.com</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p>© 2024 Jammin' Duo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </PayPalScriptProvider>
  );
}

export default App;
