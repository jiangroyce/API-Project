const { validationResult, check, query } = require('express-validator');

const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const errors = {};
        validationErrors
            .array()
            .forEach(error => errors[error.path] = error.msg);
        const err = Error("Bad request");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request";
        next(err);
    }
    next();
};

async function isValidDate(str) {
    if (!str.match(/^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g))
        {
            throw new Error()
        }
}

// Express Validator for Create Group
const validateCreateGroup = [
    check('name')
        .isLength({ min: 1, max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    handleValidationErrors
]

const validateEditGroup = [
    check('name')
        .if(check('name').exists( { checkFalsy: true }))
        .isLength({ min: 1, max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .if(check('about').exists( { checkFalsy: true }))
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .if(check('type').exists( { checkFalsy: true }))
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .if(check('private').exists( { checkFalsy: true }))
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check('city')
        .if(check('city').notEmpty())
        .isLength({ min: 1 }).withMessage("City is required"),
    check('state')
        .if(check('state').notEmpty())
        .isLength({ min: 1 }).withMessage("State is required"),
    handleValidationErrors
]

const validateCreateVenue = [
    check('address')
    .exists({ checkFalsy: true })
    .isLength({ min: 5 })
    .withMessage("Street address is required"),
    check('city')
    .isLength({ min: 4 })
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
    check('state')
    .isLength({ min: 2 })
    .exists({ checkFalsy: true })
    .withMessage("State is required"),
    check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
    check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
    handleValidationErrors
]

const validateEditVenue = [
    check('address')
        .if(check('address').exists( { checkFalsy: true }))
        .isLength({ min: 5 })
        .withMessage("Street address is required"),
    check('city')
        .if(check('city').exists( { checkFalsy: true }))
        .isLength({ min: 4 })
        .withMessage("City is required"),
    check('state')
        .if(check('state').exists( { checkFalsy: true }))
        .isLength({ min: 2 })
        .withMessage("State is required"),
    check('lat')
        .if(check('lat').exists( { checkFalsy: true }))
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be within -90 and 90"),
    check('lng')
        .if(check('lng').exists( { checkFalsy: true }))
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be within -180 and 180"),
    handleValidationErrors
]

const validateCreateEvent = [
    check('name')
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters"),
    check('type')
    .isIn(["Online", "In person"])
    .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
    .isInt({ min: 0 })
    .withMessage("Capacity must be an integer"),
    check('price')
        .isFloat({ min: 0 })
        .withMessage("Price is invalid"),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check('startDate')
        .isLength({ min: 19 })
        .custom(async startDate => isValidDate(startDate))
        .withMessage("Start date must be a valid datetime in YYYY-MM-DD HH:MM:SS format"),
    check('endDate')
        .isLength({ min: 19 })
        .custom(async endDate => isValidDate(endDate))
        .withMessage("End date must be a valid datetime in YYYY-MM-DD HH:MM:SS format"),
    handleValidationErrors
]

const validateEditMembership = [
    check('memberId')
        .isInt({ min: 1 })
        .withMessage("Invalid memberId"),
    check('status')
        .isIn(["pending", "member", "co-host"])
        .withMessage("Invalid status"),
    handleValidationErrors
]

const validateEditEvent = [
    check('name')
        .if(check('name').notEmpty())
        .isLength({ min: 5 })
        .withMessage("Name must be at least 5 characters"),
    check('type')
        .if(check('type').notEmpty())
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .if(check('capacity').notEmpty())
        .isInt({ min: 0 })
        .withMessage("Capacity must be an integer"),
    check('price')
        .if(check('price').notEmpty())
        .isFloat({ min: 0 })
        .withMessage("Price is invalid"),
    check('description')
        .if(check('description').notEmpty())
        .isLength({ min: 4 })
        .withMessage("Description is required"),
    check('startDate')
        .if(check('startDate').notEmpty())
        .isLength({ min: 19 })
        .custom(async startDate => isValidDate(startDate))
        .withMessage("Start date must be a valid datetime in YYYY-MM-DD HH:MM:SS format"),
    check('endDate')
        .if(check('endDate').notEmpty())
        .isLength({ min: 19 })
        .custom(async endDate => isValidDate(endDate))
        .withMessage("End date must be a valid datetime in YYYY-MM-DD HH:MM:SS format"),
    handleValidationErrors
]

const validateEditAttendance = [
    check('userId')
        .isInt({ min: 1 })
        .withMessage("Invalid userId"),
    check('status')
        .isIn(["pending", "attending", "waitlist"])
        .withMessage("Invalid status"),
    handleValidationErrors
];

const validateQueryParams = [
check('page')
    .if(check('page').notEmpty())
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),
check('size')
    .if(check('size').notEmpty())
    .isInt({ min: 1 })
    .withMessage("Size must be greater than or equal to 1"),
check('name')
    .if(check('name').notEmpty())
    .isLength({ min: 3 })
    .withMessage("Name must be a string"),
check('type')
    .if(check('type').notEmpty())
    .isIn(["Online", "In person"])
    .withMessage("Type must be 'Online' or 'In person'"),
check('startDate')
    .if(check('startDate').notEmpty())
    .isLength({ min: 19 })
    .custom(async startDate => isValidDate(startDate))
    .withMessage("Start date must be a valid datetime in YYYY-MM-DD HH:MM:SS format"),
handleValidationErrors
]
module.exports = {
    handleValidationErrors,
    validateCreateGroup,
    validateEditGroup,
    validateCreateVenue,
    validateCreateEvent,
    validateEditMembership,
    validateEditAttendance,
    validateEditEvent,
    validateEditVenue,
    validateQueryParams
};
