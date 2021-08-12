const fs = require('fs')
const http = require('http')
const io = require('socket.io')(http);
const port = 80
let cnt = 1
const chunk_list = {}
const data_dir = fs.readdirSync('./data')
data_dir.forEach(v=>{fs.unlink('./data/'+v, err=>{if(err) console.log(err)})})
const file_list = fs.readdirSync('./')


const server = http.createServer((req,res)=>{
    const method = req.method
    const url = req.url
    const url_arr = url.split('/')

    if(method=='GET') console.log('[url]',decodeURI(url), cnt)
    if(url=='/') {
        fs.readdir('./',(err,list)=>{
            //console.log(list)
            //res.end(`<a href='https://zoom.us/j/92246873380?pwd=Z0RBQm9QSnE2K0lFMTBlcHFyUzBnUT09'>줌</a>`);
            //return;
            out = list.map((i)=>`<div><a href="./${i}">${i}</a></div>`).join('')
            res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.end(out)
        })
    }
    else if(method=='GET' && file_list.includes(url_arr[1]) ){
        fs.readFile('./'+decodeURI(url),(err,data)=>{
            //console.log(err,data)
            if (err){
                res.statusCode=404
                res.end('404 not found')
            }
            if (decodeURI(url).endsWith('html')) res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.end(data)
        })
    }
    else if(url=='/chunk'){
        res.writeHead('200', {'Content-Type': 'application/json; charset=utf8'});
        res.end(JSON.stringify(chunk_list))
    }
    else if(url_arr[1]=='video'){
        filename =  url_arr[2]
        fs.readFile('./data/'+filename,(err,data)=>{
            if(err){
                res.statusCode=404
                res.end('404 not found')
            }
            else{
                res.writeHead(200, {'Content-Type':'video/webm', 'Content-Length': data.length, 'Accept-Ranges': 'bytes'});
                res.end(data)
            }
        })
    }
    else if(method=='POST'){
        const data=[];
        req.on('error', () => {callback(undefined) });
        req.on('data', (chunk) => {data.push(chunk) });
        req.on('end', () => { 
            const out = Buffer.concat(data)
            const my_cnt = cnt++
            //console.log('[out]',out, out.length)
            fs.writeFile('./data/'+(my_cnt)+'.webm',out, err=>{
                if(err)console.log(err)
                chunk_list[my_cnt] = new Date()
                
                setTimeout(()=>{
                    //console.log('delelte',my_cnt)
                    delete chunk_list[my_cnt]
                    //fs.unlinkSync('./data/'+my_cnt+'.webm')
                },10*1000)
            })
            res.statusCode=200
            res.end('1')
        });
    }
    else {
        res.statusCode=404
        res.end('404 not found')
    }
})

let app = server.listen(port,()=>{console.log(`server is running at ${port}`)})



io.on('connection',socket=>{
    console.log('user connected: ', socket,socket.id);  
})