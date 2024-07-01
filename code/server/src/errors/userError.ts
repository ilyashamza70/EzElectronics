const USER_NOT_FOUND = "The user does not exist"
const USER_NOT_MANAGER = "This operation can be performed only by a manager"
const USER_ALREADY_EXISTS = "The username already exists"
const USER_NOT_CUSTOMER = "This operation can be performed only by a customer"
const USER_NOT_ADMIN = "This operation can be performed only by an admin"
const USER_IS_ADMIN = "Admins cannot be deleted"
const UNAUTHORIZED_USER = "You cannot access the information of other users"
const WRONG_INPUT = "You cannot leave this blank the .... "
const USER_NOT_LOGGED_IN = "User is not currently logged id, please refresh page"
const USER_IS_NOT_BORN = "The selected birthdate indicates user has yet to be born, please correct"

/**
 * Represents an error that occurs when a users selected Birthdate is after current datetimestamp.
 */
class UserIsNotBorn extends Error{
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_IS_NOT_BORN
        this.customCode = 401
    }

}
/**
 * Represents an error indicating one of the textbox is either left empty or wrong format???
 */
class WrongInput extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = WRONG_INPUT
        this.customCode = 401
    }
}
/**
 * Represents an error indicating user is not logged in or session had reached timeout
 */
class UserNotLoggedIn extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_LOGGED_IN
        this.customCode = 401
    }
}


/**
 * Represents an error that occurs when a user is not found.
 */
class UserNotFoundError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super()
        this.customMessage = USER_NOT_FOUND
        this.customCode = 404
    }
}

/**
 * Represents an error that occurs when a user is not a manager.
 */
class UserNotManagerError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_MANAGER
        this.customCode = 401
    }
}

/**
 * Represents an error that occurs when a user is not a customer.
 */
class UserNotCustomerError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_CUSTOMER
        this.customCode = 401
    }
}

/**
 * Represents an error that occurs when a username is already in use.
 */
class UserAlreadyExistsError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_ALREADY_EXISTS
        this.customCode = 409
    }
}
/**
 * Represents an error that indicates user is not an Admin so can't perform the action requested
 */
class UserNotAdminError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_ADMIN
        this.customCode = 401
    }
}
/**
 * Represents an error that indicates user should not be an Admin so he can't perform the action requested
 * It should be Manager only action
 */
class UserIsAdminError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_IS_ADMIN
        this.customCode = 401
    }
}
/**
 * Represents an error that indicates user cannot do this operation, missing righs? not an admin? not a manager? etc.
 */
class UnauthorizedUserError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = UNAUTHORIZED_USER
        this.customCode = 401
    }
}

export { UserNotFoundError,UserIsNotBorn,UserNotLoggedIn, UserNotManagerError, UserNotCustomerError, WrongInput,UserAlreadyExistsError, UserNotAdminError, UserIsAdminError, UnauthorizedUserError }