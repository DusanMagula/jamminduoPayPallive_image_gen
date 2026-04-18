export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  active: boolean
}
