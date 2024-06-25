const express=require("express")
const router=express.Router()
const cartSchema=require("../../models/cart")
const Product = require('../../models/product');
const User = require('../../models/User');
const multer = require('multer');
const upload = multer(); // initialize multer

router.post("/create/:uid",async(req,res)=>{
    try {
        const Data=await cartSchema.find({uid:req.params.uid})
    if(Data.length>0){
        const pidData= Data[0].cartsPid
        pidData.push(req.body.pid)
        const updatedCartsPid = await cartSchema.findOneAndUpdate(
            { uid:req.params.uid},
            {cartsPid:pidData},
            { new: true }
          );
          res.status(201).json({ message: 'cartspid add succesfully', updatedCartsPid });
    }
    else{
        const CartData=new cartSchema({
            uid:req.params.uid,
            cartsPid:req.body.pid
        })
         await CartData.save()
         res.status(201).json({ message: 'add to cart successfully', CartData });
    }
    } catch (error) {
        console.error('Error creating cartproduct:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    } 
})


router.get("/cartProduct/:uid",async(req,res)=>{
    try {
        const uidData=await cartSchema.findOne({uid:req.params.uid})
    console.log("uidData",uidData);
    const cartPid=uidData.cartsPid

    const ProductData=[]
    for(let i=0;i<cartPid.length;i++){
      const findProduct=  await Product.findOne({pid:cartPid[i]})
      ProductData.push(findProduct)
    }
    res.status(201).json({ message: 'Product find successfully', ProductData });

    } catch (error) {
        console.error("Error in get cart product",error)
        res.status(500).json({message:"interval server error"})    }

    
})







// POST /carts route to add products to the cart


// POST endpoint to add a product to the user's cart
router.post('/carts', async (req, res) => {
    const { mid, pid, Size, Colour, name,Quantity, price, image } = req.body;
console.log(req.body);

    try {
        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the Quantity is a positive integer
        if (!Number.isInteger(Quantity) || Quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be a positive integer' });
        }

        // Check if the product already exists in the cart with the same size, color, price, and url
        const existingProductIndex = user.cart.findIndex(item => 
            item.pid === pid && 
            item.name === name && 
            item.Size === Size && 
            item.Colour === Colour &&
            item.price === price &&
            item.url === image && 
            item.Quantity ==Quantity
        );

        if (existingProductIndex !== -1) {
            // If the product already exists, increase the quantity
            user.cart[existingProductIndex].Quantity += Quantity;
        } else {
            // If the product is not in the cart, add it to the cart with the specified quantity
            user.cart.push({ pid, Quantity, Size, name, Colour, price, url:image });
        }

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'Product added to cart successfully', cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






// GET /carts/:pid route to get cart details based on product ID and total quantity
router.get('/carts/:pid', async (req, res) => {
    const { pid } = req.params;
    const { Size, Colour } = req.query;

    try {
        const users = await User.find({ 'cart.pid': pid, 'cart.Size': Size, 'cart.Colour': Colour });

        // Calculate total quantity
        let totalQuantity = 0;
        users.forEach(user => {
            const cartItem = user.cart.find(item => item.pid === pid && item.Size === Size && item.Colour === Colour);
            if (cartItem) {
                totalQuantity += cartItem.Quantity;
            }
        });

        res.status(200).json({ totalQuantity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;



router.delete('/carts/delete', upload.none(),async (req, res) => {
    try {
        const { mid, pid } = req.body;

        // Check if the user exists
        const existingUser = await User.findOne({ mid });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Remove the product from the user's liked products list in the database
        await User.findOneAndUpdate(
            { mid },
            { $pull: { 'cart': { pid } } }
        );

        res.status(200).json({ message: 'Product removed from cart list successfully.' });
    } catch (error) {
        console.error('Error removing product from liked list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// GET /carts/:mid route to get cart details for a specific user
router.get('/cart/:mid', async (req, res) => {
    const mid = req.params.mid;

    try {
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Array to hold cart items with product details
        const populatedCart = [];

        // Iterate through each cart item and populate product details
        for (const cartItem of user.cart) {
            console.log(cartItem);
            const product = await Product.findOne({ pid: cartItem.pid });
            if (product) {
                populatedCart.push({
                    pid: cartItem.pid,
                    size: cartItem.Size,
                    colour: cartItem.Colour,
                    quantity: cartItem.Quantity,
                    price: product.unit_price
                });
            }
        }

        res.status(200).json({ cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




router.put('/carts/updateQuantity', upload.none(), async (req, res) => {
    const { mid, pid, Quantity    } = req.body;
    console.log(Quantity);
  
    try {
      const user = await User.findOne({ mid });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Find the product in the user's cart
      const productIndex = user.cart.findIndex(item => item.pid === pid);
  
      if (productIndex !== -1) {
        // Update the quantity for the product
        user.cart[productIndex].Quantity = Quantity        ;
        await user.save();
  
        return res.status(200).json({ message: 'Quantity updated successfully', user ,Quantity    });
      } else {
        return res.status(404).json({ message: 'Product not found in cart' });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports=router