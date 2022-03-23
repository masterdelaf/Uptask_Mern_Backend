import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js"
import proyectoRoutes from "./routes/proyectoRoutes.js"
import tareaRoutes from "./routes/tareaRoutes.js"


const app = express()
// Para poder trabajar con JSON
app.use(express.json())

// Para utilizar el fichero .env de variables de entorono
dotenv.config()

// Conexión a la base de datos
conectarDB()

// Configurar CORS
const whitelist = [process.env.FRONTED_URL]

const corsOptions = {
    origin: function (origin, callback) {
        if(whitelist.includes(origin)) {
            //Puede consultar la API
            callback(null, true)
        }else {
            // No puede consultar la API
            callback(new Error("Error de cors"))
        }
    }
}

app.use(cors(corsOptions))

// Routing
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

// Puerto de conexión, variable de entorno en produccion y 4000 en local
const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`)
})

// Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTED_URL,
    }
})

io.on('connection', (socket) => {

    // Definir los eventos de socket io
    socket.on('abrir proyecto', (proyecto) => {
        // El join es para establece una "sala" o "habitacion" para comunicar con ese socket
        socket.join(proyecto)
    })

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})