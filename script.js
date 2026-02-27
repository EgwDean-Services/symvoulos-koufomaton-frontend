// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    const testButton = document.getElementById('test-btn');
    const outputMessage = document.getElementById('output-message');

    testButton.addEventListener('click', () => {
        outputMessage.innerText = '✅ Το JavaScript λειτουργεί άψογα!';
        testButton.style.backgroundColor = '#6c757d'; // Changes button color to grey
        testButton.innerText = 'Επιβεβαιώθηκε';
        testButton.disabled = true;
    });

});