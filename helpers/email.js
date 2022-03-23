import nodemailer from "nodemailer"

export const emailRegistro = async (datos) => {

    const {email, nombre, token} = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    })

    // Informacion del email

    const info = await transport.sendMail({
        from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com',
        to: email,
        subject: "Uptask - Confirma tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${nombre}. Comprueba tu cuenta en Uptask</p>
        <p>Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:
        <a href="${process.env.FRONTED_URL}/confirmar/${token}">Confirmar cuenta</a></p>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje.
        `
    })
}

export const emailOlvidePassword = async (datos) => {

    const {email, nombre, token} = datos
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    })

    // Informacion del email

    const info = await transport.sendMail({
        from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com',
        to: email,
        subject: "Uptask - Restablece tu password",
        text: "Restablece tu password",
        html: `<p>Hola: ${nombre}. Has solicitado restablecer tu password.</p>
        <p>Sigue el siguiente enlace para restablecer tu password nueva:
        <a href="${process.env.FRONTED_URL}/olvide-password/${token}">Restablecer Password</a></p>
        <p>Si tu no solicistaste un cambio de contraseña, puedes ignorar el mensaje.
        `
    })
}