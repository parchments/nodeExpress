const path = require("path");
const mysql = require("mysql");
const express = require("express");
const app = express();//实例化一个app
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');  //用来生成token
const request = require('request');
const bodyParser = require('body-parser');
app.use(bodyParser.json());////post请求req.body为空的处理 json请求
app.use(bodyParser.urlencoded({extended: false}));// 表单请求

// 全局配置跨域
app.use(cors());

//本地访问不了已上传的图片，需要开启静态资源路径访问
const pathname = __dirname;
//静态文件访问
app.use(express.static(pathname));
// 使用静态文件   这样可以获取静态文件的东西
app.use(express.static('vueDream/dist'))


//校验token
function verifyToken(req, res, next){
	let secretOrPrivateKey = 'jwt';//密钥
	jwt.verify(req.headers.token, secretOrPrivateKey, function (__err, decode) {
		//时间失效的时候/ 伪造的token
		if (__err) {
			return res.status(401).send({
				code: 401,
				data: null,
				message: "登录过期,请重新登录"
			});
		} else {
			next();
		}
	})
}
//这里处理全局拦截，一定要写在最上面
app.all('*', (req, res, next) => {
	//设置响应头
    res.header("Access-Control-Allow-Origin", "*"); //*表示允许的域名地址，本地则为'http://localhost'
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
	
	//如果是登录 注册 找回密码  需要放行  无需校验token
	let isLogin = req.url.indexOf('login');
	let isRegister = req.url.indexOf('register');
	let isForgotPassword = req.url.indexOf('forgotPassword');
	let isCollection = req.url.indexOf('collection');
	// let isWechatLogin = req.url.indexOf('wechatLogin');
	// let isGetWxAccessToken = req.url.indexOf('getWxAccessToken');
	//微信小程序  并且是收藏接口需要校验token
	let systype = req.headers.systype;
	if(systype === 'wechat'){
		if(isCollection !== -1){
			verifyToken(req, res, next)
		} else {
			next();
		}
	} else if(systype === 'pc'){
		//pc   登录注册找回密码放行
		if(isLogin !== -1 || isRegister !== -1 || isForgotPassword !== -1){
			next();
		}else{
			verifyToken(req, res, next)
		}
	}
})

//这一步目的是，当访问根路径时，把前端代码读取出来并显示
app.get('/', (req, res) => {
	//服务器地址vueDream/dist/index.html
    res.sendFile(path.resolve(__dirname, 'vueDream', 'dist', 'index.html'));
})

//配置mysql
const option = {
	host: "",//服务器域名
	user: '',//数据库用户名
	port: '', //用户端口
    password: "",//数据库密码
    database: "node_dream",//mysql数据库
    connectTimeout: 5000, //连接超时
    //multipleStatements: false //是否允许一个query中包含多条sql语句
}

let pool;
repool();
function Res ({ code = 200, message = '', data = {} }) {
    this.code = code;
    this.message = message;
    this.data = data;
}
function resJson (_res, result) {
    return _res.json(new Res(result))
}

//断线重连机制
function repool() {
    //创建连接池
    pool = mysql.createPool({
        ...option,
        waitForConnections: true, //当无连接池可用时，等待（true）还是抛错（false）
        connectionLimit: 200, //连接数限制
        queueLimit: 0 //最大连接等待数（0为不限制）
    })
    pool.on('error', err => {
        err.code === 'PROTOCOL_CONNECTION_LOST' && setTimeout(repool, 2000)
    })
    app.all('*', (_,__, next) => {
        pool.getConnection( err => {
            err && setTimeout(repool, 2000) || next()
        })
    })
}

module.exports = { app, pool, router, resJson , jwt , request}