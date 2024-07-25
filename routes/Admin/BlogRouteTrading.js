const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Blog = require('../../models/BlogTrading'); // Assuming you have the Blog model
const Role = require('../../models/Role'); // Assuming you have a Role model

const router = express.Router();

const uploadDirectory = '/var/www/mycarelabs';
// const uploadDirectory = '/uploads';
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
    // const uniqueFileName = req.file.filename;
    // if (req.file) {
    //   catalogData.banner_image = `https://backend.mycaretrading.com/mycarelabs/${uniqueFileName}`;
    // }
    const formattedBlogName = catalogData.meta_title
    .replace(/\s+|\|+|\.|,|:/g, '-') // Replaces spaces, pipes, dots, commas, and colons with hyphens
    .replace(/-+/g, '-') // Removes consecutive hyphens
    .toLowerCase();
  const encodedBlogName = encodeURIComponent(formattedBlogName);
  console.log('Navigating to:', `/readBlog/${encodedBlogName}`);
 catalogData.routename=encodedBlogName;
// console.log(catalogData);
    const newBlog = new Blog(catalogData);  
    await newBlog.save();

    res.status(201).json({ message: 'Blog created successfully', newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read all blogs with pagination
router.get('/working', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments();
    const blogs = await Blog.find().skip(skip).limit(limit);

    res.status(200).json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Fetch random 4 blogs
router.get('/random', async (req, res) => {
  try {
    const blogs = await Blog.aggregate([{ $sample: { size: 4 } }]);
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching random blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch latest 4 articles
router.get('/latest', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(4);
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch 4 blogs from the same category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const blogs = await Blog.find({ category }).limit(4);
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching category blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch 4 most popular blogs (assuming popularity is determined by 'views')
router.get('/popular', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ views: -1 }).limit(4);
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching popular blogs:', error);
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
    const formattedBlogName = blog.meta_title
    .replace(/\s+|\|+|\.|,|:/g, '-') // Replaces spaces, pipes, dots, commas, and colons with hyphens
    .replace(/-+/g, '-') // Removes consecutive hyphens
    .toLowerCase();
  const encodedBlogName = encodeURIComponent(formattedBlogName);
  console.log('Navigating to:', `/readBlog/${encodedBlogName}`);
    blog.views += 1;
    if(!blog.routename){
blog.routename=encodedBlogName;
    }
    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});







router.get('/routename/:routename', async (req, res) => {
  try {
    console.log(req.params.routename);
    const blog = await Blog.findOne({routename:req.params.routename});
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
  
  // console.log('Navigating to:', `/readBlog/${encodedBlogName}`);
    blog.views += 1;
    await blog.save();
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

    if (req?.file?.filename) {
      const filename = req.file.filename;
      catalogData.banner_image = `https://backend.mycaretrading.com/mycarelabs/${filename}`;
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
