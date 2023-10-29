const collections = require('../config/collection');
const { getDatabase } = require('../config/connection');
const db = require('../config/connection');
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');

var instance = new Razorpay({
    key_id: 'rzp_test_3WdOKPRvG2KUDP',
    key_secret: 'XGL7vG64Eap3kV2pRm7TGmul',
  });


module.exports = {
  
  assignedSubjects: async (assigned) => {
    try {
      const db = getDatabase();
      const findOneAssigned = await db.collection(collections.ASSIGNEDSUBJECTS).findOne({ id: assigned.id });

      if (findOneAssigned) {
        // Document with the same ID exists, update the existing document
        const updateResponse = await db.collection(collections.ASSIGNEDSUBJECTS).updateOne(
          { id: assigned.id },
          {
            $push: {
              batch: { batch: assigned.batch },
              subjects: { semester: assigned.semester },
              semester: { subject: assigned.subject },
              Hour: { hour: assigned.hour }
            }
          }
        );

        if (updateResponse.modifiedCount > 0) {
          console.log('Subject assigned successfully');
          return true;
        } else {
          console.log('Failed to update subject');
          return false;
        }
      } else {
        // Document with the same ID doesn't exist, insert a new document
        const insertResponse = await db.collection(collections.ASSIGNEDSUBJECTS).insertOne({
          batch: [{ batch: assigned.batch }],
          subjects: [{ semester: assigned.semester }],
          semester: [{ subject: assigned.subject }],
          Hour: [{ hour: assigned.hout }],
          id: assigned.id
        });

        if (insertResponse) {
          console.log('Subject assigned successfully');
          return true;
        } else {
          console.log('Failed to insert subject');
          return false;
        }
      }

    }
    catch (err) {
      console.log(err);
    }
  },
  genarateBooking: async (data) => {
    try {
        const result = await db.getDatabase().collection(collections.BOOKINGS).insertOne(data);
        console.log('Bokking Result : ',result);
        if (result) {
            orderDetails = {
                orderId : result.insertedId,
                Amount : data.TotalAmount
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
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac = hmac.digest('hex')
        if (hmac == details['payment[razorpay_signature]']) {
            resolve();
        }
        else{
            reject();
        }
    });
},
changePaymentstatus: (Id) => {
    return new Promise((resolve, reject) => {
        db.getDatabase().collection(collections.BOOKINGS).updateOne({_id:new ObjectId(Id)},
        {
            $set: {
                status: true, 
              },
        }
        ).then(()=>{
            db.getDatabase().collection(collections.BOOKINGS).findOne({ _id:new ObjectId(Id) })
            .then((updatedDocument) => {
                console.log(updatedDocument);
                updatedDocument.updated = true;
                resolve(updatedDocument);
            }).catch((err)=>{
                updatedDocument.updated = false;
                updatedDocument.Err = err;
                resolve(updatedDocument);
            })
        })
    });
},
}