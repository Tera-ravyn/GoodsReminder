"use client";
import GoodsReminder from "@/components/book/crud";
import Stock from "@/components/stock/stock";
import { useState } from "react";

export default function Home() {
  const [table, setTable] = useState("book");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button
        onClick={() => setTable(table === "book" ? "stock" : "book")}
        className="absolute left-4 top-4 cursor-pointer px-4 py-2 text-white bg-blue-400 hover:bg-blue-500 transition duration-300 rounded-md"
      >
        {table !== "book" ? "预定" : "库存"}管理
      </button>
      {table !== "book" ? <Stock /> : <GoodsReminder />}
    </main>
  );
}
