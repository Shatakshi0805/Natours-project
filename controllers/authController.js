const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//SIGNUP USER
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
// first arg is PAYLOAD=> DATA OF USER TO BE PAASED, SECRET KEY, 
    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    })
});


//LOGIN USER
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) email and pwd exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }
    //2) check if user exists
    const user = await User.findOne({ email }).select('+password');//output should contain password as well

    //to avoid endless waiting if user doesnt exist, mention as 2nd param so that only if user exist then only go for correctPassword check
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    //3) if everything is ok, send token to client
    const token = signToken(user._id);
    
    res.status(200).json({
        status: "success",
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //1. get token and check if it exists
    //Access to routes will be given if user has token, check if user has token in req.headers
    //If Token is there check if that token header starts with "Bearer", only then proceed to further oprn
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];//user has auth token, split the header by space, which will create each word into array element and second eleof array [1] is our token as first is "Bearer"
    }
    
    //if no token was found, do not allow user to enter/access the route
    if (!token) {
        return next(new AppError("You are not logged in! Please login to access", 401));
    }
    //Having token is fine, but check if the token is even valid or not in order to allow further access
    //2. verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);//Gives me payload that is user id, createdAt, expiresIn time
    
    //check if user that is trying to enter in the application even exists in the DB, that is it has account created(@ signup) and exists
    //3. check if user still exists
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
        return next(new AppError("The user with this token does not exists!", 401));
    }
    //4. check if user changed pwd after token was issued
    if (freshUser.passwordChangedAfter(decoded.iat)) {//iat = issued at
        return next(new AppError("User recently changed password. Please log in again.", 401));
    }

    req.user = freshUser;
    
    next();
})