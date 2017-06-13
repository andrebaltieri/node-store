'use strict';
const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');

exports.get = async() => {
    const res = await Customer.find({});
    return res;
}

exports.getByDocument = async(document) => {
    const res = await Customer.findOne({
        document: document
    });
    return res;
}

exports.countDocuments = async(document) => {
    const res = await Customer.count({
        document: document
    });
    return res;
}

exports.countEmails = async(email) => {
    const res = await Customer.count({
        email: email
    });
    return res;
}

exports.create = async(body) => {
    var customer = new Customer(body);
    const res = await customer.save();
    return res;
}

exports.update = async(customer) => {
    const res = await customer.save();
    return res;
}