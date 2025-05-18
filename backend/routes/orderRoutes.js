const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const orderDetailController = require('../controllers/OrderDetailController');

const { verifyToken, isAdmin } = require("../middlewares/auth");


// Routes cho Order
router.get('', verifyToken, isAdmin, orderController.getAllOrders);
router.get('/:id', verifyToken, isAdmin, orderController.getOrderById);
router.get('/customer/:id', verifyToken, orderController.getOrderBycustomerId);
router.post('', verifyToken, orderController.createOrder);
router.put('/:id', verifyToken, isAdmin, orderController.updateOrder);
router.put('/cancel/:id', verifyToken, orderController.cancelOrder);
router.delete('/:id', verifyToken, isAdmin, orderController.deleteOrder);

// // Routes cho OrderDetail
// router.get('/order-details', OrderDetailController.getAllOrderDetails);
router.get('/order-details/:id', verifyToken, orderDetailController.getOrderDetails);
// router.post('/order-details', OrderDetailController.createOrderDetail);
// router.put('/order-details/:id', OrderDetailController.updateOrderDetail);
// router.delete('/order-details/:id', OrderDetailController.deleteOrderDetail);

module.exports = router;