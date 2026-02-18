import { useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data, isLoading, error, refetch } = usePortfolio();
  const [showAbsReturnPercentage, setShowAbsReturnPercentage] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
        <button onClick={refetch} className="mt-4 text-primary underline">
          Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary;
  const holdings = data?.holdings || [];

  const isPositive = (summary?.absoluteReturn || 0) >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Overview of your investments
          </p>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Current Value
              </p>
              <h3 className="text-4xl font-bold tracking-tight">
                ₹
                {summary?.currentValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) ?? "0.00"}
              </h3>
            </div>
            <div
              className={cn(
                "px-3 py-1.5 rounded-full flex items-center gap-1 text-sm font-bold",
                isPositive
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              {summary?.returnPercentage.toFixed(2)}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Invested
              </p>
              <p className="font-semibold text-lg">
                ₹
                {summary?.totalInvested.toLocaleString("en-IN", {
                  notation: "compact",
                }) ?? "0"}
              </p>
            </div>
            <div
              className="cursor-pointer group"
              onClick={() =>
                setShowAbsReturnPercentage(!showAbsReturnPercentage)
              }
            >
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Return
                </p>
                <RefreshCw
                  size={10}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p
                className={cn(
                  "font-semibold text-lg",
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {showAbsReturnPercentage
                  ? `${isPositive ? "+" : ""}${summary?.returnPercentage.toFixed(2)}%`
                  : `₹${summary?.absoluteReturn.toLocaleString("en-IN", { notation: "compact" })}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                XIRR
              </p>
              <p className="font-semibold text-lg text-primary">
                {summary?.xirr.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Your Holdings</h3>
          <Link
            to="/discover"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
          >
            <Plus size={16} /> Add New
          </Link>
        </div>

        {holdings.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">
              You don't have any holdings yet.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              Start Investing
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {holdings.map((holding) => {
              const hp = holding.returnPercentage >= 0;
              return (
                <Link
                  key={holding.schemeCode}
                  to={`/funds/${holding.schemeCode}`}
                  className="glass p-4 rounded-xl flex items-center gap-4 hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {holding.schemeName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {holding.schemeName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {holding.units.toFixed(2)} units
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold">
                      ₹
                      {holding.currentValue.toLocaleString("en-IN", {
                        notation: "compact",
                      })}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-medium",
                        hp
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {hp ? "+" : ""}
                      {holding.returnPercentage.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
