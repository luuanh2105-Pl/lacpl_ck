import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, Trash2, Plus, RefreshCw, BarChart3 } from 'lucide-react';

function App() {
  // 1. Khởi tạo state: Load từ localStorage nếu có, nếu không thì dùng mảng rỗng
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("myPortfolio");
    return saved ? JSON.parse(saved) : [];
  });
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Tự động lưu vào trình duyệt mỗi khi data thay đổi
  useEffect(() => {
    localStorage.setItem("myPortfolio", JSON.stringify(data));
  }, [data]);

  const addStock = () => {
    if (!symbol || !qty || !price) return alert("Nhập đủ thông tin nhé!");
    setData([...data, { symbol, qty, price }]);
    setSymbol(""); setQty(""); setPrice("");
  };

  const deleteStock = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const analyzeWithGemini = async () => {
    if (data.length === 0) return alert("Thêm mã vào đi đã!");
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Đây là danh mục đầu tư của tôi: ${JSON.stringify(data)}. Hãy phân tích ngắn gọn, đưa ra lời khuyên mua/bán/giữ cho từng mã dựa trên phân tích kỹ thuật chung.`;
      const result = await model.generateContent(prompt);
      setAiResult(result.response.text());
    } catch (e) {
      setAiResult("Lỗi rồi Lạc ơi, kiểm tra lại API Key nhé!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <BarChart3 /> Danh mục đầu tư của Lạc
      </h1>

      {/* Form Nhập liệu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 bg-gray-50 p-4 rounded-xl border">
        <input placeholder="Mã (MBB)" className="p-2 border rounded" value={symbol} onChange={e => setSymbol(e.target.value)} />
        <input placeholder="Số lượng" className="p-2 border rounded" value={qty} onChange={e => setQty(e.target.value)} />
        <input placeholder="Giá vốn" className="p-2 border rounded" value={price} onChange={e => setPrice(e.target.value)} />
        <button onClick={addStock} className="bg-green-600 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-green-700">
          <Plus size={18}/> Thêm
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <table className="w-full text-left border-collapse mb-6">
        <thead className="bg-gray-100">
          <tr><th className="p-3 border">Mã</th><th className="p-3 border">SL</th><th className="p-3 border">Giá vốn</th><th className="p-3 border">Action</th></tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-3 border font-bold">{item.symbol}</td>
              <td className="p-3 border">{item.qty}</td>
              <td className="p-3 border">{item.price}</td>
              <td className="p-3 border text-center">
                <button onClick={() => deleteStock(index)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nút phân tích */}
      <button onClick={analyzeWithGemini} disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 font-bold">
        {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
        {loading ? "Đang phân tích..." : "Nhờ Gemini tư vấn danh mục"}
      </button>

      {/* Kết quả AI */}
      {aiResult && (
        <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded whitespace-pre-line text-gray-700 shadow-sm">
          {aiResult}
        </div>
      )}
    </div>
  );
}

export default App;