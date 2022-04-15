const db=require('../db/index');
const bcrypt=require('bcryptjs');

exports.getUserinfo=(req,res)=>{
    const sql="select id,username,nickname,email,user_pic from userinfo where id=?";
    db.query(sql,req.user.id,(err,results)=>{
        if(err)
            return res.cc(err);
        if(results.length!==1)
            return res.cc("cannot get userinfo!");
        //get userinfo
        res.send({
            status:0,
            msg:"get userinfo success!",
            data:results[0]
        })
    })
}

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

exports.updatePassword=(req,res)=>{
    const sql="select * from userinfo where id=?";
    db.query(sql,req.user.id,(err,results)=>{
        if(err)
            return res.cc(err);        
        if(!bcrypt.compareSync(req.body.oldPwd,results[0].password))
            return res.cc("password incorrect!");
        //update password
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