const collections = require('../config/collection');
const { getDatabase } = require('../config/connection');
const db = require('../config/connection');
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt')

var instance = new Razorpay({
  key_id: 'rzp_test_3WdOKPRvG2KUDP',
  key_secret: 'XGL7vG64Eap3kV2pRm7TGmul',
});


module.exports = {

  
  genarateBooking: async (data) => {
    try {
      const result = await db.getDatabase().collection(collections.BOOKINGS).insertOne(data);
      console.log('Bokking Result : ', result);
      if (result) {
        orderDetails = {
          orderId: result.insertedId,
          Amount: data.TotalAmount
        }
        return orderDetails;
      } else {

      }

    } catch (error) {
      throw error;
    }
  },
  genarateRazorpay: (orderDetails) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: orderDetails.Amount * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: orderDetails.orderId
      };
      console.log(options);
      instance.orders.create(options, function (err, order) {
        db.getDatabase().collection(collections.ODERATTEMPTS).insertOne(order);
        resolve(order)
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      let hmac = crypto.createHmac('sha256', 'XGL7vG64Eap3kV2pRm7TGmul');
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {
        resolve();
      }
      else {
        reject();
      }
    });
  },
  changePaymentstatus: (Id) => {
    return new Promise((resolve, reject) => {
      db.getDatabase().collection(collections.BOOKINGS).updateOne({ _id: new ObjectId(Id) },
        {
          $set: {
            status: true,
          },
        }
      ).then(() => {
        db.getDatabase().collection(collections.BOOKINGS).findOne({ _id: new ObjectId(Id) })
          .then((updatedDocument) => {
            console.log(updatedDocument);
            updatedDocument.updated = true;
            resolve(updatedDocument);
          }).catch((err) => {
            updatedDocument.updated = false;
            updatedDocument.Err = err;
            resolve(updatedDocument);
          })
      })
    });
  },
  superAdmin: () => {
    return new Promise(async (resolve, reject) => {
      const superadmin = {
        username: 'super',
        password: 'super@123'
      }
      db.getDatabase().collection(collections.SUPERADMIN).findOne({ username: superadmin.username }).then(async(response) => {
        if (response) {
          resolve();
        } else {
          const salt = await bcrypt.genSalt(10)
          const hashpass = await bcrypt.hash(superadmin.password, salt)
          superadmin.password = hashpass

          console.log(superadmin.password);
          db.getDatabase().collection(collections.SUPERADMIN).insertOne(superadmin).then(() => {
            console.log('Your Accout has been created succefully');
            resolve()

          })
        }
      })


    });
  },
  superLogin: (Data) => {
    return new Promise(async (resolve, reject) => {
      
      db.getDatabase().collection(collections.SUPERADMIN).findOne({ username: Data.username }).then(async(user) => {
        console.log(user);
        if (!user) {
          respo = {
            Status : false,
            Mss : "No User exist"
          }
          resolve(respo);
        } else {
          const matched = await bcrypt.compare(Data.password, user.password);
    
          if (matched) {
            delete user.password;
            respo = {
              user : user,
              Status : true,
              Mss : "User Found"
            }
            resolve(respo);
          } else {
            respo = {
              Status : false,
              Mss : "Password not matched"
            }
            resolve(respo);
          }
        }
      })


    });
  },
  fetchBookings: () => {
    return new Promise(async (resolve, reject) => {
      
      db.getDatabase().collection(collections.BOOKINGS).find({}).toArray().then(async(response) => {
        console.log(response);
        resolve(response)
      })


    });
  },
  addAdmin: (Data) => {
    return new Promise((resolve, reject) => {
     
        db.getDatabase().collection(collections.ADMIN).insertOne(data).then(()=>{
         resolve(Status = true)
        })
      });
  },
}