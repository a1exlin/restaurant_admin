import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = '@restaurant-employee-purchases';

export type EmployeePurchase = {
  id: string;
  employeeName: string;
  itemDescription: string;
  amount: string;
  createdAt: string;
};

function readStorage(): EmployeePurchase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EmployeePurchase[];
  } catch (_) {}
  return [];
}

export function useEmployeePurchasesStore() {
  const [items, setItems] = useState<EmployeePurchase[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  return { items, hydrated, addPurchase, deletePurchase };
}
