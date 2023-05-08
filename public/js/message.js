const message = document.getElementById('message');
const urlParams = new URLSearchParams(window.location.search);
message.textContent = urlParams.get('message');