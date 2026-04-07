let entries = JSON.parse(localStorage.getItem("entries")) || [];

let addId = null;
const tbody = document.querySelector("#tbody");
const addBtn = document.querySelector(".add-btn");
const categoryInput = document.querySelector("#category-name");
const searchBar = document.querySelector("#search-bar");
const logout = document.querySelector(".logout");

const renderCategory = (data = entries) => {
  let html = "";
  data.forEach(
    (entrie, index) =>
      (html += `
    <tr>
        <td>${index + 1}</td>
        <td>${entrie.name}</td>
        <td class="actions">
        <button class="edit-btn" onclick = handelEdit(${index})>Edit</button>
        <button class="delete-btn" onclick= handelDelete(${index})>Delete</button>
        </td>
    </tr>
  `),
  );
  tbody.innerHTML = html;
};
const handelAddCategory = (event) => {
  event.preventDefault();
  categoryInputAdd = categoryInput.value.trim();
  if (addId !== null) {
    if (categoryInputAdd === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot be left blank",
      });
      return;
    }
    entries[addId].name = categoryInputAdd;
    addId = null;
    addBtn.textContent = "Add Category";
    Swal.fire({
      icon: "success",
      title: "Update success",
      timer: 1500,
      showConfirmButton: false,
    });
  } else {
    if (categoryInputAdd === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot be left blank",
      });
      return;
    }
    let newCategory = {
      id: Date.now(),
      name: categoryInputAdd,
    };
    entries.push(newCategory);
    localStorage.setItem("entries", JSON.stringify(entries));
    Swal.fire({
      icon: "success",
      title: "Add Category Successful",
      timer: 1500,
      showConfirmButton: false,
    });
  }
  localStorage.setItem("entries", JSON.stringify(entries));
  categoryInput.value = "";
  renderCategory();
};
const handelDelete = (index) => {
  const postsFromLocal = JSON.parse(localStorage.getItem("articles")) || [];
  const categoryToDelete = entries[index].name;
  const isUsed = postsFromLocal.some((post) => {
    return post.category === categoryToDelete;
  });
  if (isUsed) {
    Swal.fire({
      icon: "error",
      title: "Cannot Delete",
      text: `The category "${categoryToDelete}" is currently linked to existing articles. Please delete those articles first.`,
    });
    return;
  }
  Swal.fire({
    title: "Are you sure?",
    text: "This category will be permanently removed!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "The category has been removed.",
        icon: "success",
      }).then(() => {
        entries.splice(index, 1);
        localStorage.setItem("entries", JSON.stringify(entries));
        renderCategory();
      });
    }
  });
};

const handelEdit = (index) => {
  categoryInput.value = entries[index].name;
  addBtn.textContent = "Update";
  addId = index;
};
const handelSearch = (event) => {
  event.preventDefault();
  const value = searchBar.value.trim();
  const filteredEntries = entries.filter((entrie) =>
    entrie.name.toLowerCase().includes(value),
  );
  renderCategory(filteredEntries);
};

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
searchBar.addEventListener("input", handelSearch);
addBtn.addEventListener("click", handelAddCategory);
renderCategory();
