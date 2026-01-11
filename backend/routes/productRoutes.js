import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, isAdminOrOwner } from '../utils.js';

const productRouter = express.Router();

const canSell = (req, res, next) => {
  if (req.user?.isSeller || req.user?.isAdmin) return next();
  return res.status(403).send({ message: 'Seller or Admin only' });
};

productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find().populate('seller', 'name');
    res.send(products);
  })
);

productRouter.post(
  '/',
  isAuth,
  canSell,
  expressAsyncHandler(async (req, res) => {
    try {
      const ownerId = req.user._id;

      const {
        name = `sample name ${Date.now()}`,
        slug: incomingSlug,
        image = '/images/p1.jpg',
        price = 0,
        category = 'sample category',
        brand = 'sample brand',
        countInStock = 0,
        description = 'sample description',
      } = req.body || {};

      const baseSlug = (incomingSlug || name || 'sample-name')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      let slug = baseSlug || `sample-name-${Date.now()}`;
      const exists = await Product.findOne({ slug }).select('_id');
      if (exists) slug = `${baseSlug}-${Date.now()}`;

      const newProduct = new Product({
        name,
        slug,
        image,
        price: Number(price) || 0,
        category,
        brand,
        countInStock: Number(countInStock) || 0,
        rating: 0,
        numReviews: 0,
        description,
        seller: ownerId,
      });

      const product = await newProduct.save();
      return res.status(201).send({ message: 'Product Created', product });
    } catch (err) {
      console.error('[PRODUCT CREATE] failed:', err?.message || err);
      if (err?.code === 11000) {
        return res.status(400).send({ message: 'Slug already exists, please change product name' });
      }
      return res.status(400).send({ message: err?.message || 'Create product failed' });
    }
  })
);

productRouter.get(
  '/mine',
  isAuth,
  (req, res, next) =>
    req.user?.isSeller || req.user?.isAdmin
      ? next()
      : res.status(403).send({ message: 'Seller or Admin only' }),
  expressAsyncHandler(async (req, res) => {
    const mine = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.send(mine);
  })
);

productRouter.put(
  '/:id',
  isAuth,
  canSell,
  isAdminOrOwner(async (req) => {
    const p = await Product.findById(req.params.id).select('seller');
    if (!p) throw new Error('Product Not Found');
    return p.seller;
  }),
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ message: 'Product Not Found' });

    if (req.body.slug && req.body.slug !== product.slug) {
      const exists = await Product.findOne({ slug: req.body.slug }).select('_id');
      if (exists) return res.status(409).send({ message: 'Slug already in use' });
    }
    if (req.body.seller !== undefined) delete req.body.seller;

    const fields = [
      'name',
      'slug',
      'price',
      'image',
      'images',
      'category',
      'brand',
      'countInStock',
      'description',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    await product.save();
    res.send({ message: 'Product Updated', product });
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  canSell,
  isAdminOrOwner(async (req) => {
    const p = await Product.findById(req.params.id).select('seller');
    if (!p) throw new Error('Product Not Found');
    return p.seller;
  }),
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ message: 'Product Not Found' });

    await product.deleteOne();
    res.send({ message: 'Product Deleted' });
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ message: 'Product Not Found' });

    const alreadyReviewed = product.reviews.find(
      (x) => String(x.user) === String(req.user._id)
    );
    if (alreadyReviewed)
      return res.status(400).send({ message: 'You already submitted a review' });

    if (String(product.seller) === String(req.user._id))
      return res.status(400).send({ message: 'Sellers cannot review their own product' });

    const review = {
      name: req.user.name,
      rating: Number(req.body.rating) || 0,
      comment: req.body.comment || '',
      user: req.user._id,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) / product.reviews.length;

    const updatedProduct = await product.save();
    res.status(201).send({
      message: 'Review Created',
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      numReviews: product.numReviews,
      rating: product.rating,
    });
  })
);

const PAGE_SIZE = 5;

productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || PAGE_SIZE);

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({ products, countProducts, page, pages: Math.ceil(countProducts / pageSize) });
  })
);

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = Number(query.pageSize || PAGE_SIZE);
    const page = Number(query.page || 1);
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? { name: { $regex: searchQuery, $options: 'i' } }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all' ? { rating: { $gte: Number(rating) } } : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};

    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    res.send({ products, countProducts, page, pages: Math.ceil(countProducts / pageSize) });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get(
  '/slug/:slug',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug }).populate('seller', 'name');
    if (!product) return res.status(404).send({ message: 'Product Not Found' });
    res.send(product);
  })
);

productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('seller', 'name');
    if (!product) return res.status(404).send({ message: 'Product Not Found' });
    res.send(product);
  })
);

export default productRouter;