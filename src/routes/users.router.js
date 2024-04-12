const { Router } = require('express')

const router = Router()

const users =[

]

router.get('/', (_,res)=>{
    res.status(201).json(users)
})

router.post('/', (req,res)=>{
    const user = req.body
    user.id= Number.parseInt(Math.random()*100)
    
    
    users.push(user)
    res.status(201).json(user)
})

module.exports = router