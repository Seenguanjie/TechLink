
function ensureSession() {
    if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', 'session_' + Math.random().toString(36).substr(2, 9));
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function loadProfileToForm() {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    $('#fullName').val(profile.fullName || '');
    $('#email').val(profile.email || '');
    $('#phone').val(profile.phone || '');
}

function saveProfileFromForm() {
    const profile = {
        fullName: $('#fullName').val(),
        email: $('#email').val(),
        phone: $('#phone').val()
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
}

function updateAvatarInfo() {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile.fullName) {
        $('#avatarUserName').text(profile.fullName);
    }
    if (profile.email) {
        $('#avatarUserTitle').text(profile.email);
    }
    

    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        $('#userAvatar').attr('src', savedAvatar);
    }
}

$(function(){
    ensureSession();
    loadProfileToForm();
    updateAvatarInfo();
    
    $('#saveProfile').on('click', function(){
        if(document.getElementById('profileForm').checkValidity()){
            saveProfileFromForm();
            loadProfileToForm();
            updateAvatarInfo();
            alert('Profile saved to localStorage.');
        }else{
            document.getElementById('profileForm').reportValidity();
        }
    });
    
    $('#clearProfile').on('click', function(){ 
        localStorage.removeItem('userProfile'); 
        loadProfileToForm(); 
        updateAvatarInfo();
    });
    
    $('#sessionInfo').text(JSON.stringify({ 
        sessionId: sessionStorage.getItem('sessionId'), 
        lastVisit: getCookie('lastVisit') 
    }, null, 2));
    
    $('#avatarUploadButton').on('click', function() {
        $('#avatarUpload').click();
    });
    
    $('#avatarUpload').on('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#userAvatar').attr('src', e.target.result);
               
                localStorage.setItem('userAvatar', e.target.result);
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
});