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
const fs = require('fs');
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
app.use('/uploads',express.static(__dirname + '/uploads'))
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin : process.env.CLIENT_URL
}))

app.get('/test',(req,res)=>{
    res.json("the test route is up!");
})

const getUserDataFromRequest = async (req)=>{
    return new Promise((resolve,reject)=>{
        const token  =req.cookies?.token;
        if(token){
            jwt.verify(token,jwtSecret,{},(err,userData)=>{
                if(err) throw err;
                resolve(userData);
            })
        }else{
            reject('no token');
        }

    }) 
}

app.get('/messages/:UserId',async (req,res)=>{
    const {UserId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.UserId;

    const messages = await Message.find({
        sender:{$in:[UserId,ourUserId]},
        recipient:{$in:[UserId,ourUserId]}
    }).sort({createdAt:1})
     
    res.json(messages);
})

app.get('/people' , async (req,res)=>{
    const users = await User.find({},{'_id':1, username:1});
    res.json(users);
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

app.post('/logout',async(req,res)=>{
    res.cookie('token','',{sameSite:'none',secure:true}).json("logged out!");
})

app.post('/register',async (req,res)=>{
    // console.log(req.body);
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

    const notifyAboutOnlinePeople = ()=>{
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify(
                {
                    online: [...wss.clients].map(c => ({UserId : c.UserId, username : c.username }))
                }
            ))
        })
    }

    connection.isAlive = true;

    connection.timer = setInterval(()=>{
        connection.ping();
        connection.deathTimer = setTimeout(()=>{
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople();
            // console.log('death')
        },1000)
    },5000);

    connection.on('pong',()=>{
        // console.log('pong');
        clearTimeout(connection.deathTimer); 
    })

    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString =  cookies.split(';').find(str => str.startsWith('token='));
        // console.log(tokenCookieString);
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
        const {recipient,text,file} = msgData;
        let filename = null
        if(file){
            // console.log(file);
            const splitfile = file.info.split('.');
            const extension = splitfile[splitfile.length -1];
            filename = Date.now() + '.' + extension;
            const path = __dirname + '/uploads/'+filename;
            const bufferData = Buffer.from(file.data,'base64');
            fs.writeFile(path,bufferData,()=>{
                console.log('file saved at:'+ path);
            })
        }
        if(recipient && (text || file)){
            const MsgDoc = await Message.create({sender: connection.UserId,
                recipient,
                text,
                file: file? filename : null
            });
            [...wss.clients].filter(c => c.UserId === recipient).forEach(c=>c.send(JSON.stringify({text,sender:connection.UserId,
                recipient,
                file: file? filename : null,
                _id:MsgDoc._id
            })));
        }
    });
    //notify everyone about online people 
    notifyAboutOnlinePeople();
})

wss.on('close',data =>{
    console.log('disconnected!',data)
})


