/** Prev / Next controls for a list. `pagination` is the block returned by the API. */
export default function Pagination({ pagination, onPage }) {
  if (!pagination) return null;
  const { page, total_pages: pages, total_items: total, has_prev: hasPrev, has_next: hasNext } = pagination;
  return (
    <div className="pager">
      <span className="muted small">{total} item{total === 1 ? '' : 's'}</span>
      {pages > 1 && (
        <div className="row">
          <button className="btn small ghost" disabled={!hasPrev} onClick={() => onPage(page - 1)}>← Prev</button>
          <span className="small">Page {page} of {pages}</span>
          <button className="btn small ghost" disabled={!hasNext} onClick={() => onPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
