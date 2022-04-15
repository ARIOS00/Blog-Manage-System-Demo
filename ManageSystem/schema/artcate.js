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

exports.deleteArtcateSchema={
    params:{
        id
    }
}

exports.updateArtcateSchema={
    body:{
        id,
        name,
        alias
    }
}