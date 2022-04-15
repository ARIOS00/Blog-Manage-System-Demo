# Personal Blog Manage System



## 1. Introduction

This project is a blog manage system based on Node.js and basic JavaScript. To build up this project you need basic concept about:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Database: MySQL

This manage system implements basic functions like personal account management, article publishment, article category management.



## 2. Run the Project

After downloading this project, you can run a terminal in the root file (Make sure you install Node.js) and input the command:

```bash
node app.js
```

Now the server is running at port 2000 (Make sure this port is not occupied by other processes). Then click the link:

http://127.0.0.1:2000/index.html

Now you enter the login page. 

Before operating the pages ensure that all third party packages are installed correctly and relative database is established!!!!



## 3. Build the Backend Part of the Project

### 1. Initialization

1. First, create a root folder named *ManageSystem*. Then open a terminal here and input:

```bash
npm init -y 
```

to initialize *package.json* in this folder. 

2. Install all packages below you need in this project by using: 

```bash
npm i xxx
```

"@escook/express-joi": "^1.1.1",

  "bcryptjs": "^2.4.3",

  "cors": "^2.8.5",

  "express": "^4.17.3",

  "express-jwt": "^6.1.1",

  "joi": "^17.6.0",

  "jsonwebtoken": "^8.5.1",

  "multer": "^1.4.2",

  "multiparty": "^4.2.3",

  "mysql": "^2.18.1"

3. Create *app.js* in the root folder as the main interface of the backend part of project. And write codes below to initialize it. 

   ```javascript
   // import express module
   const express = require('express');
   // import CORS middleware module
   const cors = require('cors');
   // initialize server
   const app = express();
   
   //register cors as global middleware
   app.use(cors());
   
   //register this middleware to parse application/x-www-form-urlencoded data 
   app.use(express.urlencoded({ extended: false }))
   
   // run server at port 2000
   app.listen(3007, function () {
     console.log('api server running at 2000');
   })
   ```

4. Create *router* folder in root folder to store all router modules. Create *router_handler* folder to store all router handler functions modules.

5. Create *user.js* in router folder as the basic account management router interface. Then write codes below:

   ```javascript
   const express=require('express');
   routerHandler=require('../router_handler/user');
   
   //create router object
   const router=express.Router();
   
   //router for register new account
   router.post('/register',routerHandler.register);
   
   //router for login
   router.post('/login',routerHandler.login);
   
   //router for jumping to register page
   router.get('/register.html',)
   
   //export this module
   module.exports=router;
   ```

6. Import *router* module in *app.js*:

   ```javascript
   const router = require('./router/user')
   //register router module and add '/api' to initial router path
   app.use('/api', router)
   ```

7. Create *user.js* in *router_handler* folder and define router handler functions:

   ```javascript
   exports.register = (req, res) => {
   }
   
   exports.login = (req, res) => {
   }
   ```



### 2. Register and Login

#### 1. Initialize relative database

1. Create a database named *mydb01* in MySQL. Then create a new table named *userinfo*:

   ![image-20220414161524159](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220414161524159.png)

2. Create *db* folder and create *index.js* in it. Write codes below:

   ```javascript
   const mysql=require('mysql');
   
   const db=mysql.createPool({
       host: '127.0.0.1',
       user: 'root',
       password: 'xxxxxxxxxx', //here is your password of MySQL
       database: 'mydb01'
   })
   
   module.exports=db;
   ```

#### 2. Initialize personal information verification module

1. Using third party packages (*joi* and *escook/express-joi*) to preprocedure user's register and login information. Create */schema/user.js* in root folder. Write codes below:

   ```javascript
   const joi=require('joi');
   
   //verification rules of username and password
   const username_lr=joi.string().alphanum().min(1).max(15).required();
   const username_ui=joi.string().alphanum().min(1).max(15);
   const password=joi.string().pattern(/^\S{6,}$/).required();
   const email=joi.string().pattern(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/);
   const nickname=joi.string();
   
   exports.regSchema={
       body:{
           username:username_lr,
           password,
           email
       }
   }
   ```

2. Change codes in */router/user.js* like this: 

   ```javascript
   const express=require('express');
   const routerHandler=require('../router_handler/user');
   const expressJoi=require('@escook/express-joi');
   const {regSchema}=require('../schema/user');
   
   const router=express.Router();
   
   router.post('/register',expressJoi(regSchema),routerHandler.register);
   
   router.post('/login',expressJoi(regSchema),routerHandler.login);
   
   router.get('/register.html',)
   
   module.exports=router;
   ```

3. Simplify error report process: using *res.send({status:1, msg:xxxxxx})* to report errors is inconvenient. Define a *res.cc* function in *app.js* to simplify it and register it as a global middleware:

   ```javascript
   app.use(function (req, res, next) {
     // status=0 success
     // status=1 fail (default)
     res.cc = function (err, status = 1) {
       res.send({
         status,
         //if err is an error object or just a string
         message: err instanceof Error ? err.message : err,
       })
     }
     next()
   })
   ```

   

4. Register a global middleware to return validation failure information to client in *app.js*:

   ```javascript
   const joi=require('joi');
   
   app.use((err,req,res,next)=>{
       if(err instanceof joi.ValidationError)
           return res.cc(err);
       if(err.name==="UnauthorizedError")
           return res.cc("id authorization failed!")
   })
   ```

#### 3. Register account API

1. Change *register* function in */router_handler/user.js*:

   ```javascript
   const bcryptjs=require('bcryptjs');
   
   exports.register=(req,res)=>{
       //if username exists
       db.query('select * from userinfo where username=?',req.body.username,(err,results)=>{
           if(err) 
               return res.cc(err);
           if(results.length>0)
               return res.cc("username already exists!");
           //use bcryptjs module to encrypt user's password while registering 
           let bcryptPassword=bcryptjs.hashSync(req.body.password,10);
           
           //insert new user
           let sql='insert into userinfo (username,password,email) values(?,?,?)';
           db.query(sql,[req.body.username,bcryptPassword,req.body.email],(err,results)=>{
               if(err) 
                   return res.cc(err);
               if(results.affectedRows!=1)
                   return res.cc("register failed! please try again later!");
               res.cc("register success!",0);
           })
       })
   }
   ```

#### 4. Login API

