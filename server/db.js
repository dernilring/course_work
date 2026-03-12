const sql = require("mssql");

const config = {
  user: "darina",
  password: "1113_ddv",
  server: "127.0.0.1",
  port: 61421,
  database: "imdb_db",
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("sql server is connected");
    return pool;
  })
  .catch((err) => console.log("error: ", err));

module.exports = { sql, poolPromise };
