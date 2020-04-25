const { app, pool } = require('./connect');

app.all('/api', (req, res) => {
    pool.getConnection((err, conn) => {
        res.json({ type: 'test success'})
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
})
//引入上传路由const multerUpload = require('./routes/upload');const user = require('./routes/user');const dreamList = require('./routes/dream');const collectionList = require('./routes/collection');//使用路由app.use('/upload', multerUpload);
app.use('/user', user);
app.use('/dream', dreamList);
app.use('/collection', collectionList);


//查看链接成功
app.get('/api/test', function (req, res) {
    res.json({ message: "连接成功" })
});

//开启监听
app.listen(8888, () => {
	console.log("服务器端口8888开启中...");
})