1. Change *login* function in */router_handler/user.js*:

   ```javascript
   const bcryptjs=require('bcryptjs');
   const jwt=require('jsonwebtoken');
   const config=require('../config');
   
   exports.login=(req,res)=>{
       //if username exist
       db.query('select * from userinfo where username=?',req.body.username,(err,results)=>{
           if(err)
               return res.cc(err);
           if(results.length!=1)
               return res.cc("username not found!");
           
           //if password correct
           //use bcryptjs module to parse password encrypted while registering
           if(!bcryptjs.compareSync(req.body.password,results[0].password))
               return res.cc("password incorrect!");
   
           //use userinfo to generate Token
           //remember to exclude some private information such as password and user's
           //avatar to ensure sercurity!!
           const user={...results[0],password:'',user_pic:''};
           //config is a customized module to generate JWT secret key
           const tokenStr=jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn});
   		//send Token string and user information of this account back to the client
           res.send({
               status:0,
               msg:"login success!",
               token:"Bearer "+tokenStr,
               userinfo:{
                   username:results[0].username,
                   nickname:results[0].nickname,
                   email:results[0].email
               }
           })
       })
   }
   ```

2. Create *config.js* in root folder:

   ```javascript
   module.exports={
       jwtSecretKey:"Hanlin",
       expiresIn:'2h'
   }
   ```

3. Configure Token middleware before register router in *app.js*:

   ```javascript
   const expressJWT=require('express-jwt');
   const config=require('./config');
   
   //use unless() to define which routers need not Token verification
   app.use(expressJWT({secret:config.jwtSecretKey,algorithms:['HS256']}).unless({path:[/^\/api/]}));
   
   app.use('/api',router);
   
   app.use((err,req,res,next)=>{
       if(err instanceof joi.ValidationError)
           return res.cc(err);
       if(err.name==="UnauthorizedError")
           return res.cc("id authorization failed!")
   })
   ```



### 3. Personal Center

#### 1. Get user information

1. Create */router/userinfo.js* router module

   ```javascript
   const express = require('express')
   const router = express.Router()
   
   //router for getting user information
   router.get('/userinfo', (req, res) => {
     res.send('ok')
   })
   
   module.exports = router
   ```

2. Import it in *app.js*:

   ```javascript
   const userinfoRouter=require('./router/userinfo')
   
   app.use('/my',userinfoRouter);
   ```

   Attention! All routers that start with '/my' need pass the Token verification first!

3. Create */router_handler/userinfo.js* and define function to process request of getting user information:

   ```javascript
   const db=require('../db/index');
   
   exports.getUserinfo=(req,res)=>{
       //find the relative account in database
       const sql="select id,username,nickname,email,user_pic from userinfo where id=?";
       db.query(sql,req.user.id,(err,results)=>{
           if(err)
               return res.cc(err);
           //if the user information does not exist, then return an error
           if(results.length!==1)
               return res.cc("cannot get userinfo!");
           //if the user information exists, then return it back to the client
           res.send({
               status:0,
               msg:"get userinfo success!",
               data:results[0]
           })
       })
   }
   ```

4. Import it in */router/userinfo.js*:

   ```javascript
   const userinfoHandler=require('../router_handler/userinfo');
   ```

   

#### 2. Update user information

1. Add a new router in */router/userinfo.js*:

   ```javascript
   router.post('/userinfo',expressJoi(updateUserinfoSchema),userinfoHandler.updateUserinfo);
   ```

2. Define function to process request of updating user information in  */router_handler/userinfo.js*:

   ```javascript
   exports.updateUserinfo=(req,res)=>{
       const sql="update userinfo set ? where id=?";
       db.query(sql,[req.body,req.user.id],(err,results)=>{
           if(err)
               return res.cc(err);
           if(results.affectedRows!==1)
               return res.cc("update userinfo failed!");
           res.cc("update userinfo success!",0);
       })
   }
   ```

3. Export a new verification rule for updating user information in */schema/user.js*:

   ```javascript
   exports.updateUserinfoSchema={
       body:{
           username:username_ui,
           nickname,
           email
       }
   }
   ```

4. Apply this new verification rule in */router/userinfo.js*:

   ```javascript
   const expressJoi=require('@escook/express-joi');
   const {updateUserinfoSchema}=require('../schema/user');
   
   router.post('/userinfo',expressJoi(updateUserinfoSchema),userinfoHandler.updateUserinfo);
   ```

#### 3. Reset password

1. Add a new router in */router/userinfo.js*:

   ```javascript
   router.post('/updatePassword',expressJoi(updatePasswordSchema),userinfoHandler.updatePassword);
   ```

2. Define the verification rule for resetting password in */schema/user.js*:

   ```javascript
   exports.updatePasswordSchema={
       body:{
           oldPwd:password,
           //new password must be different from old one
           newPwd:joi.not(joi.ref('oldPwd')).concat(password)
       }
   }
   ```

3. Apply this new verification rule in */router/userinfo.js*. All codes in this file are shown below:

   ```javascript
   const express=require('express');
   const userinfoHandler=require('../router_handler/userinfo');
   const expressJoi=require('@escook/express-joi');
   const {updateUserinfoSchema,updatePasswordSchema}=require('../schema/user');
   
   const router=express.Router();
   
   router.get('/userinfo',userinfoHandler.getUserinfo);
   
   router.post('/userinfo',expressJoi(updateUserinfoSchema),userinfoHandler.updateUserinfo);
   
   router.post('/updatePassword',expressJoi(updatePasswordSchema),userinfoHandler.updatePassword);
   
   module.exports=router;
   ```

4. Define handle function of resetting password in */router_handler/userinfo.js*:

   ```javascript
   const bcrypt=require('bcryptjs');
   
   exports.updatePassword=(req,res)=>{
       //find the user according to the id hidden in Token before verifying the password
       const sql="select * from userinfo where id=?";
       db.query(sql,req.user.id,(err,results)=>{
           if(err)
               return res.cc(err); 
           //if the old password is correct
           if(!bcrypt.compareSync(req.body.oldPwd,results[0].password))
               return res.cc("password incorrect!");
           //update password if the old password is correct
           const sql="update userinfo set password=? where id=?";
           const newPwd=bcrypt.hashSync(req.body.newPwd,10);
           db.query(sql,[newPwd,req.user.id],(err,results)=>{
               if(err)
                   return res.cc(err);
               if(results.affectedRows!==1)
                   return res.cc("update password failed!");
               res.cc("update password success!",0);
           })
       })
   }
   ```



### 4. Article Category Management

#### 1. Initialize relative database

1. Create a new table named *userarticle* for *mydb01*:

   ![image-20220414200318629](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220414200318629.png)

#### 2. Initialize router module

1. Create */router/artcate.js*:

   ```javascript
   const express = require('express')
   const router = express.Router()
   
   module.exports = router
   ```

2. Import this router in *app.js*:

   ```javascript
   const artcateRouter=require('./router/artcate');
   
   app.use('/my/article',artcateRouter);
   ```

