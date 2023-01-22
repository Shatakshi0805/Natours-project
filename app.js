const morgan = require("morgan");
const express = require("express");
const app = express();

const tourRouter = require("./routes/tourRoute");
const userRouter = require("./routes/userRoute");

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    console.log("Hello from middleware👋");
    next();
})

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;