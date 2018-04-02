const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');


router.use(auth.profileUse);
// Register user
router.post('/register', auth.register);

// Check Email
router.get('/checkEmail/:email', auth.checkEmail);

// Check Username
router.get('/checkUsername/:username', auth.checkUsername);

// Login User
router.post('/login', auth.login);

// Get user
router.get('/profile', auth.getProfile);

// get Public Profile
router.get('/publicProfile/:username', auth.publicProfile);

//Get All Users
router.get('/getAllUsers',auth.getAllUsers);


module.exports = router;