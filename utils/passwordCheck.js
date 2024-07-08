const bcrypt = require('bcrypt')   
const ModelUser = require('../models/user')

const passwordCheck = async (email, password) => {
    const dataUser = await ModelUser.findOne({ where: { email } });
    if (!dataUser) {
      return { compare: false, dataUser: null, message: 'User not found' };
    }
    const compare = await bcrypt.compare(password, dataUser.password);
    return { compare, dataUser, message: compare ? 'Password matches' : 'Incorrect password' };
};

module.exports = passwordCheck 