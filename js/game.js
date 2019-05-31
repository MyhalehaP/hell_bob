var scene, camera, renderer, mesh, clock;
var keyboard = {};
var player = {
  height: 1.8,
  speed: 0.1,
  turnSpeed: Math.PI * 0.02,
  canShoot: 0
};
var meshFloor;
var speed_run = 0.01;
var waves = 0;
var crate, crateTexture, crateNormalMap, crateBumpMap;
var sound, gun_sound, back_sound, appear;

var loadingScreen = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(90, 1024 / 576, 0.1, 1000),
  box: new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.5),
    new THREE.MeshBasicMaterial({
      color: "red"
    })
  )



};


var loadingManager = null;
var RESOURCES_LOADED = false;

//Models index
var models = {
  patrick: {
    obj: "models/patrick.obj",
    mtl: "models/patrick.mtl",
    mesh: null
  },
  gun: {
    obj: "models/machinegun.obj",
    mtl: "models/machinegun.mtl",
    mesh: null,
    castShadow: false
  },
  pumpkin: {
    obj: "models/pumpkin2.obj",
    mtl: "models/pumpkin2.mtl",
    mesh: null
  },
  column: {
    obj: "models/columnLarge.obj",
    mtl: "models/columnLarge.mtl",
    mesh: null
  }
};

//Meshes index
var meshes = {};
//Enemy

var health = [];
//Bullets array
var bullets = [];

//text
var over_text;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000);

  clock = new THREE.Clock();

  loadingScreen.box.position.set(0, 0, 5);
  loadingScreen.camera.lookAt(loadingScreen.box.position);
  loadingScreen.scene.add(loadingScreen.box);

  loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);

  };

  loadingManager.onLoad = function() {
    console.log("Loaded all reosources");
    RESOURCES_LOADED = true;
    onResourcesLoaded();
  };


  var listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);
  gun_sound = new THREE.Audio(listener);
  back_sound = new THREE.Audio(listener);
  appear = new THREE.Audio(listener);

  var audioLoader = new THREE.AudioLoader(loadingManager);

  audioLoader.load('sound/die.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
  });

  audioLoader.load('sound/gun.mp3', function(buffer) {
    gun_sound.setBuffer(buffer);
    gun_sound.setVolume(0.25);
  });



  audioLoader.load('sound/obsession.mp3', function(buffer) {
    back_sound.setBuffer(buffer);
    back_sound.setVolume(0.2);
    back_sound.setLoop(true);
    back_sound.play();
  });

  audioLoader.load('sound/zap.mp3', function(buffer) {
    appear.setBuffer(buffer);
    appear.setVolume(0.25);
  });

  var loader = new THREE.FontLoader(loadingManager);

  loader.load('fonts/Preview_Regular.json', function(font) {

    var textGeo = new THREE.TextGeometry("Game Over", {

      font: font,
      size: 16,
      height: 1,
      curveSegments: 16,
      bevelThickness: 2,
      bevelSize: 1,
      bevelEnabled: true

    });

    var textMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000
    });

    over_text = new THREE.Mesh(textGeo, textMaterial);
    over_text.position.set(20, 1, 0);
    over_text.rotation.set(0, Math.PI, 0);
    over_text.scale.set(0.3, 0.3, 0.3);


  });


  var skygeom = new THREE.CubeGeometry(1000, 1000, 1000);
  var skyMaterials = [
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("textures/hell_ft.png"),
      side: THREE.DoubleSide
    }),

    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("textures/hell_bk.png"),
      side: THREE.DoubleSide
    }),

    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("textures/hell_up.png"),
      side: THREE.DoubleSide
    }),

    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("textures/hell_dn.png"),
      side: THREE.DoubleSide
    }),

    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("textures/hell_rt.png"),
      side: THREE.DoubleSide
    }),

    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("textures/hell_lf.png"),
      side: THREE.DoubleSide
    })
  ];
  var skymat = new THREE.MeshFaceMaterial(skyMaterials);
  var skybox = new THREE.Mesh(skygeom, skymat);
  scene.add(skybox);

  mesh = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 1),
    new THREE.MeshPhongMaterial({
      color: "blue",
      opacity: 0,
      transparent: true
    })
  );
  mesh.position.set(0, 1, -15);
  scene.add(mesh);

  back_red = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 1),
    new THREE.MeshPhongMaterial({
      color: "red",
      opacity: 0,
      transparent: true
    })
  );
  back_red.position.set(0, 1, -26);
  scene.add(back_red);

  left_red = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 1),
    new THREE.MeshPhongMaterial({
      color: "red",
      opacity: 0,
      transparent: true
    })
  );
  left_red.position.set(26, 1, 0);
  left_red.rotation.set(0, Math.PI / 2, 0);
  scene.add(left_red);

  right_red = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 1),
    new THREE.MeshPhongMaterial({
      color: "red",
      opacity: 0,
      transparent: true
    })
  );
  right_red.position.set(-26, 1, 0);
  right_red.rotation.set(0, Math.PI / 2, 0);
  scene.add(right_red);

  front_red = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 1),
    new THREE.MeshPhongMaterial({
      color: "red",
      opacity: 0,
      transparent: true
    })
  );
  front_red.position.set(0, 1, 26);
  front_red.receiveShadow = true;
  front_red.castShadow = true;
  scene.add(front_red);

  var textureLoader = new THREE.TextureLoader();
  var floorTexture = new textureLoader.load("textures/ground.jpg");

  meshFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50, 64, 64),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: floorTexture
    })

  );
  meshFloor.rotation.x -= Math.PI / 2;
  meshFloor.receiveShadow = true;
  scene.add(meshFloor);

  var ambientLight = new THREE.AmbientLight("#f95e5e", 0.5);
  scene.add(ambientLight);
  //c61919
  var light = new THREE.DirectionalLight("#f72e2e", 1, 5);
  light.position.set(0, 50, -10);
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 25;
  scene.add(light);

  //Load models
  for (var _key in models) {
    (function(key) {
      var mtlLoader = new THREE.MTLLoader(loadingManager);
      mtlLoader.load(models[key].mtl, function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader(loadingManager);
        objLoader.setMaterials(materials);
        objLoader.load(models[key].obj, function(mesh) {
          mesh.traverse(function(node) {
            if (node instanceof THREE.Mesh) {

              if ('castShadow' in models[key]) node.castShadow = models[key].castShadow;
              else node.castShadow = true;

              if ('receiveShadow' in models[key]) node.castShadow = models[key].castShadow;
              else node.receiveShadow = true;
            }
          });

          models[key].mesh = mesh;

        });
      });

    })(_key);


  }

  for (var i = 0; i < 10000; i += 1) health[i] = 100;

  camera.position.set(0, player.height, -20);
  camera.lookAt(new THREE.Vector3(0, player.height, 0));

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(1024, 576);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  document.body.appendChild(renderer.domElement);

  animate();
}

