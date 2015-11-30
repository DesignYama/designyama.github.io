var Bird = function () {
	var scope = this;

	THREE.Geometry.call( this );

	v(   6,   0,   0 ); //鳥の頭
	v( - 7, - 2,   1 ); //鳥の尻尾1
	v( - 7,   0,   0 ); //鳥の尻尾2
	v( - 5, - 2, - 1 );

	v(   0,   2, - 6 ); //羽根の長さ
	v(   0,   2,   6 ); //逆の羽根の長さ
	v(   3,   0,   0 ); //羽根の幅
	v( - 3,   0,   0 ); //羽根の幅

	f3( 0, 2, 1 );
	f3( 4, 7, 6 );
	f3( 5, 6, 7 );

	this.computeFaceNormals();

	function v( x, y, z ) {
		scope.vertices.push( new THREE.Vector3( x, y, z ) );
	}
	function f3( a, b, c ) {
		scope.faces.push( new THREE.Face3( a, b, c ) );
	}
}

Bird.prototype = Object.create( THREE.Geometry.prototype );
Bird.prototype.constructor = Bird;
