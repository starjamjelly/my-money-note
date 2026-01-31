import { Hono } from "hono";
import { createNotionClient, getNotionEnv } from "@/lib/notion/client";
import { getCategories } from "@/lib/notion/categories";

const app = new Hono();

// GET /api/categories - カテゴリ一覧取得
app.get("/", async (c) => {
  try {
    const notionEnv = getNotionEnv(c.env as Record<string, unknown>);
    const client = createNotionClient(notionEnv.NOTION_TOKEN);
    const categories = await getCategories(
      client,
      notionEnv.NOTION_CATEGORY_DATABASE_ID
    );
    // Cache categories for 24 hours (Cloudflare / CDN friendly)
    c.header("Cache-Control", "public, max-age=86400");
    return c.json({ categories: categories.map((cat) => cat.name) });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return c.json({ error: "カテゴリの取得に失敗しました" }, 500);
  }
});

export default app;
