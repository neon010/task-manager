const express = require('express');
require("./db/mongoose");
const User = require('./models/Users');
const Task = require('./models/Task')

const userRouter = require('./router/users');
const taskRouter = require('./router/task')

const app = express();
const port = process.env.PORT
// app.use((req, res, next) =>{
//     res.status(503).send("Site is under mentainence")
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, ()=>{
    console.log("server is listening on port "+ port);
})