//收藏接口
const {app, pool, router, resJson, jwt } = require('../connect');

// 查询
/* 
  按分页显示账号列表的路由 /getData
*/
app.post("/api/collection/getData", (req, res) => {
    console.log("前端传过来的token",req.headers.token)
		//后期需要补充校验
		console.log("前端传过来的",req.body)
		// 接收前端参数
		let { pageSize, pageNo , name , userId } = req.body;
		// 默认值
		pageSize = pageSize ? pageSize : 5;
		pageNo = pageNo ? pageNo : 1;
		name = name ? name : null;
		userId = userId ? userId : null;
		   
		// 构造sql语句 （查询所有数据 按照时间排序）
		
		// let sqlStr = `select * from collection as s left join dream as d on as.dreamId=d.id where id='${userId}'`;
		let sqlStr = `select * from collection as s left join dream as d on s.dreamId=d.id where s.collectionStatus='YES' and s.userId='${userId}'`;
		// let sqlStr = `select * from dream where id in (select dreamId from collection where userId='${userId}')`;
		// 执行sql语句
		pool.getConnection((err, conn) => {
			conn.query(sqlStr, (err, data) => {
				console.log(data)
			  if (err) throw err;
			  // 计算数据总条数
			  let total = data.length;
		   
			  // 分页条件 (跳过多少条)
			  let n = (pageNo - 1) * pageSize;
			  //   sqlStr += ` limit ${n}, ${pageSize}`;//表示从pageNo条数据取，取pageSize条数据  此处空格不能去掉不然无响应
			  // 拼接分页的sql语句
				if(name){
					sqlStr += ` and d.name like '%${name}%'`;
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
  
//新增收藏 => 更新dream并插入一条数据到collection
app.post('/api/collection/addCollection', function (req, res) {
      console.log("前端传过来的token",req.headers.token)
  	if(!req.headers.token){
  		res.json({
  			code: 0,
  			message: '请先登录',
  			data: null
  		});
  		return false;
  	}
      //后期需要补充校验
      const data = req.body;
      let {dreamId , userId , collectionStatus} = req.body;
  	console.log('修改传过来的值', dreamId , userId , collectionStatus)
  	//更新dream表
      // let modSql = `update dream set userId='${userId}', collectionStatus='${collectionStatus}' where id='${dreamId}'`;
  	
  	//插入collection
  	let addSql = `insert into collection set ?`;
  	pool.getConnection((err, conn) => {
  		conn.query(addSql, data, (err, results) => {
  			if(err){
  				console.log('添加失败',err);
  				return false;
  			}
  			res.json({
  				code: 1,
  				message: '操作成功',
  				data: results
  			});
  		})
  		pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
  	})
  });
  
//取消收藏 => 更新dream并collection删除一条数据
app.post('/api/collection/delCollection', function (req, res) {
      console.log("前端传过来的token",req.headers.token)
  	if(!req.headers.token){
  		res.json({
  			code: 0,
  			message: '请先登录',
  			data: null
  		});
  		return false;
  	}
      //后期需要补充校验
      const data = req.body;
      let {dreamId , userId , collectionStatus} = req.body;
  	console.log('修改传过来的值', dreamId , userId , collectionStatus)
  	//更新dream表
      // let modSql = `update dream set userId='${userId}', collectionStatus='${collectionStatus}' where id='${dreamId}'`;
  	//在collection删除id
  	let sqlStr = `delete from collection where dreamId in (${req.body.dreamId})`;
  	pool.getConnection((err, conn) => {
  		conn.query( sqlStr, (err , results) => {
  			if(err) {
  				console.log('删除失败',err);
  				return false;
  			}
  			res.json({
  				code: 1,
  				message: '操作成功',
  				data: results
  			});
  		})
  		pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
  	})
  });

  
//通过商品id和用户id查询当前是否收藏
app.post('/api/collection/isCollection', function (req, res) {
    console.log("前端传过来的token",req.headers.token)
  	if(!req.headers.token){
  		res.json({
  			code: 0,
  			message: '请先登录',
  			data: null
  		});
  		return false;
  	}
      //后期需要补充校验
      const data = req.body;
      let {id , userId} = req.body;
  	console.log('修改传过来的值', id , userId)
  	//更新dream表
      // let modSql = `update dream set userId='${userId}', collectionStatus='${collectionStatus}' where id='${dreamId}'`;
  	//在collection删除id
  	let sqlStr = `select * from collection where userId=${userId} and dreamId='${id}'`;
  	pool.getConnection((err, conn) => {
  		conn.query( sqlStr, (err , results) => {
  			if(err) {
  				console.log('删除失败',err);
  				return false;
  			}
  			res.json({
  				code: 1,
  				message: '查询成功',
  				data: results
  			});
  		})
  		pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
  	})
  });

module.exports = router;