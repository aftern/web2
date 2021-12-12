var testFolder = './data'; // 실행하는 위치의 경로
var fs = require('fs');
 
fs.readdir(testFolder, function(error, filelist){ // 특정 폴더 안에 파일 목록 출력
  console.log(filelist);
})