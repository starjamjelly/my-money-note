import { Hono } from "hono";
import { createNotionClient, getNotionEnv } from "@/lib/notion/client";
import {
  getTransactions,
  createTransaction,
} from "@/lib/notion/transactions";
import type { CreateTransactionInput } from "@/lib/notion/types";

const app = new Hono();

// GET /api/transactions - 一覧取得（月別フィルタ対応）
app.get("/", async (c) => {
  try {
    const notionEnv = getNotionEnv(c.env as Record<string, unknown>);
    const client = createNotionClient(notionEnv.NOTION_TOKEN);

    const yearParam = c.req.query("year");
    const monthParam = c.req.query("month");

    let filter: { year: number; month: number } | undefined;

    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10);

      if (
        !isNaN(year) &&
        !isNaN(month) &&
        month >= 1 &&
        month <= 12
      ) {
        filter = { year, month };
      }
    }

    const transactions = await getTransactions(
      client,
      notionEnv.NOTION_DATABASE_ID,
      filter
    );

    return c.json({ transactions });
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return c.json(
      { error: "Failed to get transactions" },
      500
    );
  }
});

// POST /api/transactions - 新規登録
app.post("/", async (c) => {
  try {
    const notionEnv = getNotionEnv(c.env as Record<string, unknown>);
    const client = createNotionClient(notionEnv.NOTION_TOKEN);

    const body = await c.req.json<{
      name?: string;
      amount: number;
      category: string;
      date?: string;
    }>();

    // バリデーション
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    if (!body.category || typeof body.category !== "string") {
      return c.json({ error: "Invalid category" }, 400);
    }

    if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return c.json({ error: "Invalid date format" }, 400);
    }

    const input: CreateTransactionInput = {
      name: body.name || undefined,
      amount: body.amount,
      category: body.category,
      date: body.date,
    };

    const transaction = await createTransaction(
      client,
      notionEnv.NOTION_DATABASE_ID,
      input
    );

    return c.json({ transaction }, 201);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return c.json(
      { error: "Failed to create transaction" },
      500
    );
  }
});

export default app;
