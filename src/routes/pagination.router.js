const { Router } = require('express')
const prodModel = require('../models/products.model')
const router = Router()

router.get('/', async (req,res)=>{
    const page = req.query.page || 1
    const products = await prodModel.paginate({}, {limit:3, page, lean: true})
    res.render('pagination',{
        title:'Paginacion',
        products
    })
})


module.exports = router