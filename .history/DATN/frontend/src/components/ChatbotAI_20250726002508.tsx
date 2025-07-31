"use client";
import React, { useState, useEffect, useRef } from "react";
import { fetchAllProducts } from "../services/productService";
import { Product } from "../types/product";
import ProductCard from "./ProductCard";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Định nghĩa lại type cho message
interface ChatMessage {
  id: number;
  from: "user" | "bot";
  text: string;
  products?: Product[];
}

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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Gọi API backend để nhận cả reply và products
      const res = await fetch(`http://localhost:3000/api/chat-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: trimmedInput,
          history: messages.map(m => ({ role: m.from, content: m.text }))
        }),
      });
      const data = await res.json();
      // Thêm message bot với text và products
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: data.reply,
          products: data.products || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
          products: []
        }
      ]);
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
          className="fixed bottom-6 right-6 z-[1000] text-white w-14 h-14 rounded-full shadow-lg duration-300 ease-in-out flex items-center justify-center"
          aria-label="Mở chat AI"
        >
          {/* Gemini SVG icon */}
          <img src="/images/chaticon.jpg" alt="Gemini" width={60} height={60} className="rounded-full" />
        </button>
      )}

      {/* Khung chat */}
      {isOpen && (
        <div className="fixed bottom-4 right-6 w-[440px] h-[680px] bg-white rounded-2xl shadow-2xl z-[1001] flex flex-col font-sans">
          {/* Header */}
          <div className="bg-[#3E8FFC] text-white p-4 rounded-t-2xl flex justify-between items-center">
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
                      msg.from === 'bot' ? (
                        <div className="text-sm whitespace-pre-wrap markdown-table">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      )
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