import { jsxRenderer } from "hono/jsx-renderer";
import { Script, Link } from "honox/server";

export default jsxRenderer(({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>家計簿</title>
        <Script src="/app/client.ts" async />
        <Link href="/app/style.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-100 min-h-screen">
        <div id="app" class="max-w-lg mx-auto py-6 px-4">
          {children}
        </div>
      </body>
    </html>
  );
});
