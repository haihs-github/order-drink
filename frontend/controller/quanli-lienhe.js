document.addEventListener("DOMContentLoaded", async function () {

	const authToken = localStorage.getItem("authToken");
	const logoutBtn = document.getElementById("logout-btn")
	logoutBtn.addEventListener('click', function () {
		// Xóa token và thông tin người dùng khỏi Local Storage
		localStorage.removeItem('authToken');
		// Chuyển hướng người dùng về trang đăng nhập (tùy chọn)
		window.location.href = 'dangnhap.html';
	});

	//load feedbacks
	const feedbacks = await fetch("http://localhost:5000/api/feedbacks",
		{
			headers: {
				"Authorization": `Bearer ${localStorage.getItem('authToken')}`
			}
		}
	)
		.then((response) => {
			if (!response.ok) {
				console.error("Network response was not ok", error);
				throw new Error("Network response was not ok");
			}
			return response.json();
		}).then((data) => {
			return data;
		}).catch((error) => {
			console.error("There was a problem with the fetch operation:", error);
		})
	console.log("feedbacks", feedbacks);

	function renderFeedbacks(feedbacks) {
		const feedbackList = document.getElementById("product-list");
		feedbackList.innerHTML = ""; // Clear existing content

		feedbacks.forEach(async (feedback) => {
			const feedbackItem = document.createElement("tr");
			feedbackItem.className = "feedback-item";
			feedbackItem.innerHTML = `
				<td>${feedback.user_id.username}</td>
				<td>${feedback.name}</td>
				<td>${feedback.email}</td>
				<td>${feedback.phone_number}</td>
				<td style="min-width: 300px;">${feedback.content}</td>
			`;
			feedbackList.appendChild(feedbackItem);
		});
	}

	renderFeedbacks(feedbacks);

})