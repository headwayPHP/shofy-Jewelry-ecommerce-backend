const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { sendEmail } = require("../config/email");
const { generateToken, tokenForVerify } = require("../utils/token");
const { secret } = require("../config/secret");
const mongoose = require('mongoose');

// register user
// sign up
exports.signup = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      const saved_user = await User.create(req.body);
      const token = saved_user.generateConfirmationToken();

      await saved_user.save({ validateBeforeSave: false });

      const mailData = {
        from: secret.email_user,
        to: `${req.body.email}`,
        subject: "Email Activation",
        subject: "Verify Your Email",
        html: `<h2>Hello ${req.body.name}</h2>
        <p>Verify your email address to complete the signup and login into your <strong>shofy</strong> account.</p>
  
          <p>This link will expire in <strong> 10 minute</strong>.</p>
  
          <p style="margin-bottom:20px;">Click this link for active your account</p>
  
          <a href="${secret.client_url}/email-verify/${token}" style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>
  
          <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@shofy.com</p>
  
          <p style="margin-bottom:0px;">Thank you</p>
          <strong>shofy Team</strong>
           `,
      };
      const message = "Please check your email to verify!";
      // sendEmail(mailData, res, message);
      res.status(200).json({
        status: "success",
        message: "User creation request successfull.",
        data: {
          user: saved_user,
          token: token,
        },
      });
    }
  } catch (error) {
    next(error)
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password -confirmationToken -confirmationTokenExpires -passwordResetToken -passwordResetExpires -passwordChangedAt');
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Update a user

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID",
      });
    }

    const updates = req.body;

    // Log userId and updates for debugging
    console.log("User ID:", userId);
    console.log("Updates:", updates);

    // Ensure that the password is not updated directly through this endpoint
    if (updates.password) {
      return res.status(400).json({
        status: "fail",
        message: "Password cannot be updated through this endpoint.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password -confirmationToken -confirmationTokenExpires -passwordResetToken -passwordResetExpires -passwordChangedAt');

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};;;

// Get a particular user by ID
exports.getUserById = async (req, res, next) => {
  try {

    const userId = req.params.id;

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find the user by ID and exclude sensitive fields
    const user = await User.findById(userId).select(
      '-password -confirmationToken -confirmationTokenExpires -passwordResetToken -passwordResetExpires -passwordChangedAt'
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * 1. Check if Email and password are given
 * 2. Load user with email
 * 3. if not user send res
 * 4. compare password
 * 5. if password not correct send res
 * 6. check if user is active
 * 7. if not active send res
 * 8. generate token
 * 9. send user and token
 */
module.exports.login = async (req, res, next) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "No user found. Please create an account",
      });
    }

    const isPasswordValid = user.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        error: "Password is not correct",
      });
    }

    if (user.status != "active") {
      return res.status(401).json({
        status: "fail",
        error: "Your account is not active yet.",
      });
    }

    const token = generateToken(user);

    const { password: pwd, ...others } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      data: {
        user: others,
        token,
      },
    });
  } catch (error) {
    next(error)
  }
};

// confirmEmail
exports.confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid token",
      });
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);

    if (expired) {
      return res.status(401).json({
        status: "fail",
        error: "Token expired",
      });
    }

    user.status = "active";
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    const accessToken = generateToken(user);

    const { password: pwd, ...others } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Successfully activated your account.",
      data: {
        user: others,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error)
  }
};

