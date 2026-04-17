import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@restaurant-employee-purchases';

export type EmployeePurchase = {
  id: string;
  employeeName: string;
  itemDescription: string;
  amount: string;
  createdAt: string;
};

export function useEmployeePurchasesStore() {
  const [items, setItems] = useState<EmployeePurchase[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw) as EmployeePurchase[]);
      } catch (_) {}
      setHydrated(true);
    })();
  }, []);

  const addPurchase = useCallback((employeeName: string, itemDescription: string, amount: string) => {
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const row: EmployeePurchase = {
      id,
      employeeName: employeeName.trim() || 'Unknown',
      itemDescription: itemDescription.trim() || '(no description)',
      amount: amount.trim() || '—',
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => {
      const next = [row, ...prev];
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { items, hydrated, addPurchase, deletePurchase };
}
