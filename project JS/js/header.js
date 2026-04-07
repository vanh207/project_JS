document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.querySelector('.logout-item a');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault(); 

            Swal.fire({
                title: 'Bạn muốn đăng xuất?',
                text: "Bạn sẽ thoát khỏi trang và về trang chủ!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#28a745', 
                cancelButtonColor: '#d33',    
                confirmButtonText: 'Đồng ý, thoát!',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('currentUser');
                    Swal.fire({
                        title: 'Đã đăng xuất!',
                        text: 'Đang quay về trang chủ...',
                        icon: 'success',
                        timer: 1500, 
                        showConfirmButton: false
                    });
                    setTimeout(() => {
                        window.location.href = "../pages/login.html"; 
                    }, 1500);
                }
            });
        });
    }
});