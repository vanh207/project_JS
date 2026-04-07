document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const message = document.getElementById('message');

    if (newPass !== confirmPass) {
        message.textContent = "Mật khẩu xác nhận không khớp!";
        message.style.color = "#dc3545";
        return;
    }

    if (newPass.length < 6) {
        message.textContent = "Mật khẩu mới phải từ 6 ký tự trở lên!";
        return;
    }

    Swal.fire({
        title: "Thành công!",
        text: "Mật khẩu của bạn đã được cập nhật.",
        icon: "success",
        timer: 2000, 
        showConfirmButton: false,
        timerProgressBar: true
    }).then(() => {
        
        window.location.href = "../pages/login.html"; 
    });
});