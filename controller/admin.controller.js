const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const jwt = require('jsonwebtoken');
const { tokenForVerify } = require("../config/auth");
const Admin = require("../model/Admin");
const { generateToken } = require("../utils/token");
const { invalidateToken } = require("../config/auth");
const { sendEmail } = require("../config/email");
const { secret } = require("../config/secret");
const { validationResult } = require('express-validator');

// const multer = require('multer');

// // Multer config (same as your category setup)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'public/uploads'),
//   filename: (req, file, cb) => cb(null, file.originalname),
// });
// const upload = multer({ storage });

const logoutAdmin = async (req, res) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token to get the decoded payload
    const decoded = jwt.verify(token, secret.token_secret);

    // Find admin by ID from the token
    const admin = await Admin.findById(decoded._id);

    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Invalidate the token
    await invalidateToken(admin, token);

    res.status(200).send({
      message: "Logged out successfully"
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "An error occurred during logout"
    });
  }
};

// @route   GET /api/admin/profile/:id
// @desc    Get admin profile by ID
// @access  Private (ideally token-protected)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password -tokens -confirmationToken -confirmationTokenExpires');

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found"
      });
    }
    admin.image = `${process.env.ADMIN_URL}${admin.image}`; // Adjust based on your server setup

    res.status(200).json({
      status: true,
      message: "Admin profile fetched successfully",
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @route   PUT /api/admin/profile/:id
// @desc    Update admin profile
// @access  Private
const updateAdminProfile = async (req, res) => {
  try {
    const updateFields = {
      name: req.body.name,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      phone: req.body.phone,
      status: req.body.status,
      joiningDate: req.body.joiningDate
    };

    if (req.file) {
      updateFields.image = `images/${req.file.filename}`; // adjust path based on how you serve public folder
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password -tokens');

    if (!updatedAdmin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedAdmin
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Update failed",
      error: error.message
    });
  }
};



// register
const registerAdmin = async (req, res, next) => {
  try {
    // console.log(req.body);
    const isAdded = await Admin.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(403).send({
        message: "This Email already Added!",
      });
    } else {

      // console.log(req.body);
      const newStaff = new Admin({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: bcrypt.hashSync(req.body.password),
      });
      const staff = await newStaff.save();
      const token = generateToken(staff);
      res.status(200).send({
        token,
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        joiningData: Date.now(),
      });
    }
  } catch (err) {
    // console.log(err);
    next(err)
  }
};
// login admin

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).send({
        status: false,
        message: "Invalid Email or password!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        status: false,
        message: "Invalid Email or password!",
      });
    }

    const token = generateToken(admin);

    // Store the token (with optional max token cap)
    admin.tokens.push({ token });
    await admin.save();

    return res.send({
      status: true,
      message: "Login successful",
      data: {
        token,
        _id: admin._id,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        image: admin.image,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};




// const loginAdmin = async (req, res, next) => {
//   try {
//     console.log("Request Body:", req.body);

//     const admin = await Admin.findOne({ email: req.body.email });
//     if (admin && bcrypt.compareSync(String(req.body.password), admin.password)) {
//       const token = generateToken(admin);
//       res.send({
//         token,
//         _id: admin._id,
//         name: admin.name,
//         phone: admin.phone,
//         email: admin.email,
//         image: admin.image,
//         role: admin.role,
//       });
//     } else {
//       res.status(401).send({ message: "Invalid Email or password!" });
//     }
//   } catch (err) {
//     next(err);
//   }
// };


// const loginAdmin = async (req, res, next) => {
//   console.log("Request Body:", req.body);

//   try {
//     console.log("Request Body:", req.body);

//     const admin = await Admin.findOne({ email: req.body.email });
//     // console.log(admin)
//     if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
//       const token = generateToken(admin);
//       res.send({
//         token,
//         _id: admin._id,
//         name: admin.name,
//         phone: admin.phone,
//         email: admin.email,
//         image: admin.image,
//         role: admin.role,
//       });
//     } else {

//       res.status(401).send({
//         message: "Invalid Email or password!",
//       });
//     }
//   } catch (err) {
//     next(err)
//   }
// };
// forget password
// const forgetPassword = async (req, res, next) => {
//   try {

//     const { email } = req.body;
//     // console.log('email--->',email)
//     const admin = await Admin.findOne({ email: email });
//     if (!admin) {
//       return res.status(404).send({
//         message: "Admin Not found with this email!",
//       });
//     } else {
//       const token = tokenForVerify(admin);
//       const body = {
//         from: secret.email_user,
//         to: `${email}`,
//         subject: "Password Reset",
//         html: `<h2>Hello ${email}</h2>
//         <p>A request has been received to change the password for your <strong>Shofy</strong> account </p>

//         <p>This link will expire in <strong> 10 minute</strong>.</p>

//         <p style="margin-bottom:20px;">Click this link for reset your password</p>

//         <a href=${secret.admin_url}/forget-password/${token} style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>

//         <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@shofy.com</p>

//         <p style="margin-bottom:0px;">Thank you</p>
//         <strong>Shofy Team</strong>
//         `,
//       };
//       admin.confirmationToken = token;
//       const date = new Date();
//       date.setDate(date.getDate() + 1);
//       admin.confirmationTokenExpires = date;
//       await admin.save({ validateBeforeSave: false });
//       const message = "Please check your email to reset password!";
//       sendEmail(body, res, message);
//     }
//   } catch (error) {
//     next(error)
//   }
// };

// const forgetPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     console.log("Email:", email); // Debugging

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found with this email!" });
//     }

//     const token = tokenForVerify(admin);
//     const body = {
//       from: secret.email_user,
//       to: email,
//       subject: "Password Reset",
//       html: `<h2>Hello ${email}</h2>
//       <p>A request has been received to change the password for your <strong>Shofy</strong> account.</p>
//       <p>This link will expire in <strong>10 minutes</strong>.</p>
//       <p><a href=${secret.admin_url}/forget-password/${token} style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a></p>
//       <p>If you did not initiate this request, please contact support@shofy.com.</p>
//       <p>Thank you,<br><strong>Shofy Team</strong></p>`,
//     };

//     admin.confirmationToken = token;
//     admin.confirmationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // Expire in 10 minutes
//     await admin.save({ validateBeforeSave: false });

//     sendEmail(body, (error, info) => {
//       if (error) {
//         console.error("Email sending failed:", error);
//         return res.status(500).json({ message: "Email sending failed, try again later." });
//       }
//       return res.status(200).json({ message: "Please check your email to reset your password!" });
//     });

//   } catch (error) {
//     next(error);
//   }
// };

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log("Email:", email);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      // Don't reveal whether email exists for security
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent"
      });
    }

    // Generate token (ensure tokenForVerify creates a consistent token)
    const token = tokenForVerify(admin);
    const resetLink = `${secret.admin_url}change-password.html?email=${encodeURIComponent(email)}&token=${token}`;

    // Set expiration (10 minutes from now)
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10);

    admin.confirmationToken = token;
    admin.confirmationTokenExpires = expiration;
    await admin.save({ validateBeforeSave: false });

    const emailHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Password Reset</title>
    <style type="text/css">
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #0989FF; font-size: 24px; margin-bottom: 20px; }
        .button {
            display: inline-block;
            background-color: #0989FF;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #999999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Password Reset Request</div>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetLink}" class="button">Reset Password</a></p>
        <p><strong>This link expires in 10 minutes.</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <div class="footer">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetLink}</p>
        </div>
    </div>
