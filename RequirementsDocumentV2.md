Notes:

By the end of the delivery to compute productivity.

Requirements Document

NexaMarket is a cutting-edge software solution tailored for electronics retailers, simplifying the management of products and enhancing the customer shopping experience through a dedicated online platform. Store managers can efficiently oversee their inventory, seamlessly add new products, and effortlessly process purchases. Customers benefit from a user-friendly interface, where they can browse a wide range of products, add items to their cart with ease, and conveniently track their purchase history.

**Stakeholders**



|**Stakeholder name**|**Description**|
| - | - |
|Store Managers|to manage products, update inventory, and track sales.|
|Customers (Users - more specified, such as premium ones, valuable for business strategy)|who visit the dedicated website to browse and purchase electronics products|
|Developers|The team responsible for building and maintaining the NexaMarket software application, ensuring its functionality, security, and usability|
|IT Administrators (for v2)|Oversee the installation, configuration, and maintenance of the NexaMarket application within the store's infrastructure.|
|Sales Team (for v2)|Utilizes the data and insights from NexaMarket to optimize product offerings, pricing strategies, and promotional campaigns.|
|Marketing Team(for v2)|Utilizes customer data and feedback from NexaMarket to craft marketing strategies, including targeted promotions and advertising campaigns.|
|Customer Service|Assist customers with inquiries, issues, or feedback related to the NexaMarket platform.|
|Suppliers|Provide the electronics products that are listed on NexaMarket . They may need access to the platform for inventory updates and order processing|



|Regulatory Authorities|Government agencies or regulatory bodies responsible for overseeing and enforcing laws and regulations related to electronic commerce, ensuring that NexaMarket operates in compliance with applicable standards and guidelines.|
| - | :- |

**Context Diagram and interfaces**

**Context Diagram**

<Define here Context diagram using UML use case diagram>

![](Aspose.Words.b1da6218-936f-4034-b869-febe48ee2791.001.jpeg)

<actors are a subset of stakeholders> **Interfaces**

<describe here each interface in the context diagram>

<GUIs will be described graphically in a separate document>



|**Actor**|**Logical Interface**|**Physical Interface**|
| - | - | - |
|Store Managers|Product management, inventory updates, sales tracking.|Web browser|
|Customers (Users)|Browsing products, placing orders, providing feedback|Web browser|
|Developers|Software development, security, maintenance.|Development environment (IDE, Git).|
|IT Administrators|Installation, configuration, maintenance.|Server console (SSH), network cables.|
|Sales Team|Data analysis, optimization|Desktop/laptop (Excel, BI tools).|
|Marketing Team|Marketing strategy, customer segmentation|Desktop/laptop (Email, CRM systems).|
|Customer Service|Customer support, issue resolution.|Desktop/laptop (Email, chat).|
|Suppliers|Inventory updates, order processing.|API endpoints, EDI connections.|
|Regulatory Authorities|Compliance oversight.|Email, official correspondence.|

**Stories and personas**

<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

<Persona is-an-instance-of actor>

<stories will be formalized later as scenarios in use cases>

**Functional and non functional requirements**

**Functional Requirements**

<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

<they match to high level use cases>



|**ID**|**Description**|**API Method**|
| - | - | - |



FR1: User Authentication![ref1]

FR2: User Logout![ref1]

FR3: Get Current Session Info![ref1]

FR4: User Registration FR5:![ref1] View All Users FR6:![ref1] View Users by Role FR7:![ref1] View Specific User FR8:![ref1] Delete User![ref1]

FR9: Delete All Users![ref1]

FR10: Add Product![ref1]

FR11: Record Product Arrivals![ref1]

FR12: Update Product Information![ref1]

FR13: View All Products FR14:![ref1] View Specific Product![ref1]

Create a new session for user authentication

Log out the current user session

Get information about the current session

Register a new user

Get a list of all users

Get users by role

Get a specific user by username

Delete a specific user by username

Delete all users

Add a new product

Record new product arrivals Update a product's information

Get a list of all products

Get a specific product by code

POST /sessions

DELETE /sessions/current GET /sessions/current

POST /users

GET /users

GET /users/role/:role GET /users/:username DELETE /users/:username

DELETE /users

POST /products

POST /products/arrivals PATCH /products/:code

GET /products

GET /products/:code

