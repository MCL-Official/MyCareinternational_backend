// authMiddleware.js

const jwt = require('jsonwebtoken');
const Role = require('../models/Role'); // Replace with the correct path

const authMiddleware = (catogory,permissions) => async (req, res, next) => {
  const authToken = req.headers.authorization || req.headers.Authorization;

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
  }

  try {
    const decodedToken = jwt.verify(authToken, 'your-secret-key');

    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
      return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }

    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });

    // Check if the user has permission for any of the specified CRUD operations
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === catogory && permissions
    );

    if (!canReadProducts) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // Attach the decoded token to the request for later use in the route
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = authMiddleware;
