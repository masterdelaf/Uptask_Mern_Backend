import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js"

const registrar = async (req, res) => {
    // Evitar registros duplicados
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email })

    if(existeUsuario){
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()

        // Enviar email de verificacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({ msg: "Usuario creado correctamente. Revisa tu email para confirmar tu cuenta." })
    } catch (error) {
        console.log(error)
    }
}

const autenticar = async (req, res) => {
    const { email, password } = req.body
    // Comprobar que el usuario existe
    const usuario = await Usuario.findOne({email})
    if(!usuario) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({ msg: error.message })
    }
    // Comprobar si el usuario ha confirmado
    if(!usuario.confirmado) {
        const error = new Error("La cuenta no ha sido confirmada")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobar su password
    if(await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    }else{
        const error = new Error("Contraseña incorrecta")
        return res.status(404).json({ msg: error.message })
    }
}

const confirmar = async (req, res) => {
    // Seleccionamos el campo token de la peticion
    const { token } = req.params
    // Buscamos el compo token en el modelo de Usuario
    const usuarioConfirmar = await Usuario.findOne({ token })

    // Si no existe usuario devolvemos token no valido
    if(!usuarioConfirmar){
        const error = new Error("Token no válido")
        return res.status(403).json({ msg: error.message })
    }

    try {
        // Ponemos confirmado a true
        usuarioConfirmar.confirmado = true
        // Vaciamos el token porque es de un solo uso
        usuarioConfirmar.token = ''
        // Lo guardamos en la BD
        await usuarioConfirmar.save()
        // Devolvemos mensaje de que se ha guardado correctamente
        res.json({ msg: "Usuario Confirmado correctamente" })
                
    } catch (error) {
        console.log(error)
    }
}

const olvidePassword = async ( req, res ) => {
    // Extraemos email de la peticion
    const { email } = req.body
    // buscamos usuario por email en el modelo
    const usuario = await Usuario.findOne({email})
    if(!usuario) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({ msg: error.message })
    }

    try {
        // Si todo ha ido bien generar el token
        usuario.token = generarId()
        // guardar en la BD
        await usuario.save()
        // Enviar Email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        // Enviar mensaje al fronted de que se realizado correctamente
        res.json({ msg: 'Hemos enviado un email con las instrucciones' })
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async ( req, res ) => {
    // Extraer token de la url se hace con "params"
    const { token } = req.params
    // Buscamos el token en la BD
    const tokenValido = await Usuario.findOne({ token })

    if(tokenValido){
        res.json({ msg: 'Token valido y el usuario existe' })
    }else{
        const error = new Error("Token no valido")
        return res.status(404).json({ msg: error.message })
    }

}

const nuevoPassword = async ( req, res ) => {
    const { token } = req.params
    const { password } = req.body

    // Buscamos el token en la BD
    const usuario = await Usuario.findOne({ token })

    

    if(usuario){
        usuario.password = password
        usuario.token = ''
        try {
            await usuario.save()
            res.json({ msg: "password modificado correctamente" })
        } catch (error) {
            console.log(error)
        }
        
    }else{
        const error = new Error("Token no valido")
        return res.status(404).json({ msg: error.message })
    }
}

const perfil = async (req, res) => {
    const {usuario} = req

    res.json(usuario)
}

export {registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil}