const { Router } = require('express')
const fs = require('fs').promises;

const router = Router()

router.get('/carts/:cid', async (req, res) => {
    try {
        const cid = parseInt(req.params.cid)
        const carritoData = await fs.promises.readFile(__dirname + '/../carrito.json', 'utf-8');
        const carrito = JSON.parse(carritoData)

        if (carrito.id === cid) {
            return res.json(carrito.products)
        } else {
            console.log('No se encontró el carrito')
            return res.status(404).json({ message: 'No se encontró el carrito' })
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
});
