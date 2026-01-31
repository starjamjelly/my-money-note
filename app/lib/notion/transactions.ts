import type { NotionClient } from "./client";
import type {
  Transaction,
  CreateTransactionInput,
  TransactionFilter,
} from "./types";

interface NotionPage {
  id: string;
  created_time: string;
  properties: {
    Name?: {
      type: "title";
      title: Array<{ plain_text: string }>;
    };
    Amount?: {
      type: "number";
      number: number | null;
    };
    Category?: {
      type: "select";
      select: { name: string } | null;
    };
    Date?: {
      type: "date";
      date: { start: string } | null;
    };
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parsePageToTransaction(page: NotionPage): Transaction {
  const props = page.properties;

  // Name (Title)
  let name: string | null = null;
  if (props.Name && props.Name.type === "title") {
    const titleArray = props.Name.title;
    if (titleArray.length > 0) {
      name = titleArray.map((t) => t.plain_text).join("");
    }
  }

  // Amount (Number)
  let amount = 0;
  if (props.Amount && props.Amount.type === "number") {
    amount = props.Amount.number ?? 0;
  }

  // Category (Select)
  let category = "";
  if (props.Category && props.Category.type === "select") {
    const selectValue = props.Category.select;
    if (selectValue) {
      category = selectValue.name;
    }
  }

  // Date (Date)
  let date = formatDate(new Date());
  if (props.Date && props.Date.type === "date") {
    const dateValue = props.Date.date;
    if (dateValue?.start) {
      date = dateValue.start;
    }
  }

  // CreatedAt (Created time)
  const createdAt = page.created_time;

  return {
    id: page.id,
    name,
    amount,
    category,
    date,
    createdAt,
  };
}

interface DateFilter {
  property: string;
  date: {
    on_or_after?: string;
    before?: string;
  };
}

export async function getTransactions(
  client: NotionClient,
  databaseId: string,
  filter?: TransactionFilter
): Promise<Transaction[]> {
  const filters: DateFilter[] = [];

  if (filter) {
    const startDate = `${filter.year}-${String(filter.month).padStart(2, "0")}-01`;
    const endMonth = filter.month === 12 ? 1 : filter.month + 1;
    const endYear = filter.month === 12 ? filter.year + 1 : filter.year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    filters.push({
      property: "Date",
      date: {
        on_or_after: startDate,
      },
    });
    filters.push({
      property: "Date",
      date: {
        before: endDate,
      },
    });
  }

  const queryOptions: Record<string, unknown> = {
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  };

  if (filters.length > 0) {
    queryOptions.filter = {
      and: filters,
    };
  }

  const response = await client.queryDatabase<NotionPage>(
    databaseId,
    queryOptions
  );

  const transactions: Transaction[] = [];
  for (const page of response.results) {
    if ("properties" in page) {
      transactions.push(parsePageToTransaction(page));
    }
  }

  return transactions;
}

export async function createTransaction(
  client: NotionClient,
  databaseId: string,
  input: CreateTransactionInput
): Promise<Transaction> {
  const date = input.date ?? formatDate(new Date());

  const response = await client.createPage<NotionPage>({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: input.name ? [{ text: { content: input.name } }] : [],
      },
      Amount: {
        number: input.amount,
      },
      Category: {
        select: { name: input.category },
      },
      Date: {
        date: { start: date },
      },
    },
  });

  return parsePageToTransaction(response);
}

export async function deleteTransaction(
  client: NotionClient,
  pageId: string
): Promise<void> {
  await client.updatePage(pageId, {
    archived: true,
  });
}
