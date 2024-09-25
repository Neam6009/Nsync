const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message')
const ws = require('ws');
const cookieParser = require('cookie-parser');

dotenv.config();
const jwtSecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10);
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("mongo ok")
}).catch((err)=>{
    console.log("mongoose error " , err);
});


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin : process.env.CLIENT_URL
}))

app.get('/test',(req,res)=>{
    res.json("the test route is up!");
})

app.get('/profile',(req,res)=>{
    const token  =req.cookies?.token;
    if(token){
        jwt.verify(token,jwtSecret,{},(err,userData)=>{
            if(err) throw err;
            res.json(userData);
        })
    }else{
        res.status(401).json('no token');
    }
})

app.post('/login' ,async (req,res)=>{
    const{username,password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser){
        const passOk = bcrypt.compareSync(password,foundUser.password);
        if(passOk){
            jwt.sign({UserId:foundUser._id ,username: foundUser.username},jwtSecret,{},(err,token)=>{
                if(err) throw err;
                res.cookie('token',token,{sameSite:'none',secure:true}).status(200).json({
                    id: foundUser._id
                })
            })
        }
    }
})

app.post('/register',async (req,res)=>{
    console.log(req.body);
    const {username,password} = req.body;
    try{
        const hashedPassword = bcrypt.hashSync(password,bcryptSalt);
        const userCreated = await User.create({username:username,password: hashedPassword});
        jwt.sign({UserId : userCreated._id,username},jwtSecret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({
                _id: userCreated._id,
                username
            }).then(()=>{
                console.log("cookie set")
            }).catch((err)=>{
                console.log(err);
            });
            
        });
    }catch(err){
        if(err) throw err;
        res.status(500).json('error');
    }
   
   
});



const server = app.listen(4000,(req,res)=>{
    console.log("the server is up on port 4000");
})


const wss = new ws.WebSocketServer({server});

wss.on('connection',(connection,req)=>{
    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString =  cookies.split(';').find(str => str.startsWith('token='));
        console.log(tokenCookieString);
        if(tokenCookieString){
            const token = tokenCookieString.split("=")[1];
            if(token){
                jwt.verify(token,jwtSecret,{} ,(err,userData)=>{
                    if(err) throw err;
                    const {UserId,username} = userData;
                    connection.UserId = UserId;
                    connection.username = username;
                })
                
            }
        }
    }

    connection.on('message',async (message)=>{
        const msgData = JSON.parse(message.toString());
        const {recipient,text} = msgData;
        if(recipient && text){
            const MsgDoc = await Message.create({sender: connection.UserId,
                recipient,
                text
            });
            [...wss.clients].filter(c => c.UserId === recipient).forEach(c=>c.send(JSON.stringify({text,sender:connection.UserId,
                id:MsgDoc._id
            })));
        }
    });
    
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify(
            {
                online: [...wss.clients].map(c => ({UserId : c.UserId, username : c.username }))
            }
        ))
    })
})


