const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { Db } = require('mongodb');
var router = express.Router();

const adminHelpers = require('../helper/admin-helpers');
const productHelpers = require('../helper/product-helpers');
const userHelper = require('../helper/user-helper');
const userHelpers = require('../helper/user-helper')


const verifyLogin = ((req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
})


const storeCurrentRoute = (req, res, next) => {
  if (!req.session.user)
req.session.redirectTo=req.path
console.log('hai',req.session.redirectTo,req.path)
  next()
} 



///////////* GET home page. *///////////
router.get('/', async function (req, res, next) {
  try{   
  let userrole = req.session.user
  let homeStatus = true
  let cartCount = null
  let category = await productHelpers.getAllCategory()
  if (userrole) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  res.render('user/home', {
    user: true,
    userrole,
    homeStatus,
    cartCount,
    category
  });
  }catch(err){
    console.log(err);
    res.redirect('/error')
  }
});

 

//////////////////login/////////////////

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { user: true, "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }
})


router.post('/login', (req, res) => { 
var redirectTo = req.session.redirectTo || "/";
console.log("last", redirectTo);
delete req.session.redirectTo;


  userHelpers.doLogin(req.body).then((response => {
    if (response.status) {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user
        // res.redirect('/')
        res.redirect(redirectTo);
      }
      else {
        res.redirect('/login')
        req.session.loginErr = true
      }
    }
    // else{
    //   res.send("user blocked")
    // }
  }))
})



router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})


//////////signup/////////////////

router.post('/signup', (req, res) => {
  req.body.blockStatus = true;

  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  })
  res.redirect('/login')
})


///////////// products ///////////////
router.get('/products', async (req, res) => {
  let userrole = req.session.user
  productHelpers.getAllCategory().then((category) => {
    productHelpers.getAllProducts().then((products) => {
      res.render('user/list-products', { user: true, products, userrole, category })
    })
  })
})


////////////categories////////////////
router.get('/categories', async (req, res) => {
  let category = await productHelpers.getAllCategory()
  console.log(category);
  // userrole = req.session.user._id
  let products = productHelpers.getAllProducts()
  let hello = true
  res.render('user/categories', { category, products, hello, user: true })
})



router.get('/list_category_products/:id', async (req, res) => {
  let userrole = req.session.user
  let category = await productHelpers.getAllCategory()
  await userHelpers.getProductCategory(req.params.id).then((products) => {
    console.log(req.params.id);
    res.render('user/user-categories', { category,userrole,products,user:true })
  })
})


///////////view Products//////////////
router.get('/view_product/:id',storeCurrentRoute, (req, res) => {
try{
  productHelpers.getOneProduct(req.params.id).then((product) => {
    console.log(product);
    let userrole=req.session.user
    res.render('user/view-product', { product,userrole ,user:true})
  })
}catch (err){
console.log(err);
res.redirect('/error')
}
})




////////////////////Cart/////////////////
router.get('/cart', verifyLogin, async (req, res) => {
try{
  console.log('hello')
  let userrole = req.session.user
  let total = 0
  await userHelpers.getCartProducts(req.session.user._id).then(async(products)=>{
    console.log(products,'prodddd');
   
  if (products != 'No-cart'){

    products.forEach((data) => {
      try {

      data.subTotal = Number(data.quantity) * Number(data.product.price);
      total+=data.subTotal

      } catch (error) {
        
        data.subTotal = Number(data.quantity) * Number(data.product.price);   
        total+=data.subTotal
      }   
    });
   totalAmount = await userHelpers.getTotalAmount(req.session.user._id)

  }else{

    products = false ;
    totalAmount = 0 ;

  }

           

  
  console.log("products:", products);
 
  console.log({ user: true,total, userrole, products, totalAmount });

  res.render('user/cart', { user: true,total, userrole, products, totalAmount })
 }).catch((error)=>{
  console.log(error,"hi");
  res.redirect('/error')});   
}catch (err){
  console.log(err,"hey");
  res.redirect('/error')
  }
})





router.post('/change-product-quantity', (req, res) => {
  let total = 0
  let price = 0
  productHelpers.getOneProduct(req.body.product).then(async(response) => {
    console.log(req.body.product,'req body product');
    price = response.price;

  userHelpers.changeQuantity(req.body).then(async (response) => {
    let products = await userHelper.getCartProducts(req.session.user._id);
if(products != 'No-cart'){

  products.forEach((data) => {
   try {
       data.subTotal = Number(data.quantity) * Number(data.product.price);
    total+=data.subTotal
  
   } catch (error) {
     
     data.subTotal = Number(data.quantity) * Number(data.product.price);    
     total+=data.subTotal
   }  
     
  });

  response.total = await userHelpers.getTotalAmount(req.session.user._id)
  response.total = total
  response.price = price;
}
    res.json(response)
  })
})
})




////////////Add to Cart/////////////
router.get('/add-to-cart/:id', (req, res) => {
 try{
  console.log(req.params.id);
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    console.log("API CALLED");
    res.json({ status: true })
  })
 }catch(err){
    console.log(err);
 }
})



router.get('/delete-from-cart/:proId', (req, res) => {

  let userId = req.session.user._id
  let proId = req.params.proId
  userHelpers.deleteFromCart(userId, proId).then(() => {
    res.redirect('/cart')
  })
})






