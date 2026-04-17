import { Phone, Mail } from 'lucide-react';
import Nav from '@/components/Nav';
import ProductCard from '@/components/ProductCard';
import type { CartItem } from '@/types/cart';
import strawberryJamImg from '@assets/951447e8-cfe4-4ba0_1768556543588.jpg';

interface HomePageProps {
  cart: CartItem[];
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
  onCartOpen: () => void;
}

export default function HomePage({ cart, onAddToCart, onCartOpen }: HomePageProps) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <header className="bg-red-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Nav cartItemCount={cartItemCount} onCartOpen={onCartOpen} />

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
            <ProductCard
              id="strawberry"
              name="Strawberry Jam"
              displayName="Strawberry"
              description="Handcrafted with fresh local strawberries"
              price={5.49}
              imageUrl={strawberryJamImg}
              onAddToCart={onAddToCart}
            />
            <ProductCard
              id="blueberry"
              name="Blueberry Jam"
              displayName="Blueberry"
              description="Handcrafted with fresh local fruits"
              price={5.49}
              imageUrl="https://i.imgur.com/lJcWLh7.png"
              onAddToCart={onAddToCart}
            />
            <ProductCard
              id="mixed-berry"
              name="Mixed Berry Jam"
              displayName="Mixed Berry"
              description="Handcrafted with fresh local fruits"
              price={5.49}
              onAddToCart={onAddToCart}
            />
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
  );
}
