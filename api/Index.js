const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secret = "akjsdflkj23rjsajklalksjkdf";
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const app = express();
const compression = require('compression');


app.use(cors({credentials:true, origin:'http://localhost:3000'}));


app.use((req, res, next) => {
    //console.log('Request URL:', req.url);
    next();
});

app.use(compression());

app.use((req, res, next) => {
    res.on('finish', () => {
        //cconsole.log('Response Headers:', res.getHeaders());
    });
    next();
});



app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect("mongodb+srv://alan05ja:mXddSD3YCg7wlVb7@cluster0.j3mkqv1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
//W2mOXrsPtccqmp8H
//Caching logic
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

function cacheMiddleware(req, res, next) {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
        console.log(`Cache hit for key: ${key}`);
        return res.json(cachedResponse);
    }
    console.log(`Cache miss for key: ${key}`);
    res.sendResponse = res.json;
    res.json = (body) => {
        cache.set(key, body);
        res.sendResponse(body);
    };
    next();
}

const clearPostCache = () => {
    const keys = cache.keys();
    keys.forEach((key) => {
        if (key.startsWith('/post')) {
            console.log(`Clearing cache for key: ${key}`);
            cache.del(key);
        }
    });
};



app.post('/register',async (req,res) => {
    //res.json("Test data");
    let {username,password,role} = req.body;
    if(role !== "admin"){
        role = "user";
    }
    // let role ="user";
   
    
    try{
        if(!username || !password){
            return res.status(400).json({message: "Username and Password are required"});
        }
        if(username.length<6){
            return res.status(400).json({messsage: "The username length should be greater than or equal to 6"});
        }
        if(password.length<8){
            return res.status(400).json({message: "The password length should be greater than or equal to 8"});
        }
        const userData = await User.create({
            username,
            password: bcrypt.hashSync(password,salt),
            role
        });
        res.status(201).json({data: userData, message: "Created User"});
    }
    catch(e){
        console.log(e);
        res.status(500).json(e);
    }
   
});

app.put('/user/:userId',async (req,res) => {
    const {token} = req.cookies;
    const {userId} = req.params;
    const {email,phonenumber} = req.body;
    try{
        jwt.verify(token,secret,{},async (error,info) => {
            if(error){
                return res.status(401).json({message: "Authentication failed. Please log in again"});
            }
            // if(info.role !== "admin"){
            //     return res.status(403).json({messge:"Not authorized to edit user accounts"});
            // }
            const userDoc = await User.findOne({_id: userId});
           
            if(!userDoc){
                return res.status(404).json({message: "User not found for userId:" + userId});
            }
            const isAuthor = JSON.stringify(userDoc._id) === JSON.stringify(info.id);
            if(info.role !== "admin"){
                if(!isAuthor){
                    return res.status(403).json('You dont have the privilege to edit the user data');
                }
            }
            await userDoc.updateOne({
                email,
                phonenumber
            });
            res.json({message: "Updated user data"});

        });
    }
    catch(e){
        console.log(e);
        res.status(500).json(e);
    }
    
});

app.delete('/user/:userId', async (req,res) => {
const {token} = req.cookies;
const {userId} = req.params;
    try{
        jwt.verify(token,secret,{},async (error,info) => {
            if(error){
                return res.status(401).json({message: "Authentication failed. Please log in again"});
            }
        if(info.role !== "admin"){
          return res.status(403).json({message: "You dont have the privilege to delete user accounts"});
        }
        const userDoc = User.findOne({_id: userId});
        if(!userDoc){
            return res.status(404).json({message: "User not found"});
        }
        if(userDoc.role == "admin"){
            return res.status(403).json({message: "Admin accounts cant be deleted"});
        }
       await userDoc.deleteOne({_id: userId})
        res.json({message: "Deleted"});
        })
    }
    catch(e){
        console.log(e);
        res.status(500).json(e);
    }
})



app.post('/login',async (req,res) => {
    const {username, password} = req.body;
    try{
        if(!username || !password){
            return res.status(400).json({message: "Username and Password are required"});
        }
        const userDoc = await User.findOne({username:username});
        if(!userDoc){
            return res.status(404).json({message: "User Not Found"});
        }
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if(passOk){
            jwt.sign({username,id:userDoc._id,role:userDoc.role},secret,{},(error,token) => {
                if(error) throw error;
                // console.log("Hello");
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
        res.status(500).json(e);
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
    cache.flushAll();
    res.cookie('token', '').json('ok');
});

app.post('/post', async (req,res) => {
    // const {originalname,path,destination,filename} = req.file;
    // const parts = originalname.split('.');
    // const ext = parts[parts.length - 1];
    // const newPath = destination+filename+'.'+ext;
    // console.log(newPath);
    // fs.renameSync(path, newPath);
    const{token} = req.cookies;
    try{
        jwt.verify(token,secret,{},async (error,info) => {
            if(error) {
                return res.status(401).json({message: "Authentication failed. Please log in again"});
            }
            const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover,
            author:info.id
        });
        //cache.del('/post');
        clearPostCache();
        res.json(postDoc);
        });
    } catch (e){
        console.log(e);
        res.status(500).json(e)
    }
    

    
    
});

app.put('/post', async (req, res) => {
//    let newPath = null;
//     if(req.file) {
//     const {originalname,path,destination,filename} = req.file;
//     const parts = originalname.split('.');
//     const ext = parts[parts.length - 1];
//     newPath = destination+filename+'.'+ext;
//     console.log(newPath);
//     fs.renameSync(path, newPath); 
//     }

    const{token} = req.cookies;
    jwt.verify(token,secret,{},async (error,info) => {
        if(error) {
           return res.status(401).json({message: "Authentication failed. Please log in again"});
        }
        const {postId, title, summary, content, cover} = req.body;
        const postDoc = await Post.findById(postId);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        console.log(info.role);
        if(info.role!=='admin'){
            if(!isAuthor){
                return res.status(400).json('you are not the author or you dont have admin privilege');
            }
        }
        
         await postDoc.updateOne({
            title,
            summary,
            content,
            cover: cover ? cover : postDoc.cover
         });
        console.log(`Clearing cache for /post and /post/${postId}`);
        // cache.del('/post');
        // cache.del(`/post/${id}`);
        clearPostCache();
  
    res.json({message: "Updated the data"});
    });
});

// app.get('/post', cacheMiddleware, async (req, res) => {
//     const { page = 1, limit = 10} = req.query; // Get page and limit from query parameters, default to page 1 and limit 10

//     try {
//         const posts = await Post.find()
//             .populate('author', ['username'])
//             .sort({ createdAt: -1 })
//             .skip((page - 1) * limit) // Skip the number of documents based on the current page
//             .limit(Number(limit)); // Limit the number of documents

//         const totalPosts = await Post.countDocuments(); // Total number of documents

//         res.json({
//             posts,
//             totalPages: Math.ceil(totalPosts / limit), // Total number of pages
//             currentPage: Number(page),
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });



app.get('/post', cacheMiddleware, async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query; 

    try {
        // Build search query
        const searchQuery = search
            ? { title: { $regex: search, $options: 'i' } } 
            : {};

        const posts = await Post.find(searchQuery)
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit) 
            .limit(Number(limit)); 

        const totalPosts = await Post.countDocuments(searchQuery); 
        
        res.json({
            posts,
            totalPages: Math.ceil(totalPosts / limit), 
            currentPage: Number(page),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.get('/post/:id', cacheMiddleware, async (req,res) => {
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
        if (postDoc.author.toString() === decoded.id|| decoded.role === 'admin') {
            await postDoc.deleteOne();
            console.log(`Clearing cache for /post and /post/${id}`);
            // cache.del('/post');
            // cache.del(`/post/${id}`);
            clearPostCache();
            res.json({ success: true });
        } else {
            res.status(403).json({ error: 'You are not the author of this post' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.post('/post/:postId/comment', async (req,res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { token } = req.cookies;
    try{
        // const decoded = jwt.verify(token, secret);
        jwt.verify(token,secret,{},async (error,info) => {
            if(error) {
                return res.status(401).json({message: "Authentication failed. Please log in again"});
            }
            const userId = info.id;

            const comment = await Comment.create({
                content,
                author : userId,
                post: postId
            });
            cache.del(`/post/${postId}/comments`);
            res.json(comment);
        })
      
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Unable to add comment"});
    }
});

app.get('/post/:postId/comment', cacheMiddleware, async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await Comment.find({ post: postId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to fetch comments' });
    }
});

app.put('/comment/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const { token } = req.cookies;

    try{
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;
        const comment = await Comment.findById(commentId);
        if(!comment){
            return res.status(404).json({ error: "Comment not found"});
        }

        if(comment.author.toString() === userId || decoded.role === 'admin'){
            comment.content = content;
            await comment.save();

            cache.del(`/post/${comment.post}/comments`);
            res.json({success: true, comment});
        }
        else{
            res.status(403).json({ error: 'Not authorized to update this comment' });
        }
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Unable to update comment' });
    }
});

app.delete('/comment/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { token } = req.cookies;

    try {
        const decoded = jwt.verify(token, secret);
        const comment = await Comment.findById(commentId);

        if (comment.author.toString() === decoded.id || decoded.role === 'admin') {
            await comment.deleteOne();
            res.json({ success: true });
        } else {
            res.status(403).json({ error: 'Not authorized to delete this comment' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to delete comment' });
    }
});


app.listen(4000);