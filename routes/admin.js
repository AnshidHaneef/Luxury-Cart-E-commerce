var express = require('express');
const file = require('fileupload/lib/modules/file');
const { reject } = require('promise');
const { response } = require('../app');
const adminHelpers = require('../helper/admin-helpers');
let db=require('../config/connection')
var router = express.Router();

var router = express.Router();

var productHelpers = require('../helper/product-helpers');
const userHelper = require('../helper/user-helper');

const credential = {
  email: "admin@gmail.com",
  password: "123"
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.admin)
  {
    res.redirect('/admin/home')
  }else{
    res.render('admin/adminlogin')
  }
});



router.post('/adminlogin', (req, res) => {
  console.log("adminloginnn")

  if (req.body.email == credential.email && req.body.password == credential.password){
    res.redirect('/admin/dashboard');
  }else
  {
    res.render('admin/adminlogin')
  }
});




 ////////////// Dashboard /////////////
router.get('/dashboard',async(req,res)=>{
let total = 0
let no=0
let user_no =0
let newUsers = []
let newTrans =[]

    await adminHelpers.getAllOrders().then( async (orders)=>{
      orders.forEach(data => {
        if (data.status == "delivered") {
          no++
          total=total+data.totalAmount
        }
      });
      for (let index = 0; index < 3; index++) {
        newTrans.push(orders[index])  
      }
    orders = newTrans  

   await  userHelper.getAllUsers().then((users)=>{
      users.forEach(data =>{user_no++}) 
      users.reverse()

          for (let index = 0; index < 3; index++) {
            newUsers.push(users[index])  
          }
        users = newUsers         
     res.render('admin/home',{admin:true,total,orders,no,user_no,users })

     })
 })
 })




////////// Products ////////////

router.get('/products',async(req,res,next)=>{
   try{
    let products = await productHelpers.getProductDetails()
    res.render('admin/view-products',{products, admin:true})
   }catch(err){
      console.log(err);
      res.redirect('/error')
   }
});


router.get('/add-products',(req,res,next)=>{
 try{
  productHelpers.getAllCategory().then((category=>{
    res.render('admin/add-products',{admin:true,category})
  }))
 }catch(err){
    console.log(err);
 }
})



router.post('/add-products',async(req,res)=>{
console.log(req.body);
  req.body.price= Number(req.body.price)

  try{
    await productHelpers.addProducts(req.body, async(id) => {
      try {
        let image = req.files.image;
        let banner = req.files.image4;
        let subImages = []
        
        if(req.files?.image2){subImages.push(req.files?.image2)}
        if(req.files?.image3){subImages.push(req.files?.image3)}
        try {
          
       
        for (let index = 0; index < subImages.length; index++) {
         await subImages[index].mv('./public/assets/product-images/' + id + index +".jpg", (err, data) => {
            if (!err) {
            
            console.log("sub images added",index);
            
            } else {
              console.log(err);
            }
          })
          
        }
      } catch (error) {
        
          res.redirect('/error')
      }
        if (image) {
          await image.mv("./public/assets/product-images/" + id + ".jpg", (err, data) => {
            if (!err) {
              // res.redirect("/admin/products");
             console.log("image added");
            } else {
              console.log(err);
            }
          });
        }
        if (banner) {
          await banner.mv("./public/banners/" + id + ".jpg", (err, data) => {
            if (!err) {
            
              console.log("banner");
            } else {
              console.log(err);
            }
          });
        }
        
      } catch (error) {
        console.log(error);
        res.redirect('/admin/products')
      }
        finally{
          res.redirect("/admin/products")
        }
        })
  }catch(err){
    console.log(err+"error in add product")
    res.redirect('/error')
  }
})




router.get('/delete-product/:id',(req,res)=>{
   let productId= req.params.id
   console.log(productId);
   productHelpers.deleteProduct(productId).then(()=>{
    res.redirect('/admin/products')
   })
})





//////////////// User ///////////////

router.get('/list_user',(req,res)=>{

 try{
  userHelper.getAllUsers().then((users)=>{
    console.log(users);
    res.render('admin/list-user',{admin:true,users})
  })
   router.get('/user-action/:id/:blockStatus',(req,res)=>{
    let userId = req.params.id
    let userStatus= req.params.blockStatus

    let status=true
    if(userStatus=="true"){
      status = false
    }
    userHelper.blockUser(userId,status).then((response)=>{
        res.redirect('/admin/list_user')
    })
  })
 }catch(err){
    console.log(err);
    res.redirect('/error')
 }
})



router.get('/edit-product/:id',async(req,res)=>{
try{
  let product = await productHelpers.getOneProduct(req.params.id)
  productHelpers.getAllCategory().then((category)=>{
  console.log(product);
  res.render('admin/edit-product',{admin:true, product, category})
})
}  catch(err){
    console.log(err);
    res.redirect('/error')
}
})



