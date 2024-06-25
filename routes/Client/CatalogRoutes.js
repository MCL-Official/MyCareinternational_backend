const express = require('express');
const multer = require('multer');
const Catalog = require('../../models/catalog');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const Role = require('../../models/Role');
const Looks = require('../../models/looks');
const catalog = require('../../models/catalog');

router.get('/catalog', async (req, res) => {
  try {
    // const authToken = req.headers.authorization || req.headers.Authorization;
    // console.log(authToken);
    // if (!authToken) {
    //     return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    // }
    // Decode the authentication token
    // const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    // if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
    //     return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    // }
    // Get the user's role and permissions from the database based on the decoded token
    // const userRole = decodedToken.role;
    // const userPermissionsArray = await Role.findOne({ role: userRole });
    // console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    // const canReadProducts = userPermissionsArray.permissions.some(permission =>
    //     permission.catg === 'Content' && permission.read
    // );

    // if (!canReadProducts) {
    //     return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    // }
    const catalogItems = await Catalog.find();
    res.status(200).json({ catalogItems });
  } catch (error) {
    console.error('Error getting catalog items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/looks/:catalog_id', async (req, res) => {
  try {
    // const authToken = req.headers.authorization || req.headers.Authorization;
    // console.log(authToken);
    // if (!authToken) {
    //     return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    // }
    // // Decode the authentication token
    // const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // // Check if the decoded token has the necessary fields (userId, uid, role)
    // if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
    //     return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    // }
    // // Get the user's role and permissions from the database based on the decoded token
    // const userRole = decodedToken.role;
    // const userPermissionsArray = await Role.findOne({ role: userRole });
    // console.log(userPermissionsArray);
    // // Check if the user has permission to read products in the "Inventory" category
    // const canReadProducts = userPermissionsArray.permissions.some(permission =>
    //     permission.catg === 'Content' && permission.read
    // );

    // if (!canReadProducts) {
    //     return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    // }
    // console.log(req.params.catalog_id);
    const catalog=await Catalog.find({catalog_id:req.params.catalog_id})
    // console.log("catalog",catalog);
    const look = await Looks.find({catalog_id:req.params.catalog_id});
    // console.log(look);
    if (!look) {
      return res.status(404).json({ message: 'Look not found' });
    }
    const sendData=[look,catalog]
    // console.log("senddata",sendData.length)
    res.status(200).json(sendData);
  } catch (error) {
    console.error('Error fetching Look by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports=router;