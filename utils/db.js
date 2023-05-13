const mysql = require('mysql')
const config = require('../config/mysql')
const logger = require('./logger')

const pool = mysql.createPool(config)

function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          setTimeout(() => {
            query(sql)
          }, 2000)
        } else {
          logger.error(err)
          reject(new Error('断开重连'))
        }
      } else {
        conn.query(sql, params, (queryErr, result) => {
          if (queryErr) {
            reject(queryErr)
          } else {
            resolve(result)
          }
          conn.release()
        })
      }
    })
  })
}

module.exports = query
