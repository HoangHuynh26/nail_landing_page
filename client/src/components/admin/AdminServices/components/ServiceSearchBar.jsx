import React from 'react';
import { Search, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

export function ServiceSearchBar({
  searchQuery,
  setSearchQuery,
  totalPages,
  safeCurrentPage,
  setCurrentPage,
  getPageNumbers
}) {
  return (
    <div className="admin-services-filter-bar">
      <div className="admin-services-search-form">
        <Search size={16} className="admin-services-search-icon" />
        <input
          type="text"
          className="admin-services-search-input"
          placeholder="Search services by name, category, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-services-search-clear"
            onClick={() => setSearchQuery('')}
            title="Clear search text"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-services-top-pagination">
          <button
            type="button"
            className="admin-pagination-btn admin-pagination-nav-btn admin-pagination-edge-btn"
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            title="First Page"
          >
            <ChevronsLeft size={15} />
          </button>

          <button
            type="button"
            className="admin-pagination-btn admin-pagination-nav-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            title="Previous Page"
          >
            <ChevronLeft size={15} />
            <span className="admin-pagination-nav-text">Prev</span>
          </button>

          <div className="admin-pagination-pages-group">
            {getPageNumbers().map((pageItem, idx) =>
              pageItem === '...' ? (
                <span key={`ellipsis-${idx}`} className="admin-pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageItem}
                  type="button"
                  className={`admin-pagination-btn admin-pagination-num-btn ${
                    safeCurrentPage === pageItem ? 'is-active' : ''
                  }`}
                  onClick={() => setCurrentPage(pageItem)}
                >
                  {pageItem}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="admin-pagination-btn admin-pagination-nav-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            title="Next Page"
          >
            <span className="admin-pagination-nav-text">Next</span>
            <ChevronRight size={15} />
          </button>

          <button
            type="button"
            className="admin-pagination-btn admin-pagination-nav-btn admin-pagination-edge-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            title="Last Page"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ServiceSearchBar;
