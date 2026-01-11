import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { isAuth, isAdmin, generateToken, baseUrl, sendEmail } from '../utils.js';
import crypto from 'crypto';

const userRouter = express.Router();

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) res.send(user);
    else res.status(404).send({ message: 'User Not Found' });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({ message: 'User Not Found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = bcrypt.hashSync(req.body.password, 8);
    if (typeof req.body.isSeller === 'boolean' && req.user.isAdmin) user.isSeller = req.body.isSeller;

    const updatedUser = await user.save();
    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isSeller: updatedUser.isSeller,
      token: generateToken(updatedUser),
    });
  })
);

userRouter.post(
  '/forget-password',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ ok: true, message: 'If the email exists, a reset link was sent.' });
    }

    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpires = Date.now() + 1000 * 60 * 30; 
    await user.save();

    const resetUrl = `${baseUrl()}/reset-password?token=${user.resetToken}&email=${encodeURIComponent(user.email)}`;
    const html = `<p>Hello ${user.name || ''},</p>
      <p>Click <a href="${resetUrl}" target="_blank">here</a> to reset your password</p>`;

    const mail = await sendEmail({ to: user.email, subject: 'Reset your password', html });

    if (mail?.ok || mail?.response?.statusCode === 201) {
      return res.send({ ok: true, message: 'Email sent. Check your inbox (or spam).' });
    }
    return res.status(202).send({ ok: false, message: 'We attempted to send the email. Please check later.' });
  })
);

userRouter.post(
  '/reset-password',
  expressAsyncHandler(async (req, res) => {
    if (user.resetTokenExpires < Date.now())
    return res.status(401).send({ message: 'Token expired' });
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err) => {
      if (err) return res.status(401).send({ message: 'Invalid Token' });

      const user = await User.findOne({ resetToken: req.body.token });
      if (!user) return res.status(404).send({ message: 'User not found' });

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();
        res.send({ message: 'Password updated successfully' });
      } else {
        res.status(400).send({ message: 'New password is required' });
      }
    });
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: 'User Not Found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    user.isSeller = Boolean(req.body.isSeller);

    const updatedUser = await user.save();
    res.send({ message: 'User Updated', user: updatedUser });
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: 'User Not Found' });
    if (user.email === 'admin@example.com')
      return res.status(400).send({ message: 'Can Not Delete Admin User' });

    await user.deleteOne();
    res.send({ message: 'User Deleted' });
  })
);

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(user),
      });
      return;
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const exist = await User.findOne({ email: req.body.email });
    if (exist) return res.status(400).send({ message: 'User already exists' });
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      isSeller: !!req.body.isSeller,
    });
    const createdUser = await user.save();

    res.send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      isSeller: createdUser.isSeller,
      token: generateToken(createdUser),
    });

    try {
      await sendEmail({
        to: `${createdUser.name} <${createdUser.email}>`,
        subject: 'Welcome to UrbanBazaar',
        html: `<h1>Welcome!</h1><p>Your account was created successfully.</p>`,
      });
    } catch (e) {
      console.warn('[MAIL] Welcome email failed:', e?.message || e);
    }
  })
);

export default userRouter;
