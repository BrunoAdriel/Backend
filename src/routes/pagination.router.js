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

module.exports = router