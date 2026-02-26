// Add this to your home.html script section to handle payment return
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    
    if (paymentStatus === 'success') {
        alert('Payment successful! Your order has been confirmed.');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'pending') {
        alert('Order placed! Please pay at the counter.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});
