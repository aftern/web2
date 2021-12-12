var args = process.argv // 보통 input을 parameter or argument라고 함
console.log(args);
console.log('A');
console.log('B');
if(args[2] == 1){ // agrs[2]는 입력 값
    console.log('C1');
}
else{
    console.log('C2');
}