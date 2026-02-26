/*!
 * ============================================================================
 * Easy PayIO Payment Gateway Integration Script (Official)
 * ============================================================================
 * 
 * @package      Easy PayIO Gateway SDK
 * @version      1.0.0
 * @license      MIT License
 * @website      https://easypayio.com
 * @repository   https://github.com/easypayio/gateway-sdk
 * @support      support@easypayio.com
 * 
 * Generated for: jerinkbibin2006@gmail.com
 * Generated on: 2/20/2026, 2:10:23 PM
 * API Key ID: ep_4ya7hmnawmlu...
 * ============================================================================
 */

(function(window, document) {
    "use strict";
    
    /* ========================================================================
     * CONFIGURATION
     * ======================================================================== */
    
    const CONFIG = {
        apiKey: 'ep_4ya7hmnawmlumyxjn',
        gatewayUrl: 'https://easy-pay-gateway.web.app',
        qrPageUrl: '/qr-page.html', // Local QR page
        version: '1.0.0',
        environment: 'production',
        merchantEmail: 'jerinkbibin2006@gmail.com',
        merchantName: 'Arabian Nights'
    };
    
    /* ========================================================================
     * PAYMENT GATEWAY SDK
     * ======================================================================== */
    
    const EasyPayIOGateway = {
        version: CONFIG.version,
        apiKey: CONFIG.apiKey,
        
        /**
         * Initialize UPI payment - redirects to QR page
         */
        initiateUPIPayment: function(orderData) {
            console.log('[EasyPayIO] Initiating UPI payment for order:', orderData);
            
            // Validate order data
            if (!orderData || !orderData.orderId) {
                console.error('[EasyPayIO] Invalid order data');
                return false;
            }
            
            try {
                // Store order data in sessionStorage for the QR page
                sessionStorage.setItem('easypayio_current_order', JSON.stringify({
                    orderId: orderData.orderId,
                    amount: orderData.amount,
                    customerName: orderData.customerName,
                    tableNumber: orderData.tableNumber,
                    items: orderData.items,
                    orderNumber: orderData.orderNumber,
                    timestamp: new Date().toISOString()
                }));
                
                // Also store in localStorage as backup
                localStorage.setItem('easypayio_pending_order', JSON.stringify({
                    orderId: orderData.orderId,
                    timestamp: Date.now()
                }));
                
                console.log('[EasyPayIO] Order data stored, redirecting to QR page');
                
                // Redirect to QR page with order ID
                window.location.href = CONFIG.qrPageUrl + '?order=' + encodeURIComponent(orderData.orderId) + '&t=' + Date.now();
                
                return true;
            } catch (error) {
                console.error('[EasyPayIO] Error storing order data:', error);
                return false;
            }
        },
        
        /**
         * Handle cash payment - stay on page
         */
        processCashPayment: function(orderData) {
            console.log('[EasyPayIO] Processing cash payment for order:', orderData);
            // Just return success for cash payments
            return {
                success: true,
                message: 'Cash payment recorded',
                orderId: orderData.orderId
            };
        },
        
        /**
         * Get stored order data (for QR page to retrieve)
         */
        getStoredOrder: function(orderId) {
            try {
                const stored = sessionStorage.getItem('easypayio_current_order');
                if (stored) {
                    const orderData = JSON.parse(stored);
                    if (!orderId || orderData.orderId === orderId) {
                        return orderData;
                    }
                }
                return null;
            } catch (error) {
                console.error('[EasyPayIO] Error retrieving order:', error);
                return null;
            }
        },
        
        /**
         * Clear stored order data
         */
        clearStoredOrder: function() {
            sessionStorage.removeItem('easypayio_current_order');
            localStorage.removeItem('easypayio_pending_order');
        },
        
        /**
         * Handle payment success callback
         */
        onPaymentSuccess: function(orderId, callback) {
            // Store callback
            if (!window._easypayio_callbacks) {
                window._easypayio_callbacks = {};
            }
            window._easypayio_callbacks[orderId] = callback;
        },
        
        /**
         * Trigger payment success
         */
        triggerPaymentSuccess: function(orderId, paymentData) {
            if (window._easypayio_callbacks && window._easypayio_callbacks[orderId]) {
                window._easypayio_callbacks[orderId](paymentData);
                delete window._easypayio_callbacks[orderId];
            }
            
            // Dispatch event
            const event = new CustomEvent('easypayio:payment:success', {
                detail: { orderId: orderId, ...paymentData }
            });
            window.dispatchEvent(event);
        }
    };
    
    /* ========================================================================
     * AUTO-INITIALIZATION FOR PAYMENT BUTTONS
     * ======================================================================== */
    
    function initializePaymentButtons() {
        const buttons = document.querySelectorAll('.easypayio-pay-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const amount = parseFloat(button.dataset.amount) || 0;
                const orderId = button.dataset.orderId || 'order_' + Date.now();
                const customerName = button.dataset.customer || 'Guest';
                const tableNumber = button.dataset.table || 'Takeaway';
                
                if (amount <= 0) {
                    alert('Invalid amount');
                    return;
                }
                
                // Create order data
                const orderData = {
                    orderId: orderId,
                    amount: amount,
                    customerName: customerName,
                    tableNumber: tableNumber,
                    orderNumber: button.dataset.orderNumber || Math.floor(1000 + Math.random() * 9000),
                    items: JSON.parse(button.dataset.items || '[]')
                };
                
                // Redirect to QR page
                EasyPayIOGateway.initiateUPIPayment(orderData);
            });
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePaymentButtons);
    } else {
        initializePaymentButtons();
    }
    
    /* ========================================================================
     * EXPOSE SDK
     * ======================================================================== */
    
    window.EasyPayIO = EasyPayIOGateway;
    
    console.log('[EasyPayIO] Gateway SDK v' + EasyPayIOGateway.version + ' loaded');
    console.log('[EasyPayIO] Merchant: ' + CONFIG.merchantEmail);
    
})(window, document);
