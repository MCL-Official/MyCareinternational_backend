const express = require('express');
const multer = require('multer');
const Order = require('../../models/Order');
const User = require('../../models/User');
const router = express.Router();
const path = require('path');
const Transaction=require("../../models/Transaction")
const jwt = require('jsonwebtoken');
const Role = require('../../models/Role');
const Product = require('../../models/product');
// const Transaction=require("../models/Transaction");
const product = require('../../models/product');
const exceljs = require('exceljs');
// const uploadDirectory = '/var/www/html/tss_files/order';
const uuid = require('uuid');
const uploadDirectory = 'uploads';

function generateUniqueMid() {
  // Logic to generate a unique mid (for example, using a combination of timestamp and a random number)
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `TID${timestamp}${randomNum}`;
}


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

function generateUniquemsgid() {
  return `msgID${Date.now()}`;
}

const upload = multer({ storage: storage });


// router.get('/daily-orders-quantity', async (req, res) => {
//   try {
//     const { timeframe } = req.query;

//     let startDate, endDate;

//     // Calculate start and end dates based on the requested timeframe
//     switch (timeframe) {
//       case 'today':
//         startDate = new Date();
//         startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       case 'week':
//         startDate = new Date();
//         startDate.setDate(startDate.getDate() - 6); // Set to 7 days ago
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       case 'month':
//         startDate = new Date();
//         startDate.setDate(startDate.getDate() - 30); // Set to 30 days ago
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       case 'year':
//         startDate = new Date();
//         startDate.setFullYear(startDate.getFullYear() - 1); // Set to 1 year ago
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       default:
//         return res.status(400).json({ message: 'Invalid timeframe specified' });
//     }
// // Format dates to MM/DD/YY format
// const formatDateString = (date) => {
//   const month = date.getMonth() + 1;
//   const day = date.getDate();
//   const year = date.getFullYear() % 100; // Extract the last two digits of the year
//   return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
// };

//       const starttoday=formatDateString(startDate)
//       const endtoday=formatDateString(endDate)
      
//     const orders = await Order.find({
//       date: { $gte: starttoday, $lte: endtoday },
//     });

//     const dailyOrdersQuantity = orders.reduce((totalQuantity, order) => {
//       return totalQuantity + order.products.reduce((total, product) => total + parseInt(product.count), 0);
//     }, 0);

//     res.json({ dailyOrdersQuantity });
//   } catch (error) {
//     console.error('Error fetching daily orders quantity:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// router.get('/daily-sales', async (req, res) => {
//   try {
//     const { timeframe } = req.query;

//     let startDate, endDate;

//     // Calculate start and end dates based on the requested timeframe
//     switch (timeframe) {
//       case 'today':
//         startDate = new Date();
//         startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       case 'week':
//         startDate = new Date();
//         startDate.setDate(startDate.getDate() - 6); // Set to 7 days ago
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       case 'month':
//         startDate = new Date();
//         startDate.setDate(startDate.getDate() - 30); // Set to 30 days ago
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       case 'year':
//         startDate = new Date();
//         startDate.setFullYear(startDate.getFullYear() - 1); // Set to 1 year ago
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date();
//         endDate.setHours(23, 59, 59, 999); // Set to the end of the day
//         break;
//       default:
//         return res.status(400).json({ message: 'Invalid timeframe specified' });
//     }
// // Format dates to MM/DD/YY format
// const formatDateString = (date) => {
//   const month = date.getMonth() + 1;
//   const day = date.getDate();
//   const year = date.getFullYear() % 100; // Extract the last two digits of the year
//   return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
// };
    
//     const starttoday=formatDateString(startDate)
//     const endtoday=formatDateString(endDate)
//     const orders = await Order.find({
//       date: { $gte: starttoday, $lte: endtoday },
//       payment_status: 'paid',
//     });

//     const dailySales = orders.reduce((totalSales, order) => totalSales + order.amount, 0);

//     res.json({ dailySales });
//   } catch (error) {
//     console.error('Error fetching daily sales:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// router.get('/export-analytics', async (req, res) => {
//   try {
//     const orders = await Order.find(); // Retrieve all orders from the database

//     const salesAnalyticsData = [];

//     orders.forEach(order => {
//       order.products.forEach(product => {
//         salesAnalyticsData.push({
//           date: order.date,
//           productName: product.product_name,
//           quantity: product.count,
//           price: product.price,
//           rewardPoints: product.reward_points,
//           orderHistory: {
//             orderId: order.oid,
//             deliveryStatus: order.delivery_status,
//             paymentStatus: order.payment_status
//           },
//           currency: 'USD' // Add your currency information here
//         });
//       });
//     });

//     // Sort the salesAnalyticsData array by date in descending order
//     salesAnalyticsData.sort((a, b) => new Date(b.date) - new Date(a.date));

