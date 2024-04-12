const { Router } =require('express')   

const router = Router()

// handle index
router.get('/', (_,res)=>{
    res.render('index', {
        title:'Mi pagina backend',
        name:'perri',
        useWS: true
    })
})

// Router register
router.get('/register', (_, res)=>{
    res.render('register', {
        title: 'Registro de usuarios'
    })
})


// Router chat

router.get('/chat', (_, res)=>{
    res.render('chat',{
        useWS: true,
        scripts: [ 'index.js' ]
    })
})

module.exports = router