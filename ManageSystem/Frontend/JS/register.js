const registerBtn=document.getElementById("registerBtn");
const username=document.getElementById("username");
const password=document.getElementById("password");
axios.defaults.baseURL='http://127.0.0.1:2000';
registerBtn.addEventListener("click",function(e){
    axios({
        //request method
        method:'POST',
        //url
        url:'/api/register',
        //url parameters
        params:{},
        headers:{
            'content-type':'application/x-www-form-urlencoded'
        },
        //request body
        data:`username=${username.value}&password=${password.value}&email=${email.value}`
    }).then(res=>{
        alert(res.data.msg);
        if(res.data.status===0)
            history.back();
    });
},false)