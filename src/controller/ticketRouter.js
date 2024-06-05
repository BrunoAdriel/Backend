const { Router } = require('express');
const { createTicket } = require('./ticket.controller');

const router = Router();

router.get('/controler', createTicket);

module.exports = router;