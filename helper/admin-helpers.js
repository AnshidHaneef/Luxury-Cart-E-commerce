var db = require('../config/connection')
var collection = require('../config/collections')

const { response } = require('express')
const { reject, resolve } = require('promise')
const collections = require('../config/collections')
const objectId = require('mongodb').ObjectId


module.exports = {

    setStatus:(details)=>{
        console.log(details.orderId,"orderId of status");
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(details.orderId)},
                {
                    $set:{status:details.status}
                }).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                reject()
            } 
        })
    },
    
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let orders=await db.get().collection(collections.ORDER_COLLECTION).find().sort({"deliveryDetais.date":-1}).toArray()
            resolve(orders) 
            } catch (error) {
                reject(error)
            }           
        })
    },

    getMostStatus:()=>{
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db
              .get()
              .collection(collections.ORDER_COLLECTION)
              .aggregate([
                {
                  $unwind: "$products",
                },              
                {
                  $project: {
                    item: "$products.item",
                  },
                },
                {
                  $lookup: {
                    from: collections.PRODUCT_COLLECCTION,
                    localField: "item",
                    foreignField: "_id",
                    as: "products",
                  },
                }, 
               
                {
                  $project: {
                    product:"$item",
                    total: { $sum: 1 },
                  },
                },
                {
                    $group:{
                        _id:"$product",
                        count:{$sum:1}
                    }
                }
                
               
              ])
              .toArray();
            resolve(data);
            } catch (error) {
                reject()
            }
            
          });
   },

   addCoupon:(data)=>{

      return new Promise (async(resolve,reject)=>{

        let coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({
          couponName: { $regex: new RegExp(`^${data.couponName}$`, "i") },
        });
      let response = {};
      if (coupon) {
        response.state = false;
        resolve(response);
     } else {
         db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then((response)=>{
          response.state = true;
          resolve(response)          
        })
      }
      })
   },




   findCoupon:()=>{
    return new Promise (async(resolve,reject)=>{
       let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        resolve(coupon)
        })
   },

   
  //  findOneCoupon:()=>{
  //   return new Promise (async(resolve,reject)=>{
  //      let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne().toArray()
  //       resolve(coupon)
  //       })
  //  },


   deleteCoupon:(proId)=>{
        return new Promise ((resolve,reject)=>{
          db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
              resolve(response)
          })
        })
   },


   verifyCoupon:(coupon)=>{
    console.log(coupon)
      return new Promise (async(resolve,reject)=>{
        await db.get().collection(collection.COUPON_COLLECTION).findOne({couponName:coupon}).then((res)=>{
          resolve(res)
        })
      })
   }
   
    
}