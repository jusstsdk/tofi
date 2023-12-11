const Router = require('express')
const router = new Router()
const accountController = require('../controllers/accountController')

router.get('/:userid', accountController.getAllAccounts)
router.get('/byId/:id', accountController.getOneAccount)
router.post('/create', accountController.createAccount)

module.exports = router
