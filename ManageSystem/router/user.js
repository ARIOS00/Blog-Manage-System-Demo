const express=require('express');
const routerHandler=require('../router_handler/user');
const expressJoi=require('@escook/express-joi');
const {regSchema}=require('../schema/user');

const router=express.Router();

router.post('/register',expressJoi(regSchema),routerHandler.register);

router.post('/login',expressJoi(regSchema),routerHandler.login);

router.get('/register.html',)

module.exports=router;