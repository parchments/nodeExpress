//梦想接口
const {app, pool, router, resJson, jwt } = require('../connect');

// 查询
/* 
  按分页显示账号列表的路由 /getData
*/
app.post("/api/dream/getData", (req, res) => {
		//后期需要补充校验
		console.log("前端传过来的",req.body)
		// 接收前端参数
		let { pageSize, pageNo , name , userId} = req.body;
		// 默认值
		pageSize = pageSize ? pageSize : 5;
		pageNo = pageNo ? pageNo : 1;
		name = name ? name : null;
		   
		// 构造sql语句 （查询所有数据 按照时间排序）
		let sqlStr = `select * from dream`;
		// 执行sql语句
		pool.getConnection((err, conn) => {
			conn.query(sqlStr, (err, data) => {
			  if (err) throw err;
			  // 计算数据总条数
			  let total = data.length;
		   
			  // 分页条件 (跳过多少条)
			  let n = (pageNo - 1) * pageSize;
			  //   sqlStr += ` limit ${n}, ${pageSize}`;//表示从pageNo条数据取，取pageSize条数据  此处空格不能去掉不然无响应
			  // 拼接分页的sql语句
				if(name){
					sqlStr += ` where name like '%${name}%'`;
					// 执行sql语句 （查询对应页码的数据）
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

//添加接口
app.post('/api/dream/add', (req, res) => {
    //后期需要补充校验
    const data = req.body;
    const name = req.body.name;
    const sqlSameName = `select name from dream where name='${name}'`;
    //先查询数据库 dream 表里是否有前端传来的name值了 如果有返回重复提示 否则插入数据库
	pool.getConnection((err, conn) => {
		conn.query(sqlSameName, data, (_err, _results) => {
			if(_err){console.log(_err); return false;}
			//根据查询表结果个数判断，如果1为数据库已经存在此名称，不可插入   0代表数据库不存在此名称，可插入
			if(_results.length > 0){
				return res.json({
					code: 0, 
					message: "不可重复添加！", 
					data: null
				})
			}else{
				const sqlStr = 'insert into dream set ?';
				conn.query(sqlStr, data, (err, results) => {
					console.log(data)
					if (err) throw err;
					res.json({
						code: 1,
						message: '添加成功',
						data: results
					});
				})
			}
		})
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});

//修改
app.post('/api/dream/edit', function (req, res) {
    //后期需要补充校验
    const data = req.body;
    const id = req.body.id;
    // let { name, collectionStatus, price, age, experience, education, analysis, introduce, duty, ask, coverImagePath, planImagePathArray, viedoUrl}  = req.body;
    let { name, coverImagePath, content, viedoUrl , recommend}  = req.body;
    let modSql = `update dream set 
					name='${name}', 
					coverImagePath='${coverImagePath}', 
					content='${content}', 
					viedoUrl='${viedoUrl}',
					recommend='${recommend}'
					where id ='${id}'`;
	let nameSql = `select * from dream where name='${name}' and id !='${id}'`;
	//先查询数据库 dream 表里是否有前端传来的name值了 如果有返回重复提示 否则更新数据库
	pool.getConnection((err, conn) => {
		conn.query(nameSql, data, (err, results) => {
			console.log(results)
			if(results.length >= 1){
				return res.json({
					code: 0, 
					message: "名称已经存在！", 
					data: null
				})
			}else{
				conn.query(modSql, data, (err, results) => {
					res.json({
						code: 1,
						message: '修改成功',
						data: results
					});
				})
			}
		})
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
//查看
app.post('/api/dream/show', function (req, res) {
    //后期需要补充校验
    let data = req.body;
	//id是商品id
    let { id , userId}  = req.body;
    let modSql = `select * from dream where id='${id}'`;
	pool.getConnection((err, conn) => {
		conn.query(modSql, data, (err, results) => {
			if (err) {
				console.log("查询失败原因",err)
				return res.json({
					code: 0, 
					message: "查询失败", 
					affectedRows: err
				})
			}
			// 1.查询出当前readCount
			results[0].readCount = results[0].readCount+1;
			let newReadCount = results[0].readCount;
			
			// 2.更新列表的id readCount
			let sqlDreamCountStr = `update dream set readCount='${newReadCount}' where id ='${id}'`;
			conn.query(sqlDreamCountStr, data, (_err, _data) => {
			  if (_err) throw _err;
			  console.log('更新列表的id readCount成功');
			});
			
			// 返回
			res.json({
				code: 1,
				message: '查询成功',
				data: results
			});
		})
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});

//  删除
app.post('/api/dream/del', (req, res) => {
    //后期需要补充校验
    console.log(req.body)
    // let sqlStr = `DELETE FROM dream WHERE id = ${req.body.id}`;//单个删除
    let sqlStr = `DELETE FROM dream WHERE id in (${req.body})`;
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

module.exports = router;