</body>
</html>
`;

    // Email body
    const body = {
      to: email,
      subject: "Password Reset",
      html: emailHtml
    };

    await sendEmail(body.to, body.subject, "text", body.html);

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

const changePassword = async (req, res, next) => {
  try {
    const { email, token, newPass } = req.body;

    // Basic validation
    if (!email || !token || !newPass) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPass.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Invalid reset link" });
    }

    // Token validation
    if (!admin.confirmationToken ||
      admin.confirmationToken !== token ||
      new Date() > new Date(admin.confirmationTokenExpires)) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPass, 12);
    admin.password = hashedPassword;
    admin.confirmationToken = undefined;
    admin.confirmationTokenExpires = undefined;
    await admin.save();

    return res.status(200).json({
      message: "Password changed successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      message: "An error occurred while changing password"
    });
  }
};





// confirm-forget-password
const confirmAdminForgetPass = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const admin = await Admin.findOne({ confirmationToken: token });

    if (!admin) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid token",
      });
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);

    if (expired) {
      return res.status(401).json({
        status: "fail",
        message: "Token expired",
      });
    } else {
      const newPassword = bcrypt.hashSync(password);
      await Admin.updateOne(
        { confirmationToken: token },
        { $set: { password: newPassword } }
      );

      admin.confirmationToken = undefined;
      admin.confirmationTokenExpires = undefined;

      await admin.save({ validateBeforeSave: false });

      res.status(200).json({
        message: "Password reset successfully",
      });
    }
  } catch (error) {
    next(error)
  }
};

// change password
// const changePassword = async (req, res, next) => {
//   try {
//     const { email, token, newPass } = req.body;

//     const admin = await Admin.findOne({ email });

//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     // Check if token is valid
//     if (!admin.confirmationToken || admin.confirmationToken !== token || new Date() > admin.confirmationTokenExpires) {
//       return res.status(400).json({ message: "Invalid or expired reset token" });
//     }

//     // Hash new password and update
//     const hashedPassword = bcrypt.hashSync(newPass, 10);
//     await Admin.updateOne({ email }, { password: hashedPassword, confirmationToken: null, confirmationTokenExpires: null });

//     return res.status(200).json({ message: "Password changed successfully" });

//   } catch (error) {
//     next(error);
//   }
// };

// reset Password
const resetPassword = async (req, res) => {
  const token = req.body.token;
  const { email } = jwt.decode(token);
  const staff = await Admin.findOne({ email: email });

  if (token) {
    jwt.verify(token, secret.jwt_secret_for_verify, (err, decoded) => {
      if (err) {
        return res.status(500).send({
          message: "Token expired, please try again!",
        });
      } else {
        staff.password = bcrypt.hashSync(req.body.newPassword);
        staff.save();
        res.send({
          message: "Your password change successful, you can login now!",
        });
      }
    });
  }
};
// add staff
const addStaff = async (req, res, next) => {
  try {
    const isAdded = await Admin.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(500).send({
        message: "This Email already Added!",
      });
    } else {
      const newStaff = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
        phone: req.body.phone,
        joiningDate: req.body.joiningDate,
        role: req.body.role,
        image: req.body.image,
      });
      await newStaff.save();
      res.status(200).send({
        message: "Staff Added Successfully!",
      });
    }
  } catch (err) {
    next(err)
  }
};
// get all staff
const getAllStaff = async (req, res, next) => {
  try {
    const admins = await Admin.find({}).sort({ _id: -1 });
    res.status(200).json({
      status: true,
      message: 'Staff get successfully',
      data: admins
    });
  } catch (err) {
    next(err)
  }
};
// getStaffById
const getStaffById = async (req, res, next) => {
  // console.log('getStaffById',req.params.id)
  try {
    const admin = await Admin.findById(req.params.id);
    res.send(admin);
  } catch (err) {
    next(err)
  }
};
// updateStaff
const updateStaff = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.params.id });
    if (admin) {
      admin.name = req.body.name;
      admin.email = req.body.email;
      admin.phone = req.body.phone;
      admin.role = req.body.role;
      admin.joiningData = req.body.joiningDate;
      admin.image = req.body.image;
      admin.password =
        req.body.password !== undefined
          ? bcrypt.hashSync(req.body.password)
          : admin.password;
      const updatedAdmin = await admin.save();
      const token = generateToken(updatedAdmin);
      res.send({
        token,
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        image: updatedAdmin.image,
        phone: updatedAdmin.phone,
      });
    } else {
      res.status(404).send({
        message: "This Staff not found!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
// deleteStaff
const deleteStaff = async (req, res, next) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: 'Admin Deleted Successfully',
    });
  } catch (err) {
    next(err)
  }
};

const updatedStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;

    await Admin.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: newStatus,
        },
      }
    );
    res.send({
      message: `Store ${newStatus} Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  forgetPassword,
  resetPassword,
  addStaff,
  getAllStaff,
  getStaffById,
  logoutAdmin,
  updateStaff,
  deleteStaff,
  updatedStatus,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  confirmAdminForgetPass,
};
