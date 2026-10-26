import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle, FaUserTie, FaClock, FaCheckCircle } from 'react-icons/fa';

const emptyForm = { organizationName: '', phone: '', description: '' };

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    // Organizer request state
    const [organizer, setOrganizer] = useState({
        role: user?.role || 'user',
        organizerStatus: user?.organizerStatus || 'none',
    });
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
        fetchOrganizerStatus();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    // Always read the latest role/status from the server, not from the login token
    const fetchOrganizerStatus = async () => {
        try {
            const { data } = await api.get('/organizer/status');
            setOrganizer({ role: data.role, organizerStatus: data.organizerStatus });
        } catch (error) {
            console.error('Error fetching organizer status', error);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitOrganizerRequest = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            await api.post('/organizer/request', {
                organizationName: form.organizationName.trim(),
                phone: form.phone.trim(),
                description: form.description.trim(),
            });
            setOrganizer((prev) => ({ ...prev, organizerStatus: 'pending' }));
            setShowForm(false);
            setForm(emptyForm);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Could not send your request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading dashboard...</div>;

    const isPlainUser = organizer.role === 'user';
    const isOrganizer = organizer.role === 'organizer';
    const canRequest = isPlainUser && ['none', 'rejected'].includes(organizer.organizerStatus);
    const isPending = isPlainUser && organizer.organizerStatus === 'pending';

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-gray-200 text-gray-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome, {displayName}!</h1>
                    <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> User Dashboard
                    </p>
                </div>
            </div>

            {/* Organizer access */}
            {(canRequest || isPending || isOrganizer) && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100">
                    {isOrganizer && (
                        <div className="flex items-start gap-3 text-green-700">
                            <FaCheckCircle className="mt-1 shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">You are an approved organizer</h2>
                                <p className="text-sm text-gray-500">You can now list and manage your own programs.</p>
                            </div>
                        </div>
                    )}

                    {isPending && (
                        <div className="flex items-start gap-3 text-yellow-700">
                            <FaClock className="mt-1 shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Organizer request pending</h2>
                                <p className="text-sm text-gray-500">An admin will review your request. You will get access once it is approved.</p>
                            </div>
                        </div>
                    )}

                    {canRequest && (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <FaUserTie className="text-gray-700 text-xl mt-1 shrink-0" />
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Want to list your own programs?</h2>
                                        <p className="text-sm text-gray-500">
                                            {organizer.organizerStatus === 'rejected'
                                                ? 'Your last request was not approved. You can update your details and apply again.'
                                                : 'Send a short request. An admin reviews it before you can create programs.'}
                                        </p>
                                    </div>
                                </div>
                                {!showForm && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md shrink-0"
                                    >
                                        Become an Organizer
                                    </button>
                                )}
                            </div>

                            {showForm && (
                                <form onSubmit={submitOrganizerRequest} className="mt-6 space-y-4 max-w-xl">
                                    <div>
                                        <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Organization name
                                        </label>
                                        <input
                                            id="organizationName"
                                            name="organizationName"
                                            type="text"
                                            required
                                            maxLength={100}
                                            value={form.organizationName}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Phone number
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            pattern="[0-9]{10}"
                                            title="Enter a 10-digit phone number"
                                            value={form.phone}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Description or proof
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            required
                                            rows={4}
                                            maxLength={500}
                                            placeholder="What events do you plan to host? Add a website, social page, or past event link if you have one."
                                            value={form.description}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    {formError && <p className="text-sm text-red-600">{formError}</p>}

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md"
                                        >
                                            {submitting ? 'Sending...' : 'Send request'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowForm(false); setFormError(''); }}
                                            className="text-gray-600 hover:text-gray-900 font-semibold py-2.5 px-4"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <FaTicketAlt className="text-gray-700" /> My Bookings requests
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTicketAlt className="text-gray-300 text-3xl" />
                    </div>
                    <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">You haven't booked any events yet.</p>
                    <Link to="/" className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                            <div className="p-6 border-b border-gray-50 flex-grow">
                                {booking.eventId ? (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{booking.eventId.title}</h3>
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                {booking.status !== 'cancelled' && (
                                                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {booking.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4 space-y-1">
                                            <p><strong className="text-gray-700">Date:</strong> {new Date(booking.eventId.date).toLocaleDateString()}</p>
                                            <p><strong className="text-gray-700">Amount:</strong> {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</p>
                                            <p><strong className="text-gray-700">Requested:</strong> {new Date(booking.bookedAt).toLocaleDateString()}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-red-500 italic">Event details unavailable (might have been deleted)</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0">
                                {booking.eventId && booking.status !== 'cancelled' ? (
                                    <>
                                        <Link to={`/events/${booking.eventId._id}`} className="text-gray-900 font-semibold text-sm hover:underline">View Event</Link>
                                        <button
                                            onClick={() => cancelBooking(booking._id)}
                                            className="text-red-500 font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
                                        >
                                            <FaTimesCircle /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full text-center text-sm text-gray-500 italic">Booking Cancelled</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;