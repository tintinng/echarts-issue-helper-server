/**
 * 服务入口
 */
 var http = require('http');
 var koaStatic = require('koa-static');
 var path = require('path');
 var koaBody = require('koa-body');//文件保存库
 var fs = require('fs');
 var Koa = require('koa');
 
 var app = new Koa();
 var port = process.env.PORT || '8100';
 var host = process.env.HOST || 'localhost';
//  var host = process.env.HOST || '121.40.96.103';
 
 var uploadHost= `http://${host}:${port}/uploads/`;
 

 app.use(koaBody({
     formidable: {
         //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
         uploadDir: path.resolve(__dirname, './static/uploads')
     },
     multipart: true // 开启文件上传，默认是关闭
 }));
 
 //开启静态文件访问
 app.use(koaStatic(
     path.resolve(__dirname, './static')
 ));
 
 //文件二次处理，修改名称
 app.use((ctx) => {
     ctx.set("Access-Control-Allow-Origin", "*")
     if (ctx.request.files) {
         // 返回的图片资源
         let res = Object.create(null)
         res.fileAsserts = []
         // 单个文件也转为数组
         if (!Array.isArray(ctx.request.files.images)) {
            ctx.request.files.images = [ctx.request.files.images]
         }
         // 遍历files
         Array.prototype.forEach.call(ctx.request.files.images, image => {
            // 根据上传资源的路径和名称，转换为提供静态资源的路径
            if (image.size > 0 && image.path) {
                // 扩展名
                let extArr = image.name.split('.')
                let ext = extArr[extArr.length - 1]
                let nextPath = `${image.path}.${ext}`
                //重命名文件
                fs.renameSync(image.path, nextPath);
                //以 json 形式输出静态资源地址 注意windows下和linux下的文件分隔符有区别
                res.fileAsserts.push(`${uploadHost}${nextPath.slice(nextPath.lastIndexOf('\\')+1)}`)
            }
        })
        ctx.body = res
     }
 });
 
 /**
  * http server
  */
 var server = http.createServer(app.callback());
 server.listen(port);
 console.log('fileupload server start ......   ');
 