3. Create */router_handler/artcate.js*. Then import it in */router/artcate.js*:

   ```javascript
   const artcateHandler=require('../router_handler/artcate');
   ```

#### 3. Get article categories

1. Define the handler function of getting categories in */router_handler/artcate.js*:

   ```javascript
   const db=require('../db/index');
   
   exports.getArtcate=(req,res)=>{
       //get all categories in database and order them by id
       const sql="select * from userarticle where is_delete=0 order by id asc";
       db.query(sql,(err,results)=>{
           if(err)
               return res.cc(err);
           //return the results to the client
           res.send({
               status:0,
               msg:"get article categories success!",
               data:results
           })
       })
   }
   ```

2. Create the router of getting categories in */router/artcate.js*:

   ```javascript
   router.get('/cates',artcateHandler.getArtcate);
   ```

#### 4. Add article category

1. Create */schema/artcate.js* and define a new verification rule for adding category:

   ```javascript
   const joi=require('joi');
   
   const name=joi.string().required();
   const alias=joi.string().alphanum().required();
   const id=joi.number().integer().min(1).required();
   
   exports.addArtcateSchema={
       body:{
           name,
           alias
       }
   }
   
   ```

2. Create route for adding category in */router/artcate.js* and apply the new verification rule:

   ```javascript
   const express=require('express');
   const artcateHandler=require('../router_handler/artcate');
   const expressJoi=require('@escook/express-joi');
   const {addArtcateSchema}=require('../schema/artcate');
   
   router.post('/addcate',expressJoi(addArtcateSchema),artcateHandler.addArtcate);
   ```

3. Define the handle function of adding category in */router_handler/artcate.js:*

   ```javascript
   exports.addArtcate=(req,res)=>{
       //check if the category name already exists
       const sql="select * from userarticle where name=? and is_delete=0";
       db.query(sql,req.body.name,(err,results)=>{
           if(err)
               return res.cc(err);
           if(results.length===1)
               return res.cc("name already exists!");
           const sql="insert into userarticle set ?"
           db.query(sql,req.body,(err,results)=>{
               if(err)
                   return res.cc(err);
               if(results.affectedRows!==1)
                   return res.cc("add category failed!");
               res.send({
                   status:0,
                   msg:"add category success!",
                   data:results
               })
           })
       })
   }
   ```

#### 5. Delete article category

1. Deleting category is based on user's id. Export a new verification rule for deleting category in */schema/artcate.js*:

   ```javascript
   exports.deleteArtcateSchema={
       params:{
           id
       }
   }
   ```

2. Add router in */router/artcate.js* for deleting:

   ```javascript
   const {addArtcateSchema,deleteArtcateSchema}=require('../schema/artcate');
   
   router.get('/deletecates/:id',expressJoi(deleteArtcateSchema),artcateHandler.deletecateById);
   ```

3. Define handler function of deleting in */router_handler/artcate.js*:

   ```javascript
   exports.deletecateById=(req,res)=>{
   	//id is hidden in request body params of POST request for deleting category
       const sql="update userarticle set is_delete=1 where id=?";
       db.query(sql,req.params.id,(err,results)=>{
           if(err)
               return res.cc(err);
           if(results.affectedRows!==1)
               return res.cc("delete category failed!");
           res.cc("delete category success!");
       })
   }
   ```

#### 6. Edit article category

1. Export a new verification rule for editing category in */schema/artcate.js*:

   ```javascript
   exports.updateArtcateSchema={
       body:{
           id,
           name,
           alias
       }
   }
   ```

2. Add router in */router/artcate.js*. And the final version of */router/artcate.js* is shown as followed:

   ```javascript
   const express=require('express');
   const artcateHandler=require('../router_handler/artcate');
   const expressJoi=require('@escook/express-joi');
   const {addArtcateSchema,deleteArtcateSchema,updateArtcateSchema}=require('../schema/artcate');
   
   
   const router=express.Router();
   
   router.get('/cates',artcateHandler.getArtcate);
   
   router.post('/addcate',expressJoi(addArtcateSchema),artcateHandler.addArtcate);
   
   router.get('/deletecates/:id',expressJoi(deleteArtcateSchema),artcateHandler.deletecateById);
   
   router.post('/updatecate',expressJoi(updateArtcateSchema),artcateHandler.updatecateById);
   
   module.exports=router;
   ```

3. Define handler function of editing in */router_handler/artcate.js*:

   ```javascript
   exports.updatecateById=(req,res)=>{
       //check if the new name of category exists
       const sql="select * from userarticle where id!=? and is_delete=0 and name=?";
       db.query(sql,[req.body.id,req.body.name],(err,results)=>{
           if(err)
               return res.cc(err);
           if(results.length!==0)
               return res.cc("name already exists!");
           //update database with new data after editing
           const sql="update userarticle set ? where id=?"
           db.query(sql,[req.body,req.body.id],(err,results)=>{
               if(err)
                   return res.cc(err);
               if(results.affectedRows!==1)
                   return res.cc("update category failed!");
               res.cc("update category success!")
           })
       })
   }
   ```



### 5. Article Publishment Management

#### 1. Initialize relative database

1. Create a new table name *articles*:

   ![image-20220414204857057](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220414204857057.png)

#### 2. Initialize router module

1. Create /router/*article.js*:

   ```javascript
   const express = require('express')
   const router = express.Router()
   
   module.exports = router
   ```

2. Import this in *app.js*:

   ```javascript
   const articleRouter=require('./router/article');
   
   app.use('/my/article',artcateRouter);
   ```

3. Create */router_handler/article.js*. Then import it in */router/article.js*:

   ```javascript
   const articleHandler=require('../router_handler/article');
   ```

#### 3. Verification rule for publishment

