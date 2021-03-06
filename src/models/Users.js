const mongoose = require('mongoose');
const validator  = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter a valid Email address");
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim: true,
        minlength:6,
        validate(value){
            if(value === "password"){
                throw new Error("password should not be password");
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error("Age must be grater than zero");
            }
        }
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer,
    }
},{
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'createdBy'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject();
    delete userObject.tokens;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}


userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, )

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await  User.findOne({email});

    if(!user){
        throw new Error("Unble to login");
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Unable to login");
    };

    return user;
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Delete user task when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({createdBy:user._id});

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;