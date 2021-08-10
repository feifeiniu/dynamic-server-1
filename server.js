var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

 if(path==='/register'&&method==='POST'){//方法必须是 post 
   response.setHeader('Content-Type', 'text/html;charset=utf-8')
   const userArray = JSON.parse(fs.readFileSync("./db/users.json"))
   const array = [] //获取数据时需要一点一点的获取
   request.on('data', (chunk) => {//data 上传事件 chunk 一小段数据
     array.push(chunk)
   })
   request.on('end', () => {
     const string = Buffer.concat(array).toString()//把乱码组合到一起，变成想要的字符串
     const obj = JSON.parse(string)
     const lastUser = userArray[userArray.length - 1]
     const newUser = {
       id:lastUser ? lastUser.id + 1 : 1 ,
       name: obj.name,
       password:obj.password
     }
     userArray.push(newUser)
     fs.writeFileSync('./db/users.json',JSON.stringify(userArray))
     response.end()
   })
   
  }else{response.statusCode = 200
  // 默认首页
  const filePath = path === '/' ? '/index.html' : path
  const index = filePath.lastIndexOf('.')
  // suffix 是后缀
  const suffix = filePath.substring(index)
  const fileTypes = {
    '.html':'text/html',
    '.css':'text/css',
    '.js':'text/javascript',
    '.png':'image/png',
    '.jpg':'image/jpeg'
  }
  response.setHeader('Content-Type', 
    `${fileTypes[suffix] || 'text/html'};charset=utf-8`)
  let content 
  try{
    content = fs.readFileSync(`./public${filePath}`)
  }catch(error){
    content = '文件不存在'
    response.statusCode = 404
  }
  response.write(content)
  response.end()
}

  
  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)