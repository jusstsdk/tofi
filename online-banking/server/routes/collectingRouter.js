const Router = require('express')
const router = new Router()
const collectingController = require('../controllers/collectingController')

router.get('/:user_id', collectingController.getAllUserCollectings)
router.get('/details/:id', collectingController.getOneCollecting)
router.post('/create', collectingController.createCollecting)

module.exports = router
