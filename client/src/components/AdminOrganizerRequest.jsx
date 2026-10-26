import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { FaUserTie, FaCheck, FaTimes } from 'react-icons/fa';

const AdminOrganizerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/admin/organizer-requests');
            setRequests(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load organizer requests');
        } finally {
            setLoading(false);
        }
    };

    const decide = async (id, approve) => {
        const action = approve ? 'approve' : 'reject';
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        setBusyId(id);
        try {
            await api.patch(`/admin/organizer-requests/${id}`, { approve });
            await fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || `Could not ${action} the request`);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 mb-6">
                <FaUserTie className="text-gray-700" /> Pending Organizer Requests
                {requests.length > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">
                        {requests.length}
                    </span>
                )}
            </h2>

            {loading && <p className="text-gray-500">Loading requests...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && requests.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100 text-gray-500">
                    No pending organizer requests.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((r) => (
                    <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="p-6 flex-grow space-y-2 text-sm text-gray-500">
                            <h3 className="text-lg font-bold text-gray-900">{r.organizerRequest?.organizationName}</h3>
                            <p><strong className="text-gray-700">Name:</strong> {r.name}</p>
                            <p><strong className="text-gray-700">Email:</strong> {r.email}</p>
                            <p><strong className="text-gray-700">Phone:</strong> {r.organizerRequest?.phone}</p>
                            <p className="whitespace-pre-line break-words">
                                <strong className="text-gray-700">Details:</strong> {r.organizerRequest?.description}
                            </p>
                            {r.organizerRequest?.requestedAt && (
                                <p><strong className="text-gray-700">Requested:</strong> {new Date(r.organizerRequest.requestedAt).toLocaleDateString()}</p>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => decide(r._id, false)}
                                disabled={busyId === r._id}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50 font-semibold text-sm flex items-center gap-1 px-3 py-2"
                            >
                                <FaTimes /> Reject
                            </button>
                            <button
                                onClick={() => decide(r._id, true)}
                                disabled={busyId === r._id}
                                className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-sm py-2 px-5 rounded-lg transition flex items-center gap-1"
                            >
                                <FaCheck /> Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminOrganizerRequests;