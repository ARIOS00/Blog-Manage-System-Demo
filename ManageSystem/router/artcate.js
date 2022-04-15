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