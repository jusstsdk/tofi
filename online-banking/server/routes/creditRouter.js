const Router = require('express')
const router = new Router()
const creditController = require('../controllers/creditController')

router.get('/user/:id', creditController.getAllUserCredits)
router.post('/create', creditController.createCredit)
router.post('/pay', creditController.payCredit)

module.exports = router