1. Define handler function for publishment in */router_handler/article.js*:

   ```javascript
   const path=require('path');
   const db=require('../db/index');
   
   //import a module to process form data in POST request body
   //the data in request body is divded into file and text
   //file is the cover of the article for publishment
   //text is the data mentioned in /schema/article.js
   const multiparty=require('multiparty')
   
   exports.addArticle=(req,res)=>{
       //define a form object to parse form data from client
       let form = new multiparty.Form();
       //parse form data
       form.parse(req,(err, fields, files) => {
           if(err)
               return res.cc(err);
           //check if cover is chosen
           if(files.cover_img)
               return res.cc("please choose cover!");
           //check if title, category, content are empty
           if(!(fields.cate[0] && fields.title[0] && fields.content[0]))
               return res.cc("title, category, content cannot be empty!");
           //check if category of the article exists
           const sql="select * from userarticle where name=? and is_delete=0"
           db.query(sql,fields.cate[0],(err,results)=>{
               if(err)
                   return res.cc(err);
               if(results.length!==1)
                   return res.cc("the category you selected does not exist!");
               //when all conditions are satisfied, use an object to store form data from client
               const articleInfo={
                   title:fields.title[0],
                   cate:fields.cate[0],
                   content:fields.content[0],
                   state:fields.state[0],
                   cover_img:path.join('/uploads',files.cover_img[0].originalFilename),
                   pub_date:new Date(),
                   author_id:req.user.id
               }
   
               //insert information about the article into MySQL
               const sql="insert into articles set ?";
               db.query(sql,articleInfo,(err,results)=>{
                   if(err)
                       return res.cc(err);
                   if(results.affectedRows!==1)
                       return res.cc("publish article failed!");
                   res.cc("publish article success!");
               })
           })
      })
   }
   ```

2. Invoke this function in /router/article.js:

   ```javascript
   router.post('/add',articleHandler.addArticle);
   ```





## 4. Build the Frontend Part of the Project

### 1. Login Page

1. Create *Frontend* folder in root folder. Then, create /Frontend/index.html:

   ```html
   <!DOCTYPE html>
   <html lang="en">
       <head>
           <meta charset="UTF-8">
           <title>index</title>
           <meta name="description" content="manage system based on Node"/>
           <meta name="keywords" content="1,1,1"/>
           <link rel="stylesheet" href="http://127.0.0.1:2000/CSS/index.css">
           <script crossorigin="anonymous" src="https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.js"></script>
       </head>
       <body>
           <div class="login">
               <div class="SignIn">Log in</div>
               <div class="user">
                   <input type="text" id="username" placeholder="username: ">
               </div>
               <div class="user">
                   <input type="password" id="password" placeholder="password: ">
               </div>
               <button class="loginBtn" id="loginBtn">Log in</button>
               <!--Jump to register page-->
               <div class="noAccount">Don't have an account? <a href="http://127.0.0.1:2000/register.html" method="GET" class="register">Register</a></div>
           </div>
       </body>
       <script src="http://127.0.0.1:2000/JS/index.js"></script>
   </html>
   ```

2. Create */Frontend/CSS/index.css* to customize the style of login page:

   ```css
   /* clear the default style */
   * {
       margin: 0;
       padding: 0;
       box-sizing: border-box;
       border: none;
       outline: none;
       font-family: Verdana, Geneva, Tahoma, sans-serif;
   }
   li {
       list-style: none;
   }
   
   /* define body size, layout, background */
   body {
       min-height: 100vh;
       display: flex;
       justify-content: center;
       align-items: center;
       background: linear-gradient(45deg,rgb(104, 244, 247),rgb(251, 72, 48));
   }
   
   .login {
       /* size */
       height: 340px;
       width: 360px;
       /* location and layout */
       position: relative;
       display: flex;
       justify-content: space-evenly;
       align-items: center;
       flex-wrap: wrap;
       flex-direction: column;
       z-index: 1;
       /* shadow & background */
       background-color: rgb(255, 254, 252);
       box-shadow: 20px 20px 50px rgba(0,0,0,0.3);
       /* border */
       border-radius: 15px;
       border-left: 1px solid rgba(255,255,255,0.5);
       border-top: 1px solid rgba(255,255,255,0.5);
   }
   
   .SignIn {
       font-size: 25px;
       font-weight: 550;
   }
   
   .user {
       height: 40px;
       width: 247px;
       padding-left: 15px;
       line-height: 40px;
   
       color: rgb(128, 128, 128);
       background-color: rgb(226, 226, 226);
   
       border-radius: 10px;
   
       transition: all 0.2s;
   }
   
   .user:hover {
       width: 260px;
   }
   
   .user input {
       font-size: 15px;
       background-color: rgb(226, 226, 226);
   }
   
   .loginBtn {
       height: 40px;
       width: 70px;
       font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-weight: 550;
       font-size: 15px;
   
       color: azure;
       background-color: rgb(70, 190, 237);
   
       border-radius: 10px;
   
       transition: all 0.2s;
   }
   
   .loginBtn:hover {
       width: 80px;
       transform: translate(0px,2px);
       cursor: pointer;
   }
   
   .noAccount {
       font-size: 12px;
   }
   
   .register {
       display: inline-block;
       text-decoration: none;
       color: rgb(21, 153, 201);
   
       transition: all 0.2s;
   }
   
   .register:hover {
       color: rgb(17, 109, 142);
       transform: scale(1.05);
   }
   ```

3. Create /Frontend/JS/index.js to define that button of "login" can send login AJAX request by axios to server:

   ```javascript
   const loginBtn=document.getElementById("loginBtn");
   const username=document.getElementById("username");
   const password=document.getElementById("password");
   const email=document.getElementById("email");
   axios.defaults.baseURL='http://127.0.0.1:2000';
   loginBtn.addEventListener("click",function(e){
       axios({
           //request method
           method:'POST',
           //url
           url:'/api/login',
           //url parameters
           params:{},
           headers:{
               'content-type':'application/x-www-form-urlencoded'
           },
           //request body
           data:`username=${username.value}&password=${password.value}`
       }).then(res=>{
           console.log(res.data.userinfo.username);
           location.href="http://127.0.0.1:2000/home.html"
           sessionStorage.setItem('token',res.data.token);
           sessionStorage.setItem('userinfo',JSON.stringify(res.data.userinfo));
           alert(res.data.msg);
       });
   },false)
   ```

4. Finally, this page is shown as followed:

   ![image-20220415100514714](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220415100514714.png)



### 2. Register Page

1. Create */Frontend/register.html*. This page is almost the same as login page:

   ```html
   <!DOCTYPE html>
   <html lang="en">
       <head>
           <meta charset="UTF-8">
           <title>register</title>
           <meta name="description" content="manage system based on Node"/>
           <meta name="keywords" content="1,1,1"/>
           <link rel="stylesheet" href="http://127.0.0.1:2000/CSS/register.css">
           <script crossorigin="anonymous" src="https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.js"></script>
       </head>
       <body>
           <div class="register">
               <div class="registerLogo">Register</div>
               <div class="user">
                   <input type="text" id="username" placeholder="username: ">
               </div>
               <div class="user">
                   <input type="password" id="password" placeholder="password: ">
               </div>
               <div class="user">
                   <input type="email" id="email" placeholder="email: ">
               </div>
               <button class="registerBtn" id="registerBtn">Register</button>
           </div>
       </body>
       <script src="http://127.0.0.1:2000/JS/register.js"></script>
   </html>
   ```

