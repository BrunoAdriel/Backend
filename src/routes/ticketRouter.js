const { Router } = require('express');
const { createTicket, resolveTicket } = require('../controller/ticket.controller');

const router = Router();

// ruta para la pagina del form id ticket
router.get('/purchase', (_,res)=>{
    res.render('ticketIdForm')
})

router.get('/controler', createTicket)
router.post('/purchase', resolveTicket)

module.exports = router;