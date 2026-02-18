import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Plus } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio"; // To refresh after add
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface FundDetail {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  category: string;
  latestNav: number | null;
  latestNavDate: string | null;
}

export default function FundDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { refetch } = usePortfolio();

  const [fund, setFund] = useState<FundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [history, setHistory] = useState<{ date: string; nav: number }[]>([]);
  const [period, setPeriod] = useState("1Y");

  // Transaction Form State
  const [units, setUnits] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFund() {
      try {
        const [fundRes, historyRes] = await Promise.all([
          axios.get(`/funds/${code}`),
          axios.get(`/funds/${code}/history?period=${period}`),
        ]);
        // Backend returns { data: { ...fund } }
        setFund(fundRes.data.data);
        setHistory(
          historyRes.data.data.map((h: any) => ({
            ...h,
            nav: parseFloat(h.nav),
          })),
        );

        // Pre-fill price if available
        if (fundRes.data.data.latestNav) {
          setPrice(String(fundRes.data.data.latestNav));
        }
      } catch (e) {
        console.error("Failed to fetch fund", e);
      } finally {
        setLoading(false);
      }
    }
    fetchFund();
  }, [code, period]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/portfolios/transactions", {
        schemeCode: code,
        units: parseFloat(units),
        pricePerUnit: parseFloat(price),
        type: "BUY", // Only BUY for now
        date: new Date(date).toISOString(),
      });
      await refetch(); // Update portfolio cache
      setShowAddModal(false);
      setUnits("");
    } catch {
      alert("Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!fund)
    return <div className="p-8 text-center text-red-500">Fund not found</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="glass p-8 rounded-3xl mb-8">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-3">
              {fund.category}
            </span>
            <h1 className="text-3xl font-bold mb-2">{fund.schemeName}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {fund.fundHouse}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Latest NAV (
              {new Date(fund.latestNavDate || "").toLocaleDateString()})
            </p>
            <h2 className="text-4xl font-bold text-primary">
              ₹
              {typeof fund.latestNav === "number"
                ? fund.latestNav.toFixed(2)
                : "N/A"}
            </h2>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[300px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#007AFF", fontWeight: "bold" }}
                labelStyle={{ color: "#666", marginBottom: "4px" }}
                formatter={(
                  value: number | string | Array<number | string> | undefined,
                ) => [`₹${Number(value || 0).toFixed(2)}`, "NAV"]}
              />
              <Area
                type="monotone"
                dataKey="nav"
                stroke="#007AFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNav)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {["1M", "6M", "1Y", "3Y", "5Y", "ALL"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                period === p
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
            <h3 className="text-xl font-bold mb-4">Add Transaction</h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Units</label>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border-none"
                  placeholder="0.00"
                  step="0.001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price per Unit (NAV)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border-none"
                  placeholder="0.00"
                  step="0.0001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border-none"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 font-medium bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                >
                  {submitting ? "Adding..." : "Confirm Buy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
