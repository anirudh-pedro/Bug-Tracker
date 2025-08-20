const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// POST /api/auth/google
router.post('/google', async (req, res) => {
	const { idToken } = req.body;
	if (!idToken) {
		return res.status(400).json({ success: false, message: 'No ID token provided' });
	}
	try {
		// Verify Google ID token
		const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
		const payload = ticket.getPayload();
		const { sub: googleId, email, name, picture } = payload;

		// Find or create user
		let user = await User.findOne({ googleId });
		if (!user) {
			user = await User.create({
				name,
				email,
				googleId,
				avatar: picture,
				role: 'developer', // default role
			});
		}

		// Generate JWT for session
		const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				role: user.role,
				projects: user.projects || [],
			},
		});
	} catch (err) {
		res.status(401).json({ success: false, message: 'Invalid Google token', error: err.message });
	}
});

module.exports = router;
