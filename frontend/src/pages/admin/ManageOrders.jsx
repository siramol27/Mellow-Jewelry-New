//   src/pages/admin/ManageOrders.jsx
import React, { useMemo, useState } from "react";
import { useOrders } from "../../context/OrderContext";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const STATUS = [
  "รอตรวจสอบ",
  "ตรวจสอบแล้ว",
  "กำลังดำเนินการ",
  "สลิปไม่ถูกต้อง",
  "สำเร็จ",
];

const STATUS_STYLE = {
  "รอตรวจสอบ": "bg-amber-600/30 text-amber-200 border border-amber-600/40",
  "ตรวจสอบแล้ว": "bg-sky-600/30 text-sky-200 border border-sky-600/40",
  "กำลังดำเนินการ": "bg-indigo-600/30 text-indigo-200 border border-indigo-600/40",
  "สลิปไม่ถูกต้อง": "bg-rose-600/30 text-rose-200 border border-rose-600/40",
  "สำเร็จ": "bg-emerald-600/30 text-emerald-200 border border-emerald-600/40",
};

export default function ManageOrders() {
  const { orders, updateOrderStatus } = useOrders();

  const [slipModal, setSlipModal] = useState(null);
  const [mode, setMode] = useState("daily");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ทั้งหมด");

  //   Filter
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    const base = Array.isArray(orders) ? orders : [];

    const searched = t
      ? base.filter((o) => {
          const hay = `${o.id} ${o.buyerName} ${(o.items ?? [])
            .map((i) => i.name)
            .join(" ")}`.toLowerCase();
          return hay.includes(t);
        })
      : base;

    return filter === "ทั้งหมด" ? searched : searched.filter((o) => o.status === filter);
  }, [orders, search, filter]);

  // Summary
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const totalToday = filtered
    .filter((o) => new Date(o.createdAt).toDateString() === today.toDateString())
    .reduce((s, o) => s + o.total, 0);

  const totalMonth = filtered
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((s, o) => s + o.total, 0);

  const totalYear = filtered
    .filter((o) => new Date(o.createdAt).getFullYear() === year)
    .reduce((s, o) => s + o.total, 0);

  //   Chart data
  const chartData = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      const d = new Date(o.createdAt);
      let key = "";
      if (mode === "daily") key = d.toLocaleDateString();
      if (mode === "monthly") key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (mode === "yearly") key = `${d.getFullYear()}`;
      map[key] = (map[key] || 0) + o.total;
    });
    return Object.keys(map).map((k) => ({ name: k, total: map[k] }));
  }, [filtered, mode]);

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#0D0F12] overflow-hidden flex flex-col">

      {/*   BEAUTIFUL GLOW BACKGROUND */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[450px] h-[450px] bg-purple-700/25 blur-[180px] rounded-full"></div>
      <div className="pointer-events-none absolute top-[200px] right-[-200px] w-[550px] h-[550px] bg-fuchsia-600/20 blur-[200px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-[-350px] left-[200px] w-[500px] h-[500px] bg-purple-900/30 blur-[200px] rounded-full"></div>

      {/*   MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pt-24 flex-grow">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-xl">Dashboard ยอดขาย</h1>

          <Link
            to="/admin/products"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white shadow-lg"
          >
            จัดการสินค้า
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-[#161A20]/90 backdrop-blur border border-[#263241] rounded-xl shadow-lg">
            <p className="text-slate-400">วันนี้</p>
            <p className="text-3xl font-bold text-emerald-400 drop-shadow">{totalToday} ฿</p>
          </div>

          <div className="p-6 bg-[#161A20]/90 backdrop-blur border border-[#263241] rounded-xl shadow-lg">
            <p className="text-slate-400">เดือนนี้</p>
            <p className="text-3xl font-bold text-sky-400 drop-shadow">{totalMonth} ฿</p>
          </div>

          <div className="p-6 bg-[#161A20]/90 backdrop-blur border border-[#263241] rounded-xl shadow-lg">
            <p className="text-slate-400">ปีนี้</p>
            <p className="text-3xl font-bold text-purple-400 drop-shadow">{totalYear} ฿</p>
          </div>
        </div>

        {/* Mode Buttons */}
        <div className="flex gap-4 mb-6">
          <button className={`px-4 py-2 rounded-md shadow ${mode === "daily" ? "bg-purple-600" : "bg-[#263241]"}`} onClick={() => setMode("daily")}>รายวัน</button>
          <button className={`px-4 py-2 rounded-md shadow ${mode === "monthly" ? "bg-purple-600" : "bg-[#263241]"}`} onClick={() => setMode("monthly")}>รายเดือน</button>
          <button className={`px-4 py-2 rounded-md shadow ${mode === "yearly" ? "bg-purple-600" : "bg-[#263241]"}`} onClick={() => setMode("yearly")}>รายปี</button>
        </div>

        {/* Chart */}
        <div className="bg-[#161A20]/90 backdrop-blur border border-[#263241] p-6 rounded-xl shadow-xl mb-16">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#A763E6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders */}
        <h2 className="text-2xl font-semibold mb-6 drop-shadow">รายการคำสั่งซื้อ</h2>

        <div className="flex gap-4 mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#11161C] border border-[#263241]"
            placeholder="ค้นหา..."
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#11161C] border border-[#263241]"
          >
            <option>ทั้งหมด</option>
            {STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((o) => (
            <div key={o.id} className="p-5 bg-[#161A20]/90 backdrop-blur border border-[#263241] rounded-lg shadow-lg">

              <div className="flex justify-between mb-2">
                <p className="text-sm text-slate-400">#{o.id}</p>
                <span className={`px-2 py-1 rounded-md text-xs ${STATUS_STYLE[o.status]}`}>
                  {o.status}
                </span>
              </div>

              <p className="font-medium mb-3 drop-shadow">{o.buyerName}</p>

              <ul className="text-sm text-slate-300 space-y-1 mb-3">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-slate-400">
                      x{it.qty} • {(it.qty * it.price).toLocaleString()} ฿
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-slate-500 mb-3">
                {new Date(o.createdAt).toLocaleString()}
              </p>

              {o.slip && (
                <button
                  onClick={() => setSlipModal(o.slip)}
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-500 py-2 rounded-md shadow"
                >
                  ดูสลิปการโอน
                </button>
              )}

              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                className="w-full mt-3 bg-[#11161C] border border-[#263241] px-3 py-2 rounded-md"
              >
                {STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

      </div>

      {/*     FIXED FOOTER — สีขาวล้วน อยู่ล่างสุด */}
      <footer
        className="text-center py-10 border-t"
        style={{
          borderColor: "#1e1e25",
          color: "white",      //   ตัวหนังสือขาว
        }}
      >
        <p className="font-semibold text-lg drop-shadow" style={{ color: "white" }}>
          Mellow Jewelry
        </p>

        <span style={{ color: "white" }}>
          © 2026 Mellow Jewelry. All rights reserved.
        </span>
      </footer>

      {slipModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center"
          onClick={() => setSlipModal(null)}
        >
          <div
            className="bg-[#161A20] p-4 rounded-lg max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={slipModal}
              alt="Slip"
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}