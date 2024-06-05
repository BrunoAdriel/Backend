const { Router } = require('express');
const { createTicket, resolveTicket } = require('../controller/ticket.controller');

const router = Router();

router.get('/controler', createTicket)
router.post('/:id/purchase', resolveTicket)

module.exports = router;