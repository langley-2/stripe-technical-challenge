import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((data) => {
        setBooks(Object.entries(data).map(([id, book]) => ({ id, ...book })));
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
          Bookshop
        </h1>
        <p className="text-gray-500 mb-12 text-lg">
          Thoughtfully curated reads.
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex flex-col bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <span className="text-3xl">📖</span>
                </div>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                  Book
                </p>
                <h2 className="text-base font-semibold text-gray-900 leading-snug flex-1 mb-6">
                  {book.title}
                </h2>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-medium text-gray-800">
                    ${(book.amount / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => navigate(`/checkout?item_id=${book.id}`)}
                    className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
