module.exports = function(grunt) {

    grunt.timeStamp = new Date().getTime();

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {   
            dist: {
                src: [
                    'src/assets/js/vendor/*.js',
                    'src/assets/js/global.js'
                ],
                dest: 'dist/__assets/js/_infinitely_' + grunt.timeStamp + '.js',
            }
        },
        uglify: {
            build: {
                src: 'dist/__assets/js/_infinitely_' + grunt.timeStamp + '.js',
                dest: 'dist/__assets/js/_infinitely_' + grunt.timeStamp + '.min.js'
            }
        },
        imagemin: {
            options: {
                cache: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: [ '**/*.{ png, jpg, gif }' ],
                    dest: 'dist/'
                }]
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src/infinitely/',
                src: '**',
                dest: 'dist/',
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['concat', 'uglify', 'imagemin', 'copy']);

};