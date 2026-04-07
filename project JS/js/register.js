const fistName = document.querySelector("#fist-name");
const lastName = document.querySelector("#last-name");
const email = document.querySelector("#email");
const password = document.querySelector("#password-input");
const confirmPassword = document.querySelector("#confirmPassword");
const btnAction = document.querySelector(".btn-action");

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
btnAction.addEventListener("click", (event) => {
  event.preventDefault();
  const fistNameInput = fistName.value.trim();
  const lastNameInput = lastName.value.trim();
  const emailInput = email.value.trim();
  const passwordInput = password.value.trim();
  const confirmPasswordInput = confirmPassword.value.trim();

  // 1. Kiểm tra trống
  if (
    !fistNameInput ||
    !lastNameInput ||
    !emailInput ||
    !passwordInput ||
    !confirmPasswordInput
  ) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Cannot be left blank",
    });
    return;
  }

  // 2. Kiểm tra định dạng Email
  if (!validateEmail(emailInput)) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Email format error",
    });
    return;
  }

  // 3. Kiểm tra độ dài mật khẩu (Ví dụ tối thiểu 6 ký tự)
  if (passwordInput.length < 6) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Password must be at least 6 characters",
    });
    return;
  }

  // 4. Kiểm tra mật khẩu khớp nhau
  if (passwordInput !== confirmPasswordInput) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Passwords do not match!",
    });
    return;
  }
  const listUsers = JSON.parse(localStorage.getItem("users")) || [];
  const newUser = {
    id: Date.now(),
    fistName: fistNameInput,
    lastName: lastNameInput,
    email: emailInput,
    password: passwordInput,
    role: "user",
  };
  listUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(listUsers));
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Register successfully",
    showConfirmButton: false,
    timer: 1500,
  }).then(() => {
    // Xóa form
    fistName.value = "";
    lastName.value = "";
    email.value = "";
    password.value = "";
    confirmPassword.value = "";

    // Chuyển trang sau khi Swal biến mất
    window.location.href = "./login.html";
  });
});
const checkLogin = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Hoặc key bạn dùng để lưu user đã login

  if (currentUser) {
    // Nếu đã login rồi thì không cho ở lại trang này
    window.location.href = "../index.html"; // Chuyển hướng về trang chủ
  }
};

checkLogin();
