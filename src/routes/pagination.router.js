const { Router } = require('express')
const prodModel = require('../models/products.model')
const router = Router()


router.get('/', async (req,res)=>{
    const page = req.query.page || 1
    const query = {};
    let sortOption = {};
    if (req.query.price === 'asc') {
        sortOption = { price: 1 };
    } else if (req.query.price === 'desc') {
        sortOption = { price: -1 };
    }
    if (req.query.title){
        query.title = { $regex: '^' + req.query.title, $options: 'i' }
    }
    const products = await prodModel.paginate(query, { limit: 3, page, lean: true, sort: sortOption });
    res.render('pagination',{
        title:'Paginacion',
        products,
        scripts: [ 'pagination.js' ]
    })
})

// Agregar el producto aal carrito
// let carrito = [];


// router.post('/:id', async (req, res) => {
//     try {
//         const product = await prodModel.findById(req.params.id);
//         carrito.push(product); // Agregar el producto al carrito
//         res.status(200).json({ success: true, carrito });
//     } catch (error) {
//         console.error('Error al agregar producto al carrito:', error);
//         res.status(500).json({ success: false, error: 'Error al agregar producto al carrito' });
//     }
// });
// console.log(carrito)
module.exports = router