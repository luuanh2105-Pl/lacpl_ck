import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, RefreshCw } from 'lucide-react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMXVMgaokG-P4C6m5CPbJVLmgbXeG0M_EvcZl0mC6qsS0Twj8SpWl3rvIhRXnKgeFh1yL3U5eYf83D/pub?output=csv";

function App() {
  const [data, setData] = useState([]);
  const [aiResult, setAiResult] = useState("");

  const loadData = async () => {
    const res = await axios.get(CSV_URL);
    // Parse CSV đơn giản
    const rows = res.data.split('\n').slice(1).map(row => {
      const [Symbol, Quantity, AvgPrice] = row.split(',');
      return { Symbol, Quantity, AvgPrice };
    });
    setData(rows);
  };

  const analyze = async () => {
    const genAI = new GoogleGenerativeAI("AIzaSyDSfopeUkg5aIDBpeOtdUKexzLkDCU3m7U");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Phân tích danh mục chứng khoán này: ${JSON.stringify(data)}`;
    const result = await model.generateContent(prompt);
    setAiResult(result.response.text());
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-5">Danh mục của Lạc</h1>
      <button onClick={loadData} className="mb-4 bg-gray-200 p-2 rounded">Refresh Data</button>
      
      <table className="w-full bg-white shadow rounded mb-5">
        {data.map((d, i) => <tr key={i}><td className="p-2 border">{d.Symbol}</td><td className="p-2 border">{d.Quantity}</td></tr>)}
      </table>

      <button onClick={analyze} className="bg-blue-600 text-white p-3 rounded flex gap-2"><Sparkles/> Hỏi Gemini</button>
      <div className="mt-5 p-5 bg-white border whitespace-pre-line">{aiResult}</div>
    </div>
  );
}

export default App;