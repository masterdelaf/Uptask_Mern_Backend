import express from "express";
const router = express.Router()

import { registrar, 
        autenticar, 
        confirmar, 
        olvidePassword, 
        comprobarToken, 
        nuevoPassword, 
        perfil } from "../controllers/usuarioController.js"

import checkAuth from '../middleware/checkAuth.js'

// Autenticacion, registro y confirmación de usuarios
router.post('/', registrar) // Crea un nuevo usuario
router.post('/login', autenticar) //Autenticar usuario
router.get('/confirmar/:token', confirmar) // Confirmar usuario
router.post('/olvide-password', olvidePassword) // Olvido password
// De esta forma en la misma ruta podemos llamar a dos metodos diferentes
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)
// Para acceder al perfil, primero vemos si usuario está autenticado con checkAuth y después pasamos a perfil
router.get('/perfil', checkAuth, perfil) 

export default router