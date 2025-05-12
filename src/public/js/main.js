function readURL(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            document.getElementById(previewId).style.backgroundImage = `url('${e.target.result}')`;
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const coverImageInput = document.getElementById('coverImage');
    if (coverImageInput) {
        coverImageInput.addEventListener('change', function() {
            readURL(this, 'coverImagePreview');
        });
    }
    
    const thumbnailInput = document.getElementById('thumbnail');
    if (thumbnailInput) {
        thumbnailInput.addEventListener('change', function() {
            readURL(this, 'thumbnailPreview');
        });
    }
    
    const deleteButtons = document.querySelectorAll('.btn-delete');
    if (deleteButtons) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                    e.preventDefault();
                }
            });
        });
    }
    
    const togglePassword = document.querySelector('#togglePassword');
    if (togglePassword) {
        const password = document.querySelector('#password');
        
        togglePassword.addEventListener('click', function (e) {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    const blogCards = document.querySelectorAll('.blog-hover-card');
    if (blogCards.length > 0) {
        blogCards.forEach(card => {
            const coverImage = card.querySelector('.cover-image');
            const thumbnail = card.querySelector('.thumbnail-image');
            if (coverImage && thumbnail) {
                const coverSrc = coverImage.getAttribute('src');
                const thumbSrc = thumbnail.getAttribute('src');
                
                card.addEventListener('mouseenter', function() {
                    coverImage.setAttribute('src', thumbSrc);
                });
                
                card.addEventListener('mouseleave', function() {
                    coverImage.setAttribute('src', coverSrc);
                });
            }
        });
    }
}); 