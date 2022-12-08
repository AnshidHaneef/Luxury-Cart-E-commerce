var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db=require('./config/connection')
var fileUpload = require('express-fileupload')
var session= require('express-session')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var hbs = require('express-handlebars');
var app = express();



let method = hbs.create({})

method.handlebars.registerHelper('ifCond',function(v1,v2,options){
  if(v1 == v2){
    return options.fn(this);
  }
  else{
     return options.inverse(this);
  }
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const exhbs = hbs.create({
  extname: 'hbs', defaultLayout: 'layout',layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials',
 
  helpers:{
     off:function (a,b,options){
     // console.log(a,'aaaaaaaaaaaaaaaaaaaaaa '+b+'bbbbbbbbbbbbbbbbbbb');
      return parseInt(a-(a*(b/100)))
      },
    increment(num) {
      return num + 1;
    },
    iff: function(){
      
    },
  }
})




app.engine('hbs',exhbs.engine) 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({secret:"key",cookie:{maxAge:6000000}})) 



db.connect((err)=>{
  if (err){
    console.log("database error"+err);
  }else{
    console.log("datasbe conneted");
  }
})



app.use('/', userRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler


app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page

  res.status(err.status || 500);     
  res.render('/error');
});

app.listen(7000,()=>{
  console.log('server Started at Port http://localhost:7000');
})



module.exports = app;
