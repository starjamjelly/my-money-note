import { Client } from "@notionhq/client";

export function createNotionClient(token: string): Client {
  return new Client({
    auth: token,
  });
}

export interface NotionEnv {
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
  NOTION_CATEGORY_DATABASE_ID: string;
}

export function getNotionEnv(env: Record<string, unknown>): NotionEnv {
  const token = env.NOTION_TOKEN;
  const databaseId = env.NOTION_DATABASE_ID;
  const categoryDatabaseId = env.NOTION_CATEGORY_DATABASE_ID;

  if (typeof token !== "string" || !token) {
    throw new Error("NOTION_TOKEN is not configured");
  }
  if (typeof databaseId !== "string" || !databaseId) {
    throw new Error("NOTION_DATABASE_ID is not configured");
  }
  if (typeof categoryDatabaseId !== "string" || !categoryDatabaseId) {
    throw new Error("NOTION_CATEGORY_DATABASE_ID is not configured");
  }

  return {
    NOTION_TOKEN: token,
    NOTION_DATABASE_ID: databaseId,
    NOTION_CATEGORY_DATABASE_ID: categoryDatabaseId,
  };
}
