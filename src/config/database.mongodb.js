import mongoose from 'mongoose';
import { config } from "./config.js";

const mongodb = config.mongo_local_db;
const mongoClusterDb = config.mongo_cluster_db;

mongoose
    // .connect(mongodb, {
    .connect(mongoClusterDb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`Connected to mongodb successfully...`);
    })
    .catch((err) => {
        console.log(err.name + "💥 : " + err.message);
    });