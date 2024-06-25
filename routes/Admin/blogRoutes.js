// routes/blogRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Blog = require('../../models/Blog'); // Assuming you have the Blog model
const Role = require('../../models/Role'); // Assuming you have a Role model

const router = express.Router();

// const uploadDirectory = '/var/www/html/tss_files/catalog';
const uploadDirectory = 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = generateUniqueRid() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});

function generateUniqueRid() {
  return `RID${Date.now()}`;
}

const upload = multer({ storage: storage });

// Middleware to authenticate and authorize
async function authenticate(req, res, next) {
  try {
    const authToken = req.headers.authorization || req.headers.Authorization;
    if (!authToken) {
      return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }

    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
      return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }

    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    const canCreateContent = userPermissionsArray.permissions.some(permission =>
      permission.catg === 'Content' && permission.create
    );

    if (!canCreateContent) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error in authentication:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Create a blog
router.post('/', upload.single('banner_image'), async (req, res) => {
  try {
    const catalogData = req.body;
    // const files = req.files;
    
    const uniqueFileName = req.file.filename;
    if (req.file) {
        catalogData.banner_image =`http://64.227.186.165/tss_files/banner/${uniqueFileName}`
      }
    


    const newBlog = new Blog(catalogData);  
    await newBlog.save();

    res.status(201).json({ message: 'Blog created successfully', newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read a single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a blog by ID
router.put('/:id', upload.single('banner_image'), async (req, res) => {
  try {
    const catalogData = req.body;
    // const files = req.files;

    if(req?.file?.filename){
        const filename = req.file.filename; 
        catalogData.banner_image =`http://64.227.186.165/tss_files/banner/${filename}`
      }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, catalogData, { new: true });
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog updated successfully', updatedBlog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a blog by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
