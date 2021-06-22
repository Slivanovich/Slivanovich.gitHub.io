import * as THREE from 'three';
import { Vector3 } from 'three';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const clock = new THREE.Clock();

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;

let Dummy: THREE.Object3D;
let room: THREE.LineSegments;
let Objects = new Array(), CameraPoints = new Array();
let raycaster = new THREE.Raycaster;

let controller: THREE.Group;
const tempMatrix = new THREE.Matrix4();

init();
animate();

function init() {

    let container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x505050);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);

    Dummy = new THREE.Object3D();
    Dummy.position.x = 0;
    Dummy.position.y = 0;
    Dummy.position.z = 0;
    Dummy.add(camera);
    
    const path = 'bin/textures/Cube/';
    const format = '.png';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
 
    const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    const refractionCube = new THREE.CubeTextureLoader().load(urls);
    refractionCube.mapping = THREE.CubeRefractionMapping;
    scene.background = reflectionCube;

    room = new THREE.LineSegments(
        new BoxLineGeometry(8, 8, 8, 10, 10, 10).translate(0, 3, 0),
        new THREE.LineBasicMaterial({ color: 0x808080 })
    );
    const geometry1 = new THREE.SphereGeometry(0.05, 10, 10);
    for (let i = 0; i < 30; i++) {
        const object = new THREE.Mesh(geometry1, new THREE.MeshLambertMaterial({ color: 0x000000 }));

        object.position.x = ((Math.random() * 2) - 1) * 3;
        object.position.y = ((Math.random() * 2) - 1) * 3 + 3;
        object.position.z = ((Math.random() * 2) - 1) * 3;
        room.add(object);
        CameraPoints.push(object);
    }
    const geometry2 = new THREE.BoxGeometry(.1, .1, .1);
    for (let i = 0; i < 1500; i++) {
        const object = new THREE.Mesh(geometry2, new THREE.MeshLambertMaterial({ color: Math.random() * 0xAA0000 }));

        object.position.x = ((Math.random() * 2) - 1) * 3;
        object.position.y = ((Math.random() * 2) - 1) * 3 + 3;
        object.position.z = ((Math.random() * 2) - 1) * 3 * 3;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        let sc = Math.random() + 0.5;

        object.scale.x = sc;
        object.scale.y = sc;
        object.scale.z = sc;

        object.userData.velocity = new THREE.Vector3();

        object.userData.velocity.x = Math.random() * 0.01 - 0.005;
        object.userData.velocity.y = Math.random() * 0.01 - 0.005;
        object.userData.velocity.z = Math.random() * 0.01 - 0.005;

        room.add(object);
    }

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    function onSelectStart() {

        this.userData.isSelecting = true;

    }

    function onSelectEnd() {

        this.userData.isSelecting = false;

    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('connected', function (event) {
        this.add(buildController(event.data));
    });
    controller.addEventListener('disconnected', function () {

        this.remove(this.children[0]);

    });
    Dummy.add(controller);

    room.add(Dummy);

    scene.add(room);

    let objLoader = new GLTFLoader();

    for (let i = 0; i < 150; i++) {
        objLoader.load('./bin/Heart1.glb', function (object) {

            object.scene.position.x = ((Math.random() * 2) - 1) * 3;
            object.scene.position.y = ((Math.random() * 2) - 1) * 3 + 3;
            object.scene.position.z = ((Math.random() * 2) - 1) * 3;
            let sc = 0.01;

            object.scene.scale.x = sc;
            object.scene.scale.y = sc;
            object.scene.scale.z = sc;

            scene.add(object.scene);
            Objects.push(object.scene);

        }, undefined, function (error) {
            alert(error);
        });
    }

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    const light = new THREE.DirectionalLight(0xffffff);

    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    document.body.appendChild(VRButton.createButton(renderer));

}

function buildController(data: THREE.XRInputSource) {

    let geometry;

    switch (data.targetRayMode) {

        case 'tracked-pointer':

            geometry = new THREE.BufferGeometry();
            let vec1 = new Vector3(0, 0, 0), vec2 = new Vector3(0, 0, -1);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([vec1.x, vec1.y, vec1.z, vec2.x, vec2.y, vec2.z], 3));
            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 3,
            });

            return new THREE.Line(geometry, material);
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    renderer.setAnimationLoop(render);

}

function render() {

    // scene.background = new THREE.Color(0x000090 * (Math.sin(clock.elapsedTime / 200000) + 1) / 2);

    const delta = clock.getDelta() * 600;

    for (let i = CameraPoints.length; i < room.children.length - 1; i++) {
        const cube = room.children[i];

        cube.position.add(cube.userData.velocity);
        if (cube.position.x < -4 || cube.position.x > 4) {
            cube.position.x = THREE.MathUtils.clamp(cube.position.x, -4, 4);
            cube.userData.velocity.x = -cube.userData.velocity.x;
        }

        if (cube.position.y < -1 || cube.position.y > 7) {

            cube.position.y = THREE.MathUtils.clamp(cube.position.y, -1, 7);
            cube.userData.velocity.y = -cube.userData.velocity.y;
        }

        if (cube.position.z < -4 || cube.position.z > 4) {

            cube.position.z = THREE.MathUtils.clamp(cube.position.z, -4, 4);
            cube.userData.velocity.z = -cube.userData.velocity.z;
        }
        cube.rotation.x += cube.userData.velocity.x * delta;
        cube.rotation.y += cube.userData.velocity.y * delta;
        cube.rotation.z += cube.userData.velocity.z * delta;
    }
    for (let i = 0; i < Objects.length; i++) {
        const obj = Objects[i];

        obj.rotation.y += delta * 0.005;
    }

    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    let intersects = raycaster.intersectObjects(room.children);

    if (controller.userData.isSelecting === true) {
        if (intersects.length > 0) {
            for (let j = 0; j < CameraPoints.length; j++) {
                if (intersects[0].object === CameraPoints[j]) {
                    Dummy.position.x = intersects[0].object.position.x;
                    Dummy.position.y = intersects[0].object.position.y - 0.8;
                    Dummy.position.z = intersects[0].object.position.z;
                }
            }
        }
    }
    renderer.render(scene, camera);
}