module.exports = function(grunt) {

	// Load multiple grunt tasks using globbing patterns
	require('load-grunt-tasks')(grunt);

	// Project configuration
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		stylus: {
			compile: {
				options: {
					paths: ['admin/stylus', 'public/stylus'],
				},
				files: {
					'admin/css/admin.css': 'admin/stylus/admin.styl',
					'public/css/stylus.css': 'public/stylus/public.styl'
				}
			}
		},

		watch: {
			stylus: {
				files: ['admin/stylus/admin.styl', 'public/stylus/public.styl'],
				tasks: ['stylus'],
			}
		}

	});

	// Default task
	grunt.registerTask('default', 'watch');

};