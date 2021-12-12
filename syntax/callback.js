/*
function a(){
    console.log('A');
}
*/
// 위 아래 코드 동일 -> 'javascript에서는 함수가 값이다'
var a = function(){
    console.log('A');
}

function slowfunc(callback){
    callback();
}
slowfunc(a);