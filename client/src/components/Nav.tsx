import { ShoppingBasket } from 'lucide-react';

interface NavProps {
  cartItemCount: number;
  onCartOpen: () => void;
}

export default function Nav({ cartItemCount, onCartOpen }: NavProps) {
  return (
    <nav className="flex justify-between items-center mb-16">
      <h1 className="text-4xl font-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Jammin' Duo</h1>
      <div className="flex gap-8 items-center">
        <a href="#products" className="text-gray-800 hover:text-red-500">Products</a>
        <a href="#about" className="text-gray-800 hover:text-red-500">About Us</a>
        <a href="#contact" className="text-gray-800 hover:text-red-500">Contact</a>
        <button onClick={onCartOpen} className="relative">
          <ShoppingBasket className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
