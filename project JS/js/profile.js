// 1. Khởi tạo dữ liệu
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let allUsers = JSON.parse(localStorage.getItem("users")) || [];

const DEFAULT_AVATAR =
  "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg";

// 2. Truy vấn các phần tử
const profileImg = document.getElementById("profile-img");
const nameDisplay = document.querySelector(".profile-avatar-section h3");
const firstNameInput = document.querySelectorAll(".info-box input")[0];
const lastNameInput = document.querySelectorAll(".info-box input")[1];
const emailInput = document.querySelectorAll(".info-box input")[2];
const btnEdit = document.querySelector(".btn-edit-profile");
const btnChangePass = document.querySelector(".btn-logout");

let isEditing = false;

// --- HÀM BỔ TRỢ: Cập nhật dữ liệu vào LocalStorage ---
const updateLocalStorage = (updatedUser) => {
  // Cập nhật người dùng hiện tại
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  // Cập nhật vào danh sách tổng (Sử dụng ID để tìm chính xác user trong 100+ người)
  const uIndex = allUsers.findIndex((u) => u.id == updatedUser.id);
  if (uIndex !== -1) {
    allUsers[uIndex] = { ...allUsers[uIndex], ...updatedUser };
    localStorage.setItem("users", JSON.stringify(allUsers));
  }
};

// 3. Hiển thị thông tin ban đầu
const renderProfile = () => {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // SỬA LỖI: Luôn đọc từ trường .imager để đồng bộ với Database
  profileImg.src = currentUser.imager || DEFAULT_AVATAR;
  profileImg.onerror = () => {
    profileImg.src = DEFAULT_AVATAR;
  };

  nameDisplay.textContent = `${currentUser.fistName} ${currentUser.lastName}`;
  firstNameInput.value = currentUser.fistName || "";
  lastNameInput.value = currentUser.lastName || "";
  emailInput.value = currentUser.email || "";

  // Giao diện nút đổi mật khẩu
  if (btnChangePass) {
    btnChangePass.innerHTML = `<i class="fa-solid fa-key"></i> Change Password`;
    btnChangePass.className = "btn-change-password";
    btnChangePass.style.backgroundColor = "#f39c12";
    btnChangePass.style.color = "white";
  }
};

// 4. Logic bật/tắt chế độ chỉnh sửa thông tin
const toggleEditMode = () => {
  isEditing = !isEditing;

  if (isEditing) {
    btnEdit.innerHTML = `<i class="fa-solid fa-check"></i> Save Changes`;
    btnEdit.style.backgroundColor = "#28a745";

    [firstNameInput, lastNameInput, emailInput].forEach((input) => {
      input.removeAttribute("readonly");
      input.classList.add("editing-focus");
    });
    firstNameInput.focus();
  } else {
    saveProfileChanges();
  }
};

// 5. Hàm lưu thay đổi thông tin (Name, Email)
const saveProfileChanges = () => {
  const newFirstName = firstNameInput.value.trim();
  const newLastName = lastNameInput.value.trim();
  const newEmail = emailInput.value.trim();

  if (!newFirstName || !newLastName || !newEmail) {
    Swal.fire("Error", "Fields cannot be empty!", "error");
    isEditing = true;
    return;
  }

  currentUser.fistName = newFirstName;
  currentUser.lastName = newLastName;
  currentUser.email = newEmail;

  updateLocalStorage(currentUser);

  [firstNameInput, lastNameInput, emailInput].forEach((input) => {
    input.setAttribute("readonly", true);
    input.classList.remove("editing-focus");
  });

  btnEdit.innerHTML = `<i class="fa-solid fa-user-gear"></i> Edit Profile`;
  btnEdit.style.backgroundColor = "";
  nameDisplay.textContent = `${newFirstName} ${newLastName}`;

  Swal.fire("Success", "Profile updated successfully!", "success");
};

// 6. Thay đổi Avatar & Đồng bộ dữ liệu
document.querySelector(".upload-badge").onclick = () => {
  Swal.fire({
    title: "Change Avatar URL",
    input: "url",
    inputLabel: "Paste your image link here",
    inputValue:
      currentUser.imager ||
      "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg",
    showCancelButton: true,
    confirmButtonText: "Update",
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      currentUser.imager = result.value;
      updateLocalStorage(currentUser);

      profileImg.src = result.value;
      Swal.fire("Success", "Avatar updated and synced!", "success");
    }
  });
};

// 7. Chức năng Đổi mật khẩu
if (btnChangePass) {
  btnChangePass.onclick = () => {
    Swal.fire({
      title: "Change Password",
      html: `
                <input type="password" id="oldPass" class="swal2-input" placeholder="Current Password">
                <input type="password" id="newPass" class="swal2-input" placeholder="New Password">
                <input type="password" id="confirmPass" class="swal2-input" placeholder="Confirm New Password">
            `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const oldPass = document.getElementById("oldPass").value;
        const newPass = document.getElementById("newPass").value;
        const confirmPass = document.getElementById("confirmPass").value;

        if (!oldPass || !newPass || !confirmPass) {
          Swal.showValidationMessage("Please fill all fields");
          return false;
        }
        if (oldPass !== currentUser.password) {
          Swal.showValidationMessage("Current password is incorrect");
          return false;
        }
        if (newPass.length < 6) {
          Swal.showValidationMessage(
            "New password must be at least 6 characters",
          );
          return false;
        }
        if (newPass !== confirmPass) {
          Swal.showValidationMessage("New passwords do not match");
          return false;
        }
        return newPass;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        currentUser.password = result.value;
        updateLocalStorage(currentUser);
        Swal.fire("Success", "Password updated successfully!", "success");
      }
    });
  };
}

// 8. Gán sự kiện cho nút Edit
if (btnEdit) btnEdit.onclick = toggleEditMode;

// Chạy khởi tạo
renderProfile();
