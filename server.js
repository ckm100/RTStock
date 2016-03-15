var express = require("express"),
    app = express(),
    http = require("http").createServer(app),
    io = require("socket.io")(http),
    path = require('path'),
    mongoose = require("mongoose"),
    routes = require("./app/routes/route"),
    Quandl = require("quandl"),
    quandl = new Quandl(),
    Stock = mongoose.model("Stock", {
        dataset_code: String,
        stockName: String,
        stockData: []
    }),
    localDb = "mongodb://127.0.0.1:27017/stock";

app.set("port", (process.env.PORT || 2000));

app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGOLAB_URI || localDb);

routes(Stock, quandl, io, app);

http.listen(app.get("port"), function () {

    console.log("Listening on port " + app.get("port"));

});
