import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ucmovie", "root", null, {
  host: "127.0.0.1",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Connetion has been established successfully."))
  .catch((err) => console.log("Unable to connect to the database: " + err));

sequelize.sync();

export default sequelize;
