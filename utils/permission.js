const { expressjwt } = require('express-jwt')

/**
 * token验证函数
 *
 */
exports.tokenAuth = expressjwt({
  secret: process.env['SIGN_KEY'], // 签名的密钥
  algorithms: ['HS256'],
  credentialsRequired: true
}).unless({
  path: ['/api/admin/login']
})
