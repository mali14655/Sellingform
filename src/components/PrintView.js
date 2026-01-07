import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSellerSubmission } from '../utils/api';

const PrintView = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await getSellerSubmission(id);
      setSubmission(response.data);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Submission not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Print
        </button>
      </div>

      {/* Print Content */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center border-b-2 border-gray-800 pb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Selling Form Submission</h1>
          <p className="text-gray-600">
            Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
          </p>
        </div>

        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold">{submission.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{submission.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-semibold">{submission.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-lg font-semibold">{submission.address}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Items for Sale
          </h2>
          <div className="space-y-4">
            {submission.items.map((item, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{item.itemName}</h3>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    item.status === 'Quoted' ? 'bg-green-100 text-green-800' :
                    item.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.description && (
                  <p className="text-gray-700 mb-2">{item.description}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Condition</p>
                    <p className="font-semibold">{item.condition}</p>
                  </div>
                  {item.estimatedValue && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Value</p>
                      <p className="font-semibold">${item.estimatedValue}</p>
                    </div>
                  )}
                  {item.adminQuotedPrice && (
                    <div>
                      <p className="text-sm text-gray-600">Quoted Price</p>
                      <p className="font-semibold text-green-700">${item.adminQuotedPrice}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seller Notes */}
        {submission.sellerNotes && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              Additional Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{submission.sellerNotes}</p>
          </div>
        )}

        {/* Admin Notes */}
        {submission.adminNotes && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              Admin Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{submission.adminNotes}</p>
          </div>
        )}

        {/* Signature */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Signature
          </h2>
          <div className="border-2 border-gray-400 p-4 inline-block">
            <img
              src={submission.signature}
              alt="Signature"
              className="max-w-md"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>This document was generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:p-4 {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;
