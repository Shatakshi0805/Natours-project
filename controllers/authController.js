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
        passwordConfirm: req.body.passwordConfirm
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