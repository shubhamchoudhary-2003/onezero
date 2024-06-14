const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
    type: "postgres",
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["dist/models/*.js"],
    migrations: ["dist/migrations/*.js"]
});

module.exports = {
    datasource: AppDataSource
};
