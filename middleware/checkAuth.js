import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
    let token;
    if(
        //Se envía el token por el metodo "Bearer"
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            //Se separa con la funcion split para obtener solo el token y quitar la palabra "Bearer"    
            token = req.headers.authorization.split(" ")[1]
            //Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //Selecciona el usuario quitando varios campos como password, confirmado ...
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v")
            //Salta al siguiente middleware
            return next()
        } catch (error) {
            return res.status(404).json({ msg: "Hubo un error" })
        }
    }

    if(!token) {
        const error = new Error('Token no valido')
        res.status(401).json({ msg: error.message })
    }

    next()
}

export default checkAuth