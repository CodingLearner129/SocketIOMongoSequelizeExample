import { Sequelize } from "sequelize";
import { config } from "./config.js";


const sequelize = new Sequelize(config.database_name, config.database_user, config.database_password, {
    host: config.database_host,
    dialect: config.database_dialect,
    logging: false,
    pool: {
        max: 50,
        min: 0,
        idle: 1000000,
        acquire: 1200000
    }
});

try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
} catch (error) {
    console.error("Unable to connect to the database:", error);
}



export default sequelize;