const express=require('express');
const router=express.Router();
const mysql=require('mysql'); //npm install mysql 이후

const config ={
    host:'127.0.0.1',
    user:'root',
    password:'',
    database:'homepage',
}

const pool=mysql.createPool(config);

pool.getConnection((err,connection)=>{
    if(err) throw err;
    connection.query("select * from board",(error,results)=>{
        connection.release();
        if(error) throw error;
        console.log(results);
    })
})

//목록 화면 가져오기

router.get('/list',function(req,res,next){
    let page = (req.query.idx == undefined) ? 1 : req.query.idx;
    let row=10;
    let limit=`limit ${page-1}, ${row}`;
    let total_page_array=[];
    pool.getConnection(function(err,connection){
        var sql=`select idx,subject,writer,content,date_format(today, '%Y-%m-%d %h:%i:%s') as today, hit from board order by idx desc ${limit};`
        var sqlall=`select idx,subject,writer,content,date_format(today, '%Y-%m-%d %h:%i:%s') as today, hit from board order by idx desc`
        connection.query(sqlall,function(error,results){
            connection.release();
            if(error) throw error;
            let total_page=Math.ceil(results.length/row);
            for(i=1;i<=total_page;i++){
                total_page_array.push(i)
             }
            connection.query(sql,function(error,results){
                let total_record=results.length;
                results.forEach(ele=>{
                    ele.number=total_record;
                    total_record--;
                });
                 res.render('./board/list.html',{
                    list:results,
                    listrow:total_page_array,
                })
            })
        })
    })
})

/* 백업백업백업백업백업백업백업백업백업백업
router.get('/list',function(req,res,next){
    let page = (req.query.idx == undefined) ? 1 : req.query.idx;
    let row=10;
    let limit=`limit ${page-1}, ${row}`;
    //let total_row=134; into line 46
    //let total_page=Math.ceil(total_row/row);
    pool.getConnection(function(err,connection){

        //var sql=`select idx,subject,writer,content,date_format(today, '%Y-%m-%d %h:%i:%s') as today, hit from board order by idx desc ${limit};`
        var sqlall=`select idx,subject,writer,content,date_format(today, '%Y-%m-%d %h:%i:%s') as today, hit from board order by idx desc`
        connection.query(sqlall,function(error,results){
            connection.release();
            if(error) throw error;

            
            let total_record=results.length;
            let total_page=Math.ceil(results.length/row);
            console.log(results,'zzxc')
            let total_page_array=[];
        
            results.forEach(ele=>{
                ele.number=total_record;
                total_record--;
            });
            for(i=1;i<=total_page;i++){
               total_page_array.push(i)
            }
            res.render('./board/list.html',{
                list:results,
                listrow:total_page_array,
            })

        })
    })
}) 백업백업백업백업백업백업백업백업백업*/

//글쓰기 메뉴

router.get('/write',function(req,res,next){
    pool.getConnection(function(err,connection){
            connection.release();
            if(err) throw err;
            res.render('./board/board_write.html')
        
    })
})

//글 제목 누르면 보기 

router.get('/view',(req,res,next)=>{
    let idx=req.query.idx;
    pool.getConnection(function(err,connection){
        var sql=`select * from board where idx=${idx};`
        connection.query(sql,(error,results)=>{
            connection.release();
            if(error) throw error;
            res.render('../views/board/board_view.html',{
                list:results[0],
            })
        })
        
    })
})

// 글쓰기 메뉴에서 글쓰기 클릭 시

router.post('/write',(req,res,next)=>{

    pool.getConnection(function(err,connection){
        let subject=req.body.board_subject;
        let writer=req.body.board_writer;
        let content=req.body.board_content;
        let sql=`insert into board (subject,writer,content,hit) values('${subject}','${writer}','${content}','0')`
        connection.query(sql,(error,results)=>{
            connection.release();
            if(error) throw error;
            let insertId=results.insertId;
            res.redirect(`./view?idx=${insertId}`)
        })
    })
})

//보기 페이지>수정 페이지 불러오기

router.get('/modify',(req,res,next)=>{
    let idx=req.query.idx;
    let sql=`select * from board where idx=${idx};`
    pool.getConnection(function(err,connection){
        connection.query(sql,(error,results)=>{
            connection.release();
            if(error) throw error;
            res.render('./board/board_modify.html',{
                item:results[0],
                idx:idx,
            })
        })
    })
})

router.post('/modify',(req,res,next)=>{
    let idx=req.body.board_idx;
    let subject=req.body.board_subject;
    let writer=req.body.board_writer;
    let content=req.body.board_content;
    let sql = `update board set subject='${subject}', writer='${writer}', content='${content}', today=now() where idx='${idx}'`;
    
    pool.getConnection(function(err,connection){
        connection.query(sql,(error,results)=>{
            connection.release();
            if(error) throw error;
            let insertId=results.insertId;
            res.redirect(`/board/view?idx=${idx}`);
            })
    })
})
//수정페이지에서 글 수정시
router.get('/delete',(req,res,next)=>{
    let idx=req.query.idx;
    let sql=`delete from board where idx='${idx}'`;
    pool.getConnection(function(err,connection){
        connection.release();
        connection.query(sql,(error,results)=>{
            if(error) throw error;
            res.redirect('/board/list');
        })
 
    })
})






module.exports=router;