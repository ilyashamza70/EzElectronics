import {test, jest, expect, describe, afterEach, beforeEach} from "@jest/globals"
import { Category, Product } from "../../src/components/product";
import CartController from "../../src/controllers/cartController";
import { Role, User } from "../../src/components/user";
import { EmptyProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { Cart, ProductInCart } from "../../src/components/cart";

jest.mock("../../src/dao/cartDAO")
jest.mock("../../src/dao/productDAO")

const mockUser: User = { 
    username: 'testuser',
    name: 'testName', 
    surname: 'testSurname', 
    role: Role.CUSTOMER, 
    address: 'Street Test', 
    birthdate: '1990-01-01'
};

describe('addToCart', () => {
    const mockProduct: Product = { 
        model: 'test-product', 
        category: Category.SMARTPHONE, 
        quantity: 5, sellingPrice: 109.99, 
        arrivalDate: '2021-05-05', 
        details:'details test'};
    const testCartId = 1;
    const controller = new CartController();
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('It should add product to cart and update total if product exists and there is enough stock', async() => {
        
        

        await expect(controller.addToCart(mockUser, 'test-product')).resolves.toBe(true);

        
    })

    test('It should create new cart if user does not have a cart', async () => {
        const mockProduct: Product = { model: 'test-product', category: Category.SMARTPHONE, quantity: 5, sellingPrice: 10.99, arrivalDate: '2024-03-03', details: 'details test'};
        const controller = new CartController();



        await expect(controller.addToCart(mockUser, 'test-product')).resolves.toBe(true);


    });

    test('It should reject with ProductNotFoundError if product does not exist', async() => {
        const outOfStockProduct = { 
            ...mockProduct, 
            quantity: 0 
        };
        
        
        await expect(controller.addToCart(mockUser, 'product-out-of-stock')).rejects.toThrow(EmptyProductStockError);
        
    });

    test('It should reject with EmptyProductStockError if product is out of stock', async() => {
        await expect(controller.addToCart(mockUser, 'non-existent-product')).rejects.toThrow(ProductNotFoundError);
    });
});

describe('getCart', async () => {
    const mockCart: Cart = { 
        customer: 'u1', 
        paid: false, 
        paymentDate: null! , 
        total: 200, 
        products: [] 
    };
    const mockCartEmpty: Cart = { 
        ...mockCart, 
        total: 0
    };
    const mockError = new Error('DB test error');
    const controller = new CartController();

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should retrieve the cart with products if the cart total is not zero', async () => {
        const mockCartId = 1;
        const mockProductsInCart: ProductInCart[] = [
            { model: 'product1', quantity: 7, category: Category.SMARTPHONE, price: 33.99 },
            { model: 'product2', quantity: 13, category: Category.LAPTOP, price: 19.99 },
        ];

        

        const result = await controller.getCart(mockUser);

        expect(result).toEqual({
            customer: 'testuser',
            paid: false,
            paymentDate: null,
            total: 100,
            products: mockProductsInCart,
        });
     
    });

    test('It should reject if there is an error retrieving the cart', async () => {


        await expect(controller.getCart(mockUser)).rejects.toThrow('DB test error');
    
    });
    test('It should retrieve the cart without products if the cart total is zero', async () => {
        const controller = new CartController();


        const result = await controller.getCart(mockUser);

        expect(result).toEqual(mockCartEmpty);
      
    });

});