//     // Create Excel workbook and worksheet
//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Sales Analytics');

//     // Define the headers for the Excel file
//     worksheet.columns = [
//       { header: 'Date', key: 'date', width: 15 },
//       { header: 'Product Name', key: 'productName', width: 20 },
//       { header: 'Quantity', key: 'quantity', width: 15 },
//       { header: 'Price', key: 'price', width: 15 },
//       { header: 'Reward Points', key: 'rewardPoints', width: 15 },
//       // { header: 'Order ID', key: 'orderHistory.orderId', width: 15 },
//       // { header: 'Delivery Status', key: 'orderHistory.deliveryStatus', width: 15 },
//       // { header: 'Payment Status', key: 'orderHistory.paymentStatus', width: 15 },
//       { header: 'Currency', key: 'currency', width: 15 },
//     ];

//     // Add data to the worksheet
//     salesAnalyticsData.forEach(data => {
//       worksheet.addRow(data);
//     });

//     // Set up the response headers for Excel file
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=sales-analytics.xlsx');

//     // Send the Excel file to the client
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error('Error exporting sales analytics:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
// Create

// router.get('/export-analytics-data', async (req, res) => {
//   try {
//     const orders = await Order.find(); // Retrieve all orders from the database

//     const salesAnalyticsData = [];

//     orders.forEach(order => {
//       order.products.forEach(product => {
//         salesAnalyticsData.push({
//           date: order.date,
//           productName: product.product_name,
//           quantity: product.count,
//           price: product.price,
//           rewardPoints: product.reward_points,
//           orderHistory: {
//             orderId: order.oid,
//             deliveryStatus: order.delivery_status,
//             paymentStatus: order.payment_status
//           },
//           currency: 'USD' // Add your currency information here
//         });
//       });
//     });

//     // Sort the salesAnalyticsData array by date in descending order
//     salesAnalyticsData.sort((a, b) => new Date(b.date) - new Date(a.date));

//     // Set up the response headers for JSON data
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Content-Disposition', 'attachment; filename=sales-analytics.json');

//     // Send the sorted sales analytics data as JSON
//     res.json(salesAnalyticsData);
//   } catch (error) {
//     console.error('Error exporting sales analytics:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });





// router.get('/export', async (req, res) => {
//   try {
//     const orders = await Order.find(); // Retrieve all orders from the database

//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Orders');

//     // Define the headers for the Excel file based on your Order schema
//     worksheet.columns = [
//       { header: 'Order ID', key: 'oid', width: 15 },
//       { header: 'Amount', key: 'amount', width: 15 },
//       { header: 'Payment Mode', key: 'payment_mode', width: 15 },
//       { header: 'Tracking ID', key: 'tracking_id', width: 15 },
//       { header: 'Delivery Status', key: 'delivery_status', width: 15 },
//       { header: 'Payment Status', key: 'payment_status', width: 15 },
//       { header: 'Email', key: 'email', width: 15 },
//       { header: 'Shipping Address', key: 'shipping_addr', width: 15 },
//       { header: 'Contact', key: 'contact', width: 15 },
//       { header: 'Username', key: 'uname', width: 15 },
//       { header: 'Coupon', key: 'coupon', width: 15 },
//       { header: 'Shipping Cost', key: 'shipping', width: 15 },
//       { header: 'Subtotal', key: 'subtotal', width: 15 },
//       { header: 'Tax', key: 'tax', width: 15 },
//       { header: 'Promotion ID', key: 'promotion_id', width: 15 },
//       { header: 'Date', key: 'date', width: 15 },
//       { header: 'Time', key: 'time', width: 15 },
//       // Add more headers for product data based on your productSchema
//       { header: 'Product ID', key: 'products.pid', width: 15 },
//       { header: 'Product Name', key: 'products.product_name', width: 15 },
//       { header: 'Price', key: 'products.price', width: 15 },
//       { header: 'Photo', key: 'products.photo', width: 15 },
//       { header: 'Count', key: 'products.count', width: 15 },
//       { header: 'Reward Points', key: 'products.reward_points', width: 15 },
//     ];

//     // Add data to the worksheet
//     orders.forEach(order => {
//       order.products.forEach(product => {
//         worksheet.addRow({
//           oid: order.oid,
//           amount: order.amount,
//           payment_mode: order.payment_mode,
//           tracking_id: order.tracking_id,
//           delivery_status: order.delivery_status,
//           payment_status: order.payment_status,
//           email: order.email,
//           shipping_addr: order.shipping_addr,
//           contact: order.contact,
//           uname: order.uname,
//           coupon: order.coupon,
//           shipping: order.shipping,
//           subtotal: order.subtotal,
//           tax: order.tax,
//           promotion_id: order.promotion_id,
//           date: order.date,
//           time: order.time,
//           'products.pid': product.pid,
//           'products.product_name': product.product_name,
//           'products.price': product.price,
//           'products.photo': product.photo,
//           'products.count': product.count,
//           'products.reward_points': product.reward_points,
//         });
//       });
//     });

//     // Set up the response headers for Excel file
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

//     // Send the Excel file to the client
//     workbook.xlsx.write(res).then(() => {
//       res.end();
//     });
//   } catch (error) {
//     console.error('Error exporting orders:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.post('/',upload.none(), async (req, res) => {
try {

    var currentDate = new Date();
    var year = currentDate.getFullYear() % 100; // Extract the last two digits of the year
    var month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
    var day = currentDate.getDate();
    var formattedYear = year < 10 ? '0' + year : year;
    var formattedMonth = month < 10 ? '0' + month : month;
    var formattedDay = day < 10 ? '0' + day : day;
    var formattedDate = formattedDay + '/' + formattedMonth + '/' + formattedYear;
    console.log(formattedDate);
  const orderData = req.body;
console.log(orderData);
//   for (let i = 0; i < 10; i++) {
//     if (orderData.products[i] && orderData.products[i]['photo1']) {
//         // Assuming fieldName contains the URL directly
//         const url = orderData.products[i]['photo1'];
//         orderData.products[i]['photo1'] = url;
//     }
// }



  // const productPids = orderData.products.map(product => product.pid);
  orderData.date = formattedDate;
  // Order.save();

  // console.log(productPids);
 
  // const newOrder1 = new Product(data);
  // await newOrder1.save();
  // console.log(req.body.products);
  const oid = uuid.v4(); // Generate a random UUID
  orderData.oid = oid;
  const totalRewardPoints = orderData.products.reduce((sum, product) => {
    // Assuming each product has a reward_points field4
    return sum + parseInt(product.reward_points, 10) || 0;
  }, 0);

  const user = await User.findOne({ mid: orderData.mid });
  const trans = await Transaction.findOne({ mid: orderData.mid });
  
  // console.log(orderData);
 
  const UpdateData=Transaction({
    status:"Credited",
    amt:totalRewardPoints,
    date:orderData.date,
    time:orderData.time,
    mid:orderData.mid,
    transaction_id:generateUniqueMid(),
    oid:orderData.oid
  })
 const result=await UpdateData.save()


  const Messages={
    date:orderData.date,
    time:orderData.time,
    msg_id:generateUniquemsgid(),
    msg:"Your order had been successfully placed!",
    readed:false,
    sender_uid:orderData.mid,
    sender_uname:"System",
  }

  user?.data?.messages.push(Messages)
  const Messagess={
    date:orderData.date,
    time:orderData.time,
    msg_id:generateUniquemsgid(),
    msg:`Congratulations! ${totalRewardPoints} reward pts added for your recent purchase`,
    readed:false,
    sender_uid:orderData.mid,
    sender_uname:"System",
  }

  user.data.messages.push(Messagess)
const result1=await user.save()
// console.log(orderData.products[0].count);

let sum=0
let count1 = 0
orderData.products.map((v)=>{return sum=sum+Number(v.count*v.price)})
orderData.products.map((v)=>{return count1=count1+Number(v.count)})




await Promise.all(orderData.products.map(async (e) => {
  // console.log(e);
  const data = await Product.findOne({ pid: e.pid });
  if (data) {
    const a = data.sales + parseInt(e.count);
    const b = data.quantity_pi - parseInt(e.count);

    await Product.updateOne({ pid: e.pid }, { sales: a, quantity_pi: b });
  }
}));







// console.log(count1);
  if (user) {
    user.reward_points = (user.reward_points || 0) + totalRewardPoints;
    user.payment_history=(user.payment_history)+Number(sum)
    user.purchased_items=(user.purchased_items)+count1
    await user.save();
  }
  orderData.amount =sum;
  orderData.subtotal =sum;

  const newOrder = new Order(orderData);
  await newOrder.save();

  res.status(201).json({ message: 'Order created successfully' });
} catch (error) {
  console.error('Error creating order:', error);
  res.status(500).json({ message: 'Internal Server Error' });
}
});



// Read all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/samp/:mid', async (req, res) => {
  try {
    const orders = await Order.find({ mid: req.params.mid });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the provided mid' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update
// Update
router.put('/:id', upload.single('products[1][photo1]'), async (req, res) => {
  try {
    const updatedOrderData = req.body;

    // Check if a file was uploaded
    if (req.file) {
      const uniqueFileName = req.file.filename;
      
      // Create the URL using the filename
      const url = `http://64.227.186.165/tss_files/order/${uniqueFileName}`;
      console.log(url);

      // Update the orderData with the URL and buffer
      updatedOrderData['photo'] = url;
      updatedOrderData['photo1'] = req.file.buffer;
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updatedOrderData, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order updated successfully', updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully', deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
