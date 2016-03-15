module.exports = function (Stock, quandl, io, app) {

    var today = new Date(),
        year = today.getFullYear(),
        month = (today.getMonth().toString().length === 1) ? "0" + (today.getMonth() + 1) : today.getMonth() + 1,
        date = (today.getDate().toString().length === 1) ? "0" + today.getDate() : today.getDate(),
        fullDate = year + "-" + month + "-" + date;

    app.get("/", function (req, res) {

        Stock.find({}, function (err, doc) {

            if (err) {
                
                res.end("Something went wrong please try logging in again, if problem persist you can please contact me at kufogbemawuli1@gmail.com");
                
            } else {

                res.render("index", {
                    data: doc
                });

                io.on("connection", function (socket) {

                    io.emit("refresh", doc);

                });

            }

        });

    });

    io.on("connection", function (socket) {

        socket.on("send", function (sname) {

            quandl.dataset({
                source: "WIKI",
                table: sname
            }, {
                order: "asc",
                start_date: "2016-01-01",
                end_date: fullDate
            }, function (err, res) {

                if (err) {

                    socket.emit("general", "generr");

                } else {

                    if (JSON.parse(res).quandl_error !== undefined) {

                        if (JSON.parse(res).quandl_error.code === "QECx02") {

                            socket.emit("err", "error");

                        }

                    } else {

                        var stock = new Stock({
                            dataset_code: JSON.parse(res).dataset.dataset_code,
                            stockName: JSON.parse(res).dataset.name,
                            stockData: JSON.parse(res).dataset.data
                        });

                        stock.save(function (err) {

                            if (err) {
                                return err;
                            } else {

                                Stock.find({}, function (err, doc) {

                                    io.emit("data", doc);

                                    io.emit("add", doc);

                                });

                            }

                        });

                    }

                }

            });

        });

        socket.on("delete", function (id) {

            Stock.remove({
                _id: id
            }, function (err, doc) {

                if (doc) {

                    Stock.find({}, function (err, doc) {

                        io.emit("data", doc)

                        io.emit("delete", id);

                    });

                }
            });

        });

    });

}
