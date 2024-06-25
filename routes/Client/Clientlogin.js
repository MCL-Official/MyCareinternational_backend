const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const User = require('../../models/User');
const Order = require('../../models/Order');
const PromoCode = require('../../models/promoCode');
const multer = require('multer');
const UserActivityLog = require('../../models/UserActivityLog');
// const upload = multer(); // initialize multer




const uploadDirectory = '/var/www/html/tss_files/home';
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


router.post('/Signup', checkAdminSignup, upload.none(),async (req, res) => {
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
  


function generateUniqueMid() {
    // Logic to generate a unique mid (for example, using a combination of timestamp and a random number)
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `MID${timestamp}${randomNum}`;
} 

async function sendVerificationEmail(user) {
    const verificationLink = `https://tssapis.devcorps.in/client/auth/verify?token=${user.verificationToken}`;

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


router.post('/forgot-password', async(req, res) => {

    try{
    const { email } =  req.body;
    // console.log(email);
    const user = await User.findOne({email});

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetUrl = `https://tssapis.devcorps.in/client/auth/reset-password?token=${token}`;

    user.verificationToken = token;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Harshkhosla9945@gmail.com',
            pass: 'smos vryu mccy rhqp',
        },
    });
    
    // Define mail options
    const mailOptions = {
        from: 'harshkhosla9945@gmail.com',
        to: user.email,
        subject: 'Reset Your Password',
        html: `Click <a href="${resetUrl}">here</a> to reset your password.`
    };
    
    // Send email with reset link
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }

    res.json({ message: 'Email sent with password reset instructions' });
}
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.get('/promocode', async (req, res) => {
    try {
      const promoCodeData = await PromoCode.findOne();
      res.status(200).json(promoCodeData);
    } catch (error) {
      console.error('Error fetching promo code data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Reset password endpoint
router.post('/reset-password', async(req, res) => {

    try{
        const  newPassword  =  req.body.newpassword;
       
        const token =req.query.token

    // Find user by token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    user.verificationToken = null;
    user.save();

    res.json({ message: 'Password updated successfully' });

}
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});









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
  

router.post('/Login',checkAdminLogin,upload.none(), async (req, res) => {
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

        res.status(200).json({ message: 'Sign-in successful', authToken,mid:user.mid });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/users/:mid',upload.none(), async (req, res) => {
    

    try{
    const {mid}=req.params;

    const user=await User.findOne({mid})
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }


    res.status(200).json({ user });
} catch (error) {
    // If an error occurs during the process, log the error
    console.error('Error getting user by mid:', error);

    // Send a 500 response for internal server error
    res.status(500).json({ message: 'Internal Server Error' });
}
});


// router.put('/users/:mid',upload.none(), async (req, res) => {
//     try{
// const {mid}=req.params;
// const updatedata=req.body;

// const updatedUser = await User.findOneAndUpdate({ mid }, updatedata, { new: true });
// if(!updatedUser)
// {
//     res.status(404).send("Invalid credentials");
// }



// } catch (error) {
//     // If an error occurs during the process, log the error
//     console.error('Error getting user by mid:', error);

//     // Send a 500 response for internal server error
//     res.status(500).json({ message: 'Internal Server Error' });
// }


// });

router.put('/users/:mid', upload.single('image'), async (req, res) => {
    try {
        const { mid } = req.params;
        const updatedData = req.body;
        // Update the image field if a new image file is provided
        const uniqueFileName = req.file.filename;
        console.log(uniqueFileName);
        if (req.file && req.file.filename) {
            updatedData.pic_url= `http://64.227.186.165/tss_files/home/${uniqueFileName}`;
        }
        console.log(updatedData);
        // Find and update the user document
        const updatedUser = await User.findOneAndUpdate({ mid }, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).send("Invalid credentials");
        }

        // Send updated user information in response
        res.json(updatedUser);
    } catch (error) {
        // If an error occurs during the process, log the error
        console.error('Error updating user by mid:', error);

        // Send a 500 response for internal server error
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




router.post('/users/:mid/addresses', async (req, res) => {
    try {
        const { mid } = req.params;
        const newAddress = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { mid },
            { $push: { 'address.landmark': newAddress } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.json(updatedUser.address.landmark);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.put('/users/:mid/addresses/:addressId', async (req, res) => {
    try {
        const { mid, addressId } = req.params;
        const updatedAddress = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { mid, 'address.landmark._id': addressId },
            { $set: { 'address.landmark.$': updatedAddress } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("Address not found");
        }

        res.json(updatedUser.address.landmark);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/users/:mid/addresses', async (req, res) => {
    try {
        const { mid } = req.params;
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addresses = user.address.landmark;

        res.status(200).json({ addresses });
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.delete('/users/:mid/addresses/:addressId', async (req, res) => {
    try {
        const { mid, addressId } = req.params;
        const updatedUser = await User.findOneAndUpdate(
            { mid },
            { $pull: { 'address.landmark': { _id: addressId } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("Address not found");
        }

        res.json(updatedUser.address.landmark);
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/change-password', upload.none(),async (req, res) => {
    const {mid,oldPassword, newPassword, confirmPassword}=req.body;

    const user=await User.findOne({mid})
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    // const {  } = req.body;
  
    // Check if all required fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Please provide old password, new password, and confirm new password." });
    }
  
    // Fetch the user from the database
    // const user = await User.findOne(req.user); // Assuming you're using some sort of authentication middleware to get user id
    // const hashedPassword1=await bcrypt.hash(oldPassword,10)
    // Validate old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }
  
    // Check if new password is similar to old password
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from old password." });
    }
  
    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match." });
    }
  
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();
  
    res.status(200).json({ message: "Password changed successfully." });
  });

router.get('/orders/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user with the specified mid in the database
        const user = await User.findOne({ mid });

        // If no user is found, return a 404 response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find orders associated with the user
        const orders = await Order.find({ mid });

        // Send the orders in the response
        res.status(200).json({ orders });
    } catch (error) {
        // If an error occurs during the process, log the error
        console.error('Error getting orders for user:', error);

        // Send a 500 response for internal server error
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports=router;