document.addEventListener("DOMContentLoaded", async function () {
	const productList = document.getElementById("product-list");
	const addProductButton = document.getElementById("add-product");
	let productId = 1;
	let isEditing = false;

	// goi danh sach category
	const categoryList = await fetch("http://localhost:5000/api/category")
		.then((res) => {
			if (!res.ok) {
				throw new Error("Network response was not ok");
			}
			return res.json();
		}).then((data) => {
			return data;
		}).catch((error) => {
			alert("Có lỗi xảy ra khi tải dữ liệu");
			console.error("Lỗi khi tải dữ liệu:", error);
		})

	console.log("Dữ liệu danh sách danh mục:", categoryList);

	function addEventListeners(row, product_Id) {
		const deleteButton = row.querySelector(".delete");
		const editButton = row.querySelector(".edit");
		const saveButton = row.querySelector(".save");

		deleteButton.addEventListener("click", async function () {
			const confirmDelete = confirm(
				"Bạn có chắc chắn muốn xóa sản phẩm này không?"
			);
			if (confirmDelete) {
				fetch(`http://localhost:5000/api/products/${product_Id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}).then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					row.remove();
					alert("Xóa sản phẩm thành công");
					console.log("Sản phẩm đã được xóa:", product_Id);
					fetchListProducts();
					return response.json();
				}).catch((error) => {
					alert("Có lỗi xảy ra khi xóa sản phẩm");
					console.error("Lỗi khi xóa sản phẩm:", error);
				})
			}
		});

		editButton.addEventListener("click", function () {
			isEditing = true;

			console.log("Sửa sản phẩm", product_Id);
			row.style.backgroundColor = "#f0f0f0";
			row.style.border = "2px solid #007bff";
			const cells = row.querySelectorAll("td[contenteditable]");
			cells.forEach((cell) => (cell.contentEditable = "true"));
			editButton.style.display = "none";
			saveButton.style.display = "inline-block";
			const typeInput = cells[1];
			console.log("typeinput", typeInput)
			typeInput.innerHTML = `
				<input list="drinks" id="category" name="category" placeholder="Thể loại...">
				<datalist id="drinks">
					${categoryList.map(category => `<option value="${category.name}">${category.name}</option>`).join('')}
				</datalist>
			`;
			const imgBtn = row.querySelector('.custom-btn');
			imgBtn.style.display = "inline-block";
		});

		saveButton.addEventListener("click", async function () {
			const cells = row.querySelectorAll("td[contenteditable]");

			const productData = {}
			cells.forEach((cell) => {
				const cellName = cell.getAttribute("name");
				if (cellName) {
					productData[cellName] = cell.innerText;
				}
			});

			const thumbnailcell = row.querySelector('td[name="thumbnail"]');
			const thumbnailPreview = thumbnailcell.querySelector('img');

			const thumbnailInput = row.querySelector('input[name="thumbnail"]');
			productData.thumbnail = thumbnailInput.files[0] || thumbnailPreview.src;

			const imgBtn = row.querySelector('.custom-btn');
			const typeSelect = row.querySelector('input[name="category"]');
			productData.category = typeSelect.value;

			const formData = new FormData();
			for (const key in productData) {
				formData.append(key, productData[key]);
			}

			// Cập nhật sản phẩm
			if (isEditing) {
				alert("đang xử lý...")
				await fetch(`http://localhost:5000/api/products/${product_Id}`, {
					method: "PUT",
					headers: {
					},
					body: formData,
				})
					.then((response) => {
						if (!response.ok) {
							throw new Error("Network response was not ok");
						}
						return response.json();
					})
					.then((data) => {
						saveButton.style.display = "none";
						editButton.style.display = "inline-block";
						typeSelect.style.display = "none";
						imgBtn.style.display = "none";
						isEditing = false;
						row.style.backgroundColor = "";
						row.style.border = "";
						cells.forEach((cell) => (cell.contentEditable = "false"));
						alert("Thông tin đã được lưu.");
						fetchListProducts();
						console.log("Dữ liệu đã được gửi đến server:", data);
					})
					.catch((error) => {
						alert("Có lỗi xảy ra khi lưu thông tin");
						console.error("Lỗi khi gửi dữ liệu đến server:", error);
					});
			} else {
				// tạo mới sản phẩm
				alert("đang xử lý...")
				await fetch("http://localhost:5000/api/products", {
					method: "POST",
					headers: {
					},
					body: formData,
				})
					.then((response) => {
						if (!response.ok) {
							throw new Error("Network response was not ok");
						}
						return response.json();
					})
					.then((data) => {
						saveButton.style.display = "none";
						editButton.style.display = "inline-block";
						typeSelect.style.display = "none";
						imgBtn.style.display = "none";
						fetchListProducts()
						alert("Thông tin đã được lưu.");
						console.log("Dữ liệu đã được gửi đến server:", data);
					})
					.catch((error) => {
						alert("Có lỗi xảy ra khi lưu thông tin");
						console.error("Lỗi khi gửi dữ liệu đến server:", error);
					});
			}

		});
	}

	addProductButton.addEventListener("click", function () {
		const newRow = document.createElement("tr");
		newRow.innerHTML = `
                    <td>${productId++}</td>
					<td name="title" contenteditable="true">nhập tiêu đề</td>
                    <td contenteditable="true">
						<input list="drinks" id="category" name="category" placeholder="Thể loại...">
						<datalist id="drinks">
							${categoryList.map(category => `<option value="${category.name}">${category.name}</option>`).join('')}
						</datalist>
					</td>
                    <td name="price" contenteditable="true">Nhập giá</td>
                    <td name="discount" contenteditable="true">giảm giá</td>
                    <td name="description" contenteditable="true">Mô tả sản phẩm</td>
                    <td name="thumbnail">
						<img id="preview-${productId}" src="" alt="Ảnh xem trước" style="width: 100%;height: 30px; display: block; object-fit: scale-down" />
						<label for="thumbnail-${productId}" class="custom-btn">Chọn ảnh</label>
						<input type="file" name="thumbnail" id="thumbnail-${productId}" accept="image/*" style="display: none;" />
					</td>
                    <td>
                        <button class="edit" style="display:none;">Sửa</button>
                        <button class="save"">Lưu</button>
                        <button class="delete">Xóa</button>
                    </td>
                `;

		newRow.style.backgroundColor = "#f0f0f0";
		newRow.style.border = "2px solid #007bff";
		//  preview ảnh 
		productList.insertBefore(newRow, productList.firstChild);
		const input = document.getElementById(`thumbnail-${productId}`);
		const preview = document.getElementById(`preview-${productId}`);

		input.addEventListener("change", function () {
			const file = input.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = function (e) {
					preview.src = e.target.result;
					preview.style.display = "block";
				};
				reader.readAsDataURL(file);
			}
		});
		productList.appendChild(newRow);
		addEventListeners(newRow);
	});

	async function fetchListProducts() {
		productId = 1;
		const productsList = await fetch("http://localhost:5000/api/products")
			.then((res) => {
				if (!res.ok) {
					throw new Error("fail to fetch");
				}
				return res.json();
			})
			.then((data) => {
				return data;
			})
			.catch((error) => {
				alert("Có lỗi xảy ra khi tải dữ liệu");
				console.error("Lỗi khi tải dữ liệu:", error);
			});

		console.log("Dữ liệu sản phẩm:", productsList);

		if (!productsList || productsList.length === 0) {
			alert("Không có sản phẩm nào");
			return;
		}

		productList.innerHTML = ''

		productsList.forEach((product) => {
			if (product.deleted) return;
			const newRow = document.createElement("tr");
			newRow.innerHTML = `
                    <td>${productId++}</td>
					<td name="title" contenteditable="false">${product.title}</td>
                    <td contenteditable="false">
						${product.category_id.name}
					</td>
                    <td name="price" contenteditable="false">${product.price}</td>
                    <td name="discount" contenteditable="false">${product.discount}</td>
                    <td name="description" contenteditable="false">${product.description}</td>
                    <td name="thumbnail">
						<img id="preview-${productId}" src="${product.thumbnail}" alt="Ảnh xem trước" style="width: 100%;height: 30px; display: block; object-fit: scale-down" />
						<label for="thumbnail-${productId}" class="custom-btn" style="display: none;">Chọn ảnh</label>
						<input type="file" name="thumbnail" id="thumbnail-${productId}" accept="image/*" style="display: none;" />
					</td>
                    <td>
                        <button class="edit">Sửa</button>
                        <button class="save" style="display:none;">Lưu</button>
                        <button class="delete">Xóa</button>
                    </td>
                `;
			//  preview ảnh 
			productList.appendChild(newRow);
			const input = document.getElementById(`thumbnail-${productId}`);
			const preview = document.getElementById(`preview-${productId}`);

			input.addEventListener("change", function () {
				const file = input.files[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = function (e) {
						preview.src = e.target.result;
						preview.style.display = "block";
					};
					reader.readAsDataURL(file);
				}
			});
			productList.appendChild(newRow);
			addEventListeners(newRow, product._id);
		})
	}

	fetchListProducts();
});

