var exec = require('child_process').exec;
var cmd = 'node -v';

exec(cmd, function(error, stdout, stderr) {
  // 获取命令执行的输出
  console.info("hh"+stdout);
});