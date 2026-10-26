import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SceneBackground from './components/SceneBackground';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

function RouteTitle() {
    const { pathname } = useLocation();

    useEffect(() => {
        const normalizedPath = pathname.replace(/\/+$/, '') || '/';
        const titles = {
            '/': 'Home | Eventora',
            '/events': 'Events | Eventora',
            '/login': 'Login | Eventora',
            '/register': 'Sign Up | Eventora',
            '/dashboard': 'Dashboard | Eventora',
            '/admin': 'Dashboard | Eventora',
            '/payment-success': 'Booking Confirmed | Eventora',
            '/payment-failed': 'Payment Status | Eventora',
        };

        document.title = titles[normalizedPath]
            || (normalizedPath.startsWith('/events/') ? 'Event Details | Eventora' : 'Page Not Found | Eventora');
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <RouteTitle />
            <div className="relative isolate min-h-screen bg-transparent flex flex-col">
                <SceneBackground />
                <Navbar />
                <main className="relative z-10 flex-grow w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/events" element={<Home />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<UserDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/payment-failed" element={<PaymentFailed />} />
                        <Route path="*" element={<h1 className="text-3xl font-bold text-center mt-20">404 - Page Not Found</h1>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;