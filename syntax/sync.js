var fs = require('fs');

/* console.log('a');
//readFileSync
var result = fs.readFileSync('syntax/sample.txt', 'utf-8');
console.log(result);
console.log('c'); */

console.log('a');
//readFile은 readFileSync와 다르게 return 값이 없고, 실행 후 세번째 parameter인 함수를 실행
fs.readFile('syntax/sample.txt', 'utf-8', function(err, result){
    console.log(result);
});
console.log('c');
// 나중에 고성능의 프로그래밍을 할 때에는 비동기적으로 구성해야함