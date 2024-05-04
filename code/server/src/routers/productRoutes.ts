import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, param, query } from "express-validator"
import ProductController from "../controllers/productController"
import Authenticator from "./auth"
import { Product } from "../components/product"

/**
 * Represents a class that defines the routes for handling proposals.
 */
class ProductRoutes {
    private controller: ProductController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    /**
     * Constructs a new instance of the ProductRoutes class.
     * @param {Authenticator} authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new ProductController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    /**
     * Returns the router instance.
     * @returns The router instance.
     */
    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the routes for the product router.
     * 
     * @remarks
     * This method sets up the HTTP routes for handling product-related operations such as registering products, registering arrivals, selling products, retrieving products, and deleting products.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     * 
     */
    initRoutes() {

        /**
         * Route for registering a product.
         * It requires the user to be logged in and to be a manager.
         * It requires the following parameters:
         * - code: string. It cannot be empty, it must be at least 6 characters long, and it must be unique (an existing code cannot be used to register a new product)
         * - sellingPrice: number. It must be greater than 0.
         * - model: string. It cannot be empty.
         * - category: string (one of "Smartphone", "Laptop", "Appliance")
         * - details: string. It can be empty.
         * - arrivalDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD.
         * It returns the code of the registered product.
         */
        this.router.post(
            "/",
            (req: any, res: any, next: any) => this.controller.registerProduct(req.body.code, req.body.sellingPrice, req.body.model, req.body.category, req.body.details, req.body.arrivalDate)
                .then((code: any) => res.status(200).json(code))
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Route for registering the arrival of a set of proposed products.
         * It requires the user to be logged in and to be a manager.
         * It requires the following parameters:
         * - model: string. It cannot be empty.
         * - category: string (one of "Smartphone", "Laptop", "Appliance")
         * - details: string. It cannot be empty.
         * - quantity: number. It must be greater than 0.
         * - arrivalDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD and it cannot be earlier than the proposal's reception date.
         * - sellingPrice: number. It must be greater than 0.
         * It returns a 200 status code if the arrival was registered successfully.
         */
        this.router.post(
            "/arrivals",
            (req: any, res: any, next: any) => this.controller.registerArrival(req.body.model, req.body.category, req.body.details, req.body.quantity, req.body.arrivalDate, req.body.sellingPrice)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Route for selling a product.
         * It requires the user to be logged in and to be a manager.
         * It requires the following parameters:
         * - code: string. It cannot be empty, it must be a valid product code and it cannot be a product that has already been sold.
         * - sellingDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD and it cannot be earlier than the product's arrival date.
         * It returns a 200 status code if the product was sold successfully.
         */
        this.router.patch(
            "/:code",
            (req: any, res: any, next: any) => this.controller.sellProduct(req.params.code, req.body.sellingDate)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving all products.
         * It requires the user to be logged in.
         * It accepts an optional query parameter "sold" that can be "yes" or "no":
         *  - If the parameter is "yes", it returns only the products that have been sold (their selling date is not null)
         *  - If the parameter is "no", it returns only the products that have not been sold (their selling date is null)
         *  - If the parameter is not present, it returns all the products.
         * It returns an array of products.
         */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => this.controller.getProducts(req.query.sold)
                .then((products: any) => res.status(200).json(products))
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving a product by its code.
         * It requires the user to be logged in.
         * It requires the code of the product in the request parameters: the code must represent an existing product.
         * It returns the product.
         */
        this.router.get(
            "/:code",
            (req: any, res: any, next: any) => this.controller.getProduct(req.params.code)
                .then((product: any) => res.status(200).json(product))
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving all products of a specific category.
         * It requires the user to be logged in.
         * It requires the category of the products in the request parameters: the category must be one of "Smartphone", "Laptop", "Appliance".
         * It accepts an optional query parameter "sold" that can be "yes" or "no":
         * - If the parameter is "yes", it returns only the products that have been sold (their selling date is not null)
         * - If the parameter is "no", it returns only the products that have not been sold (their selling date is null)
         * - If the parameter is not present, it returns all the products of the category.
         * It returns an array of products.
         */
        this.router.get(
            "/category/:category",
            (req: any, res: any, next: any) => this.controller.getProductsByCategory(req.params.category, req.query.sold)
                .then((products: any) => res.status(200).json(products))
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving all products of a specific model.
         * It requires the user to be logged in.
         * It requires the model of the products in the request parameters: the model cannot be empty.
         * It accepts an optional query parameter "sold" that can be "yes" or "no":
         * - If the parameter is "yes", it returns only the products that have been sold (their selling date is not null)
         * - If the parameter is "no", it returns only the products that have not been sold (their selling date is null)
         * - If the parameter is not present, it returns all the products of the model.
         * It returns an array of products.
         */
        this.router.get(
            "/model/:model",
            (req: any, res: any, next: any) => this.controller.getProductsByModel(req.params.model, req.query.sold)
                .then((products: any) => res.status(200).json(products))
                .catch((err) => next(err))
        )

        /**
         * Route for deleting all products.
         * It does not require authentication.
         * It returns a 200 status code.
         * This route is only for testing purposes (allows to delete all products and have an empty database).
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAllProducts()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for deleting a product.
         * It requires the user to be logged in and to be a manager.
         * It requires the code of the product in the request parameters: the code must represent an existing product.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:code",
            (req: any, res: any, next: any) => this.controller.deleteProduct(req.params.code)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )
    }
}

export default ProductRoutes