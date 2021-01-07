const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivosController');
const auth = require('../middleware/auth');

// api/archivos
router.post('/',
    auth,
    archivosController.subirArchivos
);

router.get('/:archivo',
    archivosController.descargar,
    archivosController.eliminarArchivos
)

module.exports = router;
