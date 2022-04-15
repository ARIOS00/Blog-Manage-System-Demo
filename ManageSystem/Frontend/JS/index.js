const loginBtn=document.getElementById("loginBtn");
const username=document.getElementById("username");
const password=document.getElementById("password");
const email=document.getElementById("email");
axios.defaults.baseURL='http://127.0.0.1:2000';
loginBtn.addEventListener("click",function(e){
    axios({
        //request method
        method:'POST',
        //url
        url:'/api/login',
        //url parameters
        params:{},
        headers:{
            'content-type':'application/x-www-form-urlencoded'
        },
        //request body
        data:`username=${username.value}&password=${password.value}`
    }).then(res=>{
        console.log(res.data.userinfo.username);
        location.href="http://127.0.0.1:2000/home.html"
        sessionStorage.setItem('token',res.data.token);
        sessionStorage.setItem('userinfo',JSON.stringify(res.data.userinfo));
        alert(res.data.msg);
    });
},false)