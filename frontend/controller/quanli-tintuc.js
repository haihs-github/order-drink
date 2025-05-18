document.addEventListener("DOMContentLoaded", function () {
	const productList = document.getElementById("product-list");
	const addProductButton = document.getElementById("add-product");
	let productId = 1;
	let isEditing = false;

	const logoutBtn = document.getElementById('logout-btn');

	logoutBtn.addEventListener('click', function () {
		localStorage.removeItem('authToken');
		window.location.href = 'dangnhap.html';
	});

	function addEventListeners(row, newsId) {
		const deleteButton = row.querySelector(".delete");
		const editButton = row.querySelector(".edit");
		const saveButton = row.querySelector(".save");

		deleteButton.addEventListener("click", function () {
			const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?");
			if (confirmDelete) {
				alert('đang xử lý...')
				fetch(`http://localhost:5000/api/news/${newsId}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${localStorage.getItem('authToken')}`
					},
				}).then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					row.remove();
					alert("Xóa sản phẩm thành công");
					productList.innerHTML = ''
					fetchListNews()
					return response.json();
				}).catch((error) => {
					alert("Có lỗi xảy ra khi xóa sản phẩm");
					console.error("Lỗi khi xóa sản phẩm:", error);
				})
			}
		});

		editButton.addEventListener("click", function () {
			isEditing = true;
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
			alert('đang xử lý...')
			const cells = row.querySelectorAll("td[contenteditable]");

			const newsData = {}
			cells.forEach((cell) => {
				const cellName = cell.getAttribute("name");
				if (cellName) {
					newsData[cellName] = cell.innerText.trim();
				}
			});

			const thumbnailCell = row.querySelector('td[name="thumbnail"]');
			const thumbnailPreview = thumbnailCell.querySelector('img');
			const thumbnailInput = row.querySelector('input[name="thumbnail"]');
			const imgBtn = row.querySelector('.custom-btn');
			const typeSelect = row.querySelector('select[name="typeSelect"]');
			newsData.type = typeSelect ? typeSelect.value : newsData.type;

			// Dùng FormData để gửi file ảnh lên server
			const formData = new FormData();
			formData.append("type", newsData.type);
			formData.append("title", newsData.title);
			formData.append("header", newsData.header);
			formData.append("content", newsData.content);

			// Chỉ gửi file ảnh nếu có file được chọn
			if (thumbnailInput && thumbnailInput.files.length > 0) {
				formData.append("thumbnail", thumbnailInput.files[0]);
			}

			if (isEditing) {
				fetch(`http://localhost:5000/api/news/${newsId}`, {
					method: "PUT",
					headers: {
						"Authorization": `Bearer ${localStorage.getItem('authToken')}`
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
						if (typeSelect) typeSelect.style.display = "none";
						imgBtn.style.display = "none";
						const typeInput = row.querySelector('td[name="type"]');
						typeInput.innerHTML = `<p> ${data.type}</p>`;
						isEditing = false;
						row.style.backgroundColor = "";
						row.style.border = "";
						alert("Thông tin đã được lưu.");
						cells.forEach((cell) => (cell.contentEditable = "false"));

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
						"Authorization": `Bearer ${localStorage.getItem('authToken')}`
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
						if (typeSelect) typeSelect.style.display = "none";
						imgBtn.style.display = "none";
						const typeInput = row.querySelector('td[name="type"]');
						typeInput.innerHTML = `<p> ${data.type}</p>`;
						alert("Thông tin đã được lưu.");
						cells.forEach((cell) => (cell.contentEditable = "false"));
						fetchListNews(); // Tải lại danh sách sau khi tạo mới
					})
					.catch((error) => {
						alert("Có lỗi xảy ra khi lưu thông tin");
						console.error("Lỗi khi gửi dữ liệu đến server:", error);
					});
			}

		});
	}

	addProductButton.addEventListener("click", function () {
		const currentId = productId++; // Lưu lại ID trước khi tăng để dùng đúng ID cho input, preview
		const newRow = document.createElement("tr");
		newRow.innerHTML = `
            <td>${currentId}</td>
            <td name="type" contenteditable="false">
                <select name="typeSelect" id="type">
                    <option value="câu chuyện">Câu chuyện</option>
                    <option value="khuyến mãi">Khuyến mãi</option>
                    <option value="sự kiện">Sự kiện</option>
                </select>
            </td>
            <td name="title" contenteditable="true">nhập tiêu đề</td>
            <td name="header" contenteditable="true">Nhập header</td>
            <td name="thumbnail">
                <img id="preview-${currentId}" src="" alt="Ảnh xem trước" style="width: 100%;height: 30px; display: none; object-fit: scale-down" />
                <label for="thumbnail-${currentId}" class="custom-btn">Chọn ảnh</label>
                <input type="file" name="thumbnail" id="thumbnail-${currentId}" accept="image/*" style="display: none;" />
            </td>
            <td name="content" contenteditable="true">Nhập nội dung</td>
            <td>
                <button class="edit" style="display:none;">Sửa</button>
                <button class="save">Lưu</button>
                <button class="delete">Xóa</button>
            </td>
        `;
		productList.appendChild(newRow);

		const input = document.getElementById(`thumbnail-${currentId}`);
		const preview = document.getElementById(`preview-${currentId}`);

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
		addEventListeners(newRow);
	});

	async function fetchListNews() {
		productId = 1;
		productList.innerHTML = '';

		const newsList = await fetch("http://localhost:5000/api/news", {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('authToken')}`
			}
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error("Network response was not ok");

				}
				return res.json();
			})
			.catch((error) => {
				alert('Có lỗi khi tải dữ liệu');
				console.error(error);
				return [];
			});

		newsList.forEach((news) => {
			const newRow = document.createElement("tr");
			const id = productId++;
			newRow.innerHTML = `
            <td>${id}</td>
            <td name="type"><p>${news.type}</p></td>
            <td name="title" contenteditable="false">${news.title}</td>
            <td name="header" contenteditable="false">${news.header}</td>
            <td name="thumbnail">
                <img src="${news.thumbnail}" alt="" style="width: 100%;height: 30px; object-fit: scale-down" />
                <label for="thumbnail-${id}" class="custom-btn" style="display:none;">Chọn ảnh</label>
                <input type="file" name="thumbnail" id="thumbnail-${id}" accept="image/*" style="display:none;" />
            </td>
            <td name="content" contenteditable="false">${news.content}</td>
            <td>
                <button class="edit">Sửa</button>
                <button class="save" style="display:none;">Lưu</button>
                <button class="delete">Xóa</button>
            </td>
        `;
			productList.appendChild(newRow);
			addEventListeners(newRow, news._id);
		});
	}

	fetchListNews();

});
