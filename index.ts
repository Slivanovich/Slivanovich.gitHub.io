import * as THREE from 'three';
import { Vector3 } from 'three';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;
let Dummy: THREE.Object3D, room: THREE.Object3D;
let controller: THREE.Group, controllerGrip: THREE.Group;
let format: string;
let curViewPoint: viewPoint;

let IsDown = new Boolean();
let raycaster = new THREE.Raycaster;
let urls = new Array();
let allViewPoints = new Array();

const geometry1 = new THREE.SphereGeometry(0.9, 30, 30);
const tempMatrix = new THREE.Matrix4();

class viewPoint {
    reflectionCube: THREE.CubeTexture;
    obj: THREE.Mesh;

    lastSelected: viewPoint;

    canSeePoints = Array();

    constructor(path: string, pos: Vector3) {
        this.reflectionCube = loadCubemap(path);

        this.obj = new THREE.Mesh(geometry1, new THREE.MeshLambertMaterial({ color: 0xCC3333 }));

        this.obj.position.set(pos.x, pos.y, pos.z);
        this.obj.scale.x = this.obj.scale.y = this.obj.scale.z = 1;
    }

    addViewPoint(point: viewPoint) {
        this.canSeePoints.push(point);
    }

    activateAll() {
        scene.background = this.reflectionCube;
        this.lastSelected = this;

        Dummy.position.x = this.obj.position.x;
        Dummy.position.y = this.obj.position.y;
        Dummy.position.z = this.obj.position.z;

        for (let i = 0; i < this.canSeePoints.length; i++) {
            room.add(this.canSeePoints[i].obj);
        }
    }

    deactivateAll() {
        this.lastSelected = this;

        for (let i = 0; i < this.canSeePoints.length; i++) {
            this.canSeePoints[i].obj.scale.x = 1;
            this.canSeePoints[i].obj.scale.y = 1;
            this.canSeePoints[i].obj.scale.z = 1;
            room.remove(this.canSeePoints[i].obj);
        }
    }

    render(isSelected: boolean) {
        if (isSelected) {
            if (this.obj.scale.x < 2) {
                this.obj.scale.x += 0.05;
                this.obj.scale.y += 0.05;
                this.obj.scale.z += 0.05;
            }
        } else {
            if (this.obj.scale.x > 1) {
                this.obj.scale.x -= 0.05;
                this.obj.scale.y -= 0.05;
                this.obj.scale.z -= 0.05;
            }
        }
    }

    renderScene() {
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        let intersects = raycaster.intersectObjects(room.children);

        if (intersects.length > 0) {
            for (let i = 0; i < this.canSeePoints.length; i++) {
                if (intersects[0].object === this.canSeePoints[i].obj) {
                    this.canSeePoints[i].render(true);
                    this.lastSelected = this.canSeePoints[i];
                } else {
                    this.canSeePoints[i].render(false);
                }
            }
        } else {
            for (let i = 0; i < this.canSeePoints.length; i++) {
                this.canSeePoints[i].render(false);
            }
        }

        if (controller.userData.isSelecting === false) {
            IsDown = false;
        }
        if (controller.userData.isSelecting === true) {
            if (IsDown !== true) {
                let travel = this.lastSelected;



                this.deactivateAll();
                travel.activateAll();

                IsDown = true;

                return travel;
            }
        }

        return this;
    }
}

function connectViewPoints(p1: viewPoint, p2: viewPoint) {
    p1.addViewPoint(p2);
    p2.addViewPoint(p1);
}

init();
animate();

function loadCubemap(path: string) {
    format = '.png';
    urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    return new THREE.CubeTextureLoader().load(urls);
}

