const { Router } = require('express')
// esto devuelve lo que este exportando el archivo index
const { User } = require('../models')

const router = Router()


router.get('/', async(_, res)=>{
    
try{    
    const users = await User.find({})
    res.json(users)
}catch(error){
    res.status(500).json({ message : error.message })
}
})

router.get('/:id', async(req, res)=>{
    
    try{    
        const user = await User.findOne({_id: req.params.id})
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        res.json(user)
    }catch(error){
        res.status(500).json({ message : error.message })
    }
})

router.post('/', async(req, res)=>{
    const{firstName, lastName, email} = req.body
try{    
    const result = await User.create({
        firstName,
        lastName,
        email
})

    res.json(result)
}catch(error){
    res.status(400).json({ message : error.message })
}
})


module.exports = router