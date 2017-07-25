'use strict';
const net = require('net');
const fs=require('fs');
const log4js = require('log4js');
const HOST = '10.16.8.22';
const PORT = 6969;
const file=__dirname+"/doc/ipjson.txt";
var idmap=[];
//logger
log4js.configure({
	"appenders": [
		{type: 'file', filename: '/log/gjzptcp.log', category: 'gtcp'},
		{type: 'file', filename: '/log/gjzphttp.log', category: 'ghttp'},
		{type: 'console'}
	],
	replaceConsole: true
});
var logtcp = log4js.getLogger('gtcp');
var loghttp = log4js.getLogger('ghttp');
//var logtcp = console;
//var loghttp = console;
//读取文件
jsonToMap();
//读取站牌id信息保存到map中
function jsonToMap(){
	logtcp.info('===jsonToMap start===');
	var result=JSON.parse(fs.readFileSync( file));
	logtcp.info('===id.length:'+result.data.length);
	for(var i=0;i<result.data.length;i++){
		var obj=result.data[i];
		logtcp.info('===id:'+obj.id);
		idmap[obj.id]=null;
	}
	logtcp.info('===jsonToMap end===');
}
// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function(sock) {
	// 我们获得一个连接 - 该连接自动关联一个socket对象
	logtcp.info('===CONNECTED: ' +sock.remoteAddress + ':' + sock.remotePort);
	//超时事件
	sock.setTimeout(5000,function(){
		logtcp.info('===timeout: ' +sock.remoteAddress + ' ' + sock.remotePort+'--end===');
		if(idmap['id1']==sock){
			idmap['id1']=null;
		}
		sock.end();
	});
	//发送心跳
	const t=setInterval(function(){
			if(!sock.destroyed){
				logtcp.info('>>> DATA ' + sock.remoteAddress + ': xt');
				sock.write("xt");
			}
	},5000);
	// 接收数据
	sock.on('data', function(data) {
		logtcp.info('<<< DATA ' + sock.remoteAddress + ': ' + data);
		//验证
		var d=data.toString().split(':');
		if(d[0]=='type'){
			idmap[d[1]]=sock;
		}else{
			// 回发该数据，客户端将收到来自服务端的数据
			if(d[0]=='state'){
				logtcp.info('>>> DATA ' + sock.remoteAddress + ': ' +d[1]);
				sock.write('You said state:'+d[1]);
			}else{
				logtcp.info('>>> DATA ' + sock.remoteAddress + ': ' +data);
				sock.write('You said "' + data + '"');
			}
		}
	});
	// 为这个socket实例添加一个"close"事件处理函数
	sock.on('close', function(data) {
		logtcp.info('===close');
	});
	//错误捕捉
	sock.on('error', function(err) {
		logtcp.error('===eee ' + err.code + ':' + err.name + ':' + err.message);
	});

}).listen(PORT, HOST);

logtcp.info('===Server listening on ' + HOST +':'+ PORT);

// 创建一个http服务器实例
const http = require('http');
const url=require('url');//路由模块 
//引入get数据格式化的模块
const querystring=require("querystring");
const _path=__dirname+"/html/";//指定文件路径
http.createServer(function (req, res) {
	 //获取当前的访问路由
		var pathname = url.parse(req.url).pathname;
		loghttp.info('=== 当前的访问路由'+pathname)
	switch (pathname){
		case "/login"://用户页面
			SetHtml(_path+"login.html",req,res)
			break;
		case "/login2"://用户页面
		//获取get请求的传回的数据
			 var query= url.parse(req.url).query;
			loghttp.info('=== 请求参数：'+query);
			SetLoginHtml(res,(querystring.parse(query)).id)
			break;
		case "/jquery"://jquery-2.2.4.min.js
			SetHtml(_path+"/js/jquery-2.2.4.min.js",req,res)
			break;
		case "/loginjs"://login.js
			SetHtml(_path+"/js/login.js",req,res)
			break;
		case "/login/check"://get请求提交
			loghttp.info('=== 请求方式：'+req.method)
			//获取get请求的传回的数据
			 var query= url.parse(req.url).query;
			loghttp.info('=== 请求参数：'+query);
			//将获取的数据转换为key/value的形式
			loghttp.info('=== id：'+(querystring.parse(query)).id);
			var stcp=idmap[(querystring.parse(query)).id];
			//发送数据
			loghttp.info('>>> DATA ' + stcp.remoteAddress + ': ' +(querystring.parse(query)).text);
			stcp.write((querystring.parse(query)).text);
			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
			res.end("{\"data\":\"提交成功\"}");
			break;
		case "/query"://get请求提交
			loghttp.info('=== 请求方式：'+req.method)
			//获取get请求的传回的数据
			 var query= url.parse(req.url).query;
			loghttp.info('=== 请求参数：'+query);
			//将获取的数据转换为key/value的形式
			loghttp.info('=== id：'+(querystring.parse(query)).id);
			var tip=idmap[(querystring.parse(query)).id];
			loghttp.info('>>> DATA ' + tip.remoteAddress + ': state');
			tip.write("state");
			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
			res.end("{\"data\":\""+tip.remoteAddress+"\"}");
			break;
	}
}).listen(8888);
// 终端打印如下信息
loghttp.log('=== Server running at http://127.0.0.1:8888/');
//获取html文件
function SetHtml(path,req,res){
	loghttp.info('=== path:'+path)
	fs.readFile(path,function (err,data) {
		if (err){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end("加载文件失败");
		}else{
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data.toString());
		}
	});
}
function SetLoginHtml(res,id){
	res.writeHead(200, {'Content-Type': 'text/html'});
	var data='<!doctype html>'+
	'<html lang="en">'+
	' <head>'+
	'  <meta charset="UTF-8">'+
	'  <meta name="Generator" content="EditPlus®">'+
	'  <meta name="Author" content="">'+
	'  <meta name="Keywords" content="">'+
	'  <meta name="Description" content="">'+
	'  <title>login</title>'+
	' </head>'+
	' <body>'+
	' <div>'+
	'	 站牌ID：<input type="text" id="zpid" value="'+id+'" readonly="readonly"><br><br> '+
	'	 <button type="submit" id="query" value="Submit">查询</button>'+
	'	 文字显示：<input type="text" id="mess"><br><br>'+
	'	 <button type="submit" id="cli" value="Submit">提交</button>'+
	' </div>'+
	' <script type="text/javascript" src="http://127.0.0.1:8888/jquery"></script>'+
	'<script type="text/javascript" src="http://127.0.0.1:8888/loginjs"></script>'+
	' </body>'+
	'</html>';
	res.end(data.toString());
}
