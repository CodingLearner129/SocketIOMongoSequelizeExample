import express from "express";
import expressLayouts from "express-ejs-layouts";
import morgan from "morgan";
import './src/config/database.mongodb.js';
import './src/models/sql/indexModel.js';
// import sequelize from './src/config/database.sql.js';
import { config } from './src/config/config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { router as UserRoute } from "./src/routes/v1/userRoute.js";
import { router as ViewRoute } from "./src/routes/v1/viewRoute.js";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// set view engine 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './src/views'));
app.use(expressLayouts);
app.set('layout', path.join(__dirname, './src/views/layouts/layout'));

// Development logging
app.use(morgan('dev'));

app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser())
// app.use(fileUpload());

app.use(cookieParser());

// serving static files
app.use(express.static(path.join(__dirname, './src/public')));

app.use('/v1/users', UserRoute);
app.use('/', ViewRoute);
app.get('*', function (req, res) {
    res.redirect('/login');
});

// await sequelize.sync(); // force: true - This creates the table, dropping it first if it already existed
// // await sequelize.sync({alter: true}); //alter: true - This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
// console.log("All models were synchronized successfully.");

export default app;