const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new project (Admin/Manager only)
router.post('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
	try {
		const { name, description, key, priority, startDate, endDate } = req.body;
		if (!name || !description || !key) {
			return res.status(400).json({ success: false, message: 'Name, description, and key are required.' });
		}
		const project = await Project.create({
			name,
			description,
			key,
			priority,
			startDate,
			endDate,
		});
		res.status(201).json({ success: true, project });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// List all projects (authenticated users)
router.get('/', authenticate, async (req, res) => {
	try {
		const projects = await Project.find();
		res.json({ success: true, projects });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
