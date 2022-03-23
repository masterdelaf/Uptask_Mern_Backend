import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tarea.js'

const agregarTarea = async (req, res) => {
    const {proyecto} = req.body
    
    const existeProyecto = await Proyecto.findOne({proyecto})
    
    if(!existeProyecto) {
        const error = new Error('EL proyecto no existe')
        return res.status(404).json({ msg: error.message })
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos para añadir tareas')
        return res.status(403).json({ msg: error.message })
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        // ALmacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}
const obtenerTarea = async (req, res) => {
    const {id} = req.params
    // Con la opcion populate se puede cruzar la información y obtener también los datos del proyecto
    const tarea = await Tarea.findById(id).populate("proyecto")

    if(!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message }) 
    }

    // Aquí ya puedo comprobar que el creador sea el que está obtiendo la tarea con "proyecto.creador"
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }

    res.json(tarea)
}
const actualizarTarea = async (req, res) => {
    const {id} = req.params
    // Con la opcion populate se puede cruzar la información y obtener también los datos del proyecto
    const tarea = await Tarea.findById(id).populate("proyecto")

    if(!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message }) 
    }

    // Aquí ya puedo comprobar que el creador sea el que está obtiendo la tarea con "proyecto.creador"
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}
const eliminarTarea = async (req, res) => {
    const {id} = req.params
    // Con la opcion populate se puede cruzar la información y obtener también los datos del proyecto
    const tarea = await Tarea.findById(id).populate("proyecto")

    if(!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message }) 
    }

    // Aquí ya puedo comprobar que el creador sea el que está obtiendo la tarea con "proyecto.creador"
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }

    try {
        // Aqui hay que eliminar las tareas tanto de proyecto como la tarea en sí
        //Busco el proyecto por ID
        const proyecto = await Proyecto.findById(tarea.proyecto)
        // Borra la tarea del proyecto
        proyecto.tareas.pull(tarea._id)
        // Para realizar dos await en paralelo se hace con Promise
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        res.json({ msg: 'Tarea eliminada'})
    } catch (error) {
        console.log(error)
    }
}
const cambiarEstado = async (req, res) => {
    const {id} = req.params
    // Con la opcion populate se puede cruzar la información y obtener también los datos del proyecto
    const tarea = await Tarea.findById(id).populate("proyecto")

    if(!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message }) 
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString() )){
        const error = new Error("Acción no válida")
        return res.status(401).json({ msg: error.message})
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id)
        .populate("proyecto")
        .populate("completado")
        
    res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}