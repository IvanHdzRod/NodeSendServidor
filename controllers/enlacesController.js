const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variable.env' });

exports.nuevoEnlace = async (req, res, next) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    // Crea un objeto de Enlace
    const { nombre_original, nombre } = req.body;

    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;


    // Si el usuario esta autenticado
    if (req.usuario) {
        const { password, descargas } = req.body;

        // Asignar a enlace el número de descargas
        if (descargas) {
            enlace.descargas = descargas;
        }

        // Asignar el password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }

        // Asignar el autor
        enlace.autor = req.usuario.id;

    }

    // Almacenar en BD
    try {
        await enlace.save();
        res.json({ msg: `${enlace.url}` });
        next();
    } catch (error) {
        console.log(error);
    }
}

// Obtiene un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
    try {
        const enlaces = await Enlaces.find({}).select('url -_id');
        res.json({ enlaces });
    } catch (error) {
        console.log(error);
    }
}

// retorna si el enlace tiene pass
exports.tienePassword = async (req, res, next) => {
    const { url } = req.params;

    // Verificar si existe el enlace 
    const enlace = await Enlaces.findOne({ url });

    if (!enlace) {
        res.status(404).json({ msg: 'Este enlace no existe' });
        return next();
    }

    if (enlace.password) {
        return res.json({ password: true, enlace: enlace.url });
    }

    next();
}

// verificar si el password es corecto
exports.verificarPassword = async (req, res, next) => {

    const { url } = req.params;

    const { password } = req.body;

    // consultar por enlace 
    const enlace = await Enlaces.findOne({ url });

    // verificar pass
    if (bcrypt.compareSync(password, enlace.password)) {
        // descargar archivo
        next();

    } else {
        return res.status(401).json({ msg: 'Password incorrecto' })
    }

}

// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {

    const { url } = req.params;

    // Verificar si existe el enlace 
    const enlace = await Enlaces.findOne({ url });

    if (!enlace) {
        res.status(404).json({ msg: 'Este enlace no existe' });
        return next();
    }

    // si el enlace existe
    res.json({ archivo: enlace.nombre, password: false })

    next();

}