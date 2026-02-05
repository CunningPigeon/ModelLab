import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Импорт OrbitControls

// Рабочий скрипт
let scene, camera, renderer, model, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 1.3, window.innerHeight / 1.3);

    document.getElementById('container').appendChild(renderer.domElement);

    // Добавление освещения
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Мягкий свет
    scene.add(ambientLight);

    // Направленный свет
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, -1, -1).normalize(); // Добавляем второй источник света
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight3.position.set(1, -1, -1).normalize(); // Третий источник света
    scene.add(directionalLight3);

    // Установка позиции камеры
    camera.position.set(0, 1, 5); // Позиция камеры

    // Добавление управления камерой
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Увеличивает плавность вращения
    controls.dampingFactor = 0.25; // Параметр сглаживания
    controls.screenSpacePanning = false; // Запрет панорамирования в пространстве экрана
    controls.maxPolarAngle = Math.PI / 2; // Ограничение угла наклона камеры

    // Обработка загрузки модели
    document.getElementById('modelInput').addEventListener('change', handleFileSelect, false);

    animate();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const loader = new GLTFLoader();
            loader.parse(e.target.result, '', function (gltf) {
                if (model) {
                    scene.remove(model); // Удаляем предыдущую модель
                }
                model = gltf.scene;

                // Установка всех материалов на непрозрачные
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = false; // Убираем прозрачность
                        child.material.opacity = 1; // Устанавливаем непрозрачность
                    }
                });

                scene.add(model);
            }, function (error) {
                console.error('Ошибка загрузки модели:', error);
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.01; // Вращение модели
    }
    controls.update(); // Обновление управления
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight * 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 2);
});

init();

// Белая модель
// let scene, camera, renderer, model, controls;

//         function init() {
//             scene = new THREE.Scene();
//             camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//             renderer = new THREE.WebGLRenderer({ antialias: true });
//             renderer.setSize(window.innerWidth, window.innerHeight);
//             document.getElementById('container').appendChild(renderer.domElement);

//             // Установка позиции камеры
//             camera.position.set(0, 1, 5); // Позиция камеры

//             // Добавление управления камерой
//             controls = new OrbitControls(camera, renderer.domElement);
//             controls.enableDamping = true; // Увеличивает плавность вращения
//             controls.dampingFactor = 0.25; // Параметр сглаживания
//             controls.screenSpacePanning = false; // Запрет панорамирования в пространстве экрана
//             controls.maxPolarAngle = Math.PI / 2; // Ограничение угла наклона камеры

//             // Обработка загрузки модели
//             document.getElementById('modelInput').addEventListener('change', handleFileSelect, false);

//             animate();
//         }

//         function handleFileSelect(event) {
//             const file = event.target.files[0];
//             if (file) {
//                 const reader = new FileReader();
//                 reader.onload = function (e) {
//                     const loader = new GLTFLoader();
//                     loader.parse(e.target.result, '', function (gltf) {
//                         if (model) {
//                             scene.remove(model); // Удаляем предыдущую модель
//                         }
//                         model = gltf.scene;

//                         // Установка свойств материалов для использования MeshBasicMaterial
//                         model.traverse((child) => {
//                             if (child.isMesh) {
//                                 // Заменяем текущий материал на MeshBasicMaterial
//                                 child.material = new THREE.MeshBasicMaterial({
//                                     color: child.material.color, // Используем цвет из оригинального материала
//                                     side: THREE.DoubleSide // Установите двойные стороны
//                                 });
//                             }
//                         });

//                         scene.add(model);
//                     }, function (error) {
//                         console.error('Ошибка загрузки модели:', error);
//                     });
//                 };
//                 reader.readAsArrayBuffer(file);
//             }
//         }

//         function animate() {
//             requestAnimationFrame(animate);
//             if (model) {
//                 model.rotation.y += 0.01; // Вращение модели
//             }
//             controls.update(); // Обновление управления
//             renderer.render(scene, camera);
//         }

//         window.addEventListener('resize', () => {
//             camera.aspect = window.innerWidth / window.innerHeight;
//             camera.updateProjectionMatrix();
//             renderer.setSize(window.innerWidth, window.innerHeight);
//         });

//         init();

// Прокрутка

// let scene, camera, renderer, model, controls;

// function init() {
//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.getElementById('container').appendChild(renderer.domElement);

//     // Добавление освещения
//     const light = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(light);
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//     directionalLight.position.set(1, 1, 1).normalize();
//     scene.add(directionalLight);

//     // Установка позиции камеры
//     camera.position.set(0, 1, 5); // Позиция камеры

//     // Добавление управления камерой
//     controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true; // Увеличивает плавность вращения
//     controls.dampingFactor = 0.25; // Параметр сглаживания
//     controls.screenSpacePanning = false; // Запрет панорамирования в пространстве экрана
//     controls.maxPolarAngle = Math.PI / 2; // Ограничение угла наклона камеры

//     // Обработка загрузки модели
//     document.getElementById('modelInput').addEventListener('change', handleFileSelect, false);

//     animate();
// }

// function handleFileSelect(event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function (e) {
//             const loader = new GLTFLoader();
//             loader.parse(e.target.result, '', function (gltf) {
//                 if (model) {
//                     scene.remove(model); // Удаляем предыдущую модель
//                 }
//                 model = gltf.scene;
//                 scene.add(model);
//             }, function (error) {
//                 console.error('Ошибка загрузки модели:', error);
//             });
//         };
//         reader.readAsArrayBuffer(file);
//     }
// }

// function animate() {
//     requestAnimationFrame(animate);
//     if (model) {
//         model.rotation.y += 0.01; // Вращение модели
//     }
//     controls.update(); // Обновление управления
//     renderer.render(scene, camera);
// }

// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });

// init();


// Выводит
// let scene, camera, renderer, model;

//         function init() {
//             scene = new THREE.Scene();
//             camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//             renderer = new THREE.WebGLRenderer({ antialias: true });
//             renderer.setSize(window.innerWidth, window.innerHeight);
//             document.getElementById('container').appendChild(renderer.domElement);

//             // Добавление освещения
//             const light = new THREE.AmbientLight(0xffffff, 0.5);
//             scene.add(light);
//             const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
//             directionalLight.position.set(1, 1, 1).normalize();
//             scene.add(directionalLight);

//             camera.position.z = 5;

//             // Обработка загрузки модели
//             document.getElementById('modelInput').addEventListener('change', handleFileSelect, false);

//             animate();
//         }

//         function handleFileSelect(event) {
//             const file = event.target.files[0];
//             if (file) {
//                 const reader = new FileReader();
//                 reader.onload = function (e) {
//                     const loader = new GLTFLoader();
//                     loader.parse(e.target.result, '', function (gltf) {
//                         if (model) {
//                             scene.remove(model); // Удаляем предыдущую модель
//                         }
//                         model = gltf.scene;
//                         scene.add(model);
//                     }, function (error) {
//                         console.error('Ошибка загрузки модели:', error);
//                     });
//                 };
//                 reader.readAsArrayBuffer(file);
//             }
//         }

//         function animate() {
//             requestAnimationFrame(animate);
//             if (model) {
//                 model.rotation.y += 0.01; // Вращение модели
//             }
//             renderer.render(scene, camera);
//         }

//         window.addEventListener('resize', () => {
//             camera.aspect = window.innerWidth / window.innerHeight;
//             camera.updateProjectionMatrix();
//             renderer.setSize(window.innerWidth, window.innerHeight);
//         });

//         init();