import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";
import "../styles/UserSearch.css";

interface UserSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onSearch,
  initialQuery = "",
  placeholder = "Search users...",
  className = "",
}) => {
  const [localQuery, setLocalQuery] = useState(initialQuery);

  // Debounce the search function
  const debouncedSearch = debounce(onSearch, 300);

  useEffect(() => {
    debouncedSearch(localQuery);
    return () => debouncedSearch.cancel();
  }, [localQuery, debouncedSearch]);

  // Sync with external query changes
  useEffect(() => {
    setLocalQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className={`user-search-container ${className}`}>
      <div className="user-search">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="search-input"
        />
        {localQuery && (
          <button
            className="clear-search"
            onClick={() => {
              setLocalQuery("");
              onSearch("");
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
