const userinfo=document.getElementById("userinfo");
const changeInfoBtn=document.getElementById("changeInfoBtn")
axios.defaults.baseURL='http://127.0.0.1:2000';
const userinfoObj=JSON.parse(sessionStorage.getItem('userinfo'));
const dialogPwd=document.getElementById("dialogPwd");
const pwdBtn_y=document.getElementById("pwdBtn_y");
const pwdBtn_n=document.getElementById("pwdBtn_n");

let oldPwd=document.getElementById("oldPwd");
let newPwd=document.getElementById("newPwd");

function iniInnerHTML(className){
    document.getElementsByClassName(className)[0].innerHTML=userinfoObj[className]===null?`click to set ${className}`:userinfoObj[className];
}

iniInnerHTML("username");
iniInnerHTML("nickname");
iniInnerHTML("email");

userinfo.addEventListener("click",function(e){
    if(e.target!==userinfo && e.target!==changeInfoBtn){
        e.target.innerHTML=`<input type="text" class="userInput" value=${e.target.innerHTML}>`;
        changeInfoBtn.style.display="block";
    }
},false)

function getInfo(className){
    let el=document.getElementsByClassName(className)[0];
    if(el.firstElementChild===null)
        return el.innerHTML;
    else
        return el.firstElementChild.value;
}

changeInfoBtn.addEventListener ("click",function(e){
    let username=getInfo("username");
    let nickname=getInfo("nickname");
    let email=getInfo("email");
    axios({
        //request method
        method:'POST',
        //url
        url:'/my/userinfo',
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'application/x-www-form-urlencoded'
        },
        //request body
        data:`username=${username}&nickname=${nickname}&email=${email}`
    }).then(res=>{
        alert(res.data.msg);
        sessionStorage.setItem('userinfo',JSON.stringify({username,nickname,email}));
        location.reload();
    });
},false)

changePwdBtn.addEventListener("click",function(){
    dialogPwd.showModal();
},false)

pwdBtn_n.addEventListener("click",function(){
    dialogPwd.close();
    oldPwd.value='';
    newPwd.value='';
})

pwdBtn_y.addEventListener("click",function(){
    axios({
        //request method
        method:'POST',
        //url
        url:'/my/updatePassword',
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'application/x-www-form-urlencoded'
        },
        //request body
        data:`oldPwd=${oldPwd.value}&newPwd=${newPwd.value}`
    }).then(res=>{
        alert(res.data.msg);
        if(res.data.status==0){
            dialogPwd.close();
            oldPwd.value='';
            newPwd.value='';
        }        
    });
})

//article option bar
const catalogsBtn=document.getElementById("catalogsBtn");
const articlesBtn=document.getElementById("articlesBtn");
const optionBar=document.getElementById("optionBar");

const artcates=document.getElementById("artcates");
const articles=document.getElementById("articles");

const addcateBtn=document.getElementById("addcateBtn");

function deleteParentElement(Obj) {
    Obj.parentNode.parentNode.parentNode.removeChild(Obj.parentNode.parentNode);
}

articles.style.display="none";

optionBar.addEventListener("click",function(e){
    if(e.target.id=="catalogsBtn"){
        artcates.style.display="block";
        addcateBtn.style.display="block";
        e.target.style.background="linear-gradient(45deg,rgba(255, 255, 255, 0.101),rgba(255, 255, 255, 0.6))";
        articlesBtn.style.removeProperty("background");
        getArtcates();

        articles.style.display="none";
    }
    else if(e.target.id=="articlesBtn"){
        articles.style.display="block";
        e.target.style.background="linear-gradient(45deg,rgba(255, 255, 255, 0.101),rgba(255, 255, 255, 0.6))";
        catalogsBtn.style.removeProperty("background");

        artcates.style.display="none";
        addcateBtn.style.display="none";
    }
},false)

//get artcates
const dialogArtcate=document.getElementById("dialogArtcate");
//artcate dialog variables
const artcateBtn_y=document.getElementById("artcateBtn_y");
const artcateBtn_n=document.getElementById("artcateBtn_n");
const dialogArtcate_name=document.getElementById("dialogArtcate_name");
const dialogArtcate_alias=document.getElementById("dialogArtcate_alias");
const dialogHeader=document.getElementById("dialogHeader");

let artcatesData;
getArtcates();

