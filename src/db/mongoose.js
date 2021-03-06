const mongoose = require('mongoose');
const validator  = require('validator');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true
}, (err, db) => {
    if (err) {
        return console.log(err);
    }else{
        return console.log("connected successfully")
    }
});

// const User = mongoose.model('User', {
//     name:{
//         type: String,
//         required: true,
//         trim: true
//     },
//     email:{
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         validate(value){
//             if(!validator.isEmail(value)){
//                 throw new Error("Enter a valid Email address");
//             }
//         }
//     },
//     password:{
//         type:String,
//         required:true,
//         trim: true,
//         minlength:6,
//         validate(value){
//             if(value === "password"){
//                 throw new Error("password should not be password");
//             }
//         }
//     },
//     age:{
//         type: Number,
//         default: 0,
//         validate(value){
//             if(value < 0){
//                 throw new Error("Age must be grater than zero");
//             }
//         }
//     }
// });

// const me = new User({
//     name: '   mike   ',
//     email: 'MKS77777@Gmail.Com  ',
//     password: 'vvggf86868ggrgerrfdfgdgd'
// });

// me.save()
//     .then(() => console.log(me))
//     .catch((err) =>console.log(err));


// const Task = mongoose.model('Task', {
//     description:{
//         type: String,
//         required: true,
//         trim: true
//     },
//     complete:{
//         type: Boolean,
//         default: false
//     }
// });

// const task = new Task({
//     description:"Study Math"
// })

// task.save()
//     .then((result) => console.log(result))
//     .catch((err) =>console.log(err));