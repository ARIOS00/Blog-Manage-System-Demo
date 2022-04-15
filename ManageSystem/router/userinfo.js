const express=require('express');
const userinfoHandler=require('../router_handler/userinfo');
const expressJoi=require('@escook/express-joi');
const {updateUserinfoSchema,updatePasswordSchema}=require('../schema/user');

const router=express.Router();

router.get('/userinfo',userinfoHandler.getUserinfo);

router.post('/userinfo',expressJoi(updateUserinfoSchema),userinfoHandler.updateUserinfo);

router.post('/updatePassword',expressJoi(updatePasswordSchema),userinfoHandler.updatePassword);

module.exports=router;