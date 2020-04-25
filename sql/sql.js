 const SQL = {
	userSQL: {
	    queryAll: 'select * from user',   // 查询所有用户
	    queryByAccount: 'select * from user where account=?',  // 通过用户名索引查询用户
	    queryByAccountPassword: 'select * from user where account=? and password=?',  // 通过用户名和密码索引查询用户
	    // queryByAccountPassword: 'select * from user where account=? and password=?',  //  如果需要初始密码
	    insert: 'insert into user set ?',  // 插入新用户
	    updateUser: 'update user set ? where account=?',// 更新用户信息
	    deleteUser: 'delete from user where id=?', // 删除用户
	}
 }

module.exports = SQL