const jwt = require('jsonwebtoken');

module.exports = (_id, role) => {
    const token = jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '3d' });
    return token;
}