dialogArtcate.showUp=function(){
    dialogArtcate_name.value='';
    dialogArtcate_alias.value='';
    dialogArtcate.showModal();
}

//artcates, edit button and delete button
artcates.addEventListener("click",function(e){
    if(e.target.className==="deleteBtn"){
        if(confirm("Do you really want to delete this category?")){
            deleteArtcate(e.target.id.match(/\d+/)[0]);
            deleteParentElement(e.target);
        }
    }
    else if(e.target.className==="editBtn"){
        dialogHeader.innerHTML="Edit Category";
        dialogArtcate.showUp();
        artcateBtn_y.onclick=function(){
            updateArtcate(e.target.id.match(/\d+/)[0],dialogArtcate_name.value,dialogArtcate_alias.value);
            e.target.parentNode.previousElementSibling.innerHTML=dialogArtcate_alias.value;
            e.target.parentNode.previousElementSibling.previousElementSibling.innerHTML=dialogArtcate_name.value;
            dialogArtcate.close();
        }
        artcateBtn_n.onclick=function(){
            dialogArtcate.close();
        }
    }
},false)

//arcates, add button
addcateBtn.addEventListener("click",function(){
    dialogHeader.innerHTML="Add Category";
    dialogArtcate.showUp();
    artcateBtn_y.onclick=function(){
        addArtcate(dialogArtcate_name.value,dialogArtcate_alias.value);
        dialogArtcate.close();
    }
    artcateBtn_n.onclick=function(){
        dialogArtcate.close();
    }
},false)

function createArtcateList(name,alias,num){
    let catelist=document.createElement("ul");
    artcates.appendChild(catelist);
    catelist.setAttribute("class","catelist");
    catelist.innerHTML=`
        <li>${name}</li>
        <li>${alias}</li>
        <li>
            <button class="editBtn" id="editBtn${num}">Edit</button>
            <button class="deleteBtn" id="deleteBtn${num}">Delete</button>
        </li>`;
}

function clearArtcateLists(){
    artcates.innerHTML='';
}

//requests of artcate
function getArtcates(){
    axios({
        //request method
        method:'GET',
        //url
        url:'/my/article/cates',
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'application/x-www-form-urlencoded'
        }
    }).then(res=>{
        clearArtcateLists();
        artcatesData=res.data.data;
        for(let el of artcatesData){
            createArtcateList(el.name,el.alias,el.id);
        }
    });
}

function deleteArtcate(id){
    axios({
        //request method
        method:'GET',
        //url
        url:`/my/article/deletecates/${id}`,
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'application/x-www-form-urlencoded'
        },
        data:`oldPwd=${oldPwd.value}&newPwd=${newPwd.value}`
    }).then(res=>{
        alert(res.data.msg);
    });
}

function updateArtcate(id,name,alias){
    axios({
        //request method
        method:'POST',
        //url
        url:`/my/article/updatecate`,
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'application/x-www-form-urlencoded'
        },
        data:`id=${id}&name=${name}&alias=${alias}`
    }).then(res=>{
        alert(res.data.msg);
    });
}

function addArtcate(name,alias){
    axios({
        //request method
        method:'POST',
        //url
        url:`/my/article/addcate`,
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'application/x-www-form-urlencoded'
        },
        data:`&name=${name}&alias=${alias}`
    }).then(res=>{
        alert(res.data.msg);
        if(res.data.status==0)
            createArtcateList(name,alias,res.data.data.insertId);
    });
}

//article publishment
const publishBtn=document.getElementById("publishBtn");
const art_cover=document.getElementById("art_cover");
const title=document.getElementById("title");
const art_cate=document.getElementById("art_cate");
const content=document.getElementById("content");

publishBtn.addEventListener("click",function(){
    const formData=new FormData();
    formData.append("title", title.value);
    formData.append("cate", art_cate.value);
    formData.append("content", content.value);
    formData.append("state", "published");
    formData.append("cover_img",art_cover.files[0]);

    axios({
        //request method
        method:'POST',
        //url
        url:`/my/article/add`,
        //url parameters
        params:{},
        headers:{
            'Authorization':sessionStorage.getItem('token'),
            'content-type':'multipart/form-data'
        },
        //req.body
        data:formData
    }).then(res=>{
        alert(res.data.msg);
    });
},false)

