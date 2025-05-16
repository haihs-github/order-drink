document.addEventListener("DOMContentLoaded", function () {
	const productList = document.getElementById("product-list");
	const addProductButton = document.getElementById("add-product");
	let productId = 1;
	let isEditing = false;

	function addEventListeners(row, newsId) {
		const deleteButton = row.querySelector(".delete");
		const editButton = row.querySelector(".edit");
		const saveButton = row.querySelector(".save");

		deleteButton.addEventListener("click", function () {
			const confirmDelete = confirm(
				"Bạn có chắc chắn muốn xóa sản phẩm này không?"
			);
			if (confirmDelete) {
				fetch(`http://localhost:5000/api/news/${newsId}`, {
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
					console.log("Sản phẩm đã được xóa:", newsId);
					return response.json();
				}).catch((error) => {
					alert("Có lỗi xảy ra khi xóa sản phẩm");
					console.error("Lỗi khi xóa sản phẩm:", error);
				})
			}
		});

		editButton.addEventListener("click", function () {
			isEditing = true;

			console.log("Sửa sản phẩm", newsId);
			row.style.backgroundColor = "#f0f0f0";
			row.style.border = "2px solid #007bff";
			const cells = row.querySelectorAll("td[contenteditable]");
			cells.forEach((cell) => (cell.contentEditable = "true"));
			editButton.style.display = "none";
			saveButton.style.display = "inline-block";
			const typeInput = row.querySelector('td[name="type"]');
			typeInput.innerHTML = `
				<select name="typeSelect" id="type">
					<option value="câu chuyện">Câu chuyện</option>
					<option value="khuyến mãi">Khuyến mãi</option>
					<option value="sự kiện">Sự kiện</option>
				</select>	
			`;
			const imgBtn = row.querySelector('.custom-btn');
			imgBtn.style.display = "inline-block";
		});

		saveButton.addEventListener("click", async function () {
			const cells = row.querySelectorAll("td[contenteditable]");
			cells.forEach((cell) => (cell.contentEditable = "false"));

			const newsData = {}
			cells.forEach((cell) => {
				const cellName = cell.getAttribute("name");
				if (cellName) {
					newsData[cellName] = cell.innerText;
				}
			});

			const thumbnailcell = row.querySelector('td[name="thumbnail"]');
			const thumbnailPreview = thumbnailcell.querySelector('img');

			const thumbnailInput = row.querySelector('input[name="thumbnail"]');
			newsData.thumbnail = thumbnailInput.files[0] || thumbnailPreview.src;

			const imgBtn = row.querySelector('.custom-btn');
			const typeSelect = row.querySelector('select[name="typeSelect"]');
			newsData.type = typeSelect.value;

			const typeInput = row.querySelector('td[name="type"]');


			const formData = new FormData();
			for (const key in newsData) {
				formData.append(key, newsData[key]);
			}
			console.log("Dữ liệu sản phẩm guirw di:", newsData);

			// Cập nhật sản phẩm
			if (isEditing) {
				fetch(`http://localhost:5000/api/news/${newsId}`, {
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
						typeInput.innerHTML = `<p> ${data.type}</p >`
						isEditing = false;
						row.style.backgroundColor = "";
						row.style.border = "";
						alert("Thông tin đã được lưu.");
						console.log("Dữ liệu đã được gửi đến server:", data);
					})
					.catch((error) => {
						alert("Có lỗi xảy ra khi lưu thông tin");
						console.error("Lỗi khi gửi dữ liệu đến server:", error);
					});
			} else {
				// tạo mới sản phẩm

				fetch("http://localhost:5000/api/news", {
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
						typeInput.innerHTML = `<p> ${data.type}</p >`
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
                    <td name="type" contenteditable="true">
						<select name="typeSelect" id="type">
							<option value="câu chuyện">Câu chuyện</option>
							<option value="khuyến mãi">Khuyến mãi</option>
							<option value="sự kiện">Sự kiện</option>
						</select>
					</td>
                    <td name="title" contenteditable="true">nhập tiêu đề</td>
                    <td name="header" contenteditable="true">Nhập header</td>
                    <td name="thumbnail">
						<img id="preview-${productId}" src="" alt="Ảnh xem trước" style="width: 100%;height: 30px; display: block; object-fit: scale-down" />
						<label for="thumbnail-${productId}" class="custom-btn">Chọn ảnh</label>
						<input type="file" name="thumbnail" id="thumbnail-${productId}" accept="image/*" style="display: none;" />
					</td>
                    <td name="content" contenteditable="true">Nhập nội dung</td>
                    <td>
                        <button class="edit" style="display:none;">Sửa</button>
                        <button class="save"">Lưu</button>
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
		addEventListeners(newRow);
	});

	async function fetchListNews() {
		productId = 1;
		const newsList = await fetch("http://localhost:5000/api/news")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Network response was not ok");
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

		console.log("Dữ liệu sản phẩm:", newsList);

		if (!newsList || newsList.length === 0) {
			alert("Không có sản phẩm nào");
			return;
		}
		newsList.forEach((news) => {
			const newRow = document.createElement("tr");
			newRow.innerHTML = `
                    <td>${productId++}</td>
                    <td name="type" contenteditable="false">
						${news.type}
					</td>
                    <td name="title" contenteditable="false">${news.title}</td>
                    <td name="header" contenteditable="false">${news.header}</td>
                    <td name="thumbnail">
						<img id="preview-${productId}" src="${news.thumbnail}" alt="Ảnh xem trước" style="width: 100%;height: 30px; display: block; object-fit: scale-down" />
						<label for="thumbnail-${productId}" class="custom-btn" style="display: none;">Chọn ảnh</label>
						<input type="file" name="thumbnail" id="thumbnail-${productId}" accept="image/*" style="display: none;" />
					</td>
                    <td name="content" contenteditable="false">${news.content}</td>
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
			addEventListeners(newRow, news._id);
		})
	}

	fetchListNews();
});

