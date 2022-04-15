const db=require('../db/index');

exports.getArtcate=(req,res)=>{
    const sql="select * from userarticle where is_delete=0 order by id asc";
    db.query(sql,(err,results)=>{
        if(err)
            return res.cc(err);
        res.send({
            status:0,
            msg:"get article categories success!",
            data:results
        })
    })
}

exports.addArtcate=(req,res)=>{
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

exports.deletecateById=(req,res)=>{
    const sql="update userarticle set is_delete=1 where id=?";
    db.query(sql,req.params.id,(err,results)=>{
        if(err)
            return res.cc(err);
        if(results.affectedRows!==1)
            return res.cc("delete category failed!");
        res.cc("delete category success!");
    })
}

exports.updatecateById=(req,res)=>{
    const sql="select * from userarticle where id!=? and is_delete=0 and name=?";
    db.query(sql,[req.body.id,req.body.name],(err,results)=>{
        if(err)
            return res.cc(err);
        if(results.length!==0)
            return res.cc("name already exists!");
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