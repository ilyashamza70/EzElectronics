const { validationResult } = require("express-validator")
import express from "express"

/**
 * The ErrorHandler class is used to handle errors in the application.
 */
class ErrorHandler {

    /**
     * Validates the request object and returns an error if the request object is not formatted properly, according to the middlewares used when defining the request.
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @returns Returns the next function if there are no errors or a response with a status code of 422 if there are errors.
     */
    validateRequest(req: any, res: any, next: any) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: "The parameters are not formatted properly" })
        }
        return next()
    }

    /**
     * Registers the error handler.
     * @param router - The router object
     */
    static registerErrorHandler(router: express.Application) {
        router.use((err: any, req: any, res: any, next: any) => {
            return res.status(err.customCode || 503).json({
                error: err.customMessage || "Internal Server Error",
                status: err.customCode || 503
            });
        })
    }
}

export default ErrorHandler