|FR15: View Products by|Get products by category|GET|
| - | - | - |
|Category||/products/category/:cate|
|||gory|
|FR16: View Products by Model|Get products by model|GET|
|||/products/model/:model|
|FR17: Delete All Products|Delete all products|DELETE /products|
|FR18: Delete Specific Product|Delete a specific product|DELETE /products/:code|
|FR19: View Current Cart|Get current cart for user|GET /carts|
|FR20: Add Product to Cart|Add a product to the cart|POST /carts|
|FR21: Update Cart|Update products in the cart|PATCH /carts|
|FR22: View Purchase History|Get purchase history|GET /carts/history|
|FR23: Remove Product from|Remove product from cart|DELETE|
|Cart||/carts/products/:product|
|||Id|
|FR24: Clear Current Cart|Clear current cart|DELETE /carts/current|

FR25: Clear All Carts Clear all carts DELETE /carts

**Non Functional Requirements**

<Describe constraints on functional requirements>



|**ID**|**Type (efficiency, reliability, ..)**|**Descriptio n**|**Refers to**|
| - | - | :-: | :-: |
|NFR1||||
|NFR2||||
|NFR3||||
|NFRx ..||||
**Use case diagram and use cases**

**Use case diagram**

<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

<next describe here each use case in the UCD>

**Use case 1, UC1**



|**Actors Involved**||
| - | :- |
|Precondition|<Boolean expression, must evaluate to true before the UC can start>|
|Post condition|<Boolean expression, must evaluate to true after UC is finished>|
|Nominal Scenario|<Textual description of actions executed by the UC>|
|Variants|<other normal executions>|
|Exceptions|<exceptions, errors >|

**Scenario 1.1**

<describe here scenarios instances of UC1>

<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

<a scenario is a more formal description of a story> <only relevant scenarios should be described>



|**Scenario 1.1**||
| - | :- |
|Precondition|<Boolean expression, must evaluate to true before the scenario can start>|
|Post condition|<Boolean expression, must evaluate to true after scenario is finished>|
|Step#|Description|
|1||
|2||
|...||
**Scenario 1.2 Scenario 1.x**

**Use case 2, UC2** ..

**Use case x, UCx**

..

**Glossary**

<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

<concepts must be used consistently all over the document, ex in use cases, requirements etc>

1. **Authentication:**
   1. **Authenticator:** A class responsible for user authentication using Passport.js.
   1. **Auth Middleware:** Middleware functions for checking user authentication status and roles.
1. **User Management:**
   1. **User Class:** Represents user data.
   1. **User DAO:** Handles database operations related to users.
   1. **User Errors:** Custom error classes for user-related errors.
   1. **User Routes:** Express routes for user registration and login.
1. **Cart Management:**
   1. **Cart Class:** Represents cart data.
   1. **Cart DAO:** Handles database operations related to carts.
   1. **Cart Errors:** Custom error classes for cart-related errors.
   1. **Cart Controller:** Controller for cart operations.
   1. **Cart Routes:** Express routes for cart management.
1. **Product Management:**
   1. **Product Class:** Represents product data.
   1. **Product DAO:** Handles database operations related to products.
   1. **Product Errors:** Custom error classes for product-related errors.
   1. **Product Controller:** Controller for product operations.
   1. **Product Routes:** Express routes for product management.
1. **Error Handling:**
   1. **ErrorHandler:** Centralized error handling middleware.
   1. **Custom Error Classes:** Custom error classes for different types of errors in each module.
1. **Express Server:**
   1. **Express App:** Configuration and initialization of the Express server.
   1. **Main Routes:** Mounting of routes for authentication, user management, cart management, and product management.
1. **Database:**
   1. **SQLite3 Database:** Connection setup and configuration.
1. **Validation:**
- **Express Validator:** Middleware for request validation in routes.
9. **Utility Functions:**
   1. **Utility Module:** Contains utility functions used across the application.
9. **Testing:**
   1. **Test Scripts:** Provided test scripts in package.json for running tests.
   1. **Test Database Setup:** Configuration for using a separate test database.
9. **Documentation:**
- **Requirement Document Template:** Including sections for authentication, user management, cart management, product management, error handling, and testing.

**System Design**

<describe here system design>

<must be consistent with Context diagram>

**Deployment Diagram**

<describe here deployment diagram >

[ref1]: Aspose.Words.b1da6218-936f-4034-b869-febe48ee2791.002.png