2. Create /Frontend/CSS/register.css to customize the style:

   ```css
   * {
       margin: 0;
       padding: 0;
       box-sizing: border-box;
       border: none;
       outline: none;
       font-family: Verdana, Geneva, Tahoma, sans-serif;
   }
   li {
       list-style: none;
   }
   
   body {
       min-height: 100vh;
       display: flex;
       justify-content: center;
       align-items: center;
       background: linear-gradient(45deg,rgb(104, 244, 247),rgb(251, 72, 48));
   }
   
   .register {
       /* size */
       height: 340px;
       width: 360px;
       /* location and layout */
       position: relative;
       display: flex;
       justify-content: space-evenly;
       align-items: center;
       flex-wrap: wrap;
       flex-direction: column;
       z-index: 1;
       /* shadow & background */
       background-color: rgb(255, 254, 252);
       box-shadow: 20px 20px 50px rgba(0,0,0,0.3);
       /* border */
       border-radius: 15px;
       border-left: 1px solid rgba(255,255,255,0.5);
       border-top: 1px solid rgba(255,255,255,0.5);
   }
   
   .registerLogo {
       font-size: 25px;
       font-weight: 550;
   }
   
   .user {
       height: 40px;
       width: 247px;
       padding-left: 15px;
       line-height: 40px;
   
       color: rgb(128, 128, 128);
       background-color: rgb(226, 226, 226);
   
       border-radius: 10px;
   
       transition: all 0.2s;
   }
   
   .user:hover {
       width: 260px;
   }
   
   .user input {
       font-size: 15px;
       background-color: rgb(226, 226, 226);
   }
   
   .registerBtn {
       height: 40px;
       width: 70px;
       font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-weight: 550;
       font-size: 15px;
   
       color: azure;
       background-color: rgb(70, 190, 237);
   
       border-radius: 10px;
   
       transition: all 0.2s;
   }
   
   .registerBtn:hover {
       width: 80px;
       transform: translate(0px,2px);
       cursor: pointer;
   }
   
   .noAccount {
       font-size: 12px;
   }
   
   ```

3. Create /Frontend/JS/register.js to send register AJAX request to server:

   ```javascript
   const registerBtn=document.getElementById("registerBtn");
   const username=document.getElementById("username");
   const password=document.getElementById("password");
   axios.defaults.baseURL='http://127.0.0.1:2000';
   registerBtn.addEventListener("click",function(e){
       axios({
           //request method
           method:'POST',
           //url
           url:'/api/register',
           //url parameters
           params:{},
           headers:{
               'content-type':'application/x-www-form-urlencoded'
           },
           //request body
           data:`username=${username.value}&password=${password.value}&email=${email.value}`
       }).then(res=>{
           alert(res.data.msg);
           if(res.data.status===0)
               history.back();
       });
   },false)
   ```

4. The register page looks like this:

   ![image-20220415101147720](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220415101147720.png)



### 3. Blog Manage System Page

#### 1. Introduction

Blog Manage System Page is the main page of this project: 

![image-20220415101616577](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220415101616577.png)

It is divided into three parts:

1. User Information Bar
2. Categories Table
3. Article Publishment Table

#### 2. User Information Bar

1. Create */Frontend/home.html*:

   ```html
   <!DOCTYPE html>
   <html lang="en">
       <head>
           <meta charset="UTF-8">
           <title>home</title>
           <meta name="description" content="manage system based on Node"/>
           <meta name="keywords" content="1,1,1"/>
           <link rel="stylesheet" href="http://127.0.0.1:2000/CSS/home.css">
           <script crossorigin="anonymous" src="https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.js"></script>
       </head>
       <body>
           <!-- change pwd dialog -->
           <dialog class="dialog" id="dialogPwd">
               <div class="dialogHeader">Change Password</div>
               <div class="dialogContent">
                   <input type="password" id="oldPwd" placeholder="old password">
                   <input type="password" id="newPwd" placeholder="new password">
               </div>
               <div class="dialogFooter">
                   <button class="dialogBtn" id="pwdBtn_y">Confirm</button>
                   <button class="dialogBtn" id="pwdBtn_n">Cancel</button>
               </div>
           </dialog>
           <div class="userinfoBar">
               <!--this image is the avatar, you can change its url-->
               <img src="https://vignette.wikia.nocookie.net/warframe/images/4/46/Stalker_avatar.png/revision/latest?cb=20140806070139&path-prefix=ru" class="userIcon" alt="">
               <div class="userinfo" id="userinfo">
                   <div class="username"></div>
                   <div class="nickname"></div>
                   <div class="email"></div>
                   <button class="changeInfoBtn" id="changeInfoBtn">Apply Changes</button>
               </div>
               <div class="changePwdBtn" id="changePwdBtn">Change Password</div>            
           </div>
       </body>
       <script src="http://127.0.0.1:2000/JS/home.js"></script>
   </html>
   ```

