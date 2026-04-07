const listUser = JSON.parse(localStorage.getItem("users")) || [];
const searchBox = document.querySelector(".search-box");
const tbody = document.querySelector("#tbody");
const userCount = document.querySelector(".user-count");
const btnPrev = document.querySelector("#previous");
const btnNext = document.querySelector("#next");
const logout = document.querySelector(".logout");

let currentPage = 1;
const rowsPerPage = 5;
// Đây là biến quan trọng nhất để giữ trạng thái danh sách sau khi lọc/sắp xếp
let filteredList = listUser.filter((user) => {
  return user.role === "user";
});

const renderUser = () => {
  if (!tbody) {
    return;
  }

  // 1. Tính toán phân trang
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;

  // Đảm bảo trang hiện tại không vượt quá tổng số trang sau khi lọc
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const dataPerPage = filteredList.slice(start, end);

  // 2. Tạo HTML
  let html = "";
  dataPerPage.forEach((user) => {
    html += `
      <tr>
          <td>
              <div class="user-info">
                  <img src=${user.imager || "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg"} class="avatar" alt="Avatar" />
                  <div>
                      <div class="name">${user.fistName || ""} ${user.lastName || ""}</div>
                      <div class="username">@${user.fistName || ""}</div>
                  </div>
              </div>
          </td>
          <td><span class="status">hoạt động</span></td>
          <td><a href="#" class="email">${user.email}</a></td>
          <td class="actions">
              <button class="btn btn-block" onclick="handelBlock('${user.email}')">block</button>
              <button class="btn btn-unblock" onclick="handelUnBlock('${user.email}')">unblock</button>
          </td>
      </tr>`;
  });

  tbody.innerHTML = html;

  // 3. Cập nhật giao diện
  if (userCount) {
    userCount.textContent = `${filteredList.length} users`;
  }
  updatePaginationUI(totalPages);
};

const updatePaginationUI = (totalPages) => {
  const pageInfo = document.querySelector(".pagination p");
  if (pageInfo) {
    pageInfo.innerHTML = `Page <strong>${currentPage}</strong> / ${totalPages}`;
  }

  if (btnPrev) {
    btnPrev.disabled = currentPage === 1;
  }
  if (btnNext) {
    btnNext.disabled = currentPage === totalPages;
  }
};

// Hàm Tìm kiếm
const searchUser = () => {
  const value = searchBox.value.toLowerCase().trim();

  // Luôn lọc từ mảng gốc listUser và đảm bảo chỉ lấy role 'user'
  filteredList = listUser.filter((user) => {
    const fullName = `${user.fistName} ${user.lastName}`.toLowerCase();
    return user.role === "user" && fullName.includes(value);
  });

  currentPage = 1; // Reset về trang 1 khi tìm kiếm
  renderUser();
};

// Sự kiện nút Bấm
btnNext?.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderUser();
  }
});

btnPrev?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderUser();
  }
});

// Khởi tạo lần đầu
searchBox?.addEventListener("input", searchUser);
renderUser();

logout.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to log out?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Log Out Success",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "../index.html";
      });
  });
});

searchBox.addEventListener("input", searchUser);
renderUser();
