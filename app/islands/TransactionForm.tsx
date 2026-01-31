import { useState, useEffect } from "hono/jsx";

const RECENT_CATEGORIES_KEY = "my-money-note-recent-categories";
const MAX_RECENT = 8;

function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecentCategories(allCategories: string[]): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return parsed.filter((c) => allCategories.includes(c));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveRecentCategory(category: string): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY);
    const recent = stored ? (JSON.parse(stored) as string[]) : [];
    const filtered = recent.filter((c) => c !== category);
    const updated = [category, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function getSortedCategories(
  allCategories: string[],
  recent: string[]
): string[] {
  const recentSet = new Set(recent);
  const others = allCategories.filter((c) => !recentSet.has(c));
  return [...recent, ...others];
}

export default function TransactionForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(getToday());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedCategories = getSortedCategories(categories, recentCategories);

  // カテゴリをAPIから取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = (await response.json()) as { categories: string[] };
          setCategories(data.categories);
          if (data.categories.length > 0 && !category) {
            setCategory(data.categories[0]);
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // 最近使ったカテゴリを取得
  useEffect(() => {
    if (categories.length > 0) {
      setRecentCategories(getRecentCategories(categories));
    }
  }, [categories]);

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
  };

  const handlePad = (key: string) => {
    setAmount((prev) => {
      const cur = prev ?? "";
      if (key === "DEL") {
        const next = cur.slice(0, -1);
        return next;
      }
      if (key === "00") {
        if (cur === "" || cur === "0") return "0";
        return cur + "00";
      }
      // digit key '0' - '9'
      if (cur === "0") {
        return key === "0" ? "0" : key;
      }
      if (cur === "" && key === "0") return "0";
      return cur + key;
    });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("金額を正しく入力してください");
      return;
    }

    if (!date) {
      setError("日付を選択してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          amount: amountNum,
          name: name || undefined,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error("登録に失敗しました");
      }

      // 最近使ったカテゴリを保存
      saveRecentCategory(category);
      setRecentCategories(getRecentCategories(categories));

      // フォームをリセット
      setAmount("");
      setName("");
      setDate(getToday());

      // ページをリロードして一覧を更新
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow-sm p-4">
      <form onSubmit={handleSubmit}>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">新規登録</h2>

        {error && (
          <div class="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            {isLoadingCategories ? (
              <div class="text-sm text-gray-500">読み込み中...</div>
            ) : (
              <div class="flex flex-wrap gap-1.5">
                {sortedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    class={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      category === cat
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 active:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              名前（任意）
            </label>
            <input
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="購入品名"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              金額
            </label>
            <input
              type="text"
              inputmode="numeric"
              value={amount}
              onInput={(e) =>
                setAmount((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ""))
              }
              placeholder="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div class="grid grid-cols-3 gap-2 mt-2">
              <button type="button" onClick={() => handlePad("1")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">1</button>
              <button type="button" onClick={() => handlePad("2")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">2</button>
              <button type="button" onClick={() => handlePad("3")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">3</button>
              <button type="button" onClick={() => handlePad("4")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">4</button>
              <button type="button" onClick={() => handlePad("5")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">5</button>
              <button type="button" onClick={() => handlePad("6")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">6</button>
              <button type="button" onClick={() => handlePad("7")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">7</button>
              <button type="button" onClick={() => handlePad("8")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">8</button>
              <button type="button" onClick={() => handlePad("9")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">9</button>
              <button type="button" onClick={() => handlePad("0")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">0</button>
              <button type="button" onClick={() => handlePad("00")} class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100">00</button>
              <button type="button" onClick={() => handlePad("DEL")} class="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm font-medium hover:bg-red-100">del</button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              購入日
            </label>
            <input
              type="date"
              value={date}
              onInput={(e) => setDate((e.target as HTMLInputElement).value)}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}
