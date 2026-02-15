import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NGOCard from '../../components/ngo/ngo_card';
import Footer from '../../components/Footer';

const NGOList = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNGOs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/ngos?page=${page}&limit=9`
        );
        const data = await response.json();
        if (data.success) {
          setNgos(data.data);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching NGOs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNGOs();
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">

      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-12 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-wide">
              Registered NGOs
            </h1>
            <p className="mt-2 text-blue-100">
              Verified organizations driving social impact.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 md:mt-0 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-slate-100 transition duration-300"
          >
            ← Return to Home
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ngos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-700 text-xl">
              No NGOs available at the moment.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {ngos.map((ngo) => (
                <div
                  key={ngo._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300"
                >
                  <NGOCard ngo={ngo} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-6 py-2 rounded-lg border border-slate-400 text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition"
                >
                  Previous
                </button>

                <span className="text-slate-800 font-semibold text-lg">
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-6 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default NGOList;
