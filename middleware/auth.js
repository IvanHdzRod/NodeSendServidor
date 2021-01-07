const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variable.env' });

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (authHeader) {
        // Obtener el Token
        const token = authHeader.split(' ')[1]

        // Comprobar jwt
        try {
            const usuario = jwt.verify(token, process.env.SECRET);
            req.usuario = usuario;
        } catch (error) {
            console.log(error);
            console.log('JWT no válido');
        }

    }
    return next();
}