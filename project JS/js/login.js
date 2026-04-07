let listUsers = JSON.parse(localStorage.getItem("users")) || [];
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const btnAction = document.querySelector(".btn-action");

if (!Array.isArray(listUsers) || listUsers.length === 0) {
  listUsers = [
    {
      id: 1,
      fistName: "System",
      lastName: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin",
    },
    {
      id: 2,
      fistName: "Minh",
      lastName: "Thu",
      email: "user@gmail.com",
      password: "123456",
      role: "user",
    },
  ];
  localStorage.setItem("users", JSON.stringify(listUsers));
}
btnAction.addEventListener("click", (event) => {
  event.preventDefault();
  const emailInput = email.value.trim();
  const passwordInput = password.value.trim();
  if (!emailInput || !passwordInput) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Cannot be left blank",
    });
    return;
  }
  const userCheck = listUsers.find(
    (user) => user.email === emailInput && user.password === passwordInput,
  );
  if (userCheck) {
    // Lưu thông tin người dùng hiện tại vào LocalStorage để các trang khác biết ai đang đăng nhập
    localStorage.setItem("currentUser", JSON.stringify(userCheck));
    Swal.fire({
      icon: "success",
      title: "Login Successful",
      text: `Welcome back, ${userCheck.fistName}!`,
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      // 3. Kiểm tra Role để điều hướng (Redirect)
      if (userCheck.role === "admin") {
        // Nếu là Admin -> vào trang quản trị
        window.location.href = "../page/users_manage.html";
      } else {
        // Nếu là User -> vào trang chủ
        window.location.href = "../index.html";
      }
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: "Invalid email or password!",
    });
  }
});
const checkLogin = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Hoặc key bạn dùng để lưu user đã login

  if (currentUser) {
    // Nếu đã login rồi thì không cho ở lại trang này
    window.location.href = "../index.html"; // Chuyển hướng về trang chủ
  }
};

checkLogin();
