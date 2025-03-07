const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controller/user.controller');


// 🔹 Configure Multer storage (Optional: If you want to store files on disk)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files in "uploads/" folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    },
});

// 🔹 Initialize Multer (For file storage or memory)
const upload = multer({ storage: storage });


// add a user
router.post("/signup", userController.signup);
// login
router.post("/login", userController.login);
// forget-password
router.patch('/forget-password', userController.forgetPassword);
// confirm-forget-password
router.patch('/confirm-forget-password', userController.confirmForgetPassword);
// change password
router.patch('/change-password', userController.changePassword);
// confirmEmail
router.get('/confirmEmail/:token', userController.confirmEmail);
// updateUser
router.put('/update-user/:id', userController.updateUser);
// register or login with google
router.post("/register/:token", userController.signUpWithProvider);

router.get('/hello', (req, res) => {
    res.send('Hello World')
})

// Get all users
router.get('/all', userController.getAllUsers); // for admins only


// Get a particular user by ID
router.get('/:id', userController.getUserById);

// Update a user
router.put('/update/:id', userController.updateUser);

module.exports = router;

// email , name, subject, message , remember: boolean
