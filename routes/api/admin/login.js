const express = require('express')
const router = express.Router()
const User = require('../../../controllers/UserControllers')

// 登录
router.post('/', User.login)

module.exports = router
