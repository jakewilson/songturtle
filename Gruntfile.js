module.exports = function(grunt) {

  var paths = [
    'util.js',
    'waveform.js',
    'song.js',
    'renderer.js',
    'index.js'
  ].map((it) => {
    return 'src/' + it
  })
  .concat(
    [
      'cbuffer.js',
      'dsp.js',
      'phase_vocoder.js',
      'buffered-pv.js'
    ].map(it => 'lib/' + it)
  );

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