router.post('/edit-products/:id',(req,res)=>{
  try {
    
    let proId = req.params .id;
    productHelpers.updateProduct(proId, req.body).then(async() => {
      try {
        let image = req.files.image;
        let banner = req.files.image4;
        let subImages = []
        if(req.files?.image2){subImages.push(req.files?.image2)}
        if(req.files?.image3){subImages.push(req.files?.image3)}
        try {
        for (let index = 0; index < subImages.length; index++) {
         await subImages[index].mv("./public/assets/product-images/" + proId + index +".jpg", (err, data) => {
            if (!err) {        
            console.log("sub images added",index);
            } else {
              console.log(err);
            }
          })
        }
      } catch (error) {
          res.redirect('/error')
      }
        if (image) {
          await image.mv("./public/assets/product-images/" + proId + ".jpg", (err, data) => {
            if (!err) {
              // res.redirect("/admin/products");
            
              
            } else {
              console.log(err);
            }
          });
        }
        if (banner) {
          await banner.mv("./public/banners/" + proId + ".jpg", (err, data) => {
            if (!err) {
              
            
            } else {
              console.log(err);
            }
          });
        }
        
      } catch (error) {
        console.log(error);
        res.redirect('/admin/products')
      }
      finally{
        res.redirect("/admin/products")
      }
    }).then(()=>{console.log("edit successfull");}).catch((err)=>{console.log("error");});
  } catch (error) {
    res.redirect('/error')
  }
})




    ///////////// Add Category /////////////
router.get('/add-category',(req,res)=>{
try{
  res.render('admin/add-category',{admin:true})
}catch(err){
  console.log(err);
  res.redirect('/error')
}
})

router.post('/add-category',(req,res)=>{
  productHelpers.addCategory(req.body).then((result)=>{
    res.redirect('/admin/category')
  })
})

router.get('/category',(req,res)=>{
 try{
  productHelpers.getAllCategory().then((category)=>{
    console.log(category);
    res.render('admin/category',{category,admin:true})
  })
 }catch{
  res.redirect('/error')
 }
});



    ////////// Order //////////////
router.get('/order-list',(req,res)=>{
  adminHelpers.getAllOrders().then((orders)=>{
          // console.log(orders,"orderssss");
      res.render('admin/order-list',{admin:true,orders})
    })
})

router.post('/set-status',async(req,res)=>{
  console.log(req.body,"ivide ethiyoo");
    await adminHelpers.setStatus(req.body).then((response)=>{
      console.log("saadanam kitti");
    res.json(response )
  })
})


router.get('/get-order-details',async(req,res)=>{
  try{
  await adminHelpers.getAllOrders().then((order)=>{
    // console.log(order,'ordersss');
      res.json(order)
   }).catch(()=>{res.redirect('/error')});
    }catch (err){
        res.redirect('/error')
    }
 })



 router.get('/ordered-products/:id',async(req,res)=>{
  try{
    let products = await userHelper.getOrderProducts(req.params.id)
  console.log(products,'ivde ethiiii');
  res.render('admin/ordered-products',{admin:true ,products})
  }catch{
    res.redirect('/error')
  }
 })


router.get('/userDetails',async(req,res)=>{ 
 let userDetails = await userHelper.userDetails(req.query.id)
    console.log(userDetails,'queryyyyy');
    res.json(userDetails)
  })


  

////////////// Chart * Stats ////////////
 router.get('/stats',async(req,res)=>{
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);
    const data = await  db.get().collection('order').aggregate([
      {
        $match:{
            status:"delivered"
        },
      },
      {
        $project: {
          month: { $month: "$deliveryDetails.date" },
          total:"$totalAmount"
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$total" },
        },
      },
    ]).sort({ _id: -1 }).toArray();
    // res.json(data)
    res.json(data)

    console.log(data,'ddddddddaaaaaaaaaattttaa');
 })



 router.get('/getMostStats',async(req,res)=>{
  await adminHelpers.getMostStatus().then(async(response)=>{
    let top = 0
    for (let i= 0; i < response.length-1; i++) {
      if (response[i].count<response[i+1].count) {
        top  = response[i+1]
      }      
    }
  productHelpers.getProductDetails(top._id).then(async(product)=>{
     try {
       product.count = top.count
      
    } catch (error) {
      console.log("wait for top");
      console.log(product,'prooooooddd');
    }
    res.json(product)
  })
  })   
 })



    //////////// Coupons ///////////////
 router.get('/coupons',async(req,res)=>{
   try{
    await  adminHelpers.findCoupon().then((coupons)=>{
      res.render('admin/coupons',{admin:true,coupons})
    })
   }catch{
    res.redirect('/error')
   }
 })


router.get('/add-coupons',(req,res)=>{
  res.render('admin/add-coupons',{admin:true})
})

router.get('/delete-coupon',(req,res)=>{
  console.log(req.query.id,'qqqqqqqqquuuuuueeryy');
  adminHelpers.deleteCoupon(req.query.id)
  res.redirect('/admin/coupons')
})


router.post('/add-coupon',async(req,res)=>{
 try{
  req.body.offer = Number(req.body.offer)
  await adminHelpers.addCoupon(req.body).then((response)=>{
     res.json({state:response.state})
   })
 }catch{
  res.redirect('/error')
 }
})



/////////////////// Sales Report ///////////////
router.get('/sales-report',async(req,res)=>{
  try{
    await adminHelpers.getAllOrders().then( async (orders)=>{
      res.render('admin/sales-report',{admin:true,orders})
      })
  }catch(err) {
      console.log(err);
      res.redirect('/error')
  }
})


module.exports = router;
