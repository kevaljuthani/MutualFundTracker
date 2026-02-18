import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface PortfolioSummary {
  currentValue: number;
  totalInvested: number;
  xirr: number;
  absoluteReturn: number;
  returnPercentage: number;
}

export interface Holding {
  schemeCode: string;
  schemeName: string;
  units: number;
  averagePrice: number;
  currentValue: number;
  returnPercentage: number;
  absoluteReturn: number;
}

export function usePortfolio() {
  const [data, setData] = useState<{
    summary: PortfolioSummary;
    holdings: Holding[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get("/portfolios");
      console.log("Portfolio Data:", res.data);
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch portfolio");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { data, isLoading, error, refetch: fetchPortfolio };
}
