const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionClient {
  token: string;
  queryDatabase: <T = unknown>(
    databaseId: string,
    body?: Record<string, unknown>
  ) => Promise<{ results: T[] }>;
  createPage: <T = unknown>(body: Record<string, unknown>) => Promise<T>;
  updatePage: <T = unknown>(
    pageId: string,
    body: Record<string, unknown>
  ) => Promise<T>;
}

async function notionFetch<T>(
  token: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Notion API error: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

export function createNotionClient(token: string): NotionClient {
  return {
    token,
    queryDatabase: async <T = unknown>(
      databaseId: string,
      body: Record<string, unknown> = {}
    ) => {
      return notionFetch<{ results: T[] }>(
        token,
        `/databases/${databaseId}/query`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
    },
    createPage: async <T = unknown>(body: Record<string, unknown>) => {
      return notionFetch<T>(token, "/pages", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    updatePage: async <T = unknown>(
      pageId: string,
      body: Record<string, unknown>
    ) => {
      return notionFetch<T>(token, `/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
  };
}

export interface NotionEnv {
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
  NOTION_CATEGORY_DATABASE_ID: string;
}

export function getNotionEnv(env: object | undefined): NotionEnv {
  const safeEnv = (env ?? {}) as Record<string, unknown>;
  const token = safeEnv.NOTION_TOKEN;
  const databaseId = safeEnv.NOTION_DATABASE_ID;
  const categoryDatabaseId = safeEnv.NOTION_CATEGORY_DATABASE_ID;

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
