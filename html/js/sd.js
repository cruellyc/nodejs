$(document).ready(function() {
Date.prototype.Format = function (fmt) { //author: meizz 
var o = {
	"M+": this.getMonth() + 1, //月份 
	"d+": this.getDate(), //日 
	"h+": this.getHours(), //小时 
	"m+": this.getMinutes(), //分 
	"s+": this.getSeconds(), //秒 
	"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
	"S": this.getMilliseconds() //毫秒 
};
if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
for (var k in o)
if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
return fmt;
}
Date.prototype.FormatWeek = function (day) {
		var wd = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		var week = wd[day.getDay()];
		return week;
	};
$('#time_div').text(new Date().Format('yyyy-mm-dd hh:MM:ss'));
$('#week_div').text(Date.prototype.FormatWeek(new Date()));

});