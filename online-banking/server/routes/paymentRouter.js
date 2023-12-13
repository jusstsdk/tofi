const Router = require('express')
const router = new Router()
const paymentController = require('../controllers/paymentController')

router.get('/user/:id', paymentController.getAllUserPayments)
router.post('/create', paymentController.createPayment)

module.exports = router
