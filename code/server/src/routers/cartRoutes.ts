import express, { Router } from "express"
import ErrorHandler from "../helper"
import CartController from "../controllers/cartController"
import Authenticator from "./auth"

/**
 * Defines routing logic for cart operations.
 */
class CartRoutes {
    private controller: CartController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    /**
     * Initializes cart routes with necessary dependencies.
     * @param {Authenticator} authenticator - Handles user authentication.
    */
    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new CartController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    /**
     * Provides the configured router.
     * @returns Configured router instance.
    */
    getRouter(): Router {
        return this.router
    }

    /**
     * Configures routes for cart management.
     * 
     * Sets up endpoints for cart operations such as retrieval, addition, and checkout,
     * ensuring proper authentication and authorization.
    */
    initRoutes() {
        /**
         * Endpoint to retrieve the current user's cart.
         * Authentication required.
         * Responds with the user's cart details.
        */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => this.controller.getCart(req.user)
                .then((cart: any /**Cart */) => {
                    res.status(200).json(cart)
                })
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Endpoint to add a product to the user's cart.
         * Authentication required.
         * Expects 'model' in request body.
         * Responds with success status on addition.
        */
        this.router.post(
            "/",
            (req: any, res: any, next: any) => this.controller.addToCart(req.user, req.body.model)
                .then(() => res.status(200).end())
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Endpoint for cart checkout.
         * Authentication required.
         * Validates cart contents before proceeding.
         * Responds with success status on successful checkout.
         */
        this.router.patch(
            "/",
            (req: any, res: any, next: any) => this.controller.checkoutCart(req.user)
                .then(() => res.status(200).end())
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Retrieves the purchase history of the user's carts.
         * Authentication required.
         * Returns a list of past carts, excluding the current cart.
        */
        this.router.get(
            "/history",
            (req: any, res: any, next: any) => this.controller.getCustomerCarts(req.user)
                .then((carts: any /**Cart[] ?? you sure about this? */) => res.status(200).json(carts))
                .catch((err) => next(err))
        )

        /**
         * Removes a specific product from the user's cart.
         * Authentication required.
         * Expects 'model' as a route parameter.
         * Responds with success status upon removal.
        */
        this.router.delete(
            "/products/:model",
            (req: any, res: any, next: any) => this.controller.removeProductFromCart(req.user, req.params.model)
                .then(() => res.status(200).end())
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Clears all products from the current cart.
         * Authentication required.
         * Responds with success status upon clearing.
        */
        this.router.delete(
            "/current",
            (req: any, res: any, next: any) => this.controller.clearCart(req.user)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Deletes all carts from the system.
         * Restricted to admin or manager roles.
         * Responds with success status upon deletion.
        */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAllCarts()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Retrieves all carts across all users.
         * Restricted to admin or manager roles.
         * Returns an array of all user carts.
        */
        this.router.get(
            "/all",
            (req: any, res: any, next: any) => this.controller.getAllCarts()
                .then((carts: any/**Cart[] */) => res.status(200).json(carts))
                .catch((err: any) => next(err))
        )
    }
}

export default CartRoutes