//Runs when all resources are loaded
function onResourcesLoaded() {

  for (var i = 0; i < 10; i += 1) {
    meshes[i] = models.patrick.mesh.clone();
    meshes[i].position.set((2.5 * i) + i - 12, 0, 3);
    meshes[i].rotation.set(0, Math.PI, 0);
    meshes[i].scale.set(2, 2, 2);
    scene.add(meshes[i]);
  }

  for (var i = 10; i < 20; i += 1) {
    meshes[i] = models.patrick.mesh.clone();
    meshes[i].position.set((2.5 * i - 50) + i, 0, 10);
    meshes[i].rotation.set(0, Math.PI, 0);
    meshes[i].scale.set(2, 2, 2);
    scene.add(meshes[i]);
  }

  for (var i = 20; i < 30; i += 1) {
    meshes[i] = models.patrick.mesh.clone();
    meshes[i].position.set((2.5 * i - 85) + i, 0, 15);
    meshes[i].rotation.set(0, Math.PI, 0);
    meshes[i].scale.set(2, 2, 2);
    scene.add(meshes[i]);
  }

  //pumpkins
  for (var i = 31; i < 45; i += 1) {
    meshes[i] = models.pumpkin.mesh.clone();
    meshes[i].position.set((2.5 * i - 132) + i, 0, -15);
    meshes[i].scale.set(5, 5, 5);
    scene.add(meshes[i]);
  }

  //columnLarge
  meshes[45] = models.column.mesh.clone();
  meshes[45].position.set(-24, 0, -24);
  meshes[45].scale.set(7, 10, 7);
  scene.add(meshes[45]);

  meshes[46] = models.column.mesh.clone();
  meshes[46].position.set(24, 0, -24);
  meshes[46].scale.set(7, 10, 7);
  scene.add(meshes[46]);

  meshes[47] = models.column.mesh.clone();
  meshes[47].position.set(-24, 0, 24);
  meshes[47].scale.set(7, 10, 7);
  scene.add(meshes[47]);

  meshes[48] = models.column.mesh.clone();
  meshes[48].position.set(24, 0, 24);
  meshes[48].scale.set(7, 10, 7);
  scene.add(meshes[48]);

  //player weapon

  meshes["playerweapon"] = models.gun.mesh.clone();
  meshes["playerweapon"].position.set(5, 1, 0);
  meshes["playerweapon"].scale.set(10, 10, 10);
  scene.add(meshes["playerweapon"]);
}


function again() {
  appear.play();
  waves += 1;
  speed_run += 0.01;
  for (var i = 0; i < 30; i += 1) health[i] = 100;

  for (var i = 0; i < 10; i += 1) {
    meshes[i] = models.patrick.mesh.clone();
    meshes[i].position.set((2.5 * i) + i - 12, 0, 3);
    meshes[i].rotation.set(0, Math.PI, 0);
    meshes[i].scale.set(2, 2, 2);
    scene.add(meshes[i]);
  }

  for (var i = 10; i < 20; i += 1) {
    meshes[i] = models.patrick.mesh.clone();
    meshes[i].position.set((2.5 * i - 50) + i, 0, 10);
    meshes[i].rotation.set(0, Math.PI, 0);
    meshes[i].scale.set(2, 2, 2);
    scene.add(meshes[i]);
  }

  for (var i = 20; i < 30; i += 1) {
    meshes[i] = models.patrick.mesh.clone();
    meshes[i].position.set((2.5 * i - 85) + i, 0, 15);
    meshes[i].rotation.set(0, Math.PI, 0);
    meshes[i].scale.set(2, 2, 2);
    scene.add(meshes[i]);
  }

}
var done = false;
var g_o = 0;

