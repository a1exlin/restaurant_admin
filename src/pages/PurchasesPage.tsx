import { useState } from 'react';
import { useEmployeePurchasesStore } from '../store/useEmployeePurchasesStore';
import { BRAND_LOGO_ALT, BRAND_SITE_URL, ECHO_FIVES_LOGO_SRC } from '../brand';

export default function PurchasesPage() {
  const { items, hydrated, addPurchase, deletePurchase } = useEmployeePurchasesStore();
  const [employee, setEmployee] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-schedule-textMuted text-sm">Loading…</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <a href={BRAND_SITE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src={ECHO_FIVES_LOGO_SRC} alt={BRAND_LOGO_ALT} className="h-7 w-[100px] object-contain" />
        </a>
        <h1 className="text-lg font-bold text-schedule-text leading-tight">Employee purchases</h1>
      </div>

      <p className="text-schedule-textMuted text-sm mb-4">Log when an employee buys something (deduction / staff purchase).</p>

      <div className="rounded-2xl border border-schedule-border bg-schedule-card p-4 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-schedule-text mb-3">New transaction</h2>
        <label className="block text-xs font-medium text-schedule-textMuted mb-1" htmlFor="emp-name">
          Employee name
        </label>
        <input
          id="emp-name"
          className="w-full rounded-lg border border-schedule-border bg-schedule-bg px-3 py-2 text-sm text-schedule-text mb-3"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          placeholder="Name"
        />
        <label className="block text-xs font-medium text-schedule-textMuted mb-1" htmlFor="emp-item">
          What they bought
        </label>
        <textarea
          id="emp-item"
          className="w-full rounded-lg border border-schedule-border bg-schedule-bg px-3 py-2 text-sm text-schedule-text mb-3 min-h-[72px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <label className="block text-xs font-medium text-schedule-textMuted mb-1" htmlFor="emp-amt">
          Amount
        </label>
        <input
          id="emp-amt"
          className="w-full rounded-lg border border-schedule-border bg-schedule-bg px-3 py-2 text-sm text-schedule-text mb-4"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 12.50"
          inputMode="decimal"
        />
        <button
          type="button"
          onClick={() => {
            addPurchase(employee, description, amount);
            setEmployee('');
            setDescription('');
            setAmount('');
            setPage(1);
          }}
          className="w-full rounded-xl bg-schedule-accent text-white font-semibold py-3 text-sm hover:bg-schedule-accentHover transition-colors"
        >
          Save transaction
        </button>
      </div>

      <h2 className="text-sm font-bold text-schedule-text mb-2">Recent ({items.length})</h2>
      {items.length === 0 ? (
        <p className="text-schedule-textMuted text-sm">No entries yet.</p>
      ) : (
        <>
        <ul className="space-y-3">
          {pageItems.map((row) => (
            <li key={row.id} className="rounded-2xl border border-schedule-border bg-schedule-card p-4 shadow-sm">
              <p className="font-bold text-schedule-text">{row.employeeName}</p>
              <p className="text-sm text-schedule-text mt-1">{row.itemDescription}</p>
              <p className="text-sm font-semibold text-schedule-accent mt-2">{row.amount}</p>
              <p className="text-xs text-schedule-textMuted mt-1">{new Date(row.createdAt).toLocaleString()}</p>
              <button
                type="button"
                onClick={() => {
                  deletePurchase(row.id);
                  if (pageItems.length === 1 && safePage > 1) {
                    setPage(safePage - 1);
                  }
                }}
                className="text-sm text-schedule-textMuted font-medium mt-2 hover:text-schedule-text underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 rounded-lg border border-schedule-border bg-schedule-card text-sm text-schedule-text disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-xs text-schedule-textMuted">
            Page {safePage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-schedule-border bg-schedule-card text-sm text-schedule-text disabled:opacity-50"
          >
            Next
          </button>
        </div>
        </>
      )}
    </div>
  );
}
