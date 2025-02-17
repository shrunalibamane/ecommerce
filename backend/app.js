const express = require('express');
const app = express();
const mongoose = require('mongoose')
const {User} = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');



mongoose.connect('mongodb://127.0.0.1:27017/ecommerce') 
.then(()=>{

    console.log("db is connected");

}).catch(()=>
{
    console.log("db is not connected");
})
app.use(cors());
app.use(morgan("dev"));


// use middleware
app.use(express.json())


//task 1 route for register

app.post('/register', async(req,res)=>{
    const {email,password,name} = req.body;
    if(!email || !password || !name){
        res.status(400).json({message:"some fields are missing"})

    }
    //to check user is 
    const isUserAlreadyExist = await User.findOne({email});

    if(isUserAlreadyExist){
        res.status(400).json({message:"User already exist"})
        return;

    }else{
        //hashing password
        const salt = bcrypt.genSaltSync(10);
        const hashPassword  = bcrypt.hashSync(password,salt);

        //token generate
        const token = jwt.sign(email,"supersecreat");
        await User.create({
            name:name,
            email:email,
            password:hashPassword,
            token:token
        });

        // task 2
        app.post('/login',async(req,res)=>{
            const {email,password} = req.body;

            const  user=await User.findOne({email:email});
            if(user){
                //if user exists

                const isPasswordMatched = bcrypt.compareSync(password,user.password);
                if(isPasswordMatched == true){
                    res.status(200).json({
                        name:user.name,
                        token:user.token,
                        email:user.email
                    });
                }else{
                    res.status(400).json({message:"password not match"});
                }
            }else{
                res.status(400).json({message:"user is not registered please register first"});
            }
        })
            
        

    }
})




let PORT=8080;
app.listen(PORT,()=>
{
    console.log(`server is connected to ${PORT}`);
})