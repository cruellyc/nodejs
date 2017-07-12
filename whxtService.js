var net = require('net');
var HOST = '10.16.8.22';
var PORT = 6969;
var fs=require('fs');//文件系统模块
var file=__dirname+"/doc/ipjson.txt";
var ipmap=[];
var showText=[];
var showData=[];
//读取文件
jsonToMap();
//读取站牌ip信息保存到map中
function jsonToMap(){
	var result=JSON.parse(fs.readFileSync( file));
	console.log('result:'+result.data.length);
	for(var i=0;i<result.data.length;i++){
		var obj=result.data[i];
		console.log('****'+obj.id+':'+obj.ip);
		ipmap[obj.id]=obj.ip;
	}
	console.log('**map end**');
}
// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function(sock) {

	// 我们获得一个连接 - 该连接自动关联一个socket对象
	console.log('CONNECTED: ' +
		sock.remoteAddress + ':' + sock.remotePort);
	//超时事件
	sock.setTimeout(5000,function(){
		console.log('close: ' +
			sock.remoteAddress + ' ' + sock.remotePort+'-连接超时');
		sock.end();
	});
	//定时
	const t=setInterval(function(){
			if(!sock.destroyed){
				sock.write("state");
				if(ipmap['id1']==sock.remoteAddress){
					if(showText[sock.remoteAddress]!=null){
						sock.write('showText:'+showText[sock.remoteAddress]);
					}
				}else{
					sock.write('hh');
				}
			}
		},5000);
	// 为这个socket实例添加一个"data"事件处理函数
	sock.on('data', function(data) {
		console.log('DATA ' + sock.remoteAddress + ': ' + data);
		// 回发该数据，客户端将收到来自服务端的数据
		var d=data.toString().split(':');
		if(d[0]=='state'){
			sock.write('You said state:'+d[1]);
			showData[sock.remoteAddress]=d[1];
		}else{
			sock.write('You said "' + data + '"');
		}
	});
	// 为这个socket实例添加一个"close"事件处理函数
	sock.on('close', function(data) {
		console.log('close');
	});
	//错误捕捉
	sock.on('error', function(err) {
		console.log('eee ' + err.code + ':' + err.name + ':' + err.message);
	});

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

// 创建一个http服务器实例
var http = require('http');
var url=require('url');//路由模块 
//引入get数据格式化的模块
var querystring=require("querystring");
var _path=__dirname+"/html/";//指定文件路径
http.createServer(function (req, res) {
	 //获取当前的访问路由
		var pathname = url.parse(req.url).pathname;
		console.info(pathname)
	switch (pathname){
		case "/login"://用户页面
			SetHtml(_path+"login.html",req,res)
			break;
		case "/jquery"://jquery-2.2.4.min.js
			SetHtml(_path+"/js/jquery-2.2.4.min.js",req,res)
			break;
		case "/login/check"://get请求提交
			console.info(req.method)
			//获取get请求的传回的数据
			 var query= url.parse(req.url).query;
			console.info(query);
			//将获取的数据转换为key/value的形式
			console.info(querystring.parse(query));
			console.info("####"+(querystring.parse(query)).id);
			var tip=ipmap[(querystring.parse(query)).id];
			console.info("####tip:"+tip);
			//保存当前id的
			showText[tip]=(querystring.parse(query)).text;
			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
			res.end("{\"data\":\"提交成功\"}");
			break;
		case "/query"://get请求提交
			console.info(req.method)
			//获取get请求的传回的数据
			 var query= url.parse(req.url).query;
			console.info(query);
			//将获取的数据转换为key/value的形式
			console.info(querystring.parse(query));
			console.info("####"+(querystring.parse(query)).id);
			var tip=ipmap[(querystring.parse(query)).id];
			console.info("####tip:"+tip);
			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
			res.end("{\"data\":\""+showData[tip]+"\"}");
			break;
		/*case "/login/checkPost"://post提交
			//post提交的数据会暂时存在缓冲区中，需要调用request的监听方法累加获取
			var post="";//申明接受post的数据变量
			req.on("data",function (chunk) {
				post+=chunk;
			});
			//监听end事件
			req.on("end",function () {
				post=querystring.parse(post);
				console.info(post);
			})
			break;*/
	}
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');
//获取html文件
function SetHtml(path,req,res){
	console.info(path)
	fs.readFile(path,function (err,data) {
		if (err){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end("加载文件失败");
		}else{
			res.writeHead(200, {'Content-Type': 'text/html'});
			//console.info(data.toString())
			res.end(data.toString());
		}
	});
}

