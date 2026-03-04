import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Scene ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f6f5);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ── Lighting ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xfff0e0, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(5, 8, 6);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffe0c0, 0.6);
fill.position.set(-3, -2, 2);
scene.add(fill);

// ── Controls ─────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 1;
controls.maxDistance = 20;

// ── Things to load ───────────────────────────────────────────────────────────
// Drop your GLTF/GLB exports from Polycam into a "things/" folder, then list
// them here. Each will be auto-scaled and scattered in the scene.
//
// const THINGS = [
//     'things/rock.glb',
//     'things/shell.glb',
//     'things/cup.glb',
// ];
const THINGS = [
    'things/9_26_2024.glb',
    'things/5_28_2024.glb',
];

// ─────────────────────────────────────────────────────────────────────────────

const objects = [];
let focusedObj = null;

function addObject(mesh, upright = false) {
    const spread = 7;
    const x = (Math.random() - 0.5) * spread;
    const y = (Math.random() - 0.5) * spread * 0.4;
    const z = (Math.random() - 0.5) * spread * 0.3;
    mesh.position.set(x, y, z);
    // upright: only randomize Y so scanned objects stay right-side up
    if (upright) {
        mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    } else {
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
    }
    scene.add(mesh);
    objects.push({
        mesh,
        baseY: y,
        driftX: x,
        driftZ: z,
        driftVX: (Math.random() - 0.5) * 0.0007,
        driftVZ: (Math.random() - 0.5) * 0.0007,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        bobAmp: 0.05 + Math.random() * 0.05,
        bobOffset: Math.random() * Math.PI * 2,
    });
}

if (THINGS.length > 0) {
    const loader = new GLTFLoader();
    THINGS.forEach(path => {
        loader.load(path, gltf => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());
            const scale = 3.0 / size;
            // wrap in group so addObject can freely set world position
            const group = new THREE.Group();
            model.scale.setScalar(scale);
            model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
            group.add(model);
            addObject(group, true);
        });
    });
} else {
    // Placeholder shapes using the site's warm palette
    const palette = [0xe16704, 0xc97a3d, 0xd6c4aa, 0x111111, 0xe0a060, 0x8a6540];
    const geos = [
        new THREE.IcosahedronGeometry(0.6, 1),
        new THREE.TorusGeometry(0.5, 0.18, 14, 36),
        new THREE.BoxGeometry(0.85, 0.85, 0.85),
        new THREE.OctahedronGeometry(0.65),
        new THREE.TorusKnotGeometry(0.36, 0.12, 80, 8),
        new THREE.ConeGeometry(0.45, 0.9, 7),
    ];
    geos.forEach((geo, i) => {
        const mat = new THREE.MeshStandardMaterial({
            color: palette[i],
            roughness: 0.75,
            metalness: 0.05,
        });
        addObject(new THREE.Mesh(geo, mat));
    });
}

// ── Raycasting ───────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseDownAt = { x: 0, y: 0 };
let didDrag = false;

function getMeshList() {
    const list = [];
    objects.forEach(obj => {
        obj.mesh.traverse(c => { if (c.isMesh) list.push({ child: c, obj }); });
    });
    return list;
}

renderer.domElement.addEventListener('mousedown', e => {
    mouseDownAt = { x: e.clientX, y: e.clientY };
    didDrag = false;
});

renderer.domElement.addEventListener('click', e => {
    if (didDrag) return; // was a drag, not a click
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const meshList = getMeshList();
    const hits = raycaster.intersectObjects(meshList.map(m => m.child));
    if (hits.length > 0) {
        const hit = meshList.find(m => m.child === hits[0].object);
        if (hit) {
            focusedObj = hit.obj;
            controls.target.copy(hit.obj.mesh.position);
        }
    } else {
        focusedObj = null;
        controls.target.set(0, 0, 0);
    }
});

renderer.domElement.addEventListener('mousemove', e => {
    const dx = e.clientX - mouseDownAt.x;
    const dy = e.clientY - mouseDownAt.y;
    if (dx * dx + dy * dy > 16) didDrag = true; // 4px threshold

    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(getMeshList().map(m => m.child));
    renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
});

// ── Animate ──────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

(function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    objects.forEach(obj => {
        if (obj === focusedObj) return; // freeze while focused

        // slow drift in XZ plane
        obj.driftX += obj.driftVX;
        obj.driftZ += obj.driftVZ;
        if (Math.abs(obj.driftX) > 4) obj.driftVX *= -1;
        if (Math.abs(obj.driftZ) > 3) obj.driftVZ *= -1;

        // gentle Y bob
        const bobY = Math.sin(t + obj.bobOffset) * obj.bobAmp;
        obj.mesh.position.set(obj.driftX, obj.baseY + bobY, obj.driftZ);

        // slow self-rotation
        obj.mesh.rotation.y += obj.rotSpeed;
    });

    controls.update();
    renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});
