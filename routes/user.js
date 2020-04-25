//用户接口
const {app, pool, router, resJson , jwt , request} = require('../connect');
const userSQL = require('../sql/sql').userSQL;

/**
 * 用户登录功能
 */
app.post('/api/login', (req, res) => {
	let {account , password} = req.body;
    let _res = res;
    //判断参数是否为空 主要是交给前端判空 但是后台也要判断
    if (!account) {
        return resJson(_res, {
            code: 0,
			data: null,
            message: '账号不能为空'
        })
    }
    if (!password) {
        return resJson(_res, {
            code: 0,
			data: null,
            message: '密码不能为空'
        })
    }
    let _data;
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryByAccountPassword, [account, password], (e, result) => {
            if (e){
				_data = {
				    code: 0,
					data: null,
				    message: e
				}
			}
            //通过用户名和密码索引查询数据，有数据说明用户存在且密码正确，只能返回登录成功，否则返回用户名不存在或登录密码错误
            if (result && result.length) {
				 // 要生成token的主题信息
				let content = {
					account: account,
					password: password
				};
				let secretOrPrivateKey= 'jwt';// 这是加密的key（密钥）
				let token = jwt.sign(content, secretOrPrivateKey, {
					expiresIn: 60*60*1  // 1小时过期
					// expiresIn: 180  // 60秒过期
				});
                _data = {
					code: 1,
                    message: '登录成功',
                    data: token
                }
            } else {
                _data = {
                    code: 0,
					data: null,
                    message: '手机号错误或密码错误'
                }
            }
            resJson(_res, _data)
        })
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
})


/**
 * 用户鉴权功能  验证token
 */
app.post('/api/userValidator', (req, res) => {
    let _res = res;
	// let {account , password} = req.body;
	let header = req.headers;
	
	let secretOrPrivateKey= 'jwt';// 这是加密的key（密钥）
	 let token = header.token;
	 const { account , password } = jwt.verify(token, secretOrPrivateKey);
    let _data;
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryByAccountPassword, [account, password], (e, result) => {
            if (e){
				_data = {
				    code: 0,
					data: null,
				    message: e
				}
			}
            //通过用户名和密码索引查询数据，有数据说明用户存在且密码正确，只能返回登录成功，否则返回用户名不存在或登录密码错误
            if (result && result.length) {
                _data = {
					code: 1,
                    message: '获取信息成功',
                    data: {
                        userInfo: {
							id: result[0].id,
                            account: account
                        }
                    }
                }
            }
            resJson(_res, _data)
        })
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
})

/**
 * 注册用户功能
 */
app.post('/api/register', (req, res) => {
    // 获取前台页面传过来的参数
	let {account , password} = req.body;
    let _res = res;
	let reg = /^1[3456789]\d{9}$/;
    let _data;
	//手机号校验
    if (!account) {
        return resJson(_res, {
            code: 0,
			data: null,
            message: '手机号不能为空'
        })
    }
    if (account.length !== 11) {
        return resJson(_res, {
            code: 0,
			data: null,
            message: '手机长度不正确'
        })
    }
	if(!reg.test(account)){
        return resJson(_res, {
            code: 0,
			data: null,
            message: '手机号格式不正确'
        })
	}
    if (!password) {
        return resJson(_res, {
            code: 0,
			data: null,
            message: '密码不能为空'
        })
    }
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        conn.query(userSQL.queryByAccount, account, (e, r) => {
            if (e) _data = {
				code: 0,
				data: null,
                message: e
            }
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户
                    _data = {
						code: 0,
						data: null,
                        message: '用户已存在'
                    }
                } else {
                    //插入用户信息
                    conn.query(userSQL.insert, req.body, (err, result) => {
                        if (result) {
                            _data = {
								code: 1,
								data: null,
                                message: '注册成功'
                            }
                        } else {
                            _data = {
								code: 0,
								data: null,
                                message: '注册失败'
                            }
                        }
                    })
                }
            }
            setTimeout(() => {
                //把操作结果返回给前台页面
                resJson(_res, _data)
            }, 200);
        })
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
})
/**
 * 修改密码
 */
