const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const User = require('../models/User');

const getUserId = (req) => req.user._id || req.user.id;

// Admin check that reads the role from the database
const requireAdmin = async (req, res, next) => {
    try {
        const u = await User.findById(getUserId(req)).select('role');
        if (!u || u.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Latest role and organizer status for the logged-in user
router.get('/organizer/status', auth, async (req, res) => {
    try {
        const u = await User.findById(getUserId(req)).select('role organizerStatus');
        if (!u) return res.sendStatus(404);
        res.json({ role: u.role, organizerStatus: u.organizerStatus });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit the "Become an Organizer" form
router.post('/organizer/request', auth, async (req, res) => {
    try {
        const { organizationName, phone, description } = req.body;
        if ([organizationName, phone, description].some((v) => typeof v !== 'string')) {
            return res.status(400).json({ message: 'Invalid input' });
        }
        const org = organizationName.trim();
        const ph = phone.trim();
        const desc = description.trim();

        if (!org || !ph || !desc) return res.status(400).json({ message: 'All fields are required' });
        if (org.length > 100 || desc.length > 500) return res.status(400).json({ message: 'Input is too long' });
        if (!/^[0-9]{10}$/.test(ph)) return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });

        const user = await User.findById(getUserId(req));
        if (!user) return res.sendStatus(404);
        if (user.role !== 'user') return res.status(400).json({ message: 'Your account cannot request organizer access' });
        if (user.organizerStatus === 'pending') return res.status(400).json({ message: 'You already have a pending request' });

        user.organizerStatus = 'pending';
        user.organizerRequest = { organizationName: org, phone: ph, description: desc, requestedAt: new Date() };
        await user.save();

        res.json({ message: 'Request submitted. Wait for admin approval.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: list pending requests
router.get('/admin/organizer-requests', auth, requireAdmin, async (req, res) => {
    try {
        const list = await User.find({ organizerStatus: 'pending' })
            .select('name email organizerRequest')
            .sort({ 'organizerRequest.requestedAt': 1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: approve or reject one request
router.patch('/admin/organizer-requests/:id', auth, requireAdmin, async (req, res) => {
    try {
        const approve = req.body.approve === true;
        const update = approve
            ? { role: 'organizer', organizerStatus: 'approved' }
            : { organizerStatus: 'rejected' };

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, organizerStatus: 'pending', role: 'user' },
            update,
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Pending request not found' });

        res.json({ message: approve ? 'Approved' : 'Rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;