class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;//operational error

        Error.captureStackTrace(this, this.constructor);//current object is not included in the stack Trace
    }
}

module.exports = AppError