// forgetPassword
exports.forgetPassword = async (req, res, next) => {
  try {
    const { verifyEmail } = req.body;
    console.log("Received password reset request for:", verifyEmail);

    const user = await User.findOne({ email: verifyEmail });

    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent"
      });
    }

    // Generate token & expiration time (10 minutes)
    const token = tokenForVerify(user);
    const resetLink = `${secret.client_url}/forget-password/${encodeURIComponent(token)}`;

    user.confirmationToken = token;
    user.confirmationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Email content
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; background: #fff; padding: 20px; margin: auto; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
            .header { font-size: 22px; font-weight: bold; color: #0989FF; text-align: center; }
            .content { font-size: 16px; color: #333; text-align: center; }
            .button {
                display: inline-block; padding: 12px 20px; background: #0989FF; color: #fff; 
                text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;
            }
            .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Password Reset Request</div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to proceed:</p>
                <p><a href="${resetLink}" class="button">Reset Password</a></p>
                <p><strong>This link expires in 10 minutes.</strong></p>
                <p>If you didn’t request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>If the button doesn’t work, use this link:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Email body
    const emailBody = {
      to: verifyEmail,
      subject: "Password Reset",
      html: emailHtml
    };

    await sendEmail(emailBody.to, emailBody.subject, "text", emailBody.html);

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent"
    });

  } catch (error) {
    console.error("Error in forgetPassword:", error);
    return res.status(500).json({
      message: "An error occurred. Please try again later."
    });
  }
};
;

// confirm-forget-password
exports.confirmForgetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid token",
      });
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);

    if (expired) {
      return res.status(401).json({
        status: "fail",
        error: "Token expired",
      });
    } else {
      const newPassword = bcrypt.hashSync(password);
      await User.updateOne(
        { confirmationToken: token },
        { $set: { password: newPassword } }
      );

      user.confirmationToken = undefined;
      user.confirmationTokenExpires = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: "success",
        message: "Password reset successfully",
      });
    }
  } catch (error) {
    next(error)
  }
};

// change password
exports.changePassword = async (req, res, next) => {
  try {
    const { email, token, newPassword, googleSignIn, password } = req.body;

    // Basic validation
    if (!email || !newPassword || (googleSignIn ? false : !password && !token)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid reset link or user not found" });
    }

    if (googleSignIn) {
      // Directly update password for Google sign-in users
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ message: "Password changed successfully" });
    }

    // Token validation (for reset password flow)
    if (token) {
      if (!user.confirmationToken ||
        user.confirmationToken !== token ||
        new Date() > new Date(user.confirmationTokenExpires)) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }
    } else {
      // Check if the old password is correct (for normal password change)
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully. You can now log in with your new password."
    });

  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      message: "An error occurred while changing the password."
    });
  }
};
;

// update a profile
// exports.updateUser = async (req, res, next) => {
//   try {
//     const userId = req.body.id
//     const user = await User.findById(userId);
//     if (user) {
//       user.name = req.body.name;
//       user.email = req.body.email;
//       user.phone = req.body.phone;
//       user.address = req.body.address;
//       user.bio = req.body.bio;
//       const updatedUser = await user.save();
//       const token = generateToken(updatedUser);
//       res.status(200).json({
//         status: "success",
//         message: "Successfully updated profile",
//         data: {
//           user: updatedUser,
//           token,
//         },
//       });
//     }
//   } catch (error) {
//     next(error)
//   }
// };

// signUpWithProvider
exports.signUpWithProvider = async (req, res, next) => {
  try {
    const user = jwt.decode(req.params.token);
    const isAdded = await User.findOne({ email: user.email });
    if (isAdded) {
      const token = generateToken(isAdded);
      res.status(200).send({
        status: "success",
        data: {
          token,
          user: {
            _id: isAdded._id,
            name: isAdded.name,
            email: isAdded.email,
            address: isAdded.address,
            phone: isAdded.phone,
            imageURL: isAdded.imageURL,
            googleSignIn: true,
          },
        },
      });
    } else {
      const newUser = new User({
        name: user.name,
        email: user.email,
        imageURL: user.picture,
        status: 'active'
      });

      const signUpUser = await newUser.save();
      // console.log(signUpUser)
      const token = generateToken(signUpUser);
      res.status(200).send({
        status: "success",
        data: {
          token,
          user: {
            _id: signUpUser._id,
            name: signUpUser.name,
            email: signUpUser.email,
            imageURL: signUpUser.imageURL,
            googleSignIn: true,
          }
        },
      });
    }
  } catch (error) {
    next(error)
  }
};
