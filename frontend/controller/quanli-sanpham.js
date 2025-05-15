document.addEventListener("DOMContentLoaded", function () {
	const productList = document.getElementById("product-list");
	const addProductButton = document.getElementById("add-product");
	let productIdCounter = 1;
	const adminToken = localStorage.getItem("authToken"); // Sử dụng localStorage để lưu trữ token

	// Hàm kiểm tra quyền admin và chuyển hướng nếu không phải admin
	function checkAdminRole() {
		if (!adminToken) {
			alert(
				"Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản quản trị."
			);
			window.location.href = "login.html"; // Chuyển đến trang đăng nhập
			return false; // Ngăn chặn tải trang nếu không phải admin
		}

		return true; // Cho phép tải trang nếu là admin
	}

	// Kiểm tra quyền admin trước khi tải trang
	if (!checkAdminRole()) {
		return;
	}

	function renderProduct(product) {
		const newRow = document.createElement("tr");
		newRow.innerHTML = `
              <td>${productIdCounter++}</td>
              <td contenteditable="false" class="name">${product.title}</td>
              <td contenteditable="false" class="category">${product.category_id ? product.category_id.name : "Chưa có"
			}</td>
              <td contenteditable="false" class="price">${product.price}</td>
              <td contenteditable="false" class="discount">${product.discount
			}</td>
              <td contenteditable="false" class="description">${product.description
			}</td>
              <td><img src="${product.thumbnail || "img.png"}" alt="${product.title
			}" width="50"></td>
              <td>
                  <button class="edit">Sửa</button>
                  <button class="save" style="display: none;">Lưu</button>
                  <button class="delete">Xóa</button>
              </td>
          `;
		productList.appendChild(newRow);
		addEventListeners(newRow, product._id);
	}

	function addEventListeners(row, productId) {
		const deleteButton = row.querySelector(".delete");
		const editButton = row.querySelector(".edit");
		const saveButton = row.querySelector(".save");
		const nameCell = row.querySelector(".name");
		const categoryCell = row.querySelector(".category");
		const priceCell = row.querySelector(".price");
		const discountCell = row.querySelector(".discount");
		const descriptionCell = row.querySelector(".description");
		const imageCell = row.querySelector("td:nth-child(7) img");
		const imageInput = document.createElement("input");
		imageInput.type = "file";
		imageInput.accept = "image/*";
		imageInput.style.display = "none";

		row.querySelector("td:nth-child(7)").appendChild(imageInput);

		imageInput.addEventListener("change", (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					imageCell.src = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		});

		deleteButton.addEventListener("click", function () {
			const confirmDelete = confirm(
				"Bạn có chắc chắn muốn xóa sản phẩm này không?"
			);
			if (confirmDelete) {
				fetch(`http://localhost:5000/api/products/${productId}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${adminToken}`,
					},
				})
					.then((response) => {
						if (response.ok) {
							row.remove();
							alert("Sản phẩm đã được xóa.");
						} else {
							return response.json().then((data) => {
								throw new Error(
									`Lỗi xóa sản phẩm: ${data.message || "Có lỗi xảy ra."}`
								);
							});
						}
					})
					.catch((error) => {
						console.error("Lỗi khi gọi API xóa sản phẩm:", error);
						alert(error.message || "Lỗi khi xóa sản phẩm."); // Hiển thị thông báo lỗi cho người dùng
					});
			}
		});

		editButton.addEventListener("click", function () {
			nameCell.contentEditable = "true";
			categoryCell.contentEditable = "true";
			priceCell.contentEditable = "true";
			discountCell.contentEditable = "true";
			descriptionCell.contentEditable = "true";
			imageInput.style.display = "block";
			editButton.style.display = "none";
			saveButton.style.display = "inline-block";
		});

		saveButton.addEventListener("click", function () {
			const updatedProductData = {
				title: nameCell.textContent,
				category: categoryCell.textContent,
				price: parseInt(priceCell.textContent),
				discount: parseInt(discountCell.textContent),
				description: descriptionCell.textContent,
			};

			const formData = new FormData();
			for (const key in updatedProductData) {
				formData.append(key, updatedProductData[key]);
			}

			if (imageInput && imageInput.files[0]) {
				formData.append("thumbnail", imageInput.files[0]);
			}

			fetch(`http://localhost:5000/api/products/${productId}`, {
				method: "PUT",
				body: formData,
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
			})
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						return response.json().then((data) => {
							throw new Error(
								`Lỗi cập nhật sản phẩm: ${data.message || "Có lỗi xảy ra."
								}`
							);
						});
					}
				})
				.then((updatedProduct) => {
					alert("Thông tin sản phẩm đã được cập nhật.");
					if (updatedProduct.thumbnail) {
						imageCell.src = updatedProduct.thumbnail;
					}
					nameCell.contentEditable = "false";
					categoryCell.contentEditable = "false";
					priceCell.contentEditable = "false";
					discountCell.contentEditable = "false";
					descriptionCell.contentEditable = "false";
					imageInput.style.display = "none";
					saveButton.style.display = "none";
					editButton.style.display = "inline-block";

				})
				.catch((error) => {
					console.error("Lỗi khi gọi API cập nhật sản phẩm:", error);
					// alert("Lỗi khi cập nhật sản phẩm.22"); // Hiển thị thông báo lỗi
				});
		});
	}

	addProductButton.addEventListener("click", function () {
		const newRow = document.createElement("tr");
		newRow.innerHTML = `
              <td>${productIdCounter++}</td>
              <td contenteditable="true" class="name">Nhập tên</td>
              <td contenteditable="true" class="category">Nhập loại</td>
              <td contenteditable="true" class="price">Nhập giá</td>
              <td contenteditable="true" class="discount">giảm giá...</td>
              <td contenteditable="true" class="description">Nhập mô tả</td>
              <td><img src="img.png" alt="New" width="50"><input type="file" accept="image/*"></td>
              <td>
                  <button class="edit" style="display: none;">Sửa</button>
                  <button class="save-new">Lưu Mới</button>
                  <button class="delete">Xóa</button>
              </td>
          `;
		productList.appendChild(newRow);

		const saveNewButton = newRow.querySelector(".save-new");
		const deleteNewButton = newRow.querySelector(".delete");
		const nameCell = newRow.querySelector(".name");
		const categoryCell = newRow.querySelector(".category");
		const priceCell = newRow.querySelector(".price");
		const discountCell = newRow.querySelector(".discount");
		const descriptionCell = newRow.querySelector(".description");
		const imageInput = newRow.querySelector('input[type="file"]');
		const imageCell = newRow.querySelector("td:nth-child(7) img");

		imageInput.addEventListener("change", (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					imageCell.src = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		});

		saveNewButton.addEventListener("click", function () {
			const newProductData = {
				title: nameCell.textContent,
				category: categoryCell.textContent,
				price: parseInt(priceCell.textContent),
				discount: parseInt(discountCell.textContent),
				description: descriptionCell.textContent,
			};

			const formData = new FormData();
			for (const key in newProductData) {
				formData.append(key, newProductData[key]);
			}

			if (imageInput && imageInput.files[0]) {
				formData.append("thumbnail", imageInput.files[0]);
			}

			fetch("http://localhost:5000/api/products", {
				method: "POST",
				body: formData,
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
			})
				.then((response) => {
					if (response.status === 201) {
						return response.json();
					} else {
						return response.json().then((data) => {
							throw new Error(
								`Lỗi thêm sản phẩm: ${data.message || "Có lỗi xảy ra."}`
							);
						});
					}
				})
				.then((newProduct) => {
					alert("Sản phẩm đã được thêm thành công.");
					productList.innerHTML = ""; // Clear the product list
					productIdCounter = 1; // Reset the product counter
					fetch("http://localhost:5000/api/products", {
						headers: {
							Authorization: `Bearer ${adminToken}`,
						},
					})
						.then((response) => response.json())
						.then((products) => {
							const filteredProducts = products.filter(
								(product) => !product.deleted
							);
							filteredProducts.forEach((product) =>
								renderProduct(product)
							);
						})
						.catch((error) => {
							console.error("Lỗi khi gọi API lấy sản phẩm:", error);
							alert("Không thể tải danh sách sản phẩm.");
						});
				})
				.catch((error) => {
					console.error("Lỗi khi gọi API thêm sản phẩm:", error);
					alert(error.message || "Lỗi khi thêm sản phẩm."); // Hiển thị thông báo lỗi
				});
		});

		deleteNewButton.addEventListener("click", function () {
			const confirmDelete = confirm(
				"Bạn có chắc chắn muốn xóa sản phẩm mới này không?"
			);
			if (confirmDelete) {
				newRow.remove();
			}
		});
	});

	// Fetch product list on page load
	fetch("http://localhost:5000/api/products", {
		headers: {
			Authorization: `Bearer ${adminToken}`,
		},
	})
		.then((response) => response.json())
		.then((products) => {
			const filteredProducts = products.filter(
				(product) => !product.deleted
			);
			filteredProducts.forEach((product) => renderProduct(product));
		})
		.catch((error) => {
			console.error("Lỗi khi gọi API lấy sản phẩm:", error);
			alert("Không thể tải danh sách sản phẩm.");
		});
});