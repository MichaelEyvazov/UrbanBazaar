import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isSeller: { type: Boolean, default: false },
    resetToken: { type: String, index: true },
    resetTokenExpires: { type: Date },
    avatarUrl: { type: String }, 
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