2. Create /Frontend/CSS/home.css

   ```javascript
   *:not(dialog) {
       margin: 0;
       padding: 0;
       box-sizing: border-box;
       border: none;
       outline: none;
       font-family: Verdana, Geneva, Tahoma, sans-serif;
       color: rgb(111, 111, 111);
   }
   li {
       list-style: none;
   }
   button {
       cursor: pointer;
       transition: all 0.2s;
   }
   button:hover {
       transform: scale(1.05);
   }
   
   body {
       position: relative;
       min-height: 100vh;
       /* display: flex;
       justify-content: center;
       align-items: center; */
       background: linear-gradient(135deg,rgb(104, 244, 247),rgb(251, 72, 48));
   }
   
   body::before {
       content: "";
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(245, 71, 52, 0.566);
       clip-path: circle(40% at right 120%);
   }
   
   body::after {
       content: "";
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(125, 236, 231, 0.273);
       clip-path: circle(35% at 15% -7%);
   }
   
   .userinfoBar {
           /* size */
           height: 100vh;
           width: 350px;
           /* location and layout */
           position: absolute;
           display: flex;
           justify-content: space-evenly;
           align-items: center;
           flex-wrap: wrap;
           flex-direction: column;
           /* shadow & background */
           background-color: rgba(255, 255, 255, 0.218);
           box-shadow: 15px 15px 25px rgba(0,0,0,0.2);
   
           border-top-right-radius: 15px;
           border-bottom-right-radius: 15px;
   
           backdrop-filter: blur(5px);
   
           z-index: 1;
   }
   
   .userIcon {
       width: 100px;
       height: 100px;
       display: flex;
       border-radius: 50%;
       border: 1px solid rgba(255, 255, 255, 0.575);
       align-items: center;
       justify-content: center;
       overflow: hidden;
   
       transition: all 0.3s;
   }
   
   .userIcon:hover {
       transform: scale(1.3) rotate(360deg);
   }
   
   .userinfo {
       height: 230px;
       width: 300px;
       transform: translate(0,-70px);
       background-color: rgba(237, 107, 107, 0);
   
       display: flex;
       justify-content: space-evenly;
       align-items: center;
       flex-wrap: wrap;
       flex-direction: column;
   
       border-top: 1px solid rgb(136, 136, 136);
       border-bottom: 1px solid rgb(136, 136, 136);
   }
   
   .userinfo input {
       height: 35px;
       padding-left: 10px;
       font-size: 15px;
       background-color: rgba(226, 226, 226, 0.351);
       border-radius: 15px;
   }
   
   .userinfo *{
       transition: all 0.3s;
   }
   
   .userinfo *:hover {
       transform: scale(1.05);
       cursor: pointer;
   }
   
   .username {
       font-size: 40px;
       color:black;
       font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
   }
   
   .nickname {
       font-size: 20px;
       color: black;
   }
   
   .email {
       font-size: 15px;
       text-decoration: underline;
   }
   
   .changeInfoBtn {
       display: none;
       height: 40px;
       width: 130px;
       font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-weight: 550;
       font-size: 15px;
   
       color: azure;
       background-color: rgba(70, 192, 237, 0.334);
       border-radius: 10px;
   
       transition: all 0.2s;
   }
   
   .changeInfoBtn:hover {
       width: 150px;
       transform: translate(0px,2px);
       background-color: rgba(232, 87, 54, 0.414);
       cursor: pointer;
   }
   
   .dialog {
       position: relative;
       height: 300px;
       width: 250px;
       padding: 0;
       overflow: hidden;
       border: 0;
       border-top: 1px solid rgba(74, 74, 74, 0.519);
       border-left: 1px solid rgba(63, 63, 63, 0.578);
       border-radius: 15px;
       box-shadow: 20px 20px 50px rgba(0,0,0,0.3);
   }
   
   .dialog::backdrop {
       background-color: rgba(129, 129, 129, 0.592);
   }
   
   .dialogHeader {
       height: 40px;
       width: 250px;
       background: linear-gradient(45deg,rgb(104, 244, 247),rgb(251, 72, 48));
       color: white;
       text-align: center;
       line-height: 40px;
   }
   
   .dialogContent {
       height: 210px;
       display: flex;
       justify-content: space-evenly;
       align-items: center;
       flex-wrap: wrap;
       flex-direction: column;
   }
   
   .dialogContent input {
       display: block;
       height: 35px;
       padding-left: 10px;
       font-size: 15px;
       background-color: rgba(226, 226, 226, 0.351);
       color: black;
       border-radius: 15px;
   }
   
   .dialogFooter {
       position: absolute;
       top: 260px;
       height: 50px;
       width: 250px;
       border-top: 1px solid rgb(194, 194, 194);
       text-align: center;
       line-height: 40px;
   }
   
   .dialogBtn {
       height: 21px;
       margin: 10px;
       width: 80px;
       border-radius: 15px;
       color: white;
   }
   
   #pwdBtn_y {
       background-color: rgb(148, 255, 86);
   }
   
   #pwdBtn_n {
       background-color: rgb(249, 52, 52);
   }
   
   .changePwdBtn {
       position: fixed;
       top: 540px;
       left: 220px;
       font-size: 12px;
       color: rgb(159, 159, 159);
       cursor: pointer;
   
       transition: all 0.2s;
   }
   
   .changePwdBtn:hover {
       color: white;
   }
   ```

3. Then you can check this static page, and the user information bar is shown below:

   <img src="C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220415102623266.png" alt="image-20220415102623266" style="zoom: 50%;" />

4. Create */Frontend/JS/home.js* to send get/update user information AJAX request and change password AJAX request:

   ```javascript
   const userinfo=document.getElementById("userinfo");
   const changeInfoBtn=document.getElementById("changeInfoBtn")
   axios.defaults.baseURL='http://127.0.0.1:2000';
   const userinfoObj=JSON.parse(sessionStorage.getItem('userinfo'));
   const dialogPwd=document.getElementById("dialogPwd");
   const pwdBtn_y=document.getElementById("pwdBtn_y");
   const pwdBtn_n=document.getElementById("pwdBtn_n");
   
   let oldPwd=document.getElementById("oldPwd");
   let newPwd=document.getElementById("newPwd");
   
   function iniInnerHTML(className){
       document.getElementsByClassName(className)[0].innerHTML=userinfoObj[className]===null?`click to set ${className}`:userinfoObj[className];
   }
   
   iniInnerHTML("username");
   iniInnerHTML("nickname");
   iniInnerHTML("email");
   
   userinfo.addEventListener("click",function(e){
       if(e.target!==userinfo && e.target!==changeInfoBtn){
           e.target.innerHTML=`<input type="text" class="userInput" value=${e.target.innerHTML}>`;
           changeInfoBtn.style.display="block";
       }
   },false)
   
   function getInfo(className){
       let el=document.getElementsByClassName(className)[0];
       if(el.firstElementChild===null)
           return el.innerHTML;
       else
           return el.firstElementChild.value;
   }
   
   changeInfoBtn.addEventListener ("click",function(e){
       let username=getInfo("username");
       let nickname=getInfo("nickname");
       let email=getInfo("email");
       axios({
           //request method
           method:'POST',
           //url
           url:'/my/userinfo',
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'application/x-www-form-urlencoded'
           },
           //request body
           data:`username=${username}&nickname=${nickname}&email=${email}`
       }).then(res=>{
           alert(res.data.msg);
           sessionStorage.setItem('userinfo',JSON.stringify({username,nickname,email}));
           location.reload();
       });
   },false)
   
   changePwdBtn.addEventListener("click",function(){
       dialogPwd.showModal();
   },false)
   
   pwdBtn_n.addEventListener("click",function(){
       dialogPwd.close();
       oldPwd.value='';
       newPwd.value='';
   })
   
   pwdBtn_y.addEventListener("click",function(){
       axios({
           //request method
           method:'POST',
           //url
           url:'/my/updatePassword',
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'application/x-www-form-urlencoded'
           },
           //request body
           data:`oldPwd=${oldPwd.value}&newPwd=${newPwd.value}`
       }).then(res=>{
           alert(res.data.msg);
           if(res.data.status==0){
               dialogPwd.close();
               oldPwd.value='';
               newPwd.value='';
           }        
       });
   })
   ```

