## nodeJs遇到的问题：

1、本地访问不了已上传的图片，需要开启静态资源路径访问  
解决办法：  
const pathname = __dirname;  
//静态文件访问  
app.use(express.static(pathname));

## mysql遇到的问题：
1、42000 check the manual that corresponds to your MySQL server version for the right syntax to use near ':'http://localhost:8888//uploads/images/1583031150933-net.jpg', planImagePathArr' at line 1"
{code: 0, message: "名称不可重复添加！", affectedRows: {code: "ER_PARSE_ERROR", errno: 1064,…}}
affectedRows: {code: "ER_PARSE_ERROR", errno: 1064,…}
code: "ER_PARSE_ERROR"
errno: 1064
index: 0
sql: "update dream_list set name='12', price='1', age='1', experience='1', education='1', analysis='1', introduce='1', duty='1', ask='1',coverImagePath:'http://localhost:8888//uploads/images/1583031150933-net.jpg', planImagePathArray=http://localhost:8888//uploads/images/1583031159549-c++.jpg-join-http://localhost:8888//uploads/images/1583031163955-pm.jpg-join-http://localhost:8888//uploads/images/1583031167555-前端开发.jpg, viedoUrl='http://localhost:8888//uploads/video/1583031154952-腾讯前端开发工程师.mp4' where id='35'"
sqlMessage: "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ':'http://localhost:8888//uploads/images/1583031150933-net.jpg', planImagePathArr' at line 1"
sqlState: "42000"
code: 0
message: "名称不可重复添加！"

解决方案：
1、检查是否使用了mysql关键字
2、检查语法是否正确（赋值不是用‘:’ ,而是‘=’）
3、检查数据库类型是否正确