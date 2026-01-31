import type { NotionClient } from "./client";

export interface CategoryItem {
  id: string;
  name: string;
}

interface NotionPage {
  id: string;
  properties: {
    Name?: {
      type: "title";
      title: Array<{ plain_text: string }>;
    };
  };
}

function parsePageToCategory(page: NotionPage): CategoryItem | null {
  const props = page.properties;

  // Name (Title)
  if (props.Name && props.Name.type === "title") {
    const titleArray = props.Name.title;
    if (titleArray.length > 0) {
      const name = titleArray.map((t) => t.plain_text).join("");
      return {
        id: page.id,
        name,
      };
    }
  }

  return null;
}

export async function getCategories(
  client: NotionClient,
  databaseId: string
): Promise<CategoryItem[]> {
  const response = await client.queryDatabase<NotionPage>(databaseId, {
    sorts: [
      {
        property: "Name",
        direction: "ascending",
      },
    ],
  });

  const categories: CategoryItem[] = [];
  for (const page of response.results) {
    if ("properties" in page) {
      const category = parsePageToCategory(page);
      if (category) {
        categories.push(category);
      }
    }
  }

  return categories;
}
