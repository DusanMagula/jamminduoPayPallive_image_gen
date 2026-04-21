export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  selected_image_id?: string;
  selected_image_url?: string;
}