#### 3. Categories Table

1. Add codes below to body of */Frontend/home.html*:

   ```html
           <!-- update artcate dialog -->
           <dialog class="dialog" id="dialogArtcate">
               <div class="dialogHeader" id="dialogHeader"></div>
               <div class="dialogContent">
                   <input type="text" id="dialogArtcate_name" placeholder="name">
                   <input type="text" id="dialogArtcate_alias" placeholder="alias">
               </div>
               <div class="dialogFooter">
                   <button class="dialogBtn" id="artcateBtn_y">Confirm</button>
                   <button class="dialogBtn" id="artcateBtn_n">Cancel</button>
               </div>
           </dialog>
   
   		 <div class="cateAndartArea">
               <ul class="optionBar" id="optionBar">
                   <li class="option" id="catalogsBtn">categories</li>
                   <li class="option" id="articlesBtn">articles</li>
               </ul>
               <!-- category area -->
               <div class="artcates" id="artcates">
               </div>
               <div class="addcate" id="addcateBtn">+</div>
               <!-- article area -->
               <div class="articles" id="articles">
               </div>
           </div>
   ```

2. Add codes below to */Frontend/CSS/home.css* to define style of category table and option bar above it:

   ```css
    .cateAndartArea {
       /* size */
       height: 100vh;
       width: calc(74% - 1px);
       padding: 60px;
       /* location and layout */
       position: absolute;
       left: 400px;
       background-color: rgba(255, 255, 255, 0.234);
       box-shadow: 15px 15px 25px rgba(0,0,0,0.2);
   
       border-top-left-radius: 15px;
       border-bottom-left-radius: 15px;
   
       backdrop-filter: blur(15px);
   
       z-index: 1;
   }
   
   .optionBar {
       position: relative;
       height: 30px;
   
       border-bottom: 1px solid rgb(136, 136, 136);
   }
   
   .option {
       position: relative;
       padding: 3px 20px 1px;
       margin-top: 2px;
       margin-right: 5px;
   
       font-size: 18px;
       float: left;
   
       background-color: transparent;
       border-top-left-radius: 10px;
       border-top-right-radius: 10px;
   
       border-bottom: 1px solid rgba(255, 255, 255, 0);
       box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
   
       transition: all 0.3s;
   }
   
   .option:hover {
       background-color: rgba(255, 255, 255, 0.349);
       /* background: linear-gradient(45deg,rgba(255, 255, 255, 0),rgba(255, 255, 255, 0.479)); */
       border-bottom: 1px solid rgba(255, 255, 255, 0);
       cursor: pointer;
   }
   
   .artcates {
       overflow: hidden;
       position: relative;
       top: 10px;
       box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
       border-left: 1px solid rgba(255, 255, 255, 0.427);
       border-top: 1px solid rgba(255, 255, 255, 0.367);
       border-radius: 8px;
   }
   
   .addcate {
       position: relative;
       top: 20px;
       left: 1000px;
       height: 20px;
       width: 20px;
       text-align: center;
       line-height: 15px;
       color: white;
       border: 1px solid rgb(255, 255, 255);
       border-radius: 50%;
       cursor: pointer;
   
       transition: all 0.3s;
   }
   
   .addcate:hover {
       transform: scale(1.2);
   }
   
   .catelist {
       height: 30px;
       border-bottom: 1px solid rgba(146, 146, 146, 0.593);
   }
   
   .catelist li {
       height: 30px;
       width: 337px;
       float: left;
       text-align: center;
       line-height: 30px;
   }
   
   .editBtn {
       width: 50px;
       padding: 2px;
       border-radius: 5px;
       background-color: rgb(53, 255, 27);
       color: aliceblue;
       text-align: center;
   }
   
   .deleteBtn {
       width: 50px;
       padding: 2px;
       border-radius: 5px;
       background-color: rgb(255, 51, 51);
       color: aliceblue;
       text-align: center;
   }
   
   #artcateBtn_y {
       background-color: rgb(53, 255, 27);
   }
   
   #artcateBtn_n {
       background-color: rgb(255, 51, 51);
   }
   ```

3. So this static page is finished:

   ![image-20220415104458837](C:\Users\ASUS\AppData\Roaming\Typora\typora-user-images\image-20220415104458837.png)

4. Add codes below to */Frontend/JS/home.js* to ensure that user can switch between category table and article publishment table by clicking buttons on the top option bar:

   ```javascript
   //article option bar
   const catalogsBtn=document.getElementById("catalogsBtn");
   const articlesBtn=document.getElementById("articlesBtn");
   const optionBar=document.getElementById("optionBar");
   
   const artcates=document.getElementById("artcates");
   const articles=document.getElementById("articles");
   
   const addcateBtn=document.getElementById("addcateBtn");
   
   function deleteParentElement(Obj) {
       Obj.parentNode.parentNode.parentNode.removeChild(Obj.parentNode.parentNode);
   }
   
   articles.style.display="none";
   
   optionBar.addEventListener("click",function(e){
       if(e.target.id=="catalogsBtn"){
           artcates.style.display="block";
           addcateBtn.style.display="block";
           e.target.style.background="linear-gradient(45deg,rgba(255, 255, 255, 0.101),rgba(255, 255, 255, 0.6))";
           articlesBtn.style.removeProperty("background");
           getArtcates();
   
           articles.style.display="none";
       }
       else if(e.target.id=="articlesBtn"){
           articles.style.display="block";
           e.target.style.background="linear-gradient(45deg,rgba(255, 255, 255, 0.101),rgba(255, 255, 255, 0.6))";
           catalogsBtn.style.removeProperty("background");
   
           artcates.style.display="none";
           addcateBtn.style.display="none";
       }
   },false)
   ```

