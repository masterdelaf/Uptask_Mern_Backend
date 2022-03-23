import mongoose from "mongoose";
import bcrypt from "bcrypt"

const usuarioSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true 
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        token: {
            type: String
        },
        confirmado: {
            type: Boolean,
            default: false
        }
    },
    {
    timestaps: true
    }
)

// Esta funcion "pre" es propia de mongoose para ejecutar algo previo al save
usuarioSchema.pre('save', async function(next){
    //Revisa que el password no haya sido cambiado, por si el usuario cambia la password en el perfil
    if(!this.isModified('password')){
        //Next hace que salte al siguiente middleware sin que se detenga la ejecución como haría return
        next()
    }
    //Dar 10 saltos al password y hashearla
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema)
export default Usuario