import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, isSeller, sendEmail, payOrderEmailTemplate } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const items = req.body.orderItems;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ message: 'No order items' });
    }

    const orderItems = await Promise.all(
      items.map(async (x) => {
        const productId = x.product || x._id;
        if (!productId) throw new Error('Missing product id in order item');

        const product = await Product.findById(productId).select('_id seller name');
        if (!product) throw new Error(`Product not found (${productId})`);
        if (!product.seller) {
          throw new Error(`Product "${product.name}" has no seller assigned`);
        }

        return {
          ...x,
          product: product._id,    
          seller: product.seller,   
        };
      })
    );

    const newOrder = new Order({
      orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      { $group: { _id: null, numOrders: { $sum: 1 }, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const users = await User.aggregate([{ $group: { _id: null, numUsers: { $sum: 1 } } }]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.send({
      users: users.length ? users : [{ _id: null, numUsers: 0 }],
      orders: orders.length ? orders : [{ _id: null, numOrders: 0, totalSales: 0 }],
      dailyOrders,
      productCategories,
    });
  })
);

orderRouter.get(
  '/seller',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ 'orderItems.seller': req.user._id }).populate('user', 'name');
    res.send(orders);
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) return res.send(order);
    return res.status(404).send({ message: 'Order Not Found' });
  })
);

const isAdminOrSellerOfOrder = expressAsyncHandler(async (req, res, next) => {
  if (req.user?.isAdmin) return next();
  if (!req.user?.isSeller) {
    return res.status(403).send({ message: 'Seller or Admin only' });
  }
  const order = await Order.findById(req.params.id).select('orderItems.seller');
  if (!order) return res.status(404).send({ message: 'Order Not Found' });

  const ownsAnyItem = order.orderItems?.some(
    (it) => String(it.seller) === String(req.user._id)
  );
  return ownsAnyItem ? next() : res.status(403).send({ message: 'Not allowed for this order' });
});

orderRouter.put(
  '/:id/deliver',
  isAuth,
  isAdminOrSellerOfOrder,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order Not Found' });

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    res.send({ message: 'Order Delivered' });
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) return res.status(404).send({ message: 'Order Not Found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    try {
      await sendEmail({
        to: `${order.user.name || order.user.email} <${order.user.email}>`,
        subject: `Order ${order._id} paid`,
        html: payOrderEmailTemplate(order),
      });
    } catch (e) {
      console.warn('[MAIL] Failed to send payment email:', e?.message);
    }

    res.send({ message: 'Order Paid', order: updatedOrder });
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order Not Found' });
    await order.deleteOne();
    res.send({ message: 'Order Deleted' });
  })
);

export default orderRouter;
