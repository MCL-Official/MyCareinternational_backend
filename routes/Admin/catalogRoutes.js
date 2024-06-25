const express = require('express');
const multer = require('multer');
const Catalog = require('../../models/catalog');

const router = express.Router();

const path = require('path');
const jwt = require('jsonwebtoken');
const Role = require('../../models/Role');


const uploadDirectory = '/var/www/html/tss_files/catalog';
// const uploadDirectory = 'uploads';

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


function generateUniqueCatalogId() {
  return `CAT${Date.now()}`;
}
// Create
// Create
router.post('/', upload.fields([
  { name: 'inputArea1', maxCount: 1 },
  { name: 'inputArea2', maxCount: 1 },
  { name: 'inputArea3', maxCount: 1 },
  { name: 'inputArea4', maxCount: 1 },
  { name: 'inputArea5', maxCount: 1 },
]), async (req, res) => {
  try {
    const authToken = req.headers.authorization || req.headers.Authorization;
    console.log(authToken);
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'Content' && permission.create
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const catalogData = req.body;
    const files=req.files
    req.body.image=req.file && req.file.filename ?req.file.filename:null
    if(!req.body.image){
        delete req.body.image
    }
    const catalog_id = generateUniqueCatalogId();
    // console.log("req.files",req.files["inputArea1"][0].originalname)
    // Set catalog_id in the catalogData
    catalogData.catalog_id = catalog_id;

if(req.files){
  catalogData.inputArea1={
    title:catalogData.inputArea1title,
    isChecked:catalogData.isChecked,
    subtitle1:catalogData.inputArea1subtitle1,
    subtitle2:catalogData.inputArea1subtitle2,
  image:{
    url:`http://64.227.186.165/tss_files/catalog/${files["inputArea1"][0].filename}`
  }
  },
  catalogData.catalogname=catalogname;
  catalogData.inputArea2={
    imagelink:catalogData.inputArea2imagelink,
  image:{
    url:`http://64.227.186.165/tss_files/catalog/${files["inputArea2"][0].filename}`
  }
  },
  catalogData.inputArea3={
    Title:catalogData.inputArea3Title,
  image:{
    url:`http://64.227.186.165/tss_files/catalog/${files["inputArea3"][0].filename}`
  }
  },
  catalogData.inputArea4={
    imagelink:catalogData.inputArea4imagelink,
  image:{
    url:`http://64.227.186.165/tss_files/catalog/${files["inputArea4"][0].filename}`
  }
  },
  catalogData.inputArea5={
    centerText:catalogData.inputArea5conText,
  image:{
    url:`http://64.227.186.165/tss_files/catalog/${files["inputArea5"][0].filename}`
  },
  buttonText:catalogData.inputArea5buttonText
  }
}
    console.log("catalog",catalogData)
    const newCatalogItem = new Catalog(catalogData);
    await newCatalogItem.save();

    res.status(201).json({ message: 'Catalog item created successfully', newCatalogItem });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read - Get all catalog items
router.get('/', async (req, res) => {
  try {
    const authToken = req.headers.authorization || req.headers.Authorization;
    console.log(authToken);
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'Content' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const catalogItems = await Catalog.find();
    res.status(200).json({ catalogItems });
  } catch (error) {
    console.error('Error getting catalog items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read - Get a catalog item by ID
router.get('/:catalog_id', async (req, res) => {
  try {
    const authToken = req.headers.authorization || req.headers.Authorization;
    console.log(authToken);
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'Content' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const catalogItem = await Catalog.findById(req.params.catalog_id);

    if (!catalogItem) {
      return res.status(404).json({ message: 'Catalog item not found' });
    }

    res.status(200).json({ catalogItem });
  } catch (error) {
    console.error('Error getting catalog item by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update - Update a catalog item by ID
// Update - Update a catalog item by ID
router.put('/:catalog_id', upload.fields([
  { name: 'inputArea1', maxCount: 1 },
  { name: 'inputArea2', maxCount: 1 },
  { name: 'inputArea3', maxCount: 1 },
  { name: 'inputArea4', maxCount: 1 },
  { name: 'inputArea5', maxCount: 1 },
]), async (req, res) => {
  try {
    const authToken = req.headers.authorization || req.headers.Authorization;
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'Content' && permission.update
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    console.log("req.body",req.files)
    const catalogData = {}; // Initialize an empty object to store updated fields
    const CatalogFiles=req.files

    const bodyData=req.body
    if(CatalogFiles.inputArea1){
      catalogData.inputArea1={
        image:{
          url:`http://64.227.186.165/tss_files/catalog/${CatalogFiles.inputArea1[0].filename}`
        }
      }
    }

    if(CatalogFiles.inputArea2){
      catalogData.inputArea2={
        image:{
          url:`http://64.227.186.165/tss_files/catalog/${CatalogFiles.inputArea2[0].filename}`
        }
      }
    }

    if(CatalogFiles.inputArea3){
      catalogData.inputArea3={
        image:{
          url:`http://64.227.186.165/tss_files/catalog/${CatalogFiles.inputArea3[0].filename}`
        }
      }
    }

    if(CatalogFiles.inputArea4){
      catalogData.inputArea4={
        image:{
          url:`http://64.227.186.165/tss_files/catalog/${CatalogFiles.inputArea4[0].filename}`
        }
      }
    }

    if(CatalogFiles.inputArea5){
      catalogData.inputArea5={
        image:{
          url:`http://64.227.186.165/tss_files/catalog/${CatalogFiles.inputArea5[0].filename}`
        }
      }
    }
//
    if(bodyData?.catalogname){
      catalogData.catalogname=bodyData?.catalogname;
    }
    if(bodyData?.inputArea1title || bodyData.inputArea1subtitle1 || bodyData.inputArea1subtitle2||bodyData.isChecked){
      catalogData.inputArea1={
        ...catalogData.inputArea1,
        title:bodyData.inputArea1title,
        isChecked:bodyData.isChecked,
        subtitle1:bodyData.inputArea1subtitle1,
        subtitle2:bodyData.inputArea1subtitle2
      }
    }

    if(bodyData.inputArea2imagelink || bodyData.inputArea2){
      catalogData.inputArea2={
        ...catalogData.inputArea2,
        imagelink:bodyData.inputArea2imagelink,
      }
    }
    
    if(bodyData.inputArea3Title){
      catalogData.inputArea3={
        ...catalogData.inputArea3,
        Title:bodyData.inputArea3Title
      }
    }

     if(bodyData.inputarea4imagelink){
      catalogData.inputArea4={
        ...catalogData.inputArea4,
        imagelink:bodyData.inputarea4imagelink,
      }
    }
    if(bodyData.inputarea5centertext || bodyData.inputarea5buttontext){
      catalogData.inputArea5={
        ...catalogData.inputArea5,
        centerText:bodyData.inputarea5centertext,
        buttonText:bodyData.inputarea5buttontext,
      }
    }

    // Iterate over each field present in req.body and update catalogData accordingly
    // Object.keys(req.body).forEach(field => {
    //   // Check if the field corresponds to an input area
    //   if (field.startsWith('inputArea')) {
    //     const inputAreaNumber = field.replace('inputArea', ''); // Extract the input area number
    //     const fileField = req.files[`inputArea${inputAreaNumber}`];
    //     if (fileField && fileField.length > 0) {
    //       // Construct the corresponding catalogData structure based on the input area number
    //       catalogData[field] = {
    //         image: {
    //           url: `http://64.227.186.165/tss_files/catalog/${fileField[0].filename}`
    //         }
    //       };
    //       // Check for additional fields and add them to catalogData if present
    //       const titleField = `inputArea${inputAreaNumber}title`;
    //       if (req.body[titleField]) {
    //         catalogData[field].title = req.body[titleField];
    //       }
    //       const subtitle1Field = `inputArea${inputAreaNumber}subtitle1`;
    //       if (req.body[subtitle1Field]) {
    //         catalogData[field].subtitle1 = req.body[subtitle1Field];
    //       }
    //       const subtitle2Field = `inputArea${inputAreaNumber}subtitle2`;
    //       if (req.body[subtitle2Field]) {
    //         catalogData[field].subtitle2 = req.body[subtitle2Field];
    //       }
    //       const imagelinkField = `inputArea${inputAreaNumber}imagelink`;
    //       if (req.body[imagelinkField]) {
    //         catalogData[field].imagelink = req.body[imagelinkField];
    //       }
    //       const TitleField = `inputArea${inputAreaNumber}Title`;
    //       if (req.body[TitleField]) {
    //         catalogData[field].Title = req.body[TitleField];
    //       }
    //       const centerTextField = `inputArea${inputAreaNumber}conText`;
    //       if (req.body[centerTextField]) {
    //         catalogData[field].centerText = req.body[centerTextField];
    //       }
    //       const buttonTextField = `inputArea${inputAreaNumber}buttonText`;
    //       if (req.body[buttonTextField]) {
    //         catalogData[field].buttonText = req.body[buttonTextField];
    //       }
    //     }
    //   }
    // });




    const updatedCatalogItem = await Catalog.findOneAndUpdate(
      { catalog_id: req.params.catalog_id },
      catalogData,
      { new: true }
    );

    if (!updatedCatalogItem) {
      return res.status(404).json({ message: 'Catalog item not found' });
    }

    res.status(200).json({ message: 'Catalog item updated successfully', updatedCatalogItem });
  } catch (error) {
    console.error('Error updating catalog item by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Delete - Delete a catalog item by ID
router.delete('/:catalog_id', async (req, res) => {
  try {
    const authToken = req.headers.authorization || req.headers.Authorization;
    console.log(authToken);
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'Content' && permission.delete
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const deletedCatalogItem = await Catalog.findOneAndDelete(req.params.catalog_id);

    if (!deletedCatalogItem) {
      return res.status(404).json({ message: 'Catalog item not found' });
    }

    res.status(200).json({ message: 'Catalog item deleted successfully', deletedCatalogItem });
  } catch (error) {
    console.error('Error deleting catalog item by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

