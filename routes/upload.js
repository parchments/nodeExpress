//上传文件接口
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


let upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/images');
        },
        filename: function (req, file, cb) {
            var changedName = (new Date().getTime())+'-'+file.originalname;
            cb(null, changedName);
        }
    })
});

let uploadVideo = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/video');
        },
        filename: function (req, file, cb) {
            var changedName = (new Date().getTime())+'-'+file.originalname;
            cb(null, changedName);
        }
    })
});

//单个图片文件上传
router.post('/uploadImage', upload.single('singleFile'), (req, res) => {
	// console.log(req);//获取到的age和name
	if (res.file) {  //判断一下文件是否存在，也可以在前端代码中进行判断。
		res.json({
		    code: 0,
			message: "上传文件不能为空！", 
			data: null
		})
		return false
	}
	//返回路径需要转义  否则会返回反斜杠格式数据 导致微信小程序识别不了本地图片 http://localhost:8888//uploads\images\1582511344098-1.jpg
	let filePath = req.file.path;
	let pathResult = filePath.split('\\').join('/');
    res.json({
        code: 1,
        type: 'uploadImage',
		message: "上传成功！", 
		data: req.file.path,
        originalname: req.file.originalname,
        path: pathResult
    })
});


//单个视频文件上传
router.post('/uploadVideo', uploadVideo.single('singleFile'), (req, res) => {
	// console.log(req);//获取到的age和name
	if (res.file) {  //判断一下文件是否存在，也可以在前端代码中进行判断。
		res.json({
		    code: 0,
			message: "上传文件不能为空！", 
			data: null
		})
		return false
	}
	//返回路径需要转义  否则会返回反斜杠格式数据 导致微信小程序识别不了本地图片 http://localhost:8888//uploads\images\1582511344098-1.jpg
	let filePath = req.file.path;
	let pathResult = filePath.split('\\').join('/');
    res.json({
        code: 1,
        type: 'uploadVideo',
		message: "上传成功！", 
		data: req.file.path,
        originalname: req.file.originalname,
        path: pathResult
    })
});

//多个文件上传
router.post('/multer', upload.array('multerFile'), (req, res) => {
    console.log(req.files);
    let fileList = [];
    req.files.map((elem) => {
        fileList.push({
            originalname: elem.originalname
        })
    });
    res.json({
        code: '0',
        type: 'multer',
        fileList: fileList
    });
});
 
module.exports = router;