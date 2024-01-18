const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const userModel = require("./Models/userRegistration");
const product = require("./Models/productsModel");

app.use(express.json());
app.use(cors());

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL).then(() => {
  try {
    console.log("connected to database");
  } catch (err) {
    console.log("DB Error");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let exists = await userModel.findOne({ email });
    if (username === "") {
      return res
        .status(400)
        .json({ message: "Username required", status: 400 });
    } else if (email === "") {
      return res.status(400).json({ message: "Email required", status: 401 });
    } else if (password === "") {
      return res
        .status(400)
        .json({ message: "Password required", status: 402 });
    } else if (exists) {
      return res
        .status(400)
        .json({ message: "Email Id already exist", status: 404 });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.create({ username, email, password: hashedPassword });
      return res
        .status(200)
        .json({ message: "User registerd successfully", status: 200 });
    }
  } catch (err) {
    console.log("Register Error :", err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let exists = await userModel.findOne({ email });
    if (email === "" || password === "") {
      return res
        .status(400)
        .json({ message: "Email and password required", status: 400 });
    } else if (!exists) {
      return res
        .status(404)
        .json({ message: "Email doesn't exist, Register First", status: 400 });
    } else {
      const passwordMatch = await bcrypt.compare(password, exists.password);
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ message: "Password doesn't match", status: 400 });
      }
      const payload = {
        user: {
          id: exists.id,
        },
      };
      /* console.log(payload);*/
      jwt.sign(
        payload,
        "jwtSecret",
        { expiresIn: 3600000 },
        async (err, token) => {
          try {
            if (err) throw err;
            else {
              await res.json({
                token,
                status: 200,
                exists,
                message: "User Login Successful!!",
              });
            }
          } catch (e) {
            console.log(e);
          }
        }
      );
    }
  } catch (e) {
    console.log(e);
  }
});

app.post("/addproducts", async (req, res) => {
  const { title, description, category, price, image, rating } = req.body;
  try {
    await product.create(req.body);
    return res
      .status(200)
      .json({ message: "product added successfully", status: 200 });
  } catch (error) {
    console.log("error");
  }
});

app.get("/products",async (req, res) => {
    try {
      const products = await product.find({});
      return res.status(200).send(products);
    } catch (Err) {
      console.log(Err);
    }
  });

app.post('/addtocart/:id', async (req, res) => {
    try {
        const {productId } = req.body;
        // Find user and product
        const user = await userModel.findById(req.params.id);
        const proDuct = await product.findById(productId);
        // Add product to user's cart
        if(user.myCart.includes(proDuct._id)){
          res.status(400).json("Item already in cart")
        }else{
          user.myCart.push(proDuct._id);
          await user.save();
          res.status(201).json({ message: 'Product added to cart successfully!!' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/myCart/:id', async (req, res) => {
  try {
      const userId = req.params.id;

      // Find user and populate the products in the cart
      const user = await userModel.findById(userId).populate('myCart');

      res.status(200).json(user.myCart);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/removefromcart/:userId/:productId', async (req, res) => {
  try {
      const { userId, productId } = req.params;

      // Find user and remove product from cart using $pull
      const user = await userModel.findByIdAndUpdate(
          userId,
          { $pull: { myCart: productId } },
          { new: true } // This option returns the modified document
      );
    res.status(200).json({ message: 'Item removed from cart successfully' });
     
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(8000, () => {
  console.log("connected to server");
});
