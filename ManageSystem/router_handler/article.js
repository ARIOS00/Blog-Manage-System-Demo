const path=require('path');
const db=require('../db/index');
const multiparty=require('multiparty')

exports.addArticle=(req,res)=>{
    //check if cover is chosen
    let form = new multiparty.Form();
    form.parse(req,(err, fields, files) => {
        if(err)
            return res.cc(err);
        if(!files.cover_img)
            return res.cc("please choose cover!");
        if(!(fields.cate[0] && fields.title[0] && fields.content[0]))
            return res.cc("title, category, content cannot be empty!");
        //check if cate exists
        const sql="select * from userarticle where name=? and is_delete=0"
        db.query(sql,fields.cate[0],(err,results)=>{
            if(err)
                return res.cc(err);
            if(results.length!==1)
                return res.cc("the category you selected does not exist!");
            
            const articleInfo={
                title:fields.title[0],
                cate:fields.cate[0],
                content:fields.content[0],
                state:fields.state[0],
                cover_img:path.join('/uploads',files.cover_img[0].originalFilename),
                pub_date:new Date(),
                author_id:req.user.id
            }

            //insert article into MySQL
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