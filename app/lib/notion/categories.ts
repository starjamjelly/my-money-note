import type { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

export interface CategoryItem {
  id: string;
  name: string;
}

function parsePageToCategory(page: PageObjectResponse): CategoryItem | null {
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
  client: Client,
  databaseId: string
): Promise<CategoryItem[]> {
  const response: QueryDatabaseResponse = await client.databases.query({
    database_id: databaseId,
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
      const category = parsePageToCategory(page as PageObjectResponse);
      if (category) {
        categories.push(category);
      }
    }
  }

  return categories;
}
