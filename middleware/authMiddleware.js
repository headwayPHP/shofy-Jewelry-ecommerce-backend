const jwt = require("jsonwebtoken");
const User = require("../model/Admin.js"); // Adjust the path as needed

// Middleware to verify user authentication
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            console.log("Authenticated User:", req.user);

            token = req.headers?.authorization?.split(" ")?.[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password"); // Attach user info (excluding password)
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User not found" });
            }

            next(); // Proceed to the next middleware
        } catch (error) {
            console.log(error);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } else {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

// Middleware to check admin role
const adminOnly = (req, res, next) => {
    console.log(req.user);
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
};

module.exports = { protect, adminOnly };
