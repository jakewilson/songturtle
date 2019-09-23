module.exports = function(grunt) {

  var paths = [
    'Song.js',
    'index.js',
  ].map((it) => {
    return 'src/' + it
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: paths,
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify-es');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};