app.post('/api/updatePassword', (req, res) => {
	let {account , oldPassword , password , checkPass} = req.body;
    let _res = res;
    // 判断参数是否为空
    if (!account) {
        return resJson(_res, {
			code: 0,
			data: null,
            message: '用户名不能为空'
        })
    }
	//如果需要初始密码
    if (!oldPassword) {
        return resJson(_res, {
			code: 0,
			data: null,
            message: '旧密码不能为空'
        })
    }
    if (!password) {
        return resJson(_res, {
			code: 0,
			data: null,
            message: '新密码不能为空'
        })
    }
    if (!checkPass || checkPass !== password) {
        return resJson(_res, {
			code: 0,
			data: null,
            message: '请确认新密码或两次新密码不一致'
        })
    }
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
		//如果需要初始密码
        conn.query(userSQL.queryByAccountPassword, [account, oldPassword], (e, r) => {
            if (e) _data = {
				code: 0,
				data: null,
                message: e
            }
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户且密码正确
                    conn.query(userSQL.updateUser, [{
                        password: password
                    }, account], (err, result) => {
                        console.log(err)
                        if (result) {
                            _data = {
								code: 1,
								data: null,
                                message: '密码修改成功'
                            }
                        } else {
                            _data = {
								code: 0,
								data: null,
                                message: '密码修改失败'
                            }
                        }
                    })
                } else {
                    _data = {
						code: 0,
						data: null,
                        message: '用户不存在或旧密码输入错误'
                    }
                }
            }
            setTimeout(() => {
                //把操作结果返回给前台页面
                resJson(_res, _data)
            }, 200);
        })
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
})

// 用户查询
/* 
  按分页显示账号列表的路由 /getData
*/
app.post("/api/user/getData", (req, res) => {
		//接收前端参数
		let { pageSize, pageNo , account } = req.body;
		// 默认值
		pageSize = pageSize ? pageSize : 5;
		pageNo = pageNo ? pageNo : 1;
		account = account ? account : null;
		   
		// 构造sql语句 （查询所有数据 按照时间排序）
		let sqlStr = `select * from user `;
		pool.getConnection((err, conn) => {
			conn.query(sqlStr, (err, data) => {
			  if (err) throw err;
			  // 计算数据总条数
			  let total = data.length;
		   
			  // 分页条件 (跳过多少条)
			  let n = (pageNo - 1) * pageSize;
			  //   sqlStr += ` limit ${n}, ${pageSize}`;//表示从pageNo条数据取，取pageSize条数据  此处空格不能去掉不然无响应
			  // 拼接分页的sql语句
				if(account){
					// 执行sql语句 （查询对应页码的数据）
					sqlStr += ` where account like '%${account}%'`;
					conn.query(sqlStr, (_err, _data) => {
					  if (_err) throw _err;
					  res.send({
						  code: 1,
						  data: {
							  rows: _data,
							  total: _data.length,
							  pageNo: pageNo,
							  pageSize: pageSize,
						  },
						  message: '查询成功！'
					  });
					});
				}else{
					sqlStr += ` limit ${n} , ${pageSize}`;
					conn.query(sqlStr, (_err, data) => {
					  if (_err) throw _err;
					  res.send({
						  code: 1,
						  data: {
							  rows: data,
							  total: total,
							  pageNo: pageNo,
							  pageSize: pageSize,
						  },
						  message: '查询成功！'
					  });
					});
				}
			});
			pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
		})
  });


/**
 * 删除用户
 */

app.post('/api/user/del', (req, res) => {
    //后期需要补充校验
    console.log(req.body)
    // let sqlStr = `DELETE FROM dream_list WHERE id = ${req.body.id}`;//单个删除
    let sqlStr = `delete from user where id in (${req.body})`;
	pool.getConnection((err, conn) => {
		conn.query( sqlStr, (err , results) => {
			if(err) {
				console.log(err);
			}else {
				res.json({
					code: 1,
					message: '删除成功',
					data: results
				});
			}
		})
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
})

//由于微信暂不支持个人开发者获取手机号  故采取输入账号密码方式登录
//链接文档https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
//微信登录授权
// let AppID = '9e99';//appid
// let AppSecret = 'e9';//app密钥
// app.get('/api/wechatLogin', (req, res, next) => {
//     // 第一步：用户同意授权，获取code
// 	let code = req.query.data;
// 	request.get({url:'https://api.weixin.qq.com/sns/jscode2session?appid='+AppID+'&secret='+AppSecret+'&js_code='+code+'&grant_type=authorization_code'},
// 	    function(error, response, body){
// 	        if(response.statusCode == 200){
// 	            // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
// 	            console.log('拉取用户信息',body);
// 	            let data = JSON.parse(body);
// 	            let access_token = data.access_token;
// 	            let openid = data.openid;
// 	            request.get(
// 	                {
// 	                    url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
// 	                },
// 	                function(error, response, body){
// 	                    if(response.statusCode == 200){
// 	                        // 第四步：根据获取的用户信息进行对应操作
// 	                        let userinfo = JSON.parse(body);
// 	                        console.log('获取微信信息成功！',userinfo);
// 	                        //其实，到这就写完了，你应该拿到微信信息以后去干该干的事情，比如对比数据库该用户有没有关联过你们的数据库，如果没有就让用户关联....等等等...
// 	                    }else{
// 	                        console.log(response.statusCode);
// 	                    }
// 	                }
// 	            );
// 	        }else{
// 	            console.log(response.statusCode);
// 	        }
// 	    }
// 	)
// })

module.exports = router;