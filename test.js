var flag=true;
setInterval(function(){
	if(flag){
		const net = require('net');
		//连接服务器
		const client = net.createConnection({host:'10.16.8.22',port:6969}, function(){
			console.log('=== connected ');
			flag=false;
		});
		const t=setInterval(function(){
			if(!client.destroyed){
				client.write("1");
			}
		},4000);
		//处理服务发来的数据
		client.on('data', function(data){
			console.log('<<< ' + data.toString());
			if(data=='state'){
				client.write("state:1");
			}
		});
		//连接结束
		client.on('end',function() {
			flag=true;
			clearInterval(t);
			console.log('=== disconnected');
		});
		//错误捕捉
		client.on('error', function(err) {
			console.log('eee ' + err.code + ':' + err.name + ':' + err.message);
		});
	}
}, 1000);