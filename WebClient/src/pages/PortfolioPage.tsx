import { usePortfolio } from "@/hooks/usePortfolio";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

export default function Portfolio() {
  const { data, isLoading, error } = usePortfolio();

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (error)
    return <div className="text-center p-12 text-red-500">{error}</div>;

  const holdings = data?.holdings || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio Holdings</h2>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-500 dark:text-gray-400">
                  Scheme
                </th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 dark:text-gray-400">
                  Units
                </th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 dark:text-gray-400">
                  Avg NAV
                </th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 dark:text-gray-400">
                  Current Value
                </th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 dark:text-gray-400">
                  Returns
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {holdings.map((holding) => {
                const isPositive = holding.returnPercentage >= 0;
                return (
                  <tr
                    key={holding.schemeCode}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <Link
                        to={`/funds/${holding.schemeCode}`}
                        className="block"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {holding.schemeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Code: {holding.schemeCode}
                        </p>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      {holding.units.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-600 dark:text-gray-400">
                      ₹
                      {holding.averagePrice.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-4 px-6 text-right font-bold">
                      ₹
                      {holding.currentValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 font-bold",
                          isPositive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {isPositive ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                        {holding.returnPercentage.toFixed(2)}%
                      </div>
                      <p
                        className={cn(
                          "text-xs",
                          isPositive ? "text-green-600/70" : "text-red-600/70",
                        )}
                      >
                        {isPositive ? "+" : ""}₹
                        {holding.absoluteReturn.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {holdings.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No holdings found.
          </div>
        )}
      </div>
    </div>
  );
}
