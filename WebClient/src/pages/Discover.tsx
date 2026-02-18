import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Loader2 } from "lucide-react";

interface FundSearchResult {
  schemeCode: number;
  schemeName: string;
}

export default function Discover() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FundSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/funds?q=${encodeURIComponent(searchQuery)}`,
      );
      setResults(res.data.data || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect, but keep this for Enter key
    if (query.trim()) {
      performSearch(query);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Discover Funds</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Search for mutual funds to add to your portfolio
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for funds (e.g. HDFC Top 100)"
          className="w-full pl-12 pr-4 py-4 rounded-2xl glass bg-white/50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-primary transition-all text-lg placeholder-gray-400"
        />
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={24}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Search"
          )}
        </button>
      </form>

      <div className="space-y-4">
        {results.map((fund) => (
          <Link
            key={fund.schemeCode}
            to={`/funds/${fund.schemeCode}`}
            className="block p-4 glass rounded-xl hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{fund.schemeName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Code: {fund.schemeCode}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                <SearchIcon size={16} className="text-gray-500" />
              </div>
            </div>
          </Link>
        ))}

        {results.length === 0 && !isLoading && query && (
          <p className="text-center text-gray-500 mt-8">
            No funds found for "{query}"
          </p>
        )}
      </div>
    </div>
  );
}
