const Router = require('express')
const router = new Router()
const accountRouter = require('./accountRouter')
const collectingRouter = require('./collectingRouter')
const paymentRouter = require('./paymentRouter')
const userRouter = require('./userRouter')

router.use('/account', accountRouter)
router.use('/payment', paymentRouter)
router.use('/collecting', collectingRouter)
router.use('/user', userRouter)

module.exports = router
