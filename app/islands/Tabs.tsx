import { useState, useEffect } from "hono/jsx";

export default function Tabs() {
  const [path, setPath] = useState<string>(typeof window !== "undefined" ? window.location.pathname : "/");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const search = typeof window !== "undefined" ? window.location.search : "";
  const homeHref = search ? `/?${search.replace(/^\?/, "")}` : "/";
  const listHref = search ? `/list?${search.replace(/^\?/, "")}` : "/list";

  const tabClass = (isActive: boolean) =>
    `px-4 py-2 rounded-t-lg border-b-2 ${isActive ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-gray-800"}`;

  return (
    <nav class="mb-4">
      <div class="inline-flex bg-gray-100 rounded-lg p-1">
        <a href={homeHref} class={tabClass(path === "/")}>入力</a>
        <a href={listHref} class={tabClass(path === "/list")}>一覧</a>
      </div>
    </nav>
  );
}
