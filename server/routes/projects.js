const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new project (any authenticated user can create projects)
router.post('/', authenticate, async (req, res) => {
	try {
		const { name, description, key, priority, startDate, endDate } = req.body;
		
		console.log('\n========================================');
		console.log('📝 POST /projects - CREATE PROJECT');
		console.log('User Email:', req.user.email);
		console.log('User ID:', req.user._id);
		console.log('User Google ID:', req.user.googleId);
		console.log('Project Name:', name);
		console.log('========================================\n');
		
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
			owner: req.user._id
		});
		
		console.log('✅ PROJECT CREATED SUCCESSFULLY!');
		console.log('   Project Name:', project.name);
		console.log('   Project ID:', project._id);
		console.log('   Owner Email:', req.user.email);
		console.log('   Owner ID:', project.owner);
		console.log('========================================\n');
		
		// Populate the project before returning
		const populatedProject = await Project.findById(project._id)
			.populate('owner', 'name email');
		
		res.status(201).json({ success: true, data: { project: populatedProject } });
	} catch (error) {
		console.error('Create project error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// List all projects (authenticated users) - only show user's own projects
router.get('/', authenticate, async (req, res) => {
	try {
		console.log('\n========================================');
		console.log('📋 GET /projects REQUEST');
		console.log('User Email:', req.user.email);
		console.log('User ID:', req.user._id);
		console.log('User Google ID:', req.user.googleId);
		console.log('========================================\n');
		
		// Get projects where user is owner
		const projects = await Project.find({
			owner: req.user._id
		})
		.populate('owner', 'name email')
		.sort({ createdAt: -1 });
		
		console.log(`✅ Found ${projects.length} projects for user ${req.user.email}\n`);
		
		// Add bug count for each project
		const Bug = require('../models/Bug');
		const projectsWithStats = await Promise.all(projects.map(async (project) => {
			const bugCount = await Bug.countDocuments({ project: project._id });
			const resolvedBugCount = await Bug.countDocuments({ project: project._id, status: { $in: ['resolved', 'closed'] } });
			
			console.log(`📦 Project: "${project.name}"`);
			console.log(`   Owner Email: ${project.owner.email}`);
			console.log(`   Owner ID: ${project.owner._id}`);
			console.log(`   Total Bugs: ${bugCount}\n`);
			
			return {
				...project.toObject(),
				stats: {
					totalBugs: bugCount,
					resolvedBugs: resolvedBugCount
				}
			};
		}));
		
		res.json({ success: true, data: { projects: projectsWithStats } });
	} catch (error) {
		console.error('Get projects error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get a single project by ID
router.get('/:id', authenticate, async (req, res) => {
	try {
		// Find the project and check if user has access (owner only)
		const project = await Project.findById(req.params.id)
			.populate('owner', 'name email');
		
		if (!project) {
			return res.status(404).json({ success: false, message: 'Project not found' });
		}
		
		// Check if user has access to this project (owner only)
		if (project.owner._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ success: false, message: 'Access denied to this project' });
		}
		
		// Add bug statistics
		const Bug = require('../models/Bug');
		const totalBugs = await Bug.countDocuments({ project: project._id });
		const resolvedBugs = await Bug.countDocuments({ project: project._id, status: 'resolved' });
		const closedBugs = await Bug.countDocuments({ project: project._id, status: 'closed' });
		
		// Get recent bugs for this project
		const recentBugs = await Bug.find({ project: project._id })
			.populate('reportedBy', 'name email')
			.populate('assignedTo', 'name email')
			.sort({ createdAt: -1 })
			.limit(5);
		
		const projectWithStats = {
			...project.toObject(),
			stats: {
				totalBugs,
				resolvedBugs,
				closedBugs
			},
			recentBugs
		};
		
		res.json({ success: true, data: projectWithStats });
	} catch (error) {
		console.error('Get project details error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Update a project (only owner can update)
router.put('/:id', authenticate, async (req, res) => {
	try {
		const { name, description, key, priority, status } = req.body;
		
		// Find the project and check ownership
		const project = await Project.findById(req.params.id);
		if (!project) {
			return res.status(404).json({ success: false, message: 'Project not found' });
		}
		
		// Check if user is the owner
		if (project.owner.toString() !== req.user._id.toString()) {
			return res.status(403).json({ success: false, message: 'Only project owner can update the project' });
		}
		
		// If updating key, check if it's unique (excluding current project)
		if (key && key.toUpperCase() !== project.key) {
			const existingProject = await Project.findOne({ 
				key: key.toUpperCase(),
				_id: { $ne: req.params.id }
			});
			if (existingProject) {
				return res.status(400).json({ success: false, message: 'Project key already exists' });
			}
		}
		
		// Update fields
		if (name) project.name = name;
		if (description) project.description = description;
		if (key) project.key = key.toUpperCase();
		if (priority) project.priority = priority;
		if (status) project.status = status;
		
		await project.save();
		
		// Return populated project
		const updatedProject = await Project.findById(project._id)
			.populate('owner', 'name email');
		
		res.json({ success: true, data: { project: updatedProject } });
	} catch (error) {
		console.error('Update project error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Delete a project (only owner can delete)
router.delete('/:id', authenticate, async (req, res) => {
	try {
		console.log(`🗑️ DELETE /projects/${req.params.id} - User: ${req.user.email} | User ID: ${req.user._id}`);
		
		// Find the project and check ownership
		const project = await Project.findById(req.params.id);
		if (!project) {
			console.log(`❌ Project not found: ${req.params.id}`);
			return res.status(404).json({ success: false, message: 'Project not found' });
		}
		
		console.log(`📦 Project found: ${project.name} | Owner ID: ${project.owner}`);
		
		// Check if user is the owner
		if (project.owner.toString() !== req.user._id.toString()) {
			console.log(`❌ Ownership mismatch! Project owner: ${project.owner} | Requesting user: ${req.user._id}`);
			return res.status(403).json({ success: false, message: 'Only project owner can delete the project' });
		}
		
		console.log(`✅ Ownership verified. Proceeding with deletion...`);
		
		// Delete associated bugs first (cascade deletion)
		const Bug = require('../models/Bug');
		const bugCount = await Bug.countDocuments({ project: project._id });
		
		if (bugCount > 0) {
			console.log(`🗑️ Deleting ${bugCount} associated bugs for project: ${project.name}`);
			await Bug.deleteMany({ project: project._id });
			console.log(`✅ Successfully deleted ${bugCount} associated bugs`);
		}
		
		// Delete the project
		await Project.findByIdAndDelete(req.params.id);
		console.log(`✅ Successfully deleted project: ${project.name}`);
		
		res.json({ success: true, message: 'Project deleted successfully' });
	} catch (error) {
		console.error('Delete project error:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
