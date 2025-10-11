import type { Product } from '../types/quote';

export const GST_RATE = 0.089;
export const EXTRA_HEIGHT_RATE = 1500; // ₹ per kWp

export const companyDetails = {
    name: "Arpit Solar",
    logo: "/logo.png",
    address: "Sh16/114-25-K-2, Sharvodayanagar, Kadipur, Shivpur, Varanasi 221003 (UP)",
};

export const products: Product[] = [
  { kWp: 2.24, phase: 1, module: 560, qty: 4, price: 108974, wire: 150, outOfVns: 5000 },
  { kWp: 3.36, phase: 1, module: 560, qty: 6, price: 150895, wire: 150, outOfVns: 5000 },
  { kWp: 4.48, phase: 1, module: 560, qty: 8, price: 197348, wire: 150, outOfVns: 5000 },
  { kWp: 5.04, phase: 1, module: 560, qty: 9, price: 223819, wire: 150, outOfVns: 5000 },
  { kWp: 5.04, phase: 3, module: 560, qty: 9, price: 244831, wire: 225, outOfVns: 5000 },
  { kWp: 6.16, phase: 3, module: 560, qty: 11, price: 290872, wire: 225, outOfVns: 5000 },
  { kWp: 8.4, phase: 3, module: 560, qty: 15, price: 373890, wire: 225, outOfVns: 5000 },
  { kWp: 10.08, phase: 3, module: 560, qty: 18, price: 437853, wire: 225, outOfVns: 5000 },
];