const mongoose = require("mongoose");

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI);
    mongoose.connection.once("open", ()=> console.log("Database connected"));
    mongoose.connection.on("error", (error)=> console.log("Database connection error " + error))
}

module.exports = connectDB