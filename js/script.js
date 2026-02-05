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
    // renderer.setSize(window.innerWidth / 1.3, window.innerHeight / 1.3);
    //
    const container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    //


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
    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

init();