function game_over() {

  sound.play();
  g_o = 1;
  done = false;
  window.removeEventListener('keydown', keyDown);
  for (var i = 31; i < 45; i += 1) scene.remove(meshes[i]);
  document.getElementById("record").innerHTML = "S C O R E: " + waves;
  scene.add(over_text);

  camera.position.set(1, 5, -20);
  camera.rotation.set(0, Math.PI - 0.02, 0);
  scene.remove(meshes["playerweapon"]);
  player.speed = 0;
  player.turnSpeed = 0;
}

function animate() {
  if (RESOURCES_LOADED == false) {
    requestAnimationFrame(animate);


    if (loadingScreen.box.position.x > -3) loadingScreen.box.position.x -= 0.1;
    else loadingScreen.box.position.x = 3;


    renderer.render(loadingScreen.scene, loadingScreen.camera);
    return;
  }

  requestAnimationFrame(animate);

  var time = Date.now() * 0.0005;
  var delta = clock.getDelta();
  var box = new THREE.Box3().setFromObject(mesh);

  var check = true;

  for (var i = 0; i < 30; i += 1) {
    if (health[i] <= 0) continue;
    else {
      check = false;
      break;
    }
  }

  if (check) {
    check = false;
    again();
  }

  for (var i = 0; i < 30; i += 1) {
    if (health[i] <= 0) continue;
    else {
      meshes[i].position.z -= speed_run;

      var target = new THREE.Box3().setFromObject(meshes[i]);

      if (target.isIntersectionBox(box)) {
        if (g_o == 0) game_over();
      }
    }

  }

  var pl = new THREE.Box3().setFromObject(meshes["playerweapon"]);
  var back = new THREE.Box3().setFromObject(back_red);
  var left = new THREE.Box3().setFromObject(left_red);
  var right = new THREE.Box3().setFromObject(right_red);
  var front = new THREE.Box3().setFromObject(front_red);

  if (pl.isIntersectionBox(back) || pl.isIntersectionBox(left) || pl.isIntersectionBox(right) || pl.isIntersectionBox(front)) done = true;

  if (done == true) {
    camera.position.y -= 1;
  }

  if (camera.position.y <= -500) game_over();

  for (var index = 0; index < bullets.length; index += 1) {

    var bullet = new THREE.Box3().setFromObject(bullets[index]);

    for (var i = 0; i < 30; i += 1) {
      if (health[i] > 0) {
        var target = new THREE.Box3().setFromObject(meshes[i]);
        if (bullet.isIntersectionBox(target)) {
          health[i] -= 100;
          if (health[i] <= 0) {
            bullets[index].alive = false;
            scene.remove(meshes[i]);



          }
          scene.remove(bullets[index]);

        }
      } else continue;
    }

    if (bullets[index] == undefined) continue;
    if (bullets[index].alive == false) {
      bullets.splice(index, 1);
      continue;
    }
    bullets[index].position.add(bullets[index].velocity);
  }


  if (keyboard[87]) { // W
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }

  if (keyboard[83]) { // S
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }

  if (keyboard[65]) { // A
    camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
  }

  if (keyboard[68]) { // D
    camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
  }

  if (keyboard[37]) {
    camera.rotation.y -= player.turnSpeed;
  }

  if (keyboard[39]) {
    camera.rotation.y += player.turnSpeed;
  }

  if (keyboard[32] && player.canShoot <= 0) { //spacebar
    gun_sound.play();
    var bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 32, 32),
      new THREE.MeshBasicMaterial({
        color: "#F3D15A"
      })
    );

    bullet.position.set(
      meshes["playerweapon"].position.x,
      meshes["playerweapon"].position.y + 0.05,
      meshes["playerweapon"].position.z

    );

    bullet.velocity = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      0,
      Math.cos(camera.rotation.y)

    );

    bullet.alive = true;
    setTimeout(
      function() {
        bullet.alive = false;
        scene.remove(bullet);
      }, 1000);
    bullets.push(bullet);
    scene.add(bullet);

    player.canShoot = 25;
  }

  if (player.canShoot > 0) player.canShoot -= 1;
  //position the gun in front of player

  meshes["playerweapon"].position.set(
    camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 0.6,
    camera.position.y - 0.5 + Math.sin(time * 6 + camera.position.x + camera.position.z) * 0.01,
    camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 0.6


  );

  meshes["playerweapon"].rotation.set(
    camera.rotation.x,
    camera.rotation.y + Math.PI,
    camera.rotation.z


  );
  renderer.render(scene, camera);

}


function keyDown(event) {
  keyboard[event.keyCode] = true;
}

function keyUp(event) {
  keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.onload = init;
