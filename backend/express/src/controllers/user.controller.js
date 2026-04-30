const User = require("../models/user.models");
const EmailService = require("../services/EmailService");
const jwt = require("jsonwebtoken");
const { buildSecurityPayload } = require("../utils/requestContext");

// Register user controller
const registerUser = async (req, res) => {
  // 1. Get user data from request body
  const { name, email, password } = req.body;

  // 2. validate the inputs
  if (!email || !name || !password) {
    return res.status(400).json({
      status: false,
      message: "All fields are required",
    });
  }

  // password validation
  if (password.length < 6) {
    return res.status(400).json({
      status: false,
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    // 3. Check if user already exists in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    // 4. hashing of password is done in the User model using pre-save hook middleware

    // 5. generate a verification token and expiry time
    const verificationTokenExpiry = Date.now() + 10 * 60 * 1000;

    // 6. now create a new user
    const user = await User.create({
      name,
      email,
      password,
      verificationTokenExpiry: verificationTokenExpiry,
    });

    // 6. check if user is created
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User registration failed",
      });
    }
    

    // 7. Fire webhook to send welcome email
    EmailService.send(user.email, user.name, 'welcome', {
      appUrl: process.env.CLIENT_URL,
    });

    // 8. send response
    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("User registration failed", error);
    return res.status(500).json({
      status: false,
      message: error.message // "User registration failed",
      
    });
  }
};

// // Verify user email address controller
// const verify = async (req, res) => {
//   try {
//     // 1. get verification token from request params means from URL
//     const token = req.params.token;

    

//     // 2. find the user with the verification token in DB
//     const user = await User.findOne({
//       verificationToken: token,
//       verificationTokenExpiry: { $gt: Date.now() },
//     });

//     // 3. check if user exists
//     if (!user) {
//       return res.status(400).json({
//         status: false,
//         message: "Invalid or expired verification token",
//       });
//     }

//     // 4. update user isVerified status and remove verification token
//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpiry = undefined;
//     await user.save();

//     // 5. send response
//     return res.status(200).json({
//       status: true,
//       message: "Email verified successfully",
//     });
//   } catch (error) {
//     console.error("Email verification failed", error);
//     return res.status(500).json({
//       status: false,
//       message: "Email verification failed",
//     });
//   }
// };

// Add email validation in controller:


// Login user controller
const login = async (req, res) => {
  // 1. get user data from request body
  const { email, password } = req.body;

  // 2. validate the inputs
  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "All fields are required",
    });
  }

  try {
    // 3. check if user exists in DB with the provided email
    const user = await User.findOne({ email });

    // 4. check if user exists
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // 6. compare the password
    const isPasswordMatch = await user.comparePassword(password);

    // 7. check if password is correct
    if (!isPasswordMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // 8. create a JWT token for the user to access protected routes
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // 9. set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    };

    res.cookie("jwtToken", jwtToken, cookieOptions);

    // Trigger security alert email asynchronously
    EmailService.send(user.email, user.name, 'security', buildSecurityPayload(req, 'Password Auth'));

    // 10. send response with token in body as fallback for cross-origin issues
    return res.status(200).json({
      status: true,
      message: "User logged in successfully",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      }
    });
  } catch (error) {
    console.error("User login failed", error);
    return res.status(500).json({
      status: false,
      message: error.message,  // Show actual error message
      stack: error.stack        // Show stack trace
    });
  }
};
// get user profile controller
const getProfile = async (req, res) => {
  try {
    // 1. get user id from request object
    const userId = req.user.id;

    // 2. find user by id
    const user = await User.findById(userId).select("-password");

    // check if user exists
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }

    // 3. send response
    return res.status(200).json({
      status: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        isVerified: user.isVerified,
        role: user.role,
        subscription: user.subscription || { plan: 'FREE', status: 'ACTIVE' },
      },
    });
  } catch (error) {
    console.error("Error getting user profile", error);
    return res.status(500).json({
      status: false,
      message: "Error getting user profile",
    });
  }
};

// logout user controller
const logout = async (req, res) => {
  try {
    // 1. check if user is logged in
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
      });
    }

    // 2. clear cookie
    res.cookie("jwtToken", "", {
      expires: new Date(Date.now()), // set the cookie to expire immediately after logout
      httpOnly: true,
    });

    // 3. send response
    return res.status(200).json({
      status: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("User logout failed", error);
    return res.status(500).json({
      status: false,
      message: "User logout failed",
    });
  }
};

// Forgot Password -> Send OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: false, message: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send OTP via Webhook. Password reset must not claim success if email fails.
    const emailResult = await EmailService.send(
      user.email,
      user.name,
      'otp',
      buildSecurityPayload(req, 'Password Reset Request', {
        otp,
        expiresIn: '10 minutes',
      })
    );

    if (!emailResult.ok) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();

      return res.status(502).json({
        status: false,
        message: emailResult.skipped
          ? "Email service is not configured"
          : "Could not send OTP email. Please try again shortly.",
      });
    }

    return res.status(200).json({ status: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot password failed", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Reset Password with OTP
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ status: false, message: "All fields are required" });
  }

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ status: false, message: "Invalid or expired OTP" });
    }

    // Since we're changing password, we need to hash it.
    // userSchema has pre-save hook, so we just set it.
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    // Trigger security email
    EmailService.send(user.email, user.name, 'security', buildSecurityPayload(req, 'Password Reset via OTP'));

    return res.status(200).json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password failed", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    if (name) user.name = name;
    if (Object.prototype.hasOwnProperty.call(req.body, "avatar")) {
      user.avatar = avatar || null;
    }

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Update profile failed", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { registerUser, login, getProfile, logout, forgotPassword, resetPassword, updateProfile };
