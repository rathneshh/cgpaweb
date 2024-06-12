// respond.js

function confirmDelete(replyId) {
    if (confirm('Are you sure you want to delete this reply?')) {
        fetch(`/delete_reply/${replyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply_id: replyId })
        })
        .then(response => {
            if (response.ok) {
                // Reload the page or update the UI as needed
                window.location.reload();
            } else {
                // Handle error responses
                console.error('Failed to delete reply:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting reply:', error);
        });
    }
}

function editReply(replyId) {
    const replyElement = document.getElementById('reply-' + replyId);
    const currentContent = replyElement.querySelector('.reply-content').innerText;
    const currentImage = replyElement.querySelector('.reply-image img');
    const imagePath = currentImage ? currentImage.src : '';

    const editForm = `
        <form action="/modify_reply/${replyId}" method="POST" enctype="multipart/form-data">
            <textarea name="new_content" required>${currentContent}</textarea>
            <input type="file" name="image">
            <button type="submit">Save</button>
        </form>
    `;
    replyElement.innerHTML = editForm;

    if (imagePath) {
        const imageInput = replyElement.querySelector('input[type="file"]');
        imageInput.insertAdjacentHTML('beforebegin', `<img src="${imagePath}" alt="Reply Image" style="max-width: 200px; display: block; margin-top: 10px;">`);
    }
}
