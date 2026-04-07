// 1. Khởi tạo dữ liệu
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
const DEFAULT_AVATAR =
  "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg";

// 2. Truy vấn các phần tử
const profileImg = document.getElementById("profile-img");
const nameDisplay = document.querySelector(".profile-avatar-section h3");
const firstNameInput = document.querySelectorAll(".info-box input")[0];
const lastNameInput = document.querySelectorAll(".info-box input")[1];
const emailInput = document.querySelectorAll(".info-box input")[2];
const btnEdit = document.querySelector(".btn-edit-profile");
const btnExit = document.querySelector(".btn-logout");

let isEditing = false;

// 3. Hiển thị thông tin ban đầu
const renderProfile = () => {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  profileImg.src = currentUser.avatar || DEFAULT_AVATAR;
  profileImg.onerror = () => {
    profileImg.src = DEFAULT_AVATAR;
  };

  nameDisplay.textContent = `${currentUser.fistName} ${currentUser.lastName}`;
  firstNameInput.value = currentUser.fistName || "";
  lastNameInput.value = currentUser.lastName || "";
  emailInput.value = currentUser.email || "";

  // Đổi nút Log Out thành Exit
  btnExit.innerHTML = `<i class="fa-solid fa-door-open"></i> Exit`;
  btnExit.className = "btn-exit";
};

// 4. Logic bật/tắt chế độ chỉnh sửa
const toggleEditMode = () => {
  isEditing = !isEditing;

  if (isEditing) {
    // Chuyển sang chế độ Save
    btnEdit.innerHTML = `<i class="fa-solid fa-check"></i> Save Changes`;
    btnEdit.style.backgroundColor = "#28a745";

    // Mở khóa input
    [firstNameInput, lastNameInput, emailInput].forEach((input) => {
      input.removeAttribute("readonly");
      input.parentElement.classList.add("editing-focus"); // Thêm class để highlight nếu cần
    });
    firstNameInput.focus();
  } else {
    // Thực hiện lưu dữ liệu
    saveProfileChanges();
  }
};

// 5. Hàm lưu thay đổi vào LocalStorage
const saveProfileChanges = () => {
  const newFirstName = firstNameInput.value.trim();
  const newLastName = lastNameInput.value.trim();
  const newEmail = emailInput.value.trim();

  if (!newFirstName || !newLastName || !newEmail) {
    Swal.fire("Error", "Please do not leave fields blank!", "error");
    isEditing = true; // Giữ nguyên chế độ edit để người dùng sửa lại
    return;
  }

  // Cập nhật đối tượng currentUser
  currentUser.fistName = newFirstName;
  currentUser.lastName = newLastName;
  currentUser.email = newEmail;

  // Lưu lại vào LocalStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Đồng bộ với danh sách users tổng (nếu có)
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const uIndex = allUsers.findIndex((u) => u.id === currentUser.id);
  if (uIndex !== -1) {
    allUsers[uIndex] = { ...allUsers[uIndex], ...currentUser };
    localStorage.setItem("users", JSON.stringify(allUsers));
  }

  // Khóa lại các input
  [firstNameInput, lastNameInput, emailInput].forEach((input) =>
    input.setAttribute("readonly", true),
  );

  // Reset nút bấm
  btnEdit.innerHTML = `<i class="fa-solid fa-user-gear"></i> Edit Profile`;
  btnEdit.style.backgroundColor = "";

  nameDisplay.textContent = `${newFirstName} ${newLastName}`;
  Swal.fire("Success", "Profile updated successfully!", "success");
};

// 6. Sửa ảnh qua Link (nhấn vào icon camera)
document.querySelector(".upload-badge").onclick = () => {
  Swal.fire({
    title: "Change Avatar Link",
    input: "url",
    inputLabel: "Your Image URL",
    showCancelButton: true,
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      currentUser.avatar = result.value;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      profileImg.src = result.value;
      Swal.fire("Updated!", "Avatar changed.", "success");
    }
  });
};

// 7. Gán sự kiện cho các nút
btnEdit.onclick = toggleEditMode;

btnExit.onclick = () => {
  if (isEditing) {
    // Nếu đang sửa mà bấm Exit thì hỏi xác nhận
    Swal.fire({
      title: "Discard changes?",
      text: "Your edits haven't been saved yet.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Exit anyway",
    }).then((res) => {
      if (res.isConfirmed) window.location.href = "../index.html";
    });
  } else {
    window.location.href = "../index.html";
  }
};

// Chạy khởi tạo
renderProfile();
