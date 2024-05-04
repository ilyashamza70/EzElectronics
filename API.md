# EZElectronics Full API Specifications

This document lists all the expected behaviors for the APIs that compose the EZElectronics application.

Request parameters, request body content, and optional query parameters must be validated when handling a request; this can be done in two ways:

- in the different functions inside the `controllers` module
  Example:
  ```javascript
     async createUser(username: string, name: string, surname: string, password: string, role: string): Promise<boolean> {
        if(!username || !name || !surname || !password || !role) throw new WrongParametersError() //example error with the correct error code
        if(username.length === 0 || name.length === 0 || surname.length === 0 || password.length === 0 || role.length === 0) throw new WrongParametersError()
        if(role !== "Manager" || role !== "Customer") thow new WrongParametersError()
        const ret: any = await this.dao.createUser(username, name, surname, password, role)
        return ret
    }
  ```
- using middlewares directly when calling the routes in the `routers` module (preferred option for simplicity)
  Example:
  ```javascript
  this.router.post(
    "/",
    body("username").isString().isLength({ min: 1 }), //the request body must contain an attribute named "username", the attribute must be a non-empty string
    body("surname").isString().isLength({ min: 1 }), //the request body must contain an attribute named "surname", the attribute must be a non-empty string
    body("name").isString().isLength({ min: 1 }), //the request body must contain an attribute named "name", the attribute must be a non-empty string
    body("password").isString().isLength({ min: 1 }), //the request body must contain an attribute named "password", the attribute must be a non-empty string
    body("role").isString().isIn(["Manager", "Customer"]), //the request body must contain an attribute named "role", the attribute must be a string and its value must be one of the two allowed options
    this.errorHandler.validateRequest, //middleware defined in `helper.ts`, checks the result of all the evaluations performed above and returns a 422 error if at least one fails or continues if there are no issues
    (req: any, res: any, next: any) =>
      this.controller
        .createUser(
          req.body.username,
          req.body.name,
          req.body.surname,
          req.body.password,
          req.body.role
        )
        .then(() => res.status(200).end())
        .catch((err) => {
          next(err);
        })
  );
  ```

The different middlewares that can be used when calling a route are:

- The validators defined by [express-validator](https://express-validator.github.io/docs): these validators can check the body of a request, its request parameters, its cookies, its header, and its optional query parameters. It is possible to check whether an attribute is an integer, an email, a string, a numeric value, and more.
- The function `ErrorHandler.validateRequest()` defined inside `helper.ts`. This function can be placed after a chain of validators to return an error code in case at least one constraint is not respected.
- The function `isLoggedIn()` defined inside `routers/auth.ts`. This function can be used to define a route that requires authentication: if the route is accessed without setting cookies that correspond to a logged in user it returns a 401 error.
- The functions `isCustomer()`, and`isManager()` defined inside `routers/auth.ts`. These functions check whether a logged in user has a specific role, returning 401 if a user with a different role tries to access a route.

## API List

For all constraints on request parameters and request body content, always assume a 422 error in case one constraint is not satisfied.
For all access constraints, always assume a 401 error in case the access rule is not satisfied.
For all success scenarios, always assume a 200 status code for the API response.
Specific error scenarios will have their corresponding error code.

### Access APIs

#### POST `ezelectronics/sessions`

Allows login for a user with the provided credentials.

- Request Parameters: None
- Request Body Content: An object having as attributes:
  - `username`: a string that must not be empty
  - `password`: a string that must not be empty
  - Example: `{username: "MarioRossi", password: "MarioRossi"}`
- Response Body Content: A <b>User</b> object that represents the logged in user
  - Example: `{username: "Mario Rossi", name: "Mario", surname: "Rossi", role: "Customer"}`
- Access Constraints: None

#### DELETE `ezelectronics/sessions/current`

Performs logout for the currently logged in user.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user

#### GET `ezelectronics/sessions/current`

Retrieves information about the currently logged in user.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: A <b>User</b> object that represents the logged in user
  - Example: `{username: "Mario Rossi", name: "Mario", surname: "Rossi", role: "Customer"}`
- Access Constraints: Can only be called by a logged in user

### User APIs

#### POST `ezelectronics/users`

Creates a new user with the provided information.

- Request Parameters: None
- Request Body Content: An object with the following attributes:
  - `username`: a string that must not be empty
  - `name`: a string that must not be empty
  - `surname`: a string that must not be empty
  - `password`: a string that must not be empty
  - `role`: a string whose value can only be one of ["Customer", "Manager"]
- Response Body Content: None
- Access Constraints: None
- Additional Constraints:
  - It should return a 409 error when `username` represents a user that is already in the database

#### GET `ezelectronics/users`

Returns the list of all users.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: An array of <b>User</b> objects where each one represents a user present in the database
  - Example: `[{username: "Mario Rossi", name: "Mario", surname: "Rossi", role: "Customer"}, {username: "Giuseppe Verdi", name: "Giuseppe", surname: "Verdi", role: "Customer"}, {username: "Admin", name: "admin", surname: "admin", role: "Manager"}]`
- Access Constraints: None

#### GET `ezelectronics/users/role/:role`

Returns the list of all users with a specific role.

- Request Parameters: Example `ezelectronics/users/role/Customer`
  - `role`: a string whose value can only be one of ["Customer", "Manager"]
- Request Body Content: None
- Response Body Content: An array of <b>User</b> objects where each one represents a user present in the database with the specified role
  - Example: `[{username: "Mario Rossi", name: "Mario", surname: "Rossi", role: "Customer"}]`
- Access Constraints: None

#### GET `ezelectronics/users/:username`

Returns a single user with a specific username.

- Request Parameters: Example: `ezelectronics/users/Admin`
  - `username`: a string that must not be empty
- Request Body Content: None
- Response Body Content: A <b>User</b> object representing the requested user
  - Example: `{username: "Admin", name: "admin", surname: "admin", role: "Manager"}`
- Access Constraints: None
- Additional Constraints:
  - It should return a 404 error when `username` represents a user that does not exist in the database

#### DELETE `ezelectronics/users/:username`

Deletes a specific user, identified by the username, from the database

- Request Parameters: Example: `ezelectronics/users/Admin`
  - `username`: a string that must not be empty
- Request Body Content: None
- Response Body Content: None
- Access Constraints: None
- Additional Constraints:
  - It should return a 404 error when `username` represents a user that does not exist in the database

#### DELETE `ezelectronics/users`

Deletes all users from the database. This route is only used for testing purposes, as it allows the deletion of all users to ensure an empty database.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: None

### Product APIs

#### POST `ezelectronics/products`

Creates a new product.

- Request Parameters: None
- Request Body Content: An object with the following parameters:
  - `code`: a string that is at least 6 characters long
  - `sellingPrice`: a floating point number whose value is greater than 0
  - `model`: a string that must not be empty
  - `category`: a string whose value can only be one of ["Smartphone", "Laptop", "Appliance"]
  - `details`: a string that can be empty
  - `arrivalDate`: an optional string that represents a date. If present, it must be in the format <b>YYYY-MM-DD</b>. If absent, then the current date is used as the arrival date for the product, in the same format.
  - Example: `{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01"}`
- Response Body Content: The code of the newly created product:
  - Example: `{code: "Smartphone1"}`
- Access Constraints: Can only be called by a logged in user whose role is Manager
- Additional Constraints:
  - It should return a 409 error when `code` represents a product that exists already in the database
  - It should return an error when `arrivalDate` is after the current date

#### POST `ezelectronics/products/arrivals`

Registers the arrival of a set of products of the same model.

- Request Parameters: None
- Request Body Content: An object with the following parameters:
  - `model`: a string that must not be empty
  - `category`: a string whose value can only be one of ["Smartphone", "Laptop", "Appliance"]
  - `details`: a string that can be empty
  - `quantity`: an integer value that must be greater than 0
  - `arrivalDate`: an optional string that represents a date. If present, it must be in the format <b>YYYY-MM-DD</b>. If absent, then the current date is used as the arrival date for the products, in the same format.
  - `sellingPrice`: a floating point number that must be greater than 0
  - Example: `{sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", quantity: 5}`
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Manager
- Additional Constraints:
  - It should return an error if `arrivalDate` is after the current date

#### PATCH `ezelectronics/products/:code`

Marks a product as sold

- Request Parameters: Example: `ezelectronics/products/Smartphone1`
  - `code`: a string that is at least 6 characters long
- Request Body Content: An object with the following parameters:
  - `sellingDate`: an optional string that represents a date. If present, it must be in the format <b>YYYY-MM-DD</b>. If absent, then the current date is used as the selling date for the product, in the same format.
  - Example: `{sellingDate: "2024-01-02"}`
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Manager
- Additional Constraints:
  - It should return a 404 error if `code` does not represent a product in the database
  - It should return an error if `sellingDate` is after the current date
  - It should return an error if `sellingDate` is before the product's `arrivalDate`
  - It should return an error if the product has already been sold

#### GET `ezelectronics/products`

Returns all products present in the database.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: An array of <b>Product</b> objects, each one representing a product in the database.
  - Example: `[{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}, {code: "Smartphone2", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: null}]`
- Access Constraints: Can only be called by a logged in user
- Optional Query parameters: `sold`, a string that can only have the following values:
  - `yes`, in which case it returns only the products that have been sold
    - Example: `ezelectronics/products?sold=yes` => `[{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}]`
  - `no`, in which case it returns only the products that have not been sold yet
    - Example: `ezelectronics/products?sold=yes` => `[{code: "Smartphone2", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: null}]`

#### GET `ezelectronics/products/:code`

Creates a new product.

- Request Parameters: Example: `ezelectronics/products/Smartphone1`
  - `code`: a string that is at least 6 characters long
- Request Body Content: None
- Response Body Content: A <b>Product</b> object that represents the requested product
  - Example: `{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}`
- Access Constraints: Can only be called by a logged in user
- Additional Constraints:
  - It should return a 404 error if `code` does not represent a product in the database

#### GET `ezelectronics/products/category/:category`

Returns all products of a specific category.

- Request Parameters: Example: `ezelectronics/products/category/Smartphone`
  - `category`: a string whose value can only be one of ["Smartphone", "Laptop", "Appliance"]
- Request Body Content: None
- Response Body Content: An array of <b>Product</b> objects, each one having the same category.
  - Example: `[{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}, {code: "Smartphone2", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: null}]`
- Access Constraints: Can only be called by a logged in user
- Optional Query parameters: `sold`, a string that can only have the following values:
  - `yes`, in which case it returns only the products of that category that have been sold
    - Example: `ezelectronics/products?sold=yes` => `[{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}]`
  - `no`, in which case it returns only the products of that category that have not been sold yet
    - Example: `ezelectronics/products?sold=yes` => `[{code: "Smartphone2", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: null}]`

#### GET `ezelectronics/products/model/:model`

Returns all products of a specific category.

- Request Parameters: Example: `ezelectronics/products/model/iPhone 13`
  - `model`: a string that must not be empty
- Request Body Content: None
- Response Body Content: An array of <b>Product</b> objects, each one having the same model.
  - Example: `[{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}, {code: "Smartphone2", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: null}]`
- Access Constraints: Can only be called by a logged in user
- Optional Query parameters: `sold`, a string that can only have the following values:
  - `yes`, in which case it returns only the products of that model that have been sold
    - Example: `ezelectronics/products?sold=yes` => `[{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: "2024-01-02"}]`
  - `no`, in which case it returns only the products of that model that have not been sold yet
    - Example: `ezelectronics/products?sold=yes` => `[{code: "Smartphone2", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01", sellingDate: null}]`

#### DELETE `ezelectronics/products`

Deletes all products from the database. This route is only used for testing purposes, as it allows the deletion of all products to ensure an empty database.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: None

#### DELETE `ezelectronics/products/:code`

Deletes a specific product from the database.

- Request Parameters: Example: `ezelectronics/products/Smartphone1`
  - `code`: a string that is at least 6 characters long
- Request Body Content: None
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Manager
- Additional Constraints:
  - It should return a 404 error if `code` does not represent a product in the database

### Cart APIs

#### GET `ezelectronics/carts`

Returns the current cart of the logged in user.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: A <b>Cart</b> object that represents the cart of the currently logged in user.
  - Example: `{id: 1, customer: "Mario Rossi", paid: false, paymentDate: null, total: 0, products: [{code: "Smartphone1", sellingPrice: 200, model: "iPhone 13", category: "Smartphone", details: "", arrivalDate: "2024-01-01"}]}`
- Access Constraints: Can only be called by a logged in user whose role is Customer

#### POST `ezelectronics/carts`

Adds a product to the current cart of the logged in user.

- Request Parameters: None
- Request Body Content: An object with the following parameters:
  - `productId`: a string that must be at least 6 characters long
  - Example: `{productId: "Smartphone1"}`
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Customer
- Additional Constraints:
  - It should return a 404 error if `productId` does not represent an existing product
  - It should return a 409 error if `productId` represents a product that is already in another cart
  - It should return a 409 error if `productId` represents a product that has already been sold

#### PATCH `ezelectronics/carts`

Pays for the current cart of the logged in user.
Sets the total of the cart as the sum of the costs of all products and the payment date as the current date, in format <b>YYYY-MM-DD</b>.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Customer
- Additional Constraints:
  - It should return a 404 error if the logged user does not have a cart
  - It should return a 404 error if the logged user has an empty cart

#### GET `ezelectronics/carts/history`

Returns the history of the carts that have been paid for by the current user.
The current cart is not included in the list.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Customer

#### DELETE `ezelectronics/carts/products/:productId`

Removes a product from the current cart of the logged in user.

- Request Parameters: Example: `ezelectronics/carts/products/Smartphone1`
  - `productId`: a string that must be at least 6 characters long
- Request Body Content: None
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Customer
- Additional Constraints:
  - It should return a 404 error if `productId` represents a product that is not in the cart
  - It should return a 404 error if the logged user does not have a cart
  - It should return a 404 error if `productId` does not represent an existing product
  - It should return a 409 error if `productId` represents a product that has already been sold

#### DELETE `ezelectronics/carts/current`

Deletes the current cart of the logged in user.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: Can only be called by a logged in user whose role is Customer
- Additional Constraints:
  - It should return a 404 error if the current user does not have a cart

#### DELETE `ezelectronics/carts`

Deletes all existing carts. This route is only used for testing purposes, as it allows the deletion of all carts to ensure an empty database.

- Request Parameters: None
- Request Body Content: None
- Response Body Content: None
- Access Constraints: None
