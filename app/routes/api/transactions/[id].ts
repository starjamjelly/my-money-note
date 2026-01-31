import { Hono } from "hono";
import { createNotionClient, getNotionEnv } from "@/lib/notion/client";
import { deleteTransaction } from "@/lib/notion/transactions";

const app = new Hono();

// DELETE /api/transactions/:id - 削除
app.delete("/", async (c) => {
  try {
    const notionEnv = getNotionEnv(c.env as Record<string, unknown>);
    const client = createNotionClient(notionEnv.NOTION_TOKEN);

    const id = c.req.param("id");

    if (!id) {
      return c.json({ error: "Transaction ID is required" }, 400);
    }

    await deleteTransaction(client, id);

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete transaction:", {
      error,
      id: c.req.param("id"),
    });
    const message = error instanceof Error ? error.message : "Failed to delete transaction";
    return c.json({ error: message }, 500);
  }
});

export default app;
