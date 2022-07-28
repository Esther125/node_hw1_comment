//建立資料庫連線
const mongo = require("mongodb");
const url = "mongodb+srv://root:root123@mycluster.top4n.mongodb.net/?retryWrites=true&w=majority"; 
const client = new mongo.MongoClient(url);
let db = null; 
client.connect(async function(err){
    if(err){
        console.log("database failed",err);
        return;
    }
    db = client.db("comment");
    console.log("database success");
});

//建立網站伺服器基礎設定
const express = require("express");
const app = express();
const session = require("express-session");
const { name } = require("ejs");
app.use(session({
    secret:"anything",
    resave:false,
    saveUninitialized:true
}));
app.set("vew engine","ejs");
app.set("views","./views"); 
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
//建立首頁的路由
app.get("/",async function(req,res){
    const collection = db.collection("message");
    let result = await collection.find({}).sort(
        {timestamp:1});
    let messages = [];
    await result.forEach(message => {
        messages.push(message);
    });
    res.render("index.ejs",{messages:messages});
    });

//建立提交的路由
app.get("/submit",async function(req,res){
    const collection = db.collection("message");
    const name = req.query.name;
    const comment = req.query.comment;
    if(!name){
        res.redirect("/error");
        return;
    }else{
        var timestamp = new Date().getTime();
        let date = new Date(timestamp);
        const dateValues = [
            `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        ];
        
        let result = await collection.insertOne({
            name:name,
            timestamp:timestamp,
            dateValues:dateValues,
            comment:comment
        });
        res.redirect("/");
        return;

    }
});
//錯誤的路由
app.get("/error",async function(req,res){
    const error = "姓名不可以空白!";
    res.render("error.ejs",{error:error});
})

//啟動伺服器 http://localhost:3000/
app.listen(3000,function(){
    console.log("server started");
});

