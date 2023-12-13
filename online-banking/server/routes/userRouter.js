const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')

router.post('/login', userController.login)
router.post('/register', userController.registration)
// router.get('/', userController.getAllUsers)
router.get('/collecting/:phone', userController.getUserByPhone)
router.get('/collecting/id/:id', userController.getUserById)

module.exports = router
