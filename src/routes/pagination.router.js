const { Router } = require('express')
const prodModel = require('../models/products.model')
const router = Router()
const fs = require('fs');

router.get('/', async (req,res)=>{
    const page = req.query.page || 1
    let sortOption = {};
    if (req.query.price === 'asc') {
        sortOption = { price: 1 };
    } else if (req.query.price === 'desc') {
        sortOption = { price: -1 };
    }
    const products = await prodModel.paginate({}, { limit: 3, page, lean: true, sort: sortOption });
    res.render('pagination',{
        title:'Paginacion',
        products
    })
})

// agregar alcarritocon el boton
router.post('/:id', async (req,res)=>{
    try{
        const manager = req.app.get('productManager')
        await manager.getProductById(req.params.id)
        await fs.promises.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));
        res.status(200).json({success: true})
    }catch(error){
        return res.status(500).json({success:false})
    }
})

module.exports = router