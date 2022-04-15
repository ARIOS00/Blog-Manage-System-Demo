const express=require('express');
const articleHandler=require('../router_handler/article');
const {addArticleSchema}=require('../schema/article')
const expressJoi=require('@escook/express-joi');
const multer=require('multer');
const path=require('path');

const router=express.Router();

const upload=multer({ dest: path.join(__dirname,'../uploads') })

router.post('/add',articleHandler.addArticle);

module.exports=router;