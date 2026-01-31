import { useState } from "hono/jsx";

interface MonthSelectorProps {
  initialYear: number;
  initialMonth: number;
  basePath?: string;
}

export default function MonthSelector({
  initialYear,
  initialMonth,
  basePath = "/",
}: MonthSelectorProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrev = () => {
    setIsLoading(true);
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
      navigateTo(year - 1, 12);
    } else {
      setMonth(month - 1);
      navigateTo(year, month - 1);
    }
  };

  const handleNext = () => {
    setIsLoading(true);
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
      navigateTo(year + 1, 1);
    } else {
      setMonth(month + 1);
      navigateTo(year, month + 1);
    }
  };

  const navigateTo = (y: number, m: number) => {
    const qs = `?year=${y}&month=${m}`;
    if (basePath.endsWith("/")) {
      window.location.href = `${basePath.slice(0, -1)}${qs}`;
    } else {
      window.location.href = `${basePath}${qs}`;
    }
  };

  if (isLoading) {
    return (
      <div class="flex items-center gap-2">
        <svg
          class="animate-spin h-5 w-5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span class="text-gray-500 text-sm">読み込み中...</span>
      </div>
    );
  }

  return (
    <div class="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePrev}
        class="p-1 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="前月"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <span class="font-medium text-gray-800">
        {year}年{month}月
      </span>
      <button
        type="button"
        onClick={handleNext}
        class="p-1 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="次月"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
