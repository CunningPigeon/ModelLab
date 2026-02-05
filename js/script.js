import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

let scene, camera, renderer, model, controls;
let mixer, clock = new THREE.Clock();
let isPlaying = false;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e); // Тёмный фон

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 1.3, window.innerHeight / 1.3);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Окружающее освещение с HDR-картой
    new RGBELoader().load('env.hdr', (hdrEquirect) => {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrEquirect;
    });

    // Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(4, 10, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Плоскость (пол) с тенью
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.ShadowMaterial({ opacity: 0.25 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Управление камерой
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.maxPolarAngle = Math.PI / 2;

    controls.minDistance = 2; 
    controls.maxDistance = 40; 


    controls.mouseButtons = {
        LEFT: null,
        MIDDLE: null,
        RIGHT: THREE.MOUSE.ROTATE
    };

    // Открытие модели при клике на миниатюру
    document.querySelectorAll('.openModal').forEach(image => {
        image.addEventListener('click', () => {
            const modelName = image.getAttribute('data-model');
            loadModel(modelName);
            document.getElementById('modal').style.display = 'block';
        });
    });

    // Закрытие модального окна
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
        if (model) {
            scene.remove(model);
            model = null;
            mixer = null;
            isPlaying = false;
        }
    });

    // ЛКМ: Воспроизведение/пауза анимации
    renderer.domElement.addEventListener('mousedown', (event) => {
        if (event.button === 0 && mixer) {
            mixer._actions.forEach(action => {
                action.paused = isPlaying;
            });
            isPlaying = !isPlaying;
        }
    });

    animate();
}

function loadModel(modelName) {
    const modelPath = `${modelName}`;
    const loader = new GLTFLoader();

    loader.load(modelPath, (gltf) => {
        if (model) scene.remove(model);

        model = gltf.scene;

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const oldMat = child.material;

                // Если материал не PBR, замена на MeshStandardMaterial
                if (!(oldMat instanceof THREE.MeshStandardMaterial)) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: oldMat.color || new THREE.Color(0xffffff),
                        map: oldMat.map || null,
                        metalness: 0.4,
                        roughness: 0.5,
                    });
                } else {
                    child.material.metalness = 0.4;
                    child.material.roughness = 0.5;
                }

                // Копирование текстур
                if (oldMat.normalMap) child.material.normalMap = oldMat.normalMap;
                if (oldMat.aoMap) child.material.aoMap = oldMat.aoMap;
                if (oldMat.roughnessMap) child.material.roughnessMap = oldMat.roughnessMap;
                if (oldMat.metalnessMap) child.material.metalnessMap = oldMat.metalnessMap;

                // Настройка текстур
                const maps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'];
                maps.forEach(mapName => {
                    const map = child.material[mapName];
                    if (map) {
                        map.encoding = THREE.sRGBEncoding;
                        map.anisotropy = 16;
                        map.wrapS = THREE.RepeatWrapping;
                        map.wrapT = THREE.RepeatWrapping;
                        map.needsUpdate = true;
                    }
                });

                child.material.needsUpdate = true;
            }
        });

        scene.add(model);

        // Анимация
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => {
            const action = mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            action.play();
            action.paused = true;
        });

        isPlaying = false;
    }, undefined, (error) => {
        console.error('Ошибка загрузки модели:', error);
    });
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 1.3, window.innerHeight / 1.3);
});

init();






/*import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, model, controls;
let mixer, clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 1.7, window.innerHeight / 1.7);
    renderer.shadowMap.enabled = false;
    document.getElementById('container').appendChild(renderer.domElement);

    // Свет
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1).normalize();
    scene.add(directionalLight1);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight2);
    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight3.position.set(1, -1, -1).normalize();
    scene.add(directionalLight3);

    // Камера и управление
    camera.position.set(0, 1, 5);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Клик по миниатюрам
    document.querySelectorAll('.openModal').forEach(image => {
        image.addEventListener('click', () => {
            const modelName = image.getAttribute('data-model');
            loadModel(modelName);
            document.getElementById('modal').style.display = 'block';
        });
    });

    // Закрытие модального окна
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
        if (model) {
            scene.remove(model);
            model = null;
            mixer = null;
        }
    });

    // Клик для запуска анимации
    renderer.domElement.addEventListener('click', () => {
        if (mixer && mixer._actions.length > 0) {
            mixer._actions.forEach(action => {
                action.reset().play();
            });
        }
    });

    animate();
}

function loadModel(modelName) {
    const modelPath = `3dmodel/${modelName}`;
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        if (model) {
            scene.remove(model);
        }
        model = gltf.scene;
        scene.add(model);

        // Удаляем старый миксер и создаём новый
        mixer = new THREE.AnimationMixer(model);

        // Добавляем все анимации
        gltf.animations.forEach(clip => {
            const action = mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        });

    }, undefined, (error) => {
        console.error('Ошибка загрузки модели:', error);
    });
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 1.3, window.innerHeight / 1.3);
});

init();






/*import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, model, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 1.7, window.innerHeight / 1.7);
    renderer.shadowMap.enabled = false; // Отключаем тени в рендерере

    document.getElementById('container').appendChild(renderer.domElement);

    // Добавление освещения
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Мягкий свет
    scene.add(ambientLight);

    // Направленный свет
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1).normalize();
    directionalLight1.castShadow = false; // Отключаем тени для первого источника света
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, -1, -1).normalize();
    directionalLight2.castShadow = false; // Отключаем тени для второго источника света
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight3.position.set(1, -1, -1).normalize();
    directionalLight3.castShadow = false; // Отключаем тени для третьего источника света
    scene.add(directionalLight3);

    // Установка позиции камеры
    camera.position.set(0, 1, 5); // Позиция камеры

    // Добавление управления камерой
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Увеличивает плавность вращения
    controls.dampingFactor = 0.25; // Параметр сглаживания
    controls.screenSpacePanning = false; // Запрет панорамирования в пространстве экрана
    controls.maxPolarAngle = Math.PI / 2; // Ограничение угла наклона камеры

   // Обработчик для открытия модального окна
   const openModalImages = document.querySelectorAll('.openModal');
   openModalImages.forEach(image => {
       image.addEventListener('click', () => {
           const modelName = image.getAttribute('data-model'); // Получаем имя модели из атрибута
           loadModel(modelName); // Загружаем модель
           document.getElementById('modal').style.display = 'block'; // Показываем модальное окно
       });
   });

   // Обработчик для закрытия модального окна
   document.getElementById('closeModal').addEventListener('click', () => {
       document.getElementById('modal').style.display = 'none'; // Скрываем модальное окно
       if (model) {
           scene.remove(model); // Удаляем модель из сцены
           model = null; // Сбрасываем модель
       }
   });

    animate();
}

function loadModel(modelName) {
    const modelPath = `3dmodel/${modelName}`; // Формируем путь к модели
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        if (model) {
            scene.remove(model); // Удаляем предыдущую модель
        }
        model = gltf.scene;
        scene.add(model);
    }, undefined, (error) => {
        console.error('Ошибка загрузки модели:', error);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.00; // Вращение модели
    }
    controls.update(); // Обновление управления
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 1.3, window.innerHeight / 1.3);
});

init();
*/