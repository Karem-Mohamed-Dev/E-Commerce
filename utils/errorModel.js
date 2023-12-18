exports.errorModel = (statusCode, msg) => {
    const error = new Error();
    error.message = msg;
    error.statusCode = statusCode;
    return error;
}