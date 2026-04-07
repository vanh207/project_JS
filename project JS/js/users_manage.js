// --- 1. KHỞI TẠO DỮ LIỆU ---
const listUser = JSON.parse(localStorage.getItem("users")) || [];
const searchBox = document.querySelector(".search-box");
const tbody = document.querySelector("#tbody");
const userCount = document.querySelector(".user-count");
const btnPrev = document.querySelector("#previous");
const btnNext = document.querySelector("#next");
const logout = document.querySelector(".logout");
const btnSort = document.querySelector(".btnSort");

let currentPage = 1;
const rowsPerPage = 5;
let isAscending = true; // Biến trạng thái sắp xếp

// Lọc danh sách ban đầu (chỉ lấy role user)
let filteredList = listUser.filter((user) => user.role === "user");

// --- 2. HÀM RENDER CHÍNH ---
const renderUser = () => {
  if (!tbody) return;

  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;
  const dataPerPage = filteredList.slice(start, start + rowsPerPage);

  let html = dataPerPage
    .map(
      (user) => `
    <tr>
        <td>
            <div class="user-info">
                <img src="${user.imager || "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-12.jpg"}" class="avatar" />
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
    </tr>`,
    )
    .join("");

  tbody.innerHTML = html;

  if (userCount) userCount.textContent = `${filteredList.length} users`;
  updatePaginationUI(totalPages);
};

// --- 3. LOGIC SẮP XẾP (TOGGLE SORT) ---
const handleToggleSort = () => {
  filteredList.sort((a, b) => {
    const nameA = `${a.fistName || ""} ${a.lastName || ""}`.toLowerCase();
    const nameB = `${b.fistName || ""} ${b.lastName || ""}`.toLowerCase();

    // Sử dụng localeCompare để chuẩn tiếng Việt
    return isAscending
      ? nameA.localeCompare(nameB, "vi")
      : nameB.localeCompare(nameA, "vi");
  });

  // Đổi nhãn nút để user biết trạng thái tiếp theo
  if (btnSort) {
    btnSort.innerHTML = isAscending ? `A↑Z` : `A↓Z`;
  }

  isAscending = !isAscending; // Đảo trạng thái
  currentPage = 1;
  renderUser();
};

// --- 4. HÀM TÌM KIẾM ---
const searchUser = () => {
  const value = searchBox.value.toLowerCase().trim();

  filteredList = listUser.filter((user) => {
    const fullName =
      `${user.fistName || ""} ${user.lastName || ""}`.toLowerCase();
    return user.role === "user" && fullName.includes(value);
  });

  // Giữ nguyên trạng thái sắp xếp hiện tại sau khi search
  const currentSort = !isAscending; // Lấy trạng thái vừa thực hiện
  isAscending = currentSort;
  handleToggleSort();
};

// --- 5. PHÂN TRANG & UI ---
const updatePaginationUI = (totalPages) => {
  const pageInfo = document.querySelector(".pagination p");
  if (pageInfo)
    pageInfo.innerHTML = `Page <strong>${currentPage}</strong> / ${totalPages}`;
  if (btnPrev) btnPrev.disabled = currentPage === 1;
  if (btnNext) btnNext.disabled = currentPage === totalPages;
};

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

// --- 6. SỰ KIỆN KHÁC ---
searchBox?.addEventListener("input", searchUser);
btnSort?.addEventListener("click", handleToggleSort);

logout?.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to log out?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("currentUser");
      window.location.href = "../index.html";
    }
  });
});

// Khởi tạo
renderUser();
