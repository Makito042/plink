import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { CartItem } from '../types';

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Delivered';
  date: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
  getUserOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (items: CartItem[], total: number) => {
    if (!user) return;

    const newOrder: Order = {
      id: `ORD${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      items,
      total,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0]
    };

    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const getUserOrders = () => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.id);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getUserOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