function init() {
    IsDown = false;
    let container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);

    room = new THREE.Object3D();
    room.position.x = room.position.y = room.position.z = 0;

    Dummy = new THREE.Object3D();
    Dummy.position.x = 0;
    Dummy.position.y = 3;
    Dummy.position.z = -45;
    Dummy.add(camera);

    // coridor 2 floor
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/1/", new THREE.Vector3(0, 1.5, -25))); // 0
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/2/", new THREE.Vector3(0, 1.5, 65)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/3/", new THREE.Vector3(0, 1.5, 125)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/4/", new THREE.Vector3(-60, 1.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/5/", new THREE.Vector3(-120, 1.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/6/", new THREE.Vector3(-180, 1.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/coridor/7/", new THREE.Vector3(-240, 1.5, -25))); // 6

    // 201
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/201/1/", new THREE.Vector3(-180, 1.5, -60))); // 7
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/201/2/", new THREE.Vector3(-180, 1.5, -120)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/201/3/", new THREE.Vector3(-240, 1.5, -120))); // 9

    // 207
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/207/1/", new THREE.Vector3(60, 1.5, -25))); // 10
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/207/2/", new THREE.Vector3(150, 1.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/207/3/", new THREE.Vector3(150, 1.5, -100))); // 12

    // 208
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/208/1/", new THREE.Vector3(60, 1.5, 10))); // 13
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/208/2/", new THREE.Vector3(60, 1.5, 75)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/208/3/", new THREE.Vector3(150, 1.5, 75))); // 15

    // 209
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/209/1/", new THREE.Vector3(60, 1.5, 125))); // 16
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/209/2/", new THREE.Vector3(60, 1.5, 200)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/209/3/", new THREE.Vector3(150, 1.5, 200))); // 18

    // lest 23 main
    allViewPoints.push(new viewPoint("bin/textures/Cube2/lm23/1/", new THREE.Vector3(-60, 1.5, 25))); // 19
    allViewPoints.push(new viewPoint("bin/textures/Cube2/lm23/2/", new THREE.Vector3(-60, 15.5, 125)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/lm23/3/", new THREE.Vector3(-30, 15.5, 125)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/lm23/4/", new THREE.Vector3(-30, 41.5, 25))); // 22

    // coridor 3 floor
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/1/", new THREE.Vector3(0, 41.5, 125))); // 23
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/2/", new THREE.Vector3(0, 41.5, 65)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/3/", new THREE.Vector3(0, 41.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/4/", new THREE.Vector3(0, 41.5, -65)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/5/", new THREE.Vector3(-30, 41.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/6/", new THREE.Vector3(-120, 41.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/7/", new THREE.Vector3(-180, 41.5, -25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/coridor/8/", new THREE.Vector3(-240, 41.5, -25))); // 30

    // 202
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/202/1/", new THREE.Vector3(-120, 1.5, -45))); // 31
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/202/2/", new THREE.Vector3(-120, 1.5, -115)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f2/202/3/", new THREE.Vector3(-180, 1.5, -115))); // 33 

    // 301
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/301/1/", new THREE.Vector3(-240, 41.5, -60))); // 34
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/301/2/", new THREE.Vector3(-200, 41.5, -60)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/301/3/", new THREE.Vector3(-200, 41.5, -120))); // 36

    // 302
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/302/1/", new THREE.Vector3(-180, 41.5, -45))); // 37
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/302/2/", new THREE.Vector3(-180, 41.5, -115)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/302/3/", new THREE.Vector3(-240, 41.5, -115))); // 39 

    // 303
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/303/1/", new THREE.Vector3(-120, 41.5, -45))); // 40
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/303/2/", new THREE.Vector3(-120, 41.5, -115)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/303/3/", new THREE.Vector3(-60, 41.5, -115))); // 42

    // 306
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/306/1/", new THREE.Vector3(60, 41.5, -45))); // 43
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/306/2/", new THREE.Vector3(150, 41.5, -45)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/306/3/", new THREE.Vector3(150, 41.5, -100))); // 45

    // 307
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/307/1/", new THREE.Vector3(60, 41.5, 65))); // 46
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/307/2/", new THREE.Vector3(110, 41.5, 65)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/307/3/", new THREE.Vector3(110, 41.5, -5))); // 48

    // 308
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/308/1/", new THREE.Vector3(60, 41.5, 125))); // 49
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/308/2/", new THREE.Vector3(60, 41.5, 175)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/308/3/", new THREE.Vector3(110, 41.5, 175))); // 51

    // English stairs
    allViewPoints.push(new viewPoint("bin/textures/Cube2/la23/5/", new THREE.Vector3(-240, 41.5, 25))); // 52
    allViewPoints.push(new viewPoint("bin/textures/Cube2/la23/4/", new THREE.Vector3(-240, 15.5, 125)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/la23/3/", new THREE.Vector3(-210, 15.5, 125)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/la23/2/", new THREE.Vector3(-210, 1.5, 25)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/la23/1/", new THREE.Vector3(-240, 1.5, 25))); // 56

    // 300
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/300/1/", new THREE.Vector3(-240, 15.5, 145))); // 57
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/300/2/", new THREE.Vector3(-240, 15.5, 175)));
    allViewPoints.push(new viewPoint("bin/textures/Cube2/f3/300/3/", new THREE.Vector3(-210, 15.5, 175))); // 59

    // connect coridor 2 floor
    connectViewPoints(allViewPoints[0], allViewPoints[1]);
    connectViewPoints(allViewPoints[1], allViewPoints[2]);
    connectViewPoints(allViewPoints[0], allViewPoints[3]);
    connectViewPoints(allViewPoints[3], allViewPoints[4]);
    connectViewPoints(allViewPoints[4], allViewPoints[5]);
    connectViewPoints(allViewPoints[5], allViewPoints[6]);

    // connect 201
    connectViewPoints(allViewPoints[5], allViewPoints[7]);
    connectViewPoints(allViewPoints[7], allViewPoints[8]);
    connectViewPoints(allViewPoints[8], allViewPoints[9]);
    connectViewPoints(allViewPoints[7], allViewPoints[9]);

    // connect 202
    connectViewPoints(allViewPoints[4], allViewPoints[31]);
    connectViewPoints(allViewPoints[31], allViewPoints[32]);
    connectViewPoints(allViewPoints[32], allViewPoints[33]);
    connectViewPoints(allViewPoints[31], allViewPoints[33]);


    // connect 207
    connectViewPoints(allViewPoints[0], allViewPoints[10]);
    connectViewPoints(allViewPoints[10], allViewPoints[11]);
    connectViewPoints(allViewPoints[11], allViewPoints[12]);
    connectViewPoints(allViewPoints[10], allViewPoints[12]);

    // connect 208
    connectViewPoints(allViewPoints[0], allViewPoints[13]);
    connectViewPoints(allViewPoints[13], allViewPoints[14]);
    connectViewPoints(allViewPoints[14], allViewPoints[15]);
    connectViewPoints(allViewPoints[13], allViewPoints[15]);

    // connect 209
    connectViewPoints(allViewPoints[2], allViewPoints[16]);
    connectViewPoints(allViewPoints[16], allViewPoints[17]);
    connectViewPoints(allViewPoints[17], allViewPoints[18]);
    connectViewPoints(allViewPoints[16], allViewPoints[18]);

    // connect 2 floor lest
    connectViewPoints(allViewPoints[3], allViewPoints[19]);

    // connect 23 lest
    connectViewPoints(allViewPoints[19], allViewPoints[20]);
    connectViewPoints(allViewPoints[20], allViewPoints[21]);
    connectViewPoints(allViewPoints[21], allViewPoints[22]);

    // connect 23 lest 3 floor
    connectViewPoints(allViewPoints[22], allViewPoints[27]);

    // connect 3 coridor
    connectViewPoints(allViewPoints[27], allViewPoints[28]);
    connectViewPoints(allViewPoints[27], allViewPoints[25]);
    connectViewPoints(allViewPoints[26], allViewPoints[25]);
    connectViewPoints(allViewPoints[25], allViewPoints[24]);
    connectViewPoints(allViewPoints[24], allViewPoints[23]);
    connectViewPoints(allViewPoints[28], allViewPoints[29]);
    connectViewPoints(allViewPoints[29], allViewPoints[30]);

    // connect 301
    connectViewPoints(allViewPoints[30], allViewPoints[34]);
    connectViewPoints(allViewPoints[34], allViewPoints[35]);
    connectViewPoints(allViewPoints[35], allViewPoints[36]);
    connectViewPoints(allViewPoints[34], allViewPoints[36]);

    // connect 302
    connectViewPoints(allViewPoints[29], allViewPoints[37]);
    connectViewPoints(allViewPoints[37], allViewPoints[38]);
    connectViewPoints(allViewPoints[37], allViewPoints[39]);
    connectViewPoints(allViewPoints[38], allViewPoints[39]);

    // connect 303
    connectViewPoints(allViewPoints[28], allViewPoints[40]);
    connectViewPoints(allViewPoints[40], allViewPoints[41]);
    connectViewPoints(allViewPoints[40], allViewPoints[42]);
    connectViewPoints(allViewPoints[41], allViewPoints[42]);

    // connect 306
    connectViewPoints(allViewPoints[25], allViewPoints[43]);
    connectViewPoints(allViewPoints[43], allViewPoints[44]);
    connectViewPoints(allViewPoints[45], allViewPoints[44]);
    connectViewPoints(allViewPoints[43], allViewPoints[45]);

    // connect 307
    connectViewPoints(allViewPoints[24], allViewPoints[46]);
    connectViewPoints(allViewPoints[46], allViewPoints[47]);
    connectViewPoints(allViewPoints[46], allViewPoints[48]);
    connectViewPoints(allViewPoints[47], allViewPoints[48]);

    // connect 308
    connectViewPoints(allViewPoints[23], allViewPoints[49]);
    connectViewPoints(allViewPoints[49], allViewPoints[50]);
    connectViewPoints(allViewPoints[49], allViewPoints[51]);
    connectViewPoints(allViewPoints[50], allViewPoints[51]);

    // connect eng lest
    connectViewPoints(allViewPoints[30], allViewPoints[52]);
    connectViewPoints(allViewPoints[52], allViewPoints[53]);
    connectViewPoints(allViewPoints[53], allViewPoints[54]);
    connectViewPoints(allViewPoints[54], allViewPoints[55]);
    connectViewPoints(allViewPoints[55], allViewPoints[56]);
    connectViewPoints(allViewPoints[56], allViewPoints[6]);

    // connect 300
    connectViewPoints(allViewPoints[53], allViewPoints[57]);
    connectViewPoints(allViewPoints[58], allViewPoints[59]);
    connectViewPoints(allViewPoints[58], allViewPoints[57]);
    connectViewPoints(allViewPoints[57], allViewPoints[59]);


    curViewPoint = allViewPoints[30];
    curViewPoint.activateAll();

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

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip = renderer.xr.getControllerGrip(0);
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
    Dummy.add(controllerGrip);

    scene.add(Dummy);
    scene.add(room);
    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    document.body.appendChild(VRButton.createButton(renderer));
}

function buildController(data: THREE.XRInputSource) {

    let geometry, material;

    switch (data.targetRayMode) {

        case 'tracked-pointer':

            geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
            material = new THREE.LineBasicMaterial({
                color: 0xff0000,
                linewidth: 10,
            });

            return new THREE.Line(geometry, material);
        case 'gaze':

            geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
            material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
            return new THREE.Mesh(geometry, material);
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
    curViewPoint = curViewPoint.renderScene();

    renderer.render(scene, camera);
}