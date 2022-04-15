const express = require('express');
const cors=require('cors');

const router=require('./router/user');
const userinfoRouter=require('./router/userinfo')
const artcateRouter=require('./router/artcate');
const articleRouter=require('./router/article');

const joi=require('joi');
const expressJWT=require('express-jwt');
const config=require('./config');
const fs=require('fs');
const path=require('path');
const { json } = require('express/lib/response');
//create server instance obj
const app=express();

app.use(cors());

app.use(express.urlencoded({extended:false}));

//error middleware
app.use((req,res,next)=>{
    res.cc=function(err,status=1){
        res.send({
            status,
            msg:err instanceof Error?err.message:err
        })
    }
    next();
})

app.use(express.static("./Frontend"));

app.use('/uploads',express.static('./uploads'));

app.use(expressJWT({secret:config.jwtSecretKey,algorithms:['HS256']}).unless({path:[/^\/api/]}));

app.use('/api',router);

app.use('/my',userinfoRouter);

app.use('/my/article',artcateRouter);

app.use('/my/article',express.json(),articleRouter);

app.use((err,req,res,next)=>{
    if(err instanceof joi.ValidationError)
        return res.cc(err);
    if(err.name==="UnauthorizedError")
        return res.cc("id authorization failed!")
})

//start server
app.listen(2000,()=>{
    console.log('api server running at 2000');
})