
const axios = require('axios');
var sha256 = require('js-sha256');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const  lang={};
const strArr=[]

// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
var from = 'zh-CHS';
var to = 'en';
var appKey = '03aea9eb2c4df13a';
var key = '';//注意：暴露appSecret，有被盗用造成损失的风险

function getInput(input){
	if (input.length == 0) {
		return null;
	}
	var result;
	var len = input.length;
	if(len <= 20){
		result = input;
	}else{
		var startStr = input.substring(0,10);
		var endStr = input.substring(len-10,len);
		result = startStr + len +endStr;
	}
	return result;

}


function sendReq(query){
	var salt = new Date().getTime();
	var curtime=Math.round(new Date().getTime()/1000);
	var str1 = appKey + getInput(query) + salt + curtime +key;
	var sign = sha256(str1);
	//console.log(str1);
	return axios.get('http://openapi.youdao.com/api',{params:{
			q: query,
	        appKey: appKey,
	        salt: salt,
	        from: from,
	        to: to,
			curtime: curtime,
	        sign: sign,
			signType: "v3"
		}})
		.then(res=>{
		    let str= strArr.pop()
		    if(str){
		    	//console.log(res.data);
				let d= res.data.translation;
				lang[query]={"zh-CN":query,"en-US":`${d[0]}`}
				sendReq(str);
			}else{
				console.log(lang)
			}
			
		})
}

let filepath = path.join(__dirname, "cn_keys.txt")
let input = fs.createReadStream(filepath)
const rl = readline.createInterface({
  input: input
});

rl.on('line', (line) => {
  strArr.push(line.trim())
  
});
rl.on('close', (line) => {
  console.log("读取完毕！",strArr.length);
  sendReq(strArr[strArr.length-1])
});

