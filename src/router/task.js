const express = require('express');
const Task = require('../models/Task');
const authHandler = require('../middleware/authHandler');

const router = new express.Router();

router.post('/task', authHandler, async function (req, res) {
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        createdBy: req.user._id
    })
    try {
        await task.save();
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

//get /task?completed=true
//get /task?limit=2&skip=4
//get localhost:5000/task?sortBy=createdAt:asc
router.get('/task', authHandler, async function (req, res) {
    const match = {};
    const sort = {};
    if(req.query.complete){
        match.complete = req.query.complete === "true"
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    try {
        await req.user.populate({
            path:'tasks', 
            match, 
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
    // try {
    //     const tasks = await Task.find({});
    //     res.status(200).send(tasks);
    // } catch (error) {
    //     res.status(400).send(error)
    // }
});

router.get('/task/:id', authHandler, async function (req, res) {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, createdBy: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }

    // try {
    //     const task = await Task.findById({_id:req.params.id});
    //     if(!task){
    //         return res.status(500).send("task not found");
    //     }
    //     res.status(200).send(task);
    // } catch (error) {
    //     res.status(400).send(error);
    // }
})

router.patch("/task/:id", authHandler, async function (req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "complete"];
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if(!isValidUpdate){
        return res.status(400).send("invalid update");
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }

    // try {
    //     const task = await Task.findById(req.params.id)

    //     updates.forEach((update) => task[update] = req.body[update])
    //     //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true});
    //     if(!task){
    //        return res.status(400).send("No user found")
    //     }
    //     res.status(200).send(task);
    // } catch (error) {
    //     res.status(400).send(error)
    // }
})

router.delete("/task/:id", authHandler, async function (req, res){
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
    // try {
    //     const task = await Task.findByIdAndDelete(req.params.id);
    //     if(!task){
    //         return res.status(404).send("task not found")
    //     }
    //     res.send(task);
    // } catch (error) {
    //     res.status(400).send(error)
    // }
});

module.exports = router

