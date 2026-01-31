import { createRoute } from "honox/factory";
import { Layout } from "@/components/Layout";
import { createNotionClient, getNotionEnv } from "@/lib/notion/client";
import { getTransactions } from "@/lib/notion/transactions";
import type { Transaction } from "@/lib/notion/types";
import TransactionList from "@/islands/TransactionList";
import MonthSelector from "@/islands/MonthSelector";
import Tabs from "@/islands/Tabs";

export default createRoute(async (c) => {
  const now = new Date();
  const yearParam = c.req.query("year");
  const monthParam = c.req.query("month");

  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

  let transactions: Transaction[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const notionEnv = getNotionEnv(c.env);
    const client = createNotionClient(notionEnv.NOTION_TOKEN);
    transactions = await getTransactions(client, notionEnv.NOTION_DATABASE_ID, {
      year,
      month,
    });
    total = transactions.reduce((sum, t) => sum + t.amount, 0);
  } catch (e) {
    console.error("Failed to fetch transactions:", e);
    error = "データの取得に失敗しました";
  }

  const formattedTotal = total.toLocaleString("ja-JP");

  return c.render(
    <Layout>
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-800">家計簿</h1>
        <MonthSelector initialYear={year} initialMonth={month} basePath="/list" />
      </header>

      <Tabs />

      {error ? (
        <div class="text-red-500 text-center py-4">{error}</div>
      ) : (
        <>
          <div class="bg-blue-50 rounded-lg p-4 mb-6">
            <div class="text-sm text-blue-600">今月の合計</div>
            <div class="text-2xl font-bold text-blue-800">¥{formattedTotal}</div>
          </div>

          <TransactionList transactions={transactions} />
        </>
      )}
    </Layout>
  );
});
