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

exports.updateUserinfoSchema={
    body:{
        username:username_ui,
        nickname,
        email
    }
}

exports.updatePasswordSchema={
    body:{
        oldPwd:password,
        newPwd:joi.not(joi.ref('oldPwd')).concat(password)
    }
}