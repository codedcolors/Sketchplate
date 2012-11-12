//#Hooks
//provides automated functionality to perform on already existing projects
var colors = require('./colors'),
	os = require('os'),
	spawn = require('child_process').spawn;

exports.initRepo = function( location, fn ){
	var git = spawn( 'git', ['init', location] ).on('exit', function( code ){
		if( fn ) fn( code );
	});
	git.stdout.setEncoding('utf8');
	git.stdout.on('data', function ( data ){
		console.log(colors.red+data.replace(/\n/,'')+colors.reset);
	});
};

exports.npmInstall = function( location, fn ){
	var npmInstall = spawn( 'npm', ['install'], { cwd: location } )
		.on('exit', function( code ){
			if( fn ) fn( code );
		});
	npmInstall.stdout.setEncoding('utf8');
	npmInstall.stdout.on('data', function( data ){
		console.log( data );
	});
};
exports.openInEditor = function( editorArgs, location, fn ){
	var err = null;
	var params = editorArgs.slice(0);
	var cmd = params.shift();
	var pathIndex = params.indexOf("%path");
	if( pathIndex > -1 ){
		params.splice( pathIndex, 1, location );
	} else {
		params.push( location );
	}
	//console.log( cmd + ': ', params );
	spawn( cmd, params ).on('exit', function ( code ){
		if( code !== 0){
			err = Error(colors.red+'Editor exited with code '+ code+colors.reset);
		}
		if ( fn ) fn( err );
	});
};

exports.openInFileBrowser = function( location, fn ){
	var commands = {
		'darwin': 'open',
		'win32': 'explorer',
		'linux': 'nautilus'
	};
	var cmd = commands[ os.platform() ];
	spawn( cmd, [location] ).on('exit', function( code ) {
		var err;
		if( code !== 0 ){
			err = Error( colors.red + 'Error opening folder in file browser, exited with code '+ code );
		}
		if( fn ){
			fn( err );
		}
	});
};

//###Project constructor _`hooks.Project`_
//provides functionality on created-projects
//after the template has been copied
function Project ( location, editorArgs ){
	this.location = location;
	this.editorArgs = editorArgs;
}

Project.prototype = {
	constructor: Project,
	//####project.initRepo(function (){})
	//initializes a git repository at the specified location
	//
	//*	**{Function}** _[fn]_ callback, receieves error object in params
	initRepo: function ( fn ){
		exports.initRepo( this.location, fn );
		return this;
	},
	//####project.npmInstall(function (){})
	//run an npm install on the project
	//
	//*	**{Function}**	_[fn]_ callback, receives error object in params
	npmInstall: function( fn ){
		exports.npmInstall( this.location, fn );
		return this;
	},
	//####project.openInEditor(function (){})
	//opens location in text editor using _editorArgs_
	//
	//*	**{Function}** _[fn]_ optional callback, receives error as callback param
	openInEditor: function ( fn ){
		exports.openInEditor( this.editorArgs, this.location, fn );
		return this;
	},
	//####project.openInFileBrowser(function(){})
	//opens location in file browsers: Finder _(OSX)_, Explorer _(Win)_ or Nautilus _(Linux)_
	//
	//*	**{Function}** _[fn]_ optional callback
	openInFileBrowser: function( fn ) {
		exports.openInFileBrowser( this.location, fn );
		return this;
	}
};



exports.Project = Project;