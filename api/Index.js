const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secret = "akjsdflkj23rjsajklalksjkdf";
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const app = express();


app.use(cors({credentials:true, origin:'http://localhost:3000'}));
//
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect("mongodb+srv://alan05ja:mXddSD3YCg7wlVb7@cluster0.j3mkqv1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

app.post('/register',async (req,res) => {
    //res.json("Test data");

    const {username,password} = req.body;
    try{
        const userData = await User.create({
            username,
            password: bcrypt.hashSync(password,salt),
        });
        res.json(userData);
    }
    catch(e){
        console.log(e);
        res.status(404).json(e);
    }
   
});

app.post('/login',async (req,res) => {
    const {username, password} = req.body;
    try{
        const userDoc = await User.findOne({username:username});
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if(passOk){
            jwt.sign({username,id:userDoc._id},secret,{},(error,token) => {
                if(error) throw error;
                res.cookie('token',token).json({
                    id: userDoc._id,
                    username
                });
            });
        }
        else{
            res.status(400).json("Wrong credentials");
        }
    }
    catch(e){
        console.log(e);
        res.status(404).json(e);
    }
    
});

app.get('/profile',(req,res) => {
    const{token} = req.cookies;
    jwt.verify(token,secret,{},(error,info) => {
        if(error) throw error;
        res.json(info);
    });
   
});

app.post('/logout',(req,res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post',uploadMiddleware.single('file'), async (req,res) => {
    const {originalname,path,destination,filename} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = destination+filename+'.'+ext;
    console.log(newPath);
    fs.renameSync(path, newPath);

    const{token} = req.cookies;
    jwt.verify(token,secret,{},async (error,info) => {
        if(error) throw error;
        const {title, summary, content} = req.body;
    const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author:info.id
    });
    res.json(postDoc);
    });

    
    
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
   let newPath = null;
    if(req.file) {
    const {originalname,path,destination,filename} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = destination+filename+'.'+ext;
    console.log(newPath);
    fs.renameSync(path, newPath); 
    }

    const{token} = req.cookies;
    jwt.verify(token,secret,{},async (error,info) => {
        if(error) throw error;
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if(!isAuthor) {
         return res.status(400).json('you are not the author');
         }
         await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover
         });
        
  
    res.json(postDoc);
    });
});

app.get('/post', async (req, res) => {
    res.json(await Post.find()
    .populate('author', ['username'])
    .sort({createdAt: -1})
    .limit(20)
);
})

app.get('/post/:id', async (req,res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author',['username']);
    res.json(postDoc);
})

app.delete('/post/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
    try {
        const decoded = jwt.verify(token, secret);
        const postDoc = await Post.findById(id);
        if (postDoc.author.toString() === decoded.id) {
            await postDoc.deleteOne();
            res.json({ success: true });
        } else {
            res.status(403).json({ error: 'You are not the author of this post' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.listen(4000);