5. Then add codes below to */Frontend/JS/home.js* to ensure that buttons can send relative get/edit/delete categories AJAX request to backend:

   ```javascript
   //get artcates
   const dialogArtcate=document.getElementById("dialogArtcate");
   //artcate dialog variables
   const artcateBtn_y=document.getElementById("artcateBtn_y");
   const artcateBtn_n=document.getElementById("artcateBtn_n");
   const dialogArtcate_name=document.getElementById("dialogArtcate_name");
   const dialogArtcate_alias=document.getElementById("dialogArtcate_alias");
   const dialogHeader=document.getElementById("dialogHeader");
   
   let artcatesData;
   getArtcates();
   
   dialogArtcate.showUp=function(){
       dialogArtcate_name.value='';
       dialogArtcate_alias.value='';
       dialogArtcate.showModal();
   }
   
   //artcates, edit button and delete button
   artcates.addEventListener("click",function(e){
       if(e.target.className==="deleteBtn"){
           if(confirm("Do you really want to delete this category?")){
               deleteArtcate(e.target.id.match(/\d+/)[0]);
               deleteParentElement(e.target);
           }
       }
       else if(e.target.className==="editBtn"){
           dialogHeader.innerHTML="Edit Category";
           dialogArtcate.showUp();
           artcateBtn_y.onclick=function(){
               updateArtcate(e.target.id.match(/\d+/)[0],dialogArtcate_name.value,dialogArtcate_alias.value);
               e.target.parentNode.previousElementSibling.innerHTML=dialogArtcate_alias.value;
               e.target.parentNode.previousElementSibling.previousElementSibling.innerHTML=dialogArtcate_name.value;
               dialogArtcate.close();
           }
           artcateBtn_n.onclick=function(){
               dialogArtcate.close();
           }
       }
   },false)
   
   //arcates, add button
   addcateBtn.addEventListener("click",function(){
       dialogHeader.innerHTML="Add Category";
       dialogArtcate.showUp();
       artcateBtn_y.onclick=function(){
           addArtcate(dialogArtcate_name.value,dialogArtcate_alias.value);
           dialogArtcate.close();
       }
       artcateBtn_n.onclick=function(){
           dialogArtcate.close();
       }
   },false)
   
   function createArtcateList(name,alias,num){
       let catelist=document.createElement("ul");
       artcates.appendChild(catelist);
       catelist.setAttribute("class","catelist");
       catelist.innerHTML=`
           <li>${name}</li>
           <li>${alias}</li>
           <li>
               <button class="editBtn" id="editBtn${num}">Edit</button>
               <button class="deleteBtn" id="deleteBtn${num}">Delete</button>
           </li>`;
   }
   
   function clearArtcateLists(){
       artcates.innerHTML='';
   }
   
   //requests of artcate
   function getArtcates(){
       axios({
           //request method
           method:'GET',
           //url
           url:'/my/article/cates',
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'application/x-www-form-urlencoded'
           }
       }).then(res=>{
           clearArtcateLists();
           artcatesData=res.data.data;
           for(let el of artcatesData){
               createArtcateList(el.name,el.alias,el.id);
           }
       });
   }
   
   function deleteArtcate(id){
       axios({
           //request method
           method:'GET',
           //url
           url:`/my/article/deletecates/${id}`,
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'application/x-www-form-urlencoded'
           },
           data:`oldPwd=${oldPwd.value}&newPwd=${newPwd.value}`
       }).then(res=>{
           alert(res.data.msg);
       });
   }
   
   function updateArtcate(id,name,alias){
       axios({
           //request method
           method:'POST',
           //url
           url:`/my/article/updatecate`,
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'application/x-www-form-urlencoded'
           },
           data:`id=${id}&name=${name}&alias=${alias}`
       }).then(res=>{
           alert(res.data.msg);
       });
   }
   
   function addArtcate(name,alias){
       axios({
           //request method
           method:'POST',
           //url
           url:`/my/article/addcate`,
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'application/x-www-form-urlencoded'
           },
           data:`&name=${name}&alias=${alias}`
       }).then(res=>{
           alert(res.data.msg);
           if(res.data.status==0)
               createArtcateList(name,alias,res.data.data.insertId);
       });
   }
   ```

#### 4. Article Publishment Table

1. Update codes in article area in */Frontend/home.html* like this:

   ```html
               <!-- article area -->
               <div class="articles" id="articles">
                   <input type="text" class="title" id="title" placeholder="Title">
                   <div class="artInfoBar">
                       <input type="text" class="art_cate" id="art_cate" placeholder="input category">
                       <div class="sci">cover image</div>
                       <input type="file" class="art_cover" id="art_cover" name="cover_img">
                   </div>
                   <textarea class="content" id="content" cols="30" rows="10">Input your content</textarea>
                   <button class="publishBtn" id="publishBtn">Publish</button>
               </div>
   ```

2. Add contents below to */Frontend/CSS/home.css* to define style of article publishment table:

   ```css
   /* writing article area */
   .articles {
       position: relative;
       top: 10px;
       height: 630px;
       width: 1010px;
       padding: 30px;
       /* text-align: center; */
       background-color:rgba(255, 255, 255, 0.55);
   
       border-radius: 15px;
       box-shadow: 5px 5px 16px rgb(255, 255, 255) inset;
   }
   
   .title {
       width: 950px;
       padding-bottom: 10px;
       text-align: center;
       font-size: 30px;
       color: black;
       background-color: transparent;
   }
   
   .artInfoBar {
       width: 950px;
       text-align: center;
       padding-bottom: 4px;
       border-bottom: 1px solid grey;
   }
   
   .art_cate {
       width: 130px;
       font-size: 15px;
       background-color: transparent;
   }
   
   .sci {
       display: inline;
       font-size: 10px;
       color: rgb(157, 157, 157);
   }
   
   .art_cover {
       width: 167px;
   }
   
   .content {
       margin-top: 10px;
       width: 950px;
       height: 480px;
       font-size: 15px;
       color: black;
       background-color: transparent;
   }
   
   .publishBtn {
       position: relative;
       left: 890px;
       height: 20px;
       padding-left: 4px;
       padding-right: 4px;
       color:white;
       font-size: 10px;
       background-color: rgb(252, 93, 35);
       border-radius: 5px;
   }
   ```

3. Add codes below to */Frontend/JS/home.js* so that the button "Publish" would send AJAX request when it is clicked:

   ```javascript
   //article publishment
   const publishBtn=document.getElementById("publishBtn");
   const art_cover=document.getElementById("art_cover");
   const title=document.getElementById("title");
   const art_cate=document.getElementById("art_cate");
   const content=document.getElementById("content");
   
   publishBtn.addEventListener("click",function(){
       //the AJAX request of publishment needs form data in request body
       //so we use FormData object to generate a form data
       const formData=new FormData();
       //add data into it
       formData.append("title", title.value);
       formData.append("cate", art_cate.value);
       formData.append("content", content.value);
       formData.append("state", "published");
       formData.append("cover_img",art_cover.files[0]);
   
       axios({
           //request method
           method:'POST',
           //url
           url:`/my/article/add`,
           //url parameters
           params:{},
           headers:{
               'Authorization':sessionStorage.getItem('token'),
               'content-type':'multipart/form-data'
           },
           //req.body
           data:formData
       }).then(res=>{
           alert(res.data.msg);
       });
   },false)
   ```

   

