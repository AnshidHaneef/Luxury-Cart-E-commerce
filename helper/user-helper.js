var db = require('../config/connection')
var collection = require('../config/collections')

const bcrypt = require('bcrypt')
const { response } = require('express')
const { reject, resolve } = require('promise')
const collections = require('../config/collections')
const objectId = require('mongodb').ObjectId
let moment = require('moment')
const Razorpay = require('razorpay');


var instance = new Razorpay({
    key_id: 'rzp_test_EIM2cWPYiC5rpC',
    key_secret: 'XoUOBC7tudCpfsuS6W70ymNW',
});

const crypto = require('crypto');
let hmac = crypto.createHmac('sha256', 'XoUOBC7tudCpfsuS6W70ymNW')

module.exports = {

    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            userData.con_password = await bcrypt.hash(userData.con_password, 10)
            db.get().collection(collection.USER_COLLECCTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)

            })
        })
    },


    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECCTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('Login Success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('Login Failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('Login Failed');
                resolve({ status: false })

            }
        })
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECCTION).find().toArray()
            console.log(user);
            resolve(user)
        })
    },


    userDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collections.USER_COLLECCTION).findOne({ _id: objectId(userId) })
                resolve(user)
            } catch (error) {
                reject()
            }
        })
    },

    blockUser: (userId, status) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECCTION).updateOne({ _id: objectId(userId) }, {
                $set:
                {
                    blockStatus: status
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    
    addToCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            let productObj = {
                item: objectId(productId),
                quantity: 1
            }
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                console.log(userCart);
                let proExists = userCart.prodcts.findIndex(
                    (product) => product.item == productId
                );
                console.log(proExists);
                if (proExists != -1) {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne({
                            user: objectId(userId),
                            "prodcts.item": objectId(productId)
                        }, {
                            $inc: { "prodcts.$.quantity": 1 },
                        })
                        .then(() => {
                            resolve();
                        })
                }
                else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { prodcts: productObj }
                        }).then((response) => {
                            resolve()
                        })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    prodcts: [productObj],
                    couponDiscount:0
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },



    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$prodcts'
                },
                {
                    $project: {
                        item: '$prodcts.item',
                        quantity: '$prodcts.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECCTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ["$product", 0] }
                    }
                }
            ]).toArray()
            // console.log(cartItems[0].prodcts)
           
           if(!cartItems || cartItems == null || cartItems == ''){
            console.log('cart issss emptyyy');
            resolve('No-cart')
           }
           
            resolve(cartItems)


        })
    },
    
    deleteFromCart: (userId, productId) => {
        console.log(productId);
        console.log("userIdddd", userId);
        return new Promise((resolve, reject) => {
            console.log('haaaai deletee 2');
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ user: objectId(userId) },
                    {
                        $pull: { prodcts: { item: objectId(productId) } }
                    }).then((data) => {
                        console.log('daataaaaaaaaa', data);
                        resolve(data)
                    })
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart?.prodcts?.length || 0
            }
            resolve(count)
        })
    },


    changeQuantity: (details) => {
        details.count = Number(details.count)
        details.quantity = Number(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },

                        {
                            $pull: { prodcts: { item: objectId(details.product) } }

                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'prodcts.item': objectId(details.product) },
                        {
                            $inc: { "prodcts.$.quantity": details.count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$prodcts'
                },
                {
                    $project: {
                        item: '$prodcts.item',
                        quantity: '$prodcts.quantity',
                        couponDiscount: 1
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECCTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        couponDiscount: 1
                    }
                },
                {
                    $group:
                    {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } },
                        couponDiscount: { $first: "$couponDiscount" },
                    }
                },
                {
                    $set: { total: { $subtract: ['$total', '$couponDiscount'] } }
                }
            ]).toArray()
            console.log(total)
            // resolve(total[0])

            let totalAmount = total[0]?.total || 0
                resolve(totalAmount)

        })
    },





    getProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            // console.log("caaaaaaarttttt",cart);
            resolve(cart.prodcts)

        })

    },
    placeOrder: (order, products, total, userId) => {
        console.log({ order, products, total });
        return new Promise(async (resolve, reject) => {
            let status = order['Payment-method'] === 'COD' ||  order['Payment-method'] === 'paypal' ||  order['Payment-method'] === 'wallet' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    address: order.address,
                    date:new Date(), 
                    // date: moment().format("dddd, MMMM Do YYYY")

                },
                userId: objectId(userId),
                paymentMethod: order['Payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                // date2:tempDate,
                date: moment().format("dddd, MMMM Do YYYY")
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                console.log(response, ':response');
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
                resolve(response.insertedId)
            })
        })
    },

    getOrderDetails: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            resolve(orders)
        })
    },


    getOneOrder:(orderId)=>{
            return new Promise (async(resolve, reject)=>{
            let order =    await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})  
                console.log(order,'one orderr');
                resolve(order.totalAmount)
            })
    },





    addAddress: (userId, userDetails) => {
        return new Promise((resolve, reject) => {
            let adressObj = {
                address: userDetails.address,
                area: userDetails.area,
                city: userDetails.city,
                pin: userDetails.pin,
                state: userDetails.state,
                country: userDetails.country
            }
            db.get().collection(collection.USER_COLLECCTION).updateOne({
                _id: objectId(userId)
            },
                {
                    $push: {
                        adresses: adressObj
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },

    getOrderProducts: (orderId) => {
        console.log(orderId, "orderId  xx");
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:
                    {
                        from: collection.PRODUCT_COLLECCTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ["$product", 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems)
        })
    },

    getProductCategory: (id) => {
        return new Promise((resolve, reject) => {
            console.log(id)
            db.get().collection(collection.PRODUCT_COLLECCTION).find({ category: objectId (id) }).toArray().then((product) => {

                console.log(product, 'prooooooo');
                resolve(product)

            })
        })
    },
    
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: total * 100,            // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId,
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(order);
                    }
                });
            } catch (error) {
                reject()
            }
        });
    },


    verifyPayment: (details) => {

        return new Promise((resolve, reject) => {
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },



    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    cancelOrder:(orderId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId(orderId)},{
                $set:{
                    status:'cancelled'
                }
            }).then(()=>{
                resolve()
            })
            
        })
    },


    getWalletAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECCTION).findOne({ _id: objectId(userId) })
            resolve(user.wallet)
        })
    },




    userWallet: (amount,userId) => {

        console.log(userId,'user id hello');

        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECCTION).findOne({_id:objectId(userId)})
                console.log(user,'userrrrrr');
                

                
if(user.wallet){
            let wallet = user.wallet
        // walletAmount=parseInt(user.wallet)
        db.get().collection(collection.USER_COLLECCTION).updateOne({ _id:objectId(userId) }, {
            $set: {
                wallet: parseInt(wallet)+amount
            }
        }).then(() => {
            resolve()

        })
   
    }else{

    db.get().collection(collection.USER_COLLECCTION ).updateOne({ _id:objectId(userId) }, {
    $set: {
        wallet: parseInt(100)
    }
}).then(() => {
    resolve()

    })
  }
})

    },

    updateWallet:(userId,total)=>{
        return new Promise(async(resolve, reject) => {
            let user=await db.get().collection(collection.USER_COLLECCTION).findOne({_id:objectId(userId)})

            let wallet=parseInt(user.wallet)

            db.get().collection(collection.USER_COLLECCTION).updateOne({_id:objectId(userId)},{
                $set:{
                    wallet:wallet-parseInt(total)
                }
            }).then(()=>{
                resolve()
            })
        })
    },
 

}   
