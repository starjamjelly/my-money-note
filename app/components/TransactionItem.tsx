import type { Transaction } from "@/lib/notion/types";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const dateStr = transaction.date;
  const [, month, day] = dateStr.split("-");
  const displayDate = `${parseInt(month, 10)}/${parseInt(day, 10)}`;

  const formattedAmount = transaction.amount.toLocaleString("ja-JP");

  return (
    <div
      class="flex items-center justify-between py-3 px-4 bg-white rounded-lg shadow-sm"
      data-transaction-id={transaction.id}
    >
      <div class="flex items-center gap-4">
        <span class="text-gray-500 text-sm w-12">{displayDate}</span>
        <span class="text-gray-700 font-medium w-20">{transaction.category}</span>
        <span class="text-gray-600 truncate max-w-[120px]">
          {transaction.name || "-"}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-semibold text-gray-800">¥{formattedAmount}</span>
        <button
          type="button"
          class="delete-btn text-gray-400 hover:text-red-500 transition-colors p-1"
          data-id={transaction.id}
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
  );
}
