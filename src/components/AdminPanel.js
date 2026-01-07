import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissions, updateItemPrice, updateSubmissionNotes } from '../utils/api';
import { getAuthToken, setAuthToken, isAuthenticated } from '../utils/auth';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    fetchSubmissions();
  }, [navigate]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await getSubmissions(token);
      setSubmissions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/admin/login');
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setNotesInput(submission.adminNotes || '');
    setEditingItemIndex(null);
    setPriceInput('');
  };

  const handleUpdatePrice = async (submissionId, itemIndex, currentPrice) => {
    if (!priceInput || isNaN(priceInput) || parseFloat(priceInput) < 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const token = getAuthToken();
      await updateItemPrice(submissionId, itemIndex, {
        adminQuotedPrice: parseFloat(priceInput),
        status: 'Quoted'
      }, token);
      
      await fetchSubmissions();
      const updated = submissions.find(s => s._id === submissionId);
      if (updated) {
        updated.items[itemIndex].adminQuotedPrice = parseFloat(priceInput);
        updated.items[itemIndex].status = 'Quoted';
        setSelectedSubmission(updated);
      }
      setEditingItemIndex(null);
      setPriceInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update price');
    }
  };

  const handleUpdateStatus = async (submissionId, itemIndex, status) => {
    try {
      const token = getAuthToken();
      await updateItemPrice(submissionId, itemIndex, { status }, token);
      await fetchSubmissions();
      const updated = submissions.find(s => s._id === submissionId);
      if (updated) {
        updated.items[itemIndex].status = status;
        setSelectedSubmission(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedSubmission) return;

    try {
      const token = getAuthToken();
      await updateSubmissionNotes(selectedSubmission._id, { adminNotes: notesInput }, token);
      await fetchSubmissions();
      const updated = submissions.find(s => s._id === selectedSubmission._id);
      if (updated) {
        updated.adminNotes = notesInput;
        setSelectedSubmission(updated);
      }
      alert('Notes updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update notes');
    }
  };

  const handlePrint = (submissionId) => {
    window.open(`/print/${submissionId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Submissions ({submissions.length})</h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {submissions.length === 0 ? (
                  <p className="text-gray-500">No submissions yet</p>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission._id}
                      onClick={() => handleSelectSubmission(submission)}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedSubmission?._id === submission._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{submission.name}</div>
                      <div className="text-sm text-gray-600">{submission.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {submission.items.length} item(s)
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSubmission.name}</h2>
                    <p className="text-gray-600">{selectedSubmission.email}</p>
                    <p className="text-gray-600">{selectedSubmission.phone}</p>
                    <p className="text-gray-600">{selectedSubmission.address}</p>
                  </div>
                  <button
                    onClick={() => handlePrint(selectedSubmission._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Print
                  </button>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Items</h3>
                  <div className="space-y-4">
                    {selectedSubmission.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{item.itemName}</h4>
                            {item.description && (
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Condition: {item.condition}
                            </p>
                            {item.estimatedValue && (
                              <p className="text-sm text-gray-500">
                                Estimated Value: ${item.estimatedValue}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'Quoted' ? 'bg-green-100 text-green-800' :
                            item.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                          {editingItemIndex === index ? (
                            <>
                              <input
                                type="number"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                placeholder="Enter price"
                                className="px-3 py-2 border border-gray-300 rounded-md w-32"
                                min="0"
                                step="0.01"
                              />
                              <button
                                onClick={() => handleUpdatePrice(selectedSubmission._id, index, item.adminQuotedPrice)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingItemIndex(null);
                                  setPriceInput('');
                                }}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {item.adminQuotedPrice ? (
                                <span className="font-semibold text-lg">
                                  Quoted: ${item.adminQuotedPrice}
                                </span>
                              ) : (
                                <span className="text-gray-500">No price quoted</span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingItemIndex(index);
                                  setPriceInput(item.adminQuotedPrice || '');
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                {item.adminQuotedPrice ? 'Edit Price' : 'Quote Price'}
                              </button>
                            </>
                          )}

                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(selectedSubmission._id, index, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Admin Notes</h3>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Add notes about this submission..."
                  />
                  <button
                    onClick={handleUpdateNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>

                {/* Signature Preview */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Signature</h3>
                  <img
                    src={selectedSubmission.signature}
                    alt="Signature"
                    className="border border-gray-300 rounded p-2 bg-white max-w-md"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
