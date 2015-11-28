// Based on http://www.openprocessing.org/visuals/?visualID=6910
var Boid = function() {
  var vector = new THREE.Vector3(),
  _acceleration, _width = 400, _height = 500, _depth = 400, _goal, _neighborhoodRadius = 100,
  _maxSpeed = 4, _maxSteerForce = 0.36, _avoidWalls = false;
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();

  this.setGoal = function ( target ) {
    _goal = target;
  };

  this.setAvoidWalls = function ( value ) {
    _avoidWalls = value;
  };

  this.setWorldSize = function ( width, height, depth ) {
    _width = width;
    _height = height;
    _depth = depth;
  };

  this.run = function ( boids ) {
    if ( _avoidWalls ) {
      vector.set( - _width, this.position.y, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( _width, this.position.y, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, - _height, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, _height, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, this.position.y, - _depth );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, this.position.y, _depth );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );
    }

    if ( Math.random() > 0.5 ) {
      this.flock( boids );
    }
    this.move();
  };

  this.flock = function ( boids ) {
    if ( _goal ) {
      _acceleration.add( this.reach( _goal, 0.005 ) );
    }
    _acceleration.add( this.alignment( boids ) );
    _acceleration.add( this.cohesion( boids ) );
    _acceleration.add( this.separation( boids ) );
  };

  this.move = function () {
    this.velocity.add( _acceleration );
    var l = this.velocity.length();
    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }
    this.position.add( this.velocity );
    _acceleration.set( 0, 0, 0 );
  };

  this.checkBounds = function () {
    if ( this.position.x >   _width ) this.position.x = - _width;
    if ( this.position.x < - _width ) this.position.x =   _width;
    if ( this.position.y >   _height ) this.position.y = - _height;
    if ( this.position.y < - _height ) this.position.y =  _height;
    if ( this.position.z >  _depth ) this.position.z = - _depth;
    if ( this.position.z < - _depth ) this.position.z =  _depth;
  };


  this.avoid = function ( target ) {
    var steer = new THREE.Vector3();
    steer.copy( this.position );
    steer.sub( target );
    steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );
    return steer;
  };

  this.repulse = function ( target ) {

    var distance = this.position.distanceTo( target );

    if ( distance < 150 ) {
      var steer = new THREE.Vector3();
      steer.subVectors( this.position, target );
      steer.multiplyScalar( 0.5 / distance );
      _acceleration.add( steer );
    }
  };

  this.reach = function ( target, amount ) {
    var steer = new THREE.Vector3();
    steer.subVectors( target, this.position );
    steer.multiplyScalar( amount );
    return steer;
  };

  this.alignment = function ( boids ) {
    var boid, velSum = new THREE.Vector3(),
    count = 0;
    for ( var i = 0, il = boids.length; i < il; i++ ) {
      if ( Math.random() > 0.6 ) continue;
      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );
      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        velSum.add( boid.velocity );
        count++;
      }
    }
    if ( count > 0 ) {
      velSum.divideScalar( count );
      var l = velSum.length();
      if ( l > _maxSteerForce ) {
        velSum.divideScalar( l / _maxSteerForce );
      }
    }
    return velSum;
  };

  this.cohesion = function ( boids ) {
    var boid, distance,
    posSum = new THREE.Vector3(),
    steer = new THREE.Vector3(),
    count = 0;
    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;
      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );
      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        posSum.add( boid.position );
        count++;
      }
    }
    if ( count > 0 ) {
      posSum.divideScalar( count );
    }
    steer.subVectors( posSum, this.position );
    var l = steer.length();
    if ( l > _maxSteerForce ) {
      steer.divideScalar( l / _maxSteerForce );
    }
    return steer;
  };

  this.separation = function ( boids ) {
    var boid, distance,
    posSum = new THREE.Vector3(),
    repulse = new THREE.Vector3();

    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;
      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        repulse.subVectors( this.position, boid.position );
        repulse.normalize();
        repulse.divideScalar( distance );
        posSum.add( repulse );
      }
    }
    return posSum;
  }
}

var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var camera, light, scene, renderer, mountain;
var birds, bird;
var boid, boids;
var angle = 360;
var deg;
var rotate = 0;
init();
animate();


function init() {
  scene = new THREE.Scene();
  birds = [];
  boids = [];

  camera = new THREE.PerspectiveCamera( 50, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 ); // カメラの設定
  camera.position.set(0,-10,400);
  camera.lookAt( 0,0,0 );

  light = new THREE.DirectionalLight(0xffffff, 1.4); // 光源の設定
  light.position.set(-25,-40,600);
  scene.add( light );

  mountain = new THREE.Mesh( // 山の設定
    new THREE.TetrahedronGeometry( 111,0 ), // 半径111の正四面体の分割 0回
    new THREE.MeshLambertMaterial( { color: 0x00B482 } )
  );
  mountain.rotation.x = -0.78;
  mountain.rotation.y = 0;
  mountain.rotation.z = 0.78;
  scene.add( mountain );


  for ( var i = 0; i < 77; i ++ ) { // 鳥の数
    boid = boids[ i ] = new Boid();
    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 400 - 200;
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
    boid.setAvoidWalls( true );
    boid.setWorldSize( 500, 500, 400 );
    bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.68, side: THREE.DoubleSide } ) );
    bird.phase = Math.floor( Math.random() * 62.83 );
    scene.add( bird );
  }

  renderer = new THREE.CanvasRenderer(); // canvas の設定
  renderer.setClearColor( 0x00C8FF ); // 背景色
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT ); // canvas の幅・高さ
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );
  onWindowResize();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
  var vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );
  for ( var i = 0, il = boids.length; i < il; i++ ) {
    boid = boids[ i ];
    vector.z = boid.position.z;
    boid.repulse( vector );
  }
}

function animate() {
  requestAnimationFrame( animate );
  rotate = (rotate > 359)?0:rotate + 1;
  mountain.rotation.x += -0.0008;
  mountain.rotation.y += -0.0012;
  render( );
}

function render() {
  for ( var i = 0, il = birds.length; i < il; i++ ) {
    boid = boids[ i ];
    boid.run( boids );

    bird = birds[ i ];
    bird.position.copy( boids[ i ].position );

    bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
    bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

    bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
    bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;
  }
  document.getElementById('canvas').appendChild( renderer.domElement ); // canvas をレンダリスングする場所
  renderer.render( scene, camera );
}
