// src/pages/admin/ManageOrders.jsx
import React, { useMemo, useState } from 'react';
import { useOrders } from '../../context/OrderContext';

// แผนที่สีสถานะ
const STATUS = ['ใหม่', 'รอชำระ', 'ชำระแล้ว', 'ยกเลิก'];
const STATUS_STYLE = {
  'ใหม่':      'bg-sky-600/30 text-sky-200 border border-sky-600/40',
  'รอชำระ':    'bg-amber-600/30 text-amber-200 border border-amber-600/40',
  'ชำระแล้ว':  'bg-emerald-600/30 text-emerald-200 border border-emerald-600/40',
  'ยกเลิก':    'bg-rose-600/30 text-rose-200 border border-rose-600/40',
};

export default function ManageOrders() {
  const { orders /*, updateOrderStatus, clearOrders*/ } = useOrders();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ทั้งหมด');

  // กรอง + ค้นหา
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const base = Array.isArray(orders) ? orders : [];
    const byText = !text
      ? base
      : base.filter(o => {
          const hay =
            `${o.id ?? ''} ${o.buyerName ?? ''} ${(o.items ?? []).map(i => i.name).join(' ')}`.toLowerCase();
          return hay.includes(text);
        });
    if (filter === 'ทั้งหมด') return byText;
    return byText.filter(o => (o.status ?? 'ใหม่') === filter);
  }, [orders, q, filter]);

  // ยอดรวม “ตามสิ่งที่ผู้ใช้เห็นตอนนี้” (หลังกรอง)
  const totalOfFiltered = useMemo(
    () => (filtered ?? []).reduce((s, o) => s + (o.total ?? 0), 0),
    [filtered]
  );
  // จำนวนออเดอร์ทั้งหมดและยอดรวมทั้งหมด
  const countAll = (orders ?? []).length;
  const totalAll  = (orders ?? []).reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div className="min-h-screen text-slate-100" style={{ background: '#0D0F12' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">จัดการคำสั่งซื้อ (Owner/Admin)</h1>
            <p className="text-slate-400 text-sm">ดูรายการคำสั่งซื้อทั้งหมดจากลูกค้า</p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 text-sm">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหา: ผู้สั่ง/สินค้า/เลขที่"
              className="rounded-md px-3 py-1.5 outline-none"
              style={{ background:'#11161C', border:'1px solid #263241' }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md px-3 py-1.5 outline-none"
              style={{ background:'#11161C', border:'1px solid #263241' }}
            >
              <option>ทั้งหมด</option>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>

            {/* ปุ่มเครื่องมือ ตัวอย่าง: ส่งออก/ล้าง (ปิดทับตอนนี้ถ้ายังไม่ใช้) */}
            {/* <button onClick={...} className="rounded-md px-3 py-1.5 bg-sky-600 hover:bg-sky-500">ส่งออก CSV</button>
            <button onClick={() => { if (confirm('ล้างทั้งหมด?')) clearOrders(); }} className="rounded-md px-3 py-1.5 bg-rose-600 hover:bg-rose-500">ล้างทั้งหมด</button> */}

            <span className="rounded-md px-3 py-1.5" style={{ background:'#11161C', border:'1px solid #263241' }}>
              รวมที่แสดง {filtered.length} ออเดอร์
            </span>
            <span className="rounded-md px-3 py-1.5 font-medium" style={{ background:'#11161C', border:'1px solid #263241' }}>
              ยอดตามที่แสดง {totalOfFiltered.toLocaleString()} ฿
            </span>
            <span className="rounded-md px-3 py-1.5 text-slate-400" style={{ background:'#0F141A', border:'1px dashed #263241' }}>
              ทั้งหมด {countAll} | {totalAll.toLocaleString()} ฿
            </span>
          </div>
        </div>

        {/* Body */}
        {filtered.length === 0 ? (
          <div className="text-slate-400">ยังไม่มีคำสั่งซื้อ</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((o) => {
              const st = o.status ?? 'ใหม่';
              return (
                <div
                  key={o.id}
                  className="rounded-lg p-4"
                  style={{ background:'#161A20', border:'1px solid #263241' }}
                >
                  {/* Row 1: เลขที่ + สถานะ */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">เลขที่: {o.id}</div>
                    <span
                      className={`text-xs rounded-md px-2 py-1 ${STATUS_STYLE[st] ?? STATUS_STYLE['ใหม่']}`}
                      title="สถานะคำสั่งซื้อ"
                    >
                      {st}
                    </span>
                  </div>

                  {/* Row 2: ผู้สั่ง */}
                  <div className="font-medium">{o.buyerName || 'ลูกค้า'}</div>

                  {/* รายการ */}
                  <ul className="mt-2 text-sm text-slate-200 space-y-1">
                    {(o.items ?? []).map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="truncate">{it.name}</span>
                        <span className="text-slate-400">
                          x{it.qty} • {(it.price * it.qty).toLocaleString()}฿
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer in card */}
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-400">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                    </span>
                    <span className="font-semibold">
                      รวม {(o.total ?? 0).toLocaleString()} ฿
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}