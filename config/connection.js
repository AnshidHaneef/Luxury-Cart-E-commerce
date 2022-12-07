const mongoClient = require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    // const url = 'mongodb://localhost:27017'
    const url = `mongodb+srv://Anshid:Adhilan%4012@cluster0.og4dblc.mongodb.net/?retryWrites=true&w=majority`;
    const dbname='luxury'

    mongoClient.connect(url,(err,data)=>{
        if (err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}
