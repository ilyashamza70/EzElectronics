import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, param } from "express-validator"
import CartController from "../controllers/cartController"
import Authenticator from "./auth"
import Cart from "../components/cart"

/**
 * Represents a class that defines the routes for handling carts.
 */
class CartRoutes {
    private controller: CartController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    /**
     * Constructs a new instance of the CartRoutes class.
     * @param {Authenticator} authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new CartController()
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
     * Initializes the routes for the cart router.
     * 
     * @remarks
     * This method sets up the HTTP routes for creating, retrieving, updating, and deleting cart data.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for getting the cart of the logged in customer.
         * It requires the user to be logged in and to be a customer.
         * It returns the cart of the logged in customer.
         */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => this.controller.getCart(req.user)
                .then((cart: any) => {
                    res.status(200).json(cart)
                })
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Route for adding a product to the cart of the logged in customer.
         * It requires the user to be logged in and to be a customer.
         * It requires the following parameters:
         * - productId: string. It cannot be empty, it must be a valid product id, it must represent a product that is not already in a cart and that has not been sold yet.
         * It returns a 200 status code if the product was added to the cart.
         */
        this.router.post(
            "/",
            (req: any, res: any, next: any) => this.controller.addToCart(req.user, req.body.productId)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Route for checking out the cart of the logged in customer.
         * It requires the user to be logged in and to be a customer.
         * It returns a 200 status code if the cart was checked out.
         * It fails if the cart is empty.
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
         * Route for getting the history of the logged in customer's carts.
         * It requires the user to be logged in and to be a customer.
         * It returns the history of the logged in customer's carts (only carts that have been paid for are returned - the current cart is not included in the list).
         */
        this.router.get(
            "/history",
            (req: any, res: any, next: any) => this.controller.getCustomerCarts(req.user)
                .then((carts: any) => res.status(200).json(carts))
                .catch((err) => next(err))
        )

        /**
         * Route for removing a product from a cart.
         * It requires the user to be logged in and to be a customer.
         * It requires the following parameters:
         * - cartId: number. It cannot be empty, it must be a valid cart id, the cart must belong to the logged in user, and it cannot be a cart that has been paid for.
         * - productId: string. It cannot be empty, it must be a valid product id, it must represent a product that is in the cart.
         * It returns a 200 status code if the product was removed from the cart.
         */
        this.router.delete(
            "/products/:productId",
            (req: any, res: any, next: any) => this.controller.removeFromCart(req.user, req.params.productId, req.params.cartId)
                .then(() => res.status(200).end())
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Route for deleting a cart.
         * It requires the user to be logged in and to be a customer.
         * It requires the following parameters:
         * - cartId: number. It cannot be empty, it must be a valid cart id, the cart must belong to the logged in user.
         */
        this.router.delete(
            "/current",
            (req: any, res: any, next: any) => this.controller.deleteCart(req.user, req.params.cartId)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Route for deleting all carts.
         * It does not require authentication.
         * It returns a 200 status code.
         * This route is only for testing purposes (allows to delete all carts and have an empty database).
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAllCarts()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )
    }
}

export default CartRoutes