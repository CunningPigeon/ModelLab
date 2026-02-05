// Получаем элементы модального окна
var modal = document.getElementById("modal");
var span = document.getElementById("closeModal");

document.querySelectorAll('.openModal').forEach(image => {
    image.addEventListener('click', () => {
        const modelName = image.getAttribute('data-model');

        modal.style.display = 'block';
        loadModel(modelName);

        // 🔥 ОБНОВЛЕНИЕ РАЗМЕРА ПОСЛЕ ОТКРЫТИЯ
        setTimeout(() => {
            const container = document.getElementById('container');
            const width = container.clientWidth;
            const height = container.clientHeight;

            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }, 0);
    });
});

// Когда пользователь нажимает на <span> (x), закрываем модальное окно
span.onclick = function() {
    modal.style.display = "none";
}

// Когда пользователь нажимает где-нибудь вне модального окна, закрываем его
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
