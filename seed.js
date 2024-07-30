// seed.js
const bcrypt = require('bcrypt');
const User = require('./models/user');
const sequelize = require('./db.config'); // Adjust the path to your sequelize configuration file

async function seedAdminUser() {
    const username = 'admin';
    const email = 'admin@example.com';
    const password = '12345';
    const role = 'admin';
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the user
        await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            description: 'Admin User',
            profileImageUrl: null,
            divisionId: null
        });
        
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        // Close the database connection
        await sequelize.close();
    }
}

seedAdminUser();
