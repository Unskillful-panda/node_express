const logger = require('../utils/logger')

class Base {
  constructor() {}

  // TODO: 异常处理
  handleException(req, res, e) {
    logger.error(e)
    res.status(500).sendResultAto({
      code: '500',
      data: { code: e.code, errno: e.errno, sqlMessage: e.sqlMessage },
      msg: '服务器内部错误'
    })
  }
}

module.exports = Base
