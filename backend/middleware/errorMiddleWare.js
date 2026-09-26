const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    const status = err.statusCode || 500;

    res.status(status).json({
        message: status === 500 ? "Something went wrong" : err.message
    });
};

module.exports = errorMiddleware;
