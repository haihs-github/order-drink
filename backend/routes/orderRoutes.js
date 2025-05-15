const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const orderDetailController = require('../controllers/OrderDetailController');

// Routes cho Order
router.get('', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

// // Routes cho OrderDetail
// router.get('/order-details', OrderDetailController.getAllOrderDetails);
// router.get('/order-details/:id', OrderDetailController.getOrderDetailById);
// router.post('/order-details', OrderDetailController.createOrderDetail);
// router.put('/order-details/:id', OrderDetailController.updateOrderDetail);
// router.delete('/order-details/:id', OrderDetailController.deleteOrderDetail);

module.exports = router;