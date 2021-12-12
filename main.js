var http = require('http');
var fs = require('fs');
var url = require('url'); // 요구(url 모듈을 사용) -> url이라는 변수를 통해 사용
var qs = require('querystring');

function templateHTML(title, list, body, control){
  // control은 update 출력에 대한 선택을 하기 위한 변수
  var template = `
    <html>
    <head>
      <title>WEB2 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB2</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
  `;
  return template;
}
function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i++;
  }
  list = list + '</ul>'
  return list;
}
/* createServer()는 nodejs로 웹브라우저 접속이 들어올 때마다 
createServer()의 callback 함수를 nodejs가 호출 */
// callback 함수는 인자를 2개가 주어지는데
// request는 요청할 때 웹브라우저가 보낸 정보
// response는 응답할 때 우리가 웹브라우저에게 전송할 정보 
var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname == '/'){
    if(queryData.id == undefined){
      fs.readdir('./data', function(error, filelist){
        var title = 'welcome';
        var description = 'Hello, Node.js';
        var list = templateList(filelist);
        var body = `
          <h2>${title}</h2>
          <p>${description}</p> 
        `;
        var control = `<a href="/create">create</a>`;
        // control은 update 출력에 대한 선택을 하기 위한 변수
        var template = templateHTML(title, list, body, control);
        response.writeHead(200); // 200은 OK
        response.end(template); // 화면에 출력
      })
    } else{
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = templateList(filelist);
          var body = `
            <h2>${title}</h2>
            <p>${description}</p>
          `;
          // a태그 경로에 ?앞에 / 붙이면 안됨 -> 경로가 아닌 쿼리로 처리해줘야 할듯..(추측)
          var control = `
            <a href="/create">create</a>
            <a href="/update?id=${title}">update</a>
          `;
          // control은 update 출력에 대한 선택을 하기 위한 변수
          var template = templateHTML(title, list, body, control);
          response.writeHead(200); // 200은 OK
          response.end(template); // 화면에 출력
        })
      })
    }
  } else if(pathname == '/create'){
    fs.readdir('./data', function(error, filelist){
      var title = 'WEB - create';
      var list = templateList(filelist);
      var form = `
        <form action="/process_create" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
      `;
      var control = ``;
      // control은 update 출력에 대한 선택을 하기 위한 변수
      var template = templateHTML(title, list, form, control);
      response.writeHead(200); // 200은 OK
      response.end(template); // 화면에 출력
    })
  } else if(pathname == '/process_create'){
    var body = ``;
    // 웹브라우저가 post방식으로 data를 정송할 때 data가 매우 크면 PG이 꺼질 수 있음
    // nodejs는 post방식으로 전송하는 data가 매우 큰 것을 대비하여 
    // 조각조각된 data를 서버에서 수신할 때마다 callback 함수를 호출하게끔 약속되어 있음
    // 호출할 때마다 data라는 인자를 통해 수신한 정보를 줌
    request.on('data', function(data){ // data를 이벤트라고 함
      body = body + data;
    })
    // 정보가 들어오다가 더이상 들어올 정보가 없으면 callback 함수를 호출하게 되어 있음
    request.on('end', function(){ // end를 이벤트라고 함
      // 정보가 다 들어오면 body로 들어온 정보를 post로 보냄
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
        // 302는 page를 다른 곳으로 redirection
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end(); // 화면에 출력
      }); // 결과를 보면 data가 객체화 된 것을 알 수 있음
    })
  } else if(pathname == '/update'){
    fs.readdir('./data', function(error, filelist){
      fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
        var title = queryData.id;
        var list = templateList(filelist);
        /* title 값이 바뀔수도 있으므로 바뀌기 전 title 값을 저장할 필요 있음
        type이 hidden인 태그를 사용하면 사용자에게 보이지 않고 이전 title값 저장 가능 */
        var body = `
          <form action="/process_update" method="post">
            <input type="hidden" name="id" value=${title}>
            <p><input type="text" name="title" value="${title}"></p>
            <p>
                <textarea name="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
          </form>
        `;
        var control = `
          <a href="/create">create</a>
          <a href="/update?id=${title}">update</a>
        `;
        // control은 update 출력에 대한 선택을 하기 위한 변수
        var template = templateHTML(title, list, body, control);
        response.writeHead(200); // 200은 OK
        response.end(template); // 화면에 출력
      })
    })
  } else if(pathname == '/process_update'){
    var body = ``;
    // 웹브라우저가 post방식으로 data를 정송할 때 data가 매우 크면 PG이 꺼질 수 있음
    // nodejs는 post방식으로 전송하는 data가 매우 큰 것을 대비하여 
    // 조각조각된 data를 서버에서 수신할 때마다 callback 함수를 호출하게끔 약속되어 있음
    // 호출할 때마다 data라는 인자를 통해 수신한 정보를 줌
    request.on('data', function(data){ // data를 이벤트라고 함
      body = body + data;
    })
    // 정보가 들어오다가 더이상 들어올 정보가 없으면 callback 함수를 호출하게 되어 있음
    request.on('end', function(){ // end를 이벤트라고 함
      // 정보가 다 들어오면 body로 들어온 정보를 post로 보냄
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(err){
        fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
          // 302는 page를 다른 곳으로 redirection
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end(); // 화면에 출력
        }); // 결과를 보면 data가 객체화 된 것을 알 수 있음
      })
    })
  }
  else{
    response.writeHead(404); // not found
    response.end('not found'); // 화면에 출력
  }
});
app.listen(3000);