/////////////////Place Order///////////////////
router.get('/place-order', verifyLogin, async (req, res) => {
try{
  
let userId =req.session.user._id
let totalAmount = await userHelpers.getTotalAmount(userId)
let response = await userHelpers.getCartProducts(userId)
let walletAmount=await userHelper.getWalletAmount(userId)
let wallet=false
if(walletAmount>=totalAmount){
  wallet=true
}
let addresses = false;
await userHelpers.userDetails(req.session.user._id).then((user) => {
  if (user.adresses) {
    addresses = user.adresses;
  }
  if (response == 'No-cart'){
    res.redirect('/')
  }
res.render('user/place-order', { user: true, totalAmount, userrole: req.session.user, addresses ,wallet,walletAmount })
});
}catch(err){
  console.log(err);
  res.redirect('/error')
}
})

                                                                               
router.post('/palce-order', async (req, res) => {
  let products = await userHelpers.getProductList(req.session.user._id)
  
  let totalAmount = await userHelpers.getTotalAmount(req.session.user._id)
  let coupon_code =  req.cookies.coupon
  let coupon = await adminHelpers.verifyCoupon(coupon_code)

    console.log(coupon,"ivde coupon vanno");
    

    if (coupon) {
      let offer = Number(coupon.offer)
      totalAmount= totalAmount-(totalAmount*(offer/100))
     }
        console.log(totalAmount, 'discout price ');
  
  userHelpers.placeOrder(req.body, products, totalAmount, req.session.user._id).then((orderId) => {
    if (req.body['Payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    }
      else if (req.body["Payment-method"] === "paypal") {
        res.json({ codSuccess: true });

      }else if (req.body["Payment-method"] === "wallet") {

        userHelper.updateWallet(req.session.user._id,totalAmount).then(()=>{
          res.json({codSuccess:true})
        })
    } else {
      userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
        res.json(response)
        })
      }

  })
})

        //// Success Page /////
router.get('/checkout-success', (req, res) => {
  res.render('user/checkout-success', { user: true, userrole: req.session.user })
})


//////////////////// Coupon //////////////////
router.post('/apply-coupon', verifyLogin, async (req, res) => {
  try{
    let userrole = req.session.user
  let addresses = false;
  let totalAmount = await userHelpers.getTotalAmount(req.session.user._id)
    
  await userHelpers.userDetails(req.session.user._id).then((user) => {
    if (user.adresses) {
      addresses = user.adresses;
    }
    console.log(req.body, 'bbbbooodyyy');

    adminHelpers.verifyCoupon(req.body.coupon).then((coupon) => {

      console.log(coupon,"ivde coupon vanno");

          console.log(totalAmount,'total amount ithre aahne');
          res.cookie("coupon", req.body.coupon)
      res.render('user/place-order', { user: true, userrole, totalAmount, coupon, addresses })
    })
  })
  }catch(err){
      console.log(err);
  }
})



//////////////////Add Adress///////////////
router.post('/add-address', (req, res) => {
  let userId = req.session.user._id
  userHelpers.addAddress(userId, req.body).then((response) => {
    req.session.updatedUser = response;
    updatedUser = response
    console.log(updatedUser, "addressesssssssssssss");
  })
  res.redirect('/user-profile')
})




 ////////////////Orders////////
router.get('/orders', verifyLogin, async (req, res) => {
 try{
  let orders = await userHelpers.getOrderDetails(req.session.user._id)
  console.log(req.session.user._id);
  res.render('user/orders', { user: true, userrole: req.session.user, orders })
 }catch(err){
  console.log(err);
  res.redirect('/error')
 }
})






router.get('/cancel-order/:id',verifyLogin,async(req,res)=>{ 
  try{
    
 userHelpers.cancelOrder(req.params.id).then(async(response)=>{
  await userHelpers.getOneOrder(req.params.id).then(async(orders)=>{
   await userHelpers.userWallet(orders,req.session.user._id).then((result)=>{
     console.log(result,'resulttt');
 
         res.redirect('/orders')
 
     })
    })
  })
  }catch (err){
      console.log(err);
  }
})







router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  try{
    let products = await userHelpers.getOrderProducts(req.params.id)
  let userrole = req.session.user
  res.render('user/view-order-products', {user:true, userrole, products })
  }catch(err){
    console.log(err);
    res.redirect('/error')
  }
})



router.post('/verify-payment', (req, res) => {
try{
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log(req.body['order[receipt]'], 'reciepttt');
      console.log("payment successfull");
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: 'errror' })
  })
}catch (err){
  console.log(err);
}
})



  ////////////// Profile ////////////
router.get('/user-profile', verifyLogin, async (req, res) => {
try{
  
  let userrole = req.session.user
  let user = await userHelpers.userDetails(req.session.user._id)

  // let wallet =await userHelpers.getWalletAmount(req.session.user._id)
    // console.log(wallet,'wallet');

    res.render('user/user-profile', { user: true, userrole, user })
}catch(err){
    console.log(err);
    res.redirect('/error')
}
})




router.get('/add-new-adress',(req,res)=>{
  try{
    let userrole = req.session.user
  res.render('user/add-adress',{user:true,userrole})
  }catch{
    res.redirect('/error')
  }
})



router.post('/retryPayment',(req,res)=>{
try{
  req.body.totalAmount = parseInt(req.body.totalAmount)
let orderId = req.body.orderId
let totalAmount = req.body.totalAmount

if(req.body.paymentMethod == 'Online-Payment'){
  userHelpers.generateRazorpay(req.body.order,req.body.totalAmount).then((response)=>{
      response.payment = true
      res.json(response)
  })  
}else{
  res.json({orderId,totalAmount})
}
}catch(err){
  console.log(err);
}
})


router.post('/edit-address',(req,res)=>{
  res.redirect('/place-order')
})



module.exports = router;
