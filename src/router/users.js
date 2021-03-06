const express = require('express');
const multer = require('multer');
const sharp = require('sharp')
const User = require('../models/Users');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const authHandler = require('../middleware/authHandler');

const router = new express.Router();

router.post('/users', async function (req, res) {
    const user = new User(req.body);
    
    try {

        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })

    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/users/login", async function(req, res) {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/users/logout", authHandler, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.status(200).send("Successfully logout");
    } catch (error) {
        res.status(400).send("Error");
    }
})

router.post("/users/logoutAll", authHandler, async (req, res) => {
    console.log("logout all")
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send("Successfully logout");
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users/me', authHandler, async function (req, res) {
    res.send(req.user);
})

router.get('/users', authHandler, async function (req, res) {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (error) {
        res.status(400).send(error);
    }
})



router.get('/users/:id', async function (req, res) {
    try {
        const user = await User.findById({_id:req.params.id});
        if(!user){
            return res.status(500).send("user not found")
        };
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error)
    }
})

// router.patch("/users/:id", async function (req, res) {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ["name", "email", "password", "age"];
//     const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
//     console.log(isValidUpdate)

//     if(!isValidUpdate){
//         return res.status(400).send("invalid update");
//     }
//     try {

//         const user = await User.findById(req.params.id)
//         updates.forEach((update) => {
//             user[update] = req.body[update];
//         })

//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true});
//         if(!user){
//            return res.status(400).send("No user found")
//         }

//         await user.save()
//         res.status(200).send(user);
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

router.patch('/users/me', authHandler, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.delete("/users/:id", async function (req, res){
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if(!user){
//             return res.status(404).send("user not found");
//         }
//         res.send(user);
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

router.delete('/users/me', authHandler, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})
const upload = multer({
    dest:"avatars",
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload a jpg file"));
        }
        cb(undefined, true);
    }
})
router.post("/users/me/avatar", authHandler,upload.single("avatar"), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("file upload")
}, (error, req,res,next) => {
    res.status(400).send({error:error.message});
})

router.delete('/users/me/avatar', authHandler, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
});


router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
});

module.exports = router;