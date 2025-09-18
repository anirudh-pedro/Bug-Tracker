const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new project (any authenticated user can create projects)
router.post('/', authenticate, async (req, res) => {
	try {
		const { name, description, key, priority, startDate, endDate } = req.body;
		if (!name || !description || !key) {
			return res.status(400).json({ success: false, message: 'Name, description, and key are required.' });
		}
		
		// Check if project key already exists
		const existingProject = await Project.findOne({ key: key.toUpperCase() });
		if (existingProject) {
			return res.status(400).json({ success: false, message: 'Project key already exists. Please choose a different key.' });
		}
		
		const project = await Project.create({
			name,
			description,
			key: key.toUpperCase(),
			priority: priority || 'medium',
			startDate: startDate ? new Date(startDate) : new Date(),
			endDate: endDate ? new Date(endDate) : null,
			owner: req.user._id,
			members: [{ user: req.user._id, role: 'manager', joinedAt: new Date() }]
		});
		
		// Populate the project before returning
		const populatedProject = await Project.findById(project._id)
			.populate('owner', 'name email')
			.populate('members.user', 'name email');
		
		res.status(201).json({ success: true, data: { project: populatedProject } });
	} catch (error) {
		console.error('Create project error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// List all projects (authenticated users) - only show user's own projects
router.get('/', authenticate, async (req, res) => {
	try {
		// Get projects where user is owner or member
		const projects = await Project.find({
			$or: [
				{ owner: req.user._id },
				{ 'members.user': req.user._id }
			]
		})
		.populate('owner', 'name email')
		.populate('members.user', 'name email')
		.sort({ createdAt: -1 });
		
		// Add bug count for each project
		const Bug = require('../models/Bug');
		const projectsWithStats = await Promise.all(projects.map(async (project) => {
			const bugCount = await Bug.countDocuments({ project: project._id });
			const activeBugCount = await Bug.countDocuments({ project: project._id, status: { $in: ['open', 'in-progress'] } });
			
			return {
				...project.toObject(),
				stats: {
					totalBugs: bugCount,
					activeBugs: activeBugCount,
					memberCount: project.members.length
				}
			};
		}));
		
		res.json({ success: true, data: { projects: projectsWithStats } });
	} catch (error) {
		console.error('Get projects error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
