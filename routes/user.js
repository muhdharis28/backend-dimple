const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const ModelUser = require('../models/user');
const Division = require('../models/division');
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

// Endpoint to get users by division
router.get('/by-division', async (req, res) => {
    const { divisionId } = req.query;

    try {
        const divisionRecord = await Division.findOne({ where: { id: divisionId } });

        if (!divisionRecord) {
            return res.status(404).json({
                status: 404,
                message: 'Division not found',
            });
        }
        
        const users = await ModelUser.findAll({
            where: { divisionId: divisionRecord.id },
            include: [{ model: Division, as: 'division' }]
        });
        res.status(200).json({
            status: 200,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users by division:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

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

        // Assuming dataUser contains the role
        res.status(200).json({
            status: 200,
            data: {
                id: dataUser.id,
                username: dataUser.username,
                email: dataUser.email,
                role: dataUser.role,  // Include the role in the response
            },
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/register', async (req, res) => {
    const { username, email, password, divisionName } = req.body;

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
        const divisionRecord = await Division.findOne({ where: { name: divisionName } });
        // Create new user
        const user = await ModelUser.create({
            username,
            email,
            password: encryptedPassword,
            divisionId: divisionRecord.id
        });

        res.status(200).json({
            status: 200,
            data: user,
            message: 'User added successfully',
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
    const { username, email, newEmail, description } = req.body;
    
    try {
        // Find the user by the current email
        const user = await ModelUser.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        // Check if the new email is already in use by another user
        if (newEmail) {
            const emailExists = await ModelUser.findOne({ where: { email: newEmail } });
            if (emailExists && emailExists.id !== user.id) {
                return res.status(400).json({
                    status: 400,
                    message: 'Email already in use by another user',
                });
            }

            user.email = newEmail; // Update to the new email
        }

        // Update other user details
        user.username = username || user.username;
        user.description = description || user.description;

        // Save the updated user profile
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'User updated successfully',
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
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
        const user = await ModelUser.findOne({
            where: { email },
            include: [{ model: Division, as: 'division' }]
        });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not founds',
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                username: user.username,
                email: user.email,
                description: user.description,
                profileImageUrl: user.profileImageUrl,
                division: user.division ? user.division.name : null,
                role: user.role
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

router.get('/list', async (req, res) => {
    try {
        const users = await ModelUser.findAll({include: [{ model: Division, as: 'division' }]});
        res.status(200).json({
            status: 200,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Update user role
router.put('/update-role', async (req, res) => {
    const { userId, role } = req.body;

    try {
        const user = await ModelUser.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'Role updated successfully',
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Fetch user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await ModelUser.findOne({ where: { id }, include: [{ model: Division, as: 'division' }] });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: 200,
            data: user,
            message: 'User details fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Update user by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const [updated] = await ModelUser.update({ role: role || 'default' }, { where: { id } });

        if (updated) {
            const user = await ModelUser.findOne({ where: { id } });

            res.status(200).json({
                status: 200,
                message: 'User role updated successfully',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

module.exports = router;
