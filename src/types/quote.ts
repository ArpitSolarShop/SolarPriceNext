export interface Product {
  kWp: number;
  phase: number;
  module: number;
  qty: number;
  price: number;
  wire: number;
  outOfVns: number;
}

export type QuoteComponent = {
  name: string;
  brand?: string;
  spec?: string;
  quantity: string; // e.g., "1 nos", "10 mtr", "GI 3'X6'"
};

export type QuotePricing = {
  basePrice: number;
  wirePrice: number;
  heightPrice: number;
  outOfVnsPrice: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  discount?: number;
  grandTotal: number;
};