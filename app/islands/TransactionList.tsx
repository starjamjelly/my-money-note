import { useState } from "hono/jsx";
import type { Transaction } from "@/lib/notion/types";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({
  transactions: initialTransactions,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("この支出を削除しますか？")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        // ignore json parse errors
      }

      if (!response.ok) {
        const msg = data?.error || "削除に失敗しました";
        throw new Error(msg);
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
      // ログも出しておく
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    return `${parseInt(month, 10)}/${parseInt(day, 10)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ja-JP");
  };

  if (transactions.length === 0) {
    return (
      <p class="text-gray-500 text-center py-8">この月の支出はありません</p>
    );
  }

  return (
    <div class="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          class="flex items-center justify-between py-3 px-4 bg-white rounded-lg shadow-sm"
          style={{ opacity: deletingId === transaction.id ? 0.5 : 1 }}
        >
          <div class="flex items-center gap-4">
            <span class="text-gray-500 text-sm w-12">
              {formatDate(transaction.date)}
            </span>
            <span class="text-gray-700 font-medium w-20">
              {transaction.category}
            </span>
            <span class="text-gray-600 truncate max-w-[120px]">
              {transaction.name || "-"}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-gray-800">
              ¥{formatAmount(transaction.amount)}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(transaction.id)}
              disabled={deletingId === transaction.id}
              class="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
              aria-label="削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
