const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      // Optional for SSO users
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubUsername: String,
    githubAccessToken: String, // Store token for workflow automations
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleAccessToken: String, // Store token for workflow automations
    googleRefreshToken: String,
    avatar: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    subscription: {
      plan: { type: String, enum: ['FREE', 'PRO', 'ELITE'], default: 'FREE' },
      status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'TRIAL'], default: 'ACTIVE' },
      startDate: { type: Date },
      expiryDate: { type: Date },
      razorpayPaymentId: { type: String },
      isYearly: { type: Boolean, default: false }
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // If password is not modified or is missing (SSO users), just return
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  
  try {
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;