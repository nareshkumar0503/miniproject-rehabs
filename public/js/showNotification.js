
// ********Notification ********Notification ********Notification ********Notification******* //
function showNotification(message, isSuccess) {
    const notificationDiv = document.getElementById('notification');
    const messageP = document.getElementById('message');

    if (messageP) {
        messageP.textContent = message;
    }

    if (isSuccess) {
        notificationDiv.classList.add('alert-success');
        notificationDiv.classList.remove('alert-error');
    } else {
        notificationDiv.classList.add('alert-error');
        notificationDiv.classList.remove('alert-success');
    }

    notificationDiv.style.display = 'flex';

    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 5000);
}

// Close notification when '×' is clicked
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});
// ********Notification ********Notification ********Notification ********Notification******* //
