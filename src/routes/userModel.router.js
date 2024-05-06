const { Router } = require('express')
const  User  = require('../models/user.model')
const router = Router()


router.get('/', async(_, res)=>{
try{    
    const users = await User.find({})
    res.json(users)
}catch(error){
    res.status(500).json({ message : error.message })
}
})


router.post('/', async(req, res)=>{
    const{name, last_name, email, password} = req.body
    try{    
        const result = await User.create({
            firstName: name,
            lastName: last_name,
            email,
            password
        })
        res.json(result)
    }catch(error){
        res.status(400).json({ message : error.message })
    }
})

module.exports = router;