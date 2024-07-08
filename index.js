const ConnectToMongo = require("./db");
const express = require("express");
const http = require("http"); // Add the http module
const socketIo = require("socket.io");
const { Server } = require("socket.io");
var cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/Admin/userRoutes.js");
const adminRoutes = require("./routes/Admin/adminRoutes");
const userManagementRoutes = require("./routes/Admin/User_ManagementRoutes");
const departmentRoutes = require("./routes/Admin/DepartmentRoutes");
const roleRoutes = require("./routes/Admin/RoleRoutes");
const settingRoutes = require("./routes/Admin/settingsRoutes");
const cmsRoutes = require("./routes/Admin/cmsRoutes");
const footerRoutes = require("./routes/Admin/footerRoutes");
const pagesRoutes = require("./routes/Admin/pagesRoutes");
const homeRoutes = require("./routes/Admin/homeRoutes");
const aboutRoutes = require("./routes/Admin/aboutRoutes.js");
const contactRoutes = require("./routes/Admin/contactRoutes.js");
const promoCodeRoutes = require("./routes/Admin/promoCodeRoutes");
const generalConfigRoutes = require("./routes/Admin/generalConfigRoutes");
const catalogRoutes = require("./routes/Admin/catalogRoutes");
const productRoutes = require("./routes/Admin/productRoutes");
const promotionRoutes = require("./routes/Admin/promotionRoutes");
const categoryRoutes = require("./routes/Admin/categoryRoutes");
const bannerRoutes = require("./routes/Admin/BannerRoute.js");
const productCategoryRoutes = require("./routes/Admin/productCategoryRoutes");
const OrderRoutes = require("./routes/Admin/OrderRoutes.js");
const reviewRoutes = require("./routes/Admin/reviewController");
const transactionRoutes = require("./routes/Admin/transactions");
const looksRoutes = require("./routes/Admin/looksRoutes");
const pageController = require("./routes/Admin/pageController.js");
const ClientHome = require("./routes/Client/HomeClient.js");
const productcat = require("./routes/Client/productcatg.js");
const productDetails = require("./routes/Client/productDetails.js");
const catalogClientRoutes = require("./routes/Client/CatalogRoutes.js");
const CartRoutes = require("./routes/Client/cartRoutes.js");
const Clientlogin = require("./routes/Client/Clientlogin.js");
const visitorsRouter = require("./routes/Client/visitorRoutes.js");
const review = require("./routes/Client/Review.js");
const liked = require("./routes/Client/liked.js");
const about = require("./routes/Client/About.js");
const payment = require("./routes/Client/Payment_routes.js");
const contact = require("./routes/Client/contactroutes.js");
const Stripe = require("./routes/Client/Stripe.js");
const Orders = require("./routes/Client/Orders.js");
const promotions= require("./routes/Client/promotionroutes.js");
const blogRoutes = require('./routes/Admin/blogRoutes');
const appointmentRoutes = require('./routes/Admin/appointmentRoutes');
const PortalRoutes = require('./routes/Portal/adminRoutes');

ConnectToMongo();
const app = express();
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));
const server = http.createServer(app); // Create an HTTP server

app.use(express.json());


app.use("/portal/admin", PortalRoutes); 

app.use("/admin/user", userRoutes);
app.use("/admin/admin", adminRoutes);
app.use("/admin/user_management", userManagementRoutes);
app.use("/admin/departments", departmentRoutes);
app.use("/admin/roles", roleRoutes);
app.use("/admin/settings", settingRoutes);
app.use("/admin/cms", cmsRoutes);
app.use("/admin/footer", footerRoutes);
app.use("/admin/pages", pagesRoutes);
app.use("/admin/home", homeRoutes);
app.use("/admin/about", aboutRoutes);
app.use("/admin/contact", contactRoutes);
app.use("/admin/promo-code", promoCodeRoutes);
app.use("/admin/general-config", generalConfigRoutes);
app.use("/admin/catalog", catalogRoutes);
app.use("/admin/product", productRoutes);
app.use("/admin/promotion", promotionRoutes);
app.use("/admin/categories", categoryRoutes);
app.use("/admin/productCategory", productCategoryRoutes);
app.use("/admin/banner", bannerRoutes);
app.use("/admin/oders", OrderRoutes);
app.use("/admin/review", reviewRoutes);
app.use("/admin/transactions", transactionRoutes);
app.use("/admin/looks", looksRoutes);
app.use("/admin/page", pageController);
app.use("/admin/blog", blogRoutes);
app.use('/admin/appointments', appointmentRoutes);

//clients-Routes
app.use("/client", ClientHome);
app.use("/client/auth", Clientlogin);
app.use("/client/productcat", productcat);
app.use("/client/productDetails", productDetails);
app.use("/client/catalog", catalogClientRoutes);
app.use("/client/cart", CartRoutes);
app.use("/client/visitors", visitorsRouter);
app.use("/client/review", review);
app.use("/client/liked", liked);
app.use("/client/About", about);
app.use("/client/payments", payment);
app.use("/client/contacts", contact);
app.use("/client", Stripe);
app.use("/client/orders", Orders);
app.use("/client", promotions);

// app.use("/client/liked",liked)

// app.use('/client/page', ClientHome);

// websocket part


const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:3001",
      "http://64.227.186.165:3000",
      "https://64.227.186.165:3000",
      "http://64.227.186.165:3002",
      "https://admin.devcorps.in",
    ],
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  socket.on("send_message", () => {
    console.log("mesage sent");
    socket.broadcast.emit("receive_message");
  });
  socket.on("help_desk_send", () => {
    console.log("help desk message");
    socket.broadcast.emit("help_desk_receive");
  });
});

server.listen(3005, () => {
  console.log("SERVER IS RUNNING");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
