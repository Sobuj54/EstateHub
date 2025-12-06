const Pagination = ({ page, totalPages, setPage }) => {
  // Render a compact set of page buttons
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);

  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center gap-2 mt-5">
      <button
        onClick={() => setPage((s) => Math.max(1, s - 1))}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => setPage(1)}
            className="px-3 py-1 border rounded"
          >
            1
          </button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded border ${
            p === page ? "bg-primary text-white border-primary" : ""
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">…</span>}
          <button
            onClick={() => setPage(totalPages)}
            className="px-3 py-1 border rounded"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
