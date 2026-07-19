import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import Button from "./Button";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange = () => {},
}) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(
    currentPage * pageSize,
    totalItems
  );

  const getPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const startPage = Math.max(
      2,
      currentPage - 1
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let i = startPage;
      i <= endPage;
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {start}-{end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-2">

        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="h-10 w-10 p-0"
        >
          <ChevronsLeft size={16} />
        </Button>

        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          className="h-10 w-10 p-0"
        >
          <ChevronLeft size={16} />
        </Button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="px-2 text-slate-500"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={
                page === currentPage
                  ? "primary"
                  : "outline"
              }
              onClick={() =>
                onPageChange(page)
              }
              className="h-10 w-10 p-0"
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          className="h-10 w-10 p-0"
        >
          <ChevronRight size={16} />
        </Button>

        <Button
          variant="outline"
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            onPageChange(totalPages)
          }
          className="h-10 w-10 p-0"
        >
          <ChevronsRight size={16} />
        </Button>

      </div>
    </div>
  );
};

export default Pagination;