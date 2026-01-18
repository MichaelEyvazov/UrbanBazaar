import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import data from '../data.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res, next) => {
  try {
    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);

    const createdUsers = await User.insertMany(
      data.users.map((u) => ({
        ...u,
        password: u.password?.startsWith('$2')
          ? u.password
          : bcrypt.hashSync(u.password || '123456', 10),
      }))
    );

    const sellerUser = createdUsers.find((u) => u.isSeller);
    if (!sellerUser) {
      return res.status(500).send({ message: 'No seller user in seed users' });
    }

    const productsWithSeller = data.products.map((p) => ({
      ...p,
      seller: sellerUser._id,
    }));

    const createdProducts = await Product.insertMany(productsWithSeller);

    res.send({
      message: 'Seeded OK',
      users: createdUsers.length,
      products: createdProducts.length,
      sellerId: sellerUser._id,
    });
  } catch (err) {
    next(err);
  }
});

export default seedRouter;
