const express=require("express")
const router=express.Router()
const visitorsModel=require("../../models/visitors")
const VisitorLog = require('../../models/VisitorLog');
const UserActivityLog = require("../../models/UserActivityLog");
var currentDate = new Date();
var month = currentDate.getMonth() + 1; 
var day = currentDate.getDate();
var year = currentDate.getFullYear();
var formattedDate = month + '/' + day + '/' + year;



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
router.post("/createVisitors",async(req,res)=>{
    try {
        const {country,ip}=req.body
        const saveToDb=new visitorsModel({
            country,
            ip,
            date:formattedDate
        })
       const response= await saveToDb.save()
       res.status(200).json({message:"visitors create successfully",response})
        console.log("response",response);
    } catch (error) {
        console.log("error in creating visitores",error)
        res.status(500).json({message:"Interval server error"})
    }
   
})
router.post('/chit', checkUniqueVisitor, async (req, res) => {
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

        let visitorRecord;

        if (mid) {
            // If mid is provided, update the visitor count based on mid and formatted date
            visitorRecord = await UserActivityLog.findOneAndUpdate(
                { mid, loginDate: formattedDate },
                { $inc: { visitorCount: 1 } },
                { upsert: true, new: true }
            );
        } else {
            // If mid is not provided, check if a visitor record exists for today's date
            visitorRecord = await UserActivityLog.findOne({ loginDate: formattedDate , mid: { $exists: false }});

            if (visitorRecord) {
                // If a visitor record already exists for today's date, increment the visitor count
                visitorRecord.visitorCount += 1;
            } else {
                // If no visitor record exists for today's date, create a new one with an incremented count
                visitorRecord = await UserActivityLog.create({
                    loginDate: formattedDate,
                    visitorCount: 1
                });
            }

            // Save the updated or newly created visitor record
            await visitorRecord.save();
        }

        res.json({ message: 'Visitor count incremented successfully', count: visitorRecord.visitorCount });
    } catch (error) {
        console.error('Error incrementing visitor count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




router.get("/getvisitor",async(req,res)=>{
    try {
        const getData=await VisitorLog.find()
        if(!getData){
          return  res.status(404).json({message: 'Product not found' })
        }
        res.status(200).json(getData);
    } catch (error) {
        console.log("error in creating visitores",error)
        res.status(500).json({message:"Interval server error"})
    }
})

module.exports=router;