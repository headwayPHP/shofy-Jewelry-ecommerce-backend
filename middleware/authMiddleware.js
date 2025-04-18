const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin.js"); // Adjust the path as needed

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

const isAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    try {
        if (!authorization) {
            throw new Error("No authorization header");
        }

        const token = authorization.split(" ")[1];
        const decoded = jwt.verify(token, secret.token_secret);

        // Check if token exists in database
        const admin = await Admin.findOne({
            _id: decoded._id,
            'tokens.token': token
        });

        if (!admin) {
            throw new Error("Invalid or expired token");
        }

        req.user = decoded;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).send({
            message: err.message,
        });
    }
};


// Middleware to check admin role
const adminOnly = async (req, res, next) => {
    try {
        // First verify the token and get user info
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, secret.token_secret);

        // Check if token exists in database (prevent logout tokens from working)
        const admin = await Admin.findOne({
            _id: decoded._id,
            'tokens.token': token
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Only admins can access this resource"
            });
        }

        // Check admin role
        if (admin.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        // Attach admin to request for use in route handlers
        req.admin = admin;
        next();
    } catch (err) {
        // Handle different JWT errors specifically
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: err
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        // Other errors
        console.error("Admin middleware error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { protect, adminOnly, isAuth };