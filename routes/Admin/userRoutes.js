const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User');
const UserActivityLog = require('../../models/UserActivityLog');
const multer = require('multer');
const excel = require('exceljs');
const Order = require('../../models/Order');
const fs = require('fs');
const upload = multer();
const axios = require('axios');
const VisitorLog = require('../../models/VisitorLog');

router.get('/visitor-log/today', async (req, res) => {
    try {
      var currentDate = new Date();
      var year = currentDate.getFullYear() % 100; // Extract the last two digits of the year
      var month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
      var day = currentDate.getDate();
      var formattedYear = year < 10 ? '0' + year : year;
      var formattedMonth = month < 10 ? '0' + month : month;
      var formattedDay = day < 10 ? '0' + day : day;
      var loginDate = formattedMonth + '/' + formattedDay + '/' + formattedYear;
      console.log(loginDate);
  
      // Find visitor log entries for today
      const visitorLogs = await VisitorLog.find({ loginDate });
  
      // Find orders for today
      const orders = await Order.find({ date: loginDate });
  
      // Initialize an array to store the result for each location
      const result = [];
  
      // Loop through each visitor log entry
      for (const visitorLog of visitorLogs) {
        console.log(visitorLog);
        // Assuming 'mid', 'latitude', and 'longitude' are the fields representing the location in visitor logs
        const { mid } = visitorLog;
  
        // Check if there are orders for this location
        const ordersForLocation = orders.filter(order => order.mid === mid);
  
        // Calculate daily order quantity for this location
        const dailyOrderQuantity = ordersForLocation.reduce((totalQuantity, order) => {
          return totalQuantity + order.products.reduce((total, product) => total + parseInt(product.count), 0);
        }, 0);
  const  address = visitorLog.address;
        // Push the result for this location
        result.push({
          mid,
          address,
          date: loginDate,
          dailyOrderQuantity
        });
      }
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving visitor logs for today:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  


  router.get('/user-address/all', async (req, res) => {
    try {
        // Find all users
        const users = await User.find();
       console.log(User,"payment");
        // Initialize an array to store the result for each user
        const result = [];

        // Loop through each user
        for (const user of users) {
            // Check if the user has address details
            if (user.address) {
                const {
                    latitude,
                    longitude,
                    country,
                    city,
                    region,
                    landmark,
                    zipcode,
                    phone_no,
                    status
                } = user.address;

                result.push({
                    userId: user._id, // Optionally include user ID
                    address: {
                        latitude,
                        longitude,
                        country,
                        city,
                        region,
                        landmark,
                        zipcode,
                        phone_no,
                        status
                    },
                    payment_history: user.payment_history
                });
            }
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error retrieving user addresses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/visitor-log/all', async (req, res) => {
    try {
        // Find all visitor log entries
        const visitorLogs = await VisitorLog.find();

        // Find all orders
        const orders = await User.find();

        // Initialize an array to store the result for each location
        const result = [];

        // Loop through each visitor log entry
        for (const visitorLog of visitorLogs) {
            // Extract necessary data from the visitor log
            const { _id,mid, address } = visitorLog;
            

            // Check if there are orders for this location
            const ordersForLocation = orders.filter(order => order.mid === mid);
            if(ordersForLocation.length>0){
                const dailyOrderQuantity = ordersForLocation[0]?.purchased_items;               
                result.push({
                _id,
                address: {
                    latitude: address.latitude,
                    longitude: address.longitude,
                    country: address.country
                },
                dailyOrderQuantity
            });
        }
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error retrieving visitor logs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post('/visitor-log', async (req, res) => {
    try {
        const { mid, success, address } = req.body;
        var currentDate = new Date();
        var year = currentDate.getFullYear() % 100; // Extract the last two digits of the year
        var month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
        var day = currentDate.getDate();
        var formattedYear = year < 10 ? '0' + year : year;
        var formattedMonth = month < 10 ? '0' + month : month;
        var formattedDay = day < 10 ? '0' + day : day;
        var loginDate = formattedMonth + '/' + formattedDay + '/' + formattedYear;
        console.log(loginDate);
        // Check if the visitor log entry already exists for the given mid and loginDate
        const existingEntry = await VisitorLog.findOne({ mid, loginDate });

        if (existingEntry) {
            // If an entry already exists, return a message indicating it
            return res.status(400).json({ message: 'Visitor log entry already exists for this date' });
        }

        // Create a new visitor log entry
        const newVisitorLog = new VisitorLog({
            mid,
            loginDate,
            success,
            address
        });

        // Save the visitor log entry to the database
        await newVisitorLog.save();

        res.status(201).json({ message: 'Visitor log entry saved successfully' });
    } catch (error) {
        console.error('Error saving visitor log:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});








const checkUniqueVisitor = async (req, res, next) => {
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

        const { mid } = req.body;

        // Check if the user has already visited the website today
        const hasVisitedToday = await UserActivityLog.exists({
            mid: mid,
            loginDate: formattedDate,
        });

        if (!hasVisitedToday) {
            const userActivityLog = new UserActivityLog({
                    mid: mid,
                    loginDate: formattedDate,
                });
                await userActivityLog.save();
            // Increment visitor count if the user is visiting for the first time today
        }

        next();
    } catch (error) {
        console.error('Error checking unique visitor:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
router.get('/visitor-count', async (req, res) => {
    try {
        const { timeframe } = req.query;

        let startDate, endDate;

        // Calculate start and end dates based on the requested timeframe
        switch (timeframe) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 6); // Set to 7 days ago
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            case 'month':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30); // Set to 30 days ago
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1); // Set to 1 year ago
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            default:
                return res.status(400).json({ message: 'Invalid timeframe specified' });
        }

        // Format dates to MM/DD/YY format
        const formatDateString = (date) => {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear() % 100; // Extract the last two digits of the year
            return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
        };

        const starttoday=formatDateString(startDate)
        const endtoday=formatDateString(endDate)
        // Find all activity logs within the specified timeframe
        const activityLogs = await UserActivityLog.find({
            loginDate: { $gte: starttoday, $lte: endtoday }
        });

        // Calculate total visitor count for the specified timeframe
        const totalVisitorCount = activityLogs.reduce((total, log) => total + log.visitorCount, 0);

        res.json({ startDate: formatDateString(startDate), endDate: formatDateString(endDate), totalVisitorCount });
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/conversionrate', async (req, res) => {
    try {
        const { timeframe } = req.query;

        let startDate, endDate;

        // Calculate start and end dates based on the requested timeframe
        switch (timeframe) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 6); // Set to 7 days ago
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            case 'month':
                startDate = new Date();
                startDate.setDate(1); // Set to the first day of the month
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            case 'year':
                startDate = new Date();
                startDate.setMonth(0, 1); // Set to the first day of the year
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
                break;
            default:
                return res.status(400).json({ message: 'Invalid timeframe specified' });
        }
 // Format dates to MM/DD/YY format
 const formatDateString = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear() % 100; // Extract the last two digits of the year
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
};

        const starttoday=formatDateString(startDate)
        const endtoday=formatDateString(endDate)
        // Find all activity logs within the specified timeframe
        const activityLogs = await UserActivityLog.find({
            loginDate: { $gte: starttoday, $lte: endtoday }
        });

        let totalVisitorCount = 0;
        let totalSignupCount = 0;
        activityLogs.forEach(log => {
            totalVisitorCount += log.visitorCount || 0;
            totalSignupCount += log.SignupCount || 0;
        });
        const conversionRate = totalVisitorCount > 0 ? ((totalSignupCount / totalVisitorCount) * 100).toFixed(2) : 0;
        // Calculate conversion rate
        // const conversionRate = totalVisitorCount > 0 ? ((totalSignupCount / totalVisitorCount) * 100).toFixed(2) : 0;

        res.json({ startDate, endDate, conversionRate });
    } catch (error) {
        console.error('Error fetching conversion rate:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/chit', checkUniqueVisitor,async (req, res) => {
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
        const { mid } = req.body;

        let visitorRecord = await UserActivityLog.findOneAndUpdate(
            { mid, loginDate: formattedDate }, // Search criteria
            { $inc: { visitorCount: 1 } },     // Increment count by 1 if found, create a new record otherwise
            { upsert: true, new: true } // Upsert: create if not found, new: return updated record
        );

        res.json({ message: 'Visitor count incremented successfully', count: visitorRecord.count });
        

     }catch (error) {
    console.error('Error incrementing visitor count:', error);
    res.status(500).json({ message: 'Internal Server Error' });
}
});
const checkAdminLogin = async (req, res, next) => {
    try {
        var currentDate = new Date();
        var year = currentDate.getFullYear() % 100; // Extract the last two digits of the year
        var month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
        var day = currentDate.getDate();
        var formattedYear = year < 10 ? '0' + year : year;
        var formattedMonth = month < 10 ? '0' + month : month;
        var formattedDay = day < 10 ? '0' + day : day;
        var formattedDate = formattedDay + '/' + formattedMonth + '/' + formattedYear;
        console.log(formattedDate); // Format date as 'MM/DD/YYYY'

        let userActivityLog = await UserActivityLog.findOne({
            mid: req.body.mid,
            loginDate: formattedDate,
            loginCount: 0, // Check if loginCount is zero
        });

        if (!userActivityLog) {
            // If no entry exists, create a new one
            userActivityLog = new UserActivityLog({
                mid: req.body.mid,
                loginDate: formattedDate,
            });
        }

        // Increase login count and update login date
        await UserActivityLog.updateOne(
            { mid: req.body.mid, loginDate: formattedDate },
            { $inc: { loginCount: 1 }, $set: { loginDate: formattedDate } },
            { upsert: true } // Add this option to create a new entry if none is found
        );

        next();
    } catch (error) {
        console.error('Error checking admin login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



router.post('/signin', upload.none(),checkAdminLogin,async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if the user's email is verified
        if (!user.verified) {
            return res.status(403).json({ message: 'Email not verified' });
        }

        // Compare the entered password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate and return an authentication token
        const authToken = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        res.status(200).json({ message: 'Sign-in successful', authToken });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});









  
async function convertToExcelFormat(users) {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Add headers
    worksheet.addRow([
        'Email', 'Name', 'Mobile No', 'Verified', 'Payment History',
        'Purchased Items', 'Reward Points', 'Cashback Points', 'Profile Picture URL',
        'Address', 'Bio', 'Birth Date', 'Country', 'First Name',
        'Gender', 'Last Name', 'Phone Number', 'Rating', 'Zipcode',
        'KYC Status', 'Suspend Reason'
    ]);

    // Add data
    users.forEach(user => {
        worksheet.addRow([
            user.email, user.name, user.mobileNo, user.verified, user.payment_history,
            user.purchased_items, user.reward_points, user.cashback_points, user.pic_url,
            user.address, user.bio, user.birth_date, user.country, user.fname,
            user.gender, user.lname, user.phn, user.rating, user.zipcode,
            user.kyc_status, user.suspend_reason
        ]);
    });

    // Save the workbook as a buffer
    return workbook.xlsx.writeBuffer();
}

router.get('/exportUsers', async (req, res) => {
    try {
        const users = await User.find();
        console.log("Number of users found:", users.length);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for export' });
        }

        // Assuming you have a function to convert users data to Excel
        const excelData = await convertToExcelFormat(users);

        // Set headers for the Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
        
        // Send the Excel file as a buffer
        res.send(excelData);
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/publicip', async (req, res) => {
    try {
        // Make a GET request to a service that echoes back the requester's IP address
        const response = await axios.get('https://api.ipify.org?format=json');

        // Extract the public IP address from the response data
        const publicIPAddress = response.data.ip;

        res.json({ publicIP: publicIPAddress }); // Sends back a JSON response containing the public IP address
    } catch (error) {
        console.error('Error fetching public IP:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




const checkAdminSignup = async (req, res, next) => {
    try {
        var currentDate = new Date();
        var year = currentDate.getFullYear() % 100; // Extract the last two digits of the year
        var month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
        var day = currentDate.getDate();
        var formattedYear = year < 10 ? '0' + year : year;
        var formattedMonth = month < 10 ? '0' + month : month;
        var formattedDay = day < 10 ? '0' + day : day;
        var formattedDate = formattedDay + '/' + formattedMonth + '/' + formattedYear;
        console.log(formattedDate);// Format date as 'MM/DD/YYYY'

        let userActivityLog = await UserActivityLog.findOne({
            mid: req.body.mid,
            loginDate: formattedDate,
            SignupCount: 0, // Check if loginCount is zero
        });

        if (!userActivityLog) {
            // If no entry exists, create a new one
            userActivityLog = new UserActivityLog({
                mid: req.body.mid,
                loginDate: formattedDate,
            });
        }

        // Increase login count and update login date
        await UserActivityLog.updateOne(
            { mid: req.body.mid, loginDate: formattedDate },
            { $inc: { SignupCount: 1 }, $set: { loginDate: formattedDate } },
            { upsert: true } // Add this option to create a new entry if none is found
        );

        next();
    } catch (error) {
        console.error('Error checking admin login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


router.post('/register',  checkAdminSignup,upload.none(),async (req, res) => {
    try {
        const { email, name, password, mobileNo } = req.body;

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with verificationToken
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            mobileNo,
            mid: generateUniqueMid(),
            verificationToken,
        });

        // Save the user to the database
        await newUser.save();

        // Send verification email
        await sendVerificationEmail(newUser);

        res.status(201).json({ message: 'User registered successfully', mid: newUser.mid });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





router.get('/login-signup-counts', async (req, res) => {
    try {
      // Fetch all user activity logs from the database
      const userActivityLogs = await UserActivityLog.find();
  
      if (!userActivityLogs || userActivityLogs.length === 0) {
        return res.status(404).json({ message: 'No user activity logs found' });
      }
      
      // Map to store login counts for each date
      const countsByDate = {};
  
  // Loop through the data array to aggregate counts for each date
  userActivityLogs.forEach(entry => {
    const { loginDate, loginCount, visitorCount, SignupCount } = entry;
    if (!countsByDate[loginDate]) {
      countsByDate[loginDate] = {
        loginCounts: 0,
        visitorCount: 0,
        signupCount: 0
      };
    }
    countsByDate[loginDate].loginCounts += loginCount;
    countsByDate[loginDate].visitorCount += visitorCount;
    countsByDate[loginDate].signupCount += SignupCount;
  });
  
  // Array to store aggregated data
  const aggregatedData = [];
  
  // Convert the countsByDate object to an array of objects
  for (const date in countsByDate) {
    aggregatedData.push({
      date: date,
      loginCounts: countsByDate[date].loginCounts,
      visitorCount: countsByDate[date].visitorCount,
      signupCount: countsByDate[date].signupCount
    });
  }
  
  // Print the aggregated data
  console.log(aggregatedData);
      res.json(aggregatedData);
    } catch (error) {
        console.log("error getting counts",error)
      res.status(500).json({ message: 'Server Error' });
    }
  });
  


// Helper function to generate a unique mid (you can customize this based on your requirements)
function generateUniqueMid() {
    // Logic to generate a unique mid (for example, using a combination of timestamp and a random number)
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `MID${timestamp}${randomNum}`;
}

// Helper function to send a verification email
async function sendVerificationEmail(user) {
    const verificationLink = `https://tssapis.devcorps.in/admin/user/verify?token=${user.verificationToken}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Harshkhosla9945@gmail.com',
            pass: 'smos vryu mccy rhqp',
        },
    });

    const mailOptions = {
        from: 'Harshkhosla9945@gmail.com',
        to: user.email,
        subject: 'Verify Your Email',
        text: `Please click on the following link to verify your email: ${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);
}





router.put('/:mid', upload.none(), async (req, res) => {
    try {
        const { mid } = req.params;
        const updatedData = req.body;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields based on the form data
        user.email = updatedData.email || user.email;
        // user.name = updatedData.name || user.name;
        user.password = updatedData.password
            ? await bcrypt.hash(updatedData.password, 10)
            : user.password;
        user.mobileNo = updatedData.mobileNo || user.mobileNo;
        // user.mid = updatedData.mid || user.mid;
        user.verified = updatedData.verified || user.verified;
        user.verificationToken = updatedData.verificationToken || user.verificationToken;
        user.payment_history = updatedData.payment_history || user.payment_history;
        user.purchased_items = updatedData.purchased_items || user.purchased_items;
        user.reward_points = updatedData.reward_points || user.reward_points;
        // user.pic_url = updatedData.pic_url || user.pic_url;
        user.auth_code = updatedData.auth_code || user.auth_code;
        user.address = updatedData.address || user.address;
        user.bio = updatedData.bio || user.bio;
        user.birth_date = updatedData.birth_date || user.birth_date;
        user.country = updatedData.country || user.country;
        user.fname = updatedData.fname || user.fname;
        user.gender = updatedData.gender || user.gender;
        user.lname = updatedData.lname || user.lname;
        user.phn = updatedData.phn || user.phn;
        user.rating = updatedData.rating || user.rating;
        user.zipcode = updatedData.zipcode || user.zipcode;
        user.kyc_status = updatedData.kyc_status || user.kyc_status;
        user.suspend_reason = updatedData.suspend_reason || user.suspend_reason;
        // Add more fields as needed

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// userRoutes.js
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;

        // Find the user with the verification token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(404).json({ message: 'Invalid verification token' });
        }

        // Update the user's status to "verified" and clear the verification token
        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





router.get('/users/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter unread messages
        const unreadMessages = user.data.messages.filter(message => !message.readed);

        // Update readed status to true for unread messages
        unreadMessages.forEach(message => {
            message.readed = true;
        });

        // Mark the 'data.messages' array as modified
        user.markModified('data.messages');

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ unreadMessages });
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/usersnot/:mid', async (req, res) => {
    try {
      const { mid } = req.params;
  
      // Find the user by mid
      const user = await User.findOne({ mid });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Retrieve the messages from the user's data
      const messages = user.data.messages;
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// userRoutes.js
    router.post('/users/:mid', upload.none(),async (req, res) => {
        try {
            const { mid } = req.params;
            const newMessage = req.body;
    
            // Find the user by mid
            const user = await User.findOne({ mid });
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Add the new message to the 'messages' array
            user.data.messages.push(newMessage);
    
            // Mark the 'data.messages' array as modified
            user.markModified('data.messages');
    
            // Save the updated user to the database
            await user.save();
    
            res.status(201).json({ message: 'Message added successfully', user });
        } catch (error) {
            console.error('Error adding message:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });






router.get('/:mid', async (req, res) => {
    try {
        const user = await User.findOne({ mid: req.params.mid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user by UID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        console.log(users);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// router.get('/sample', async (req, res) => {
//     try {
//         const users = await User.find();
//         console.log(users);
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error getting users:', error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// });



router.get('/getMessages/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // readed only true

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the user's messages
        const messages = user.data.messages;

        res.status(200).json({ success: true, data: { messages, mid: user.mid } });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});









// userRoutes.js

router.put('/suspend/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Suspend the user by setting the suspend_reason
        user.suspend_reason = req.body.suspend_reason || 'No specific reason provided';

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'User suspended successfully', user });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// userRoutes.js

router.put('/topup/:mid', async (req, res) => {
    try {
        const { mid } = req.params;
        const { amount } = req.body;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Top up the user's reward_points by the provided amount
        user.cashback_points = (user.cashback_points || 0) + parseInt(amount, 10);

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'Amount topped up successfully', user });
    } catch (error) {
        console.error('Error topping up amount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






router.get('/export/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a JSON file with user data
        const userData = JSON.stringify(user);
        const fileName = `user_data_${user.mid}.json`;

        fs.writeFileSync(fileName, userData);

        // Send the file as a response
        res.status(200)
            .attachment(fileName)
            .sendFile(fileName, {}, (err) => {
                if (err) {
                    console.error('Error exporting user data:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    // Remove the file after sending
                    fs.unlinkSync(fileName);
                }
            });
    } catch (error) {
        console.error('Error exporting user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// need in exel file 








//-----------------------------------------THIS IS IF WE NEED THE MID EMAIL VERIFICATION---------------------------//

// router.post('/send-email', async (req, res) => {
//     try {
//         const { mid } = req.body;

//         // Check if the mid exists in the database
//         const user = await User.findOne({ mid });
//         // const user = await User.findOne({ mid });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found with the provided MID' });
//         }
        
//         console.log('User:', user);
        
//         // Send email to the user
//         await sendEmail(user);

//         res.status(200).json({ message: 'Email sent successfully' });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Helper function to send an email
// async function sendEmail(user) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'Harshkhosla9945@gmail.com',
//             pass: 'smos vryu mccy rhqp',
//         },
//     });

//     const mailOptions = {
//         from: 'Harshkhosla9945@gmail.com',
//         to: user.email, // Using the user's email as the recipient
//         subject: 'Subject: Your Unique MID',
//         text: `Dear ${user.name},\n\nYour unique MID is: ${user.mid}`,
//     };

//     await transporter.sendMail(mailOptions);
// }


//---------------------------------------------NOT COMPULSORY TO USE IT -----------------------------------------//

// // userRoutes.js
// async function sendEmail(user) {
//     const verificationLink = `http://localhost:3000/user/verify?token=${user.verificationToken}`;

//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'Harshkhosla9945@gmail.com',
//             pass: 'smos vryu mccy rhqp',
//         },
//     });

//     const mailOptions = {
//         from: 'Harshkhosla9945@gmail.com',
//         to: user.email,
//         subject: 'Subject: Your Unique MID',
//         text: `Dear ${user.name},\n\nYour unique MID is: ${user.mid}\n\nPlease click on the following link to verify your email: ${verificationLink}`,
//     };

//     await transporter.sendMail(mailOptions);
// }



module.exports = router;
