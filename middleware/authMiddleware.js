const jwt = require("jsonwebtoken");
const User = require("../model/Admin.js"); // Adjust the path as needed

const { secret } = require("../config/secret");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract the token
            token = req.headers.authorization.split(" ")[1];

            // Verify the token
            const decoded = jwt.verify(token, secret.token_secret);

            // Attach user to the request object
            req.user = decoded;

            // Proceed to the next middleware
            next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } else {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};


// Middleware to check admin role
const adminOnly = (req, res, next) => {
    // Check if the user is authenticated and has the "admin" role
    if (req.user && req.user.role === "Admin") {
        next(); // Allow access
    } else {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
};

module.exports = { protect, adminOnly };