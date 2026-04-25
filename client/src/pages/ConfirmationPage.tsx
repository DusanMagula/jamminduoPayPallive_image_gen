import { useSearch, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_image_url: string | null;
}

interface OrderDetails {
  order_id: string;
  status: 'paid';
  total_amount: number;
  currency: string;
  customer_name: string | null;
  customer_email: string | null;
  paid_at: string;
  items: OrderItem[];
}

function maskEmail(email: string): string {
  return `${email.slice(0, 2)}***`;
}

export default function ConfirmationPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get('order_id');

  const { data: order, isLoading, isError } = useQuery<OrderDetails>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Order not found');
      return res.json();
    },
    enabled: !!orderId,
    retry: false,
  });

  if (!orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order found.</p>
          <Link href="/" className="text-red-500 hover:text-red-600 underline">Return to homepage</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading your order...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-2">
            We couldn&apos;t find your order. If you completed payment, please contact{' '}
            <a href="mailto:jammin.duo.woking@gmail.com" className="text-red-500 underline">
              jammin.duo.woking@gmail.com
            </a>
          </p>
          <p className="text-gray-500 text-sm">Reference: {orderId.slice(0, 8)}</p>
          <Link href="/" className="mt-4 inline-block text-red-500 hover:text-red-600 underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-lg mx-auto">
        <h1
          className="text-4xl font-black text-red-500 mb-2 text-center"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          Thank you for your order!
        </h1>

        <p className="text-center text-gray-500 mb-8 text-sm">
          Order reference: <span className="font-mono font-semibold text-gray-700">{order.order_id.slice(0, 8).toUpperCase()}</span>
        </p>

        <div className="border rounded-lg divide-y mb-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4">
              {item.selected_image_url && (
                <img
                  src={item.selected_image_url}
                  alt="Custom label"
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-gray-500 text-sm">
                  Qty {item.quantity} &times; £{item.unit_price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">
                £{(item.quantity * item.unit_price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6 px-1">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-red-500">
            {order.currency} £{order.total_amount.toFixed(2)}
          </span>
        </div>

        {order.customer_email && (
          <p className="text-center text-gray-500 text-sm mb-8">
            A confirmation will be sent to {maskEmail(order.customer_email)}
          </p>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
