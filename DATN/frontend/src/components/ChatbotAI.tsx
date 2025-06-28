"use client";
import React, { useState, useEffect, useRef } from "react";
import { fetchAllProducts } from "../services/productService";
import { Product } from "../types/product";
import ProductCard from "./ProductCard";

// Định nghĩa lại type cho message
interface ChatMessage {
  id: number;
  from: "user" | "bot";
  text: string;
  products?: Product[];
}

// Danh sách từ khóa không cần thiết để lọc
const vietnameseStopwords = new Set([
  "là", "của", "có", "một", "cho", "tôi", "bạn", "tìm", "muốn", "sản phẩm", 
  "cái", "chiếc", "điện thoại", "iphone", "samsung", "với", "và", "hoặc", 
  "khi", "thì", "mà", "ở", "tại", "về", "giá", "bao nhiêu"
]);

// Hàm trích xuất từ khóa, loại bỏ stop words
const extractKeywords = (text: string) => {
  const lowercased = text.toLowerCase();
  return lowercased.split(' ').filter(word => word.length > 1 && !vietnameseStopwords.has(word));
};

const ChatbotAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Xin chào Anh/Chị! Em là trợ lý AI của Poly Smart",
    },
    {
      id: 2, // ID phải khác nhau
      from: "bot",
      text: "Em rất sẵn lòng hỗ trợ Anh/Chị 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn cuối cùng
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Tải tất cả sản phẩm khi component được mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await fetchAllProducts();
        setAllProducts(productData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
      }
    };
    loadProducts();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // 1. Tạo tin nhắn mới của người dùng
    const userMessage: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: trimmedInput,
    };
    
    // 2. Lọc sản phẩm dựa trên input của người dùng (CLIENT-SIDE)
    const keywords = extractKeywords(trimmedInput);
    let foundProducts: Product[] = [];
    if (keywords.length > 0) {
      foundProducts = allProducts.filter(product => {
        const searchableText = [
          product.TenSP.toLowerCase(),
          product.variants?.map(v => `${v.mau?.toLowerCase()} ${v.dung_luong?.toLowerCase()}`).join(' ') || ''
        ].join(' ');
        
        return keywords.every(kw => searchableText.includes(kw));
      });
    }

    const currentHistory = messages.map(m => ({ role: m.from, content: m.text }));

    // 3. Chuẩn bị tin nhắn của bot
    const botMessageId = Date.now() + 1;
    let initialBotText = "";
    // Nếu tìm thấy sản phẩm, thêm một câu dẫn
    if (foundProducts.length > 0 && !loading) {
        initialBotText = "Dạ, em đã tìm thấy một vài sản phẩm có thể Anh/Chị quan tâm ạ:\n";
    }

    const botMessage: ChatMessage = {
        id: botMessageId,
        from: "bot",
        text: initialBotText, // Bắt đầu với câu dẫn (nếu có)
        products: foundProducts.slice(0, 4) // Giới hạn 4 sản phẩm
    };

    // 4. Cập nhật giao diện với tin nhắn người dùng và tin nhắn bot (với sản phẩm)
    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
    setLoading(true);
    
    try {
      // 5. Gọi API backend để nhận câu trả lời văn bản từ AI
      const res = await fetch(`http://localhost:3000/api/chat-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: trimmedInput,
          history: currentHistory
        }),
      });

      if (!res.body) throw new Error("Response body is null");

      // 6. Xử lý streaming response và nối vào câu dẫn
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: initialBotText + accumulatedResponse } // Nối vào text ban đầu
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                products: foundProducts.slice(0, 4) // Vẫn giữ sản phẩm đã tìm thấy
              }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {/* Nút mở chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[1000] bg-gray-300 hover:bg-gray-400 text-white w-14 h-14 rounded-full shadow-lg duration-300 ease-in-out flex items-center justify-center"
          aria-label="Mở chat AI"
        >🤖
        </button>
      )}

      {/* Khung chat */}
      {isOpen && (
        <div className="fixed bottom-4 right-6 w-[440px] h-[680px] bg-white rounded-2xl shadow-2xl z-[1001] flex flex-col font-sans">
          {/* Header */}
          <div className="bg-gray-800 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <p className="font-semibold text-lg">Poly Smart - Trợ lý AI</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-2xl leading-none hover:text-gray-300"
              aria-label="Đóng chat"
            >
              &times;
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-100 hide-scrollbar">
            <div className="flex flex-col space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full ${
                    msg.from === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800"
                    } ${
                      // Ẩn bong bóng chat của bot nếu text rỗng và không có sản phẩm
                      msg.from === 'bot' && !msg.text && (!msg.products || msg.products.length === 0) ? 'hidden' : ''
                    }`}
                  >
                    {/* Luôn render text trước */}
                    {msg.text && (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                                    
                  {msg.from === 'bot' && msg.products && msg.products.length > 0 && (
                    <div className="mt-2 w-full max-w-[90%] rounded-lg border bg-white border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        {msg.products.map((p, index) => (
                          <div key={p._id} className={`
                            ${index % 2 === 0 ? 'border-r' : ''} 
                            ${index < msg.products!.length - 2 ? 'border-b' : ''}
                            border-gray-200
                          `}>
                            <ProductCard
                              product={p}
                              variant={p.variants?.[0]}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                 
                </div>
              ))}
              {loading && (
                <div className="flex items-start">
                  <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 shadow">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <form onSubmit={handleSend} className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 w-full px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotAI; 