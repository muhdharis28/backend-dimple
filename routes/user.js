const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const ModelUser = require('../models/user');
const passwordCheck = require('../utils/passwordCheck');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { compare, dataUser, message } = await passwordCheck(email, password);

        if (!dataUser) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        if (!compare) {
            return res.status(400).json({
                status: 400,
                message: 'Incorrect password',
            });
        }

        res.status(200).json({
            status: 200,
            data: dataUser,
            message: 'Login successful',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await ModelUser.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: 'User already exists',
            });
        }

        // Encrypt password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await ModelUser.create({
            username,
            email,
            password: encryptedPassword,
        });

        res.status(200).json({
            status: 200,
            data: user,
            metadata: 'User added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint Method Put / Update Data User
router.put('/profile', async (req, res) => {
    const { username, email, description } = req.body;

    try {
        const [updated] = await ModelUser.update({
            username,
            email,
            description,
        }, {
            where: { email }
        });

        if (updated) {
            res.status(200).json({
                status: 200,
                message: 'User updated successfully',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint to update the user's password
router.put('/password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            status: 400,
            message: 'New password and confirm password do not match',
        });
    }
    
    try {
        const user = await ModelUser.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
        
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.password = encryptedPassword;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint to get user profile
router.get('/profile', async (req, res) => {
    const { email } = req.query;
    
    try {
        const user = await ModelUser.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                username: user.username,
                email: user.email,
                description: user.description,
                profileImageUrl: user.profileImageUrl,
            },
            message: 'User profile fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint Method Delete / Delete Data User
router.delete('/', async (req, res) => {
    const { email } = req.body;

    try {
        const deleted = await ModelUser.destroy({
            where: { email }
        });

        if (deleted) {
            res.status(200).json({
                status: 200,
                message: 'User deleted successfully',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Upload profile image
router.put('/profile/image', upload.single('profileImage'), async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                status: 400,
                message: 'Email is required',
            });
        }
        
        const user = await ModelUser.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
        
        user.profileImageUrl = `/uploads/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            status: 200,
            data: user,
            message: 'Profile image updated successfully',
        });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

module.exports = router;
