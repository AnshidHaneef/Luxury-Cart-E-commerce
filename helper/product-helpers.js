var db = require('../config/connection')
var collection = require('../config/collections');

const { reject, resolve } = require('promise');
const { response } = require('../app');
const objectId = require('mongodb').ObjectId
let moment = require('moment')



module.exports = {

    // fetchDetails: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let details = await db.get().collection(colletiondb.user_collection).find().toArray()
    //         resolve(details)
    //     })
    // },

    addProducts: (products, callback) => {
        console.log(products);

        let Dataproducts = {
            name: products.name,
            category: objectId(products.category),
            descreption: products.descreption,
            price: products.price,
        }

        db.get().collection('products').insertOne(Dataproducts).then((data) => {
            callback(data.insertedId)
        })
    },



    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECCTION).find().toArray()
            resolve(products)
        })
    },



    getOneProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECCTION).findOne({ _id: objectId(id) })
            console.log(products);
            resolve(products)
        })
    },



    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECCTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                resolve(response)
            })

        })
    },

    getOneProduct:(proId)=>{
           return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECCTION).findOne({_id:objectId(proId)}).then((product)=>{
                        resolve(product)
                })
           }) 
    },


    getProductDetails: (productId) => {
        //    return new Promise((resolve,reject)=>{
        //         db.get().collection(collection.PRODUCT_COLLECCTION).findOne({_id:objectId(productId)}).then((product)=>{
        //                 resolve(product)
        //         })
        //    }) 

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.PRODUCT_COLLECCTION).aggregate([
                {
                    $lookup:
                    {
                        from: collection.CATEGORY_COLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
            },
            {
                $unwind: '$category'
            },
           
        ]).toArray()
        resolve(orderItems)
        console.log(orderItems[0].category.categoryName, '()()()()()()()()()()()()()()');
    })



},


    updateProduct: (productId, productDetails) => {
        console.log(productId, productDetails);
        return new Promise((resolve, reject) => {
            // let amount = Number(price)
            let price = Number(productDetails.price)
            db.get().collection(collection.PRODUCT_COLLECCTION).updateOne({ _id: objectId(productId) },
                {

                    $set: {
                        name: productDetails.name,
                        category: objectId(productDetails.category),
                        descreption: productDetails.descreption,
                        price: price
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },


        addCategory: (category) => {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data) => {
                    resolve(data.insertedId)
                })

            })
        },


            getAllCategory: () => {
                return new Promise(async (resolve, reject) => {
                    let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                    resolve(category)
                })
            },


    // findCategory:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //             let category=await db.get().collection(collection.CATEGORY_COLLECTION).aggregate({



    //             }).toArray()
    //             resolve(category)
    //         })
    // },


}