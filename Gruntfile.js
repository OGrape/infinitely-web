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
                dest: 'dist/__public/assets/js/_infinitely_' + grunt.timeStamp + '.js',
            }
        },
        uglify: {
            build: {
                src: 'dist/__public/assets/js/_infinitely_' + grunt.timeStamp + '.js',
                dest: 'dist/__public/assets/js/_infinitely_' + grunt.timeStamp + '.min.js'
            }
        },
        imagemin: {
            options: {
                cache: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/__public/assets/raw',
                    src: [ '**/*.{png,jpg,gif}' ],
                    dest: 'dist/__public/assets/images'
                }]
            }
        },
        less: {
            production: {
                options: {
                    paths: [ 'dist/__public/assets/styles' ]
                },
                files: {
                    'dist/__public/assets/styles/__infinitely_.css': 'src/assets/styles/global.less'
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'dist/__public/assets/styles',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/__public/assets/styles',
                    ext: '.min.css'
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
        replace: {
            assets_generate: {
                src: ['dist/__template/*/*.ejs'],
                overwrite: true,
                replacements: [{
                    from: /\{\{infinitely_generate_time\}\}/g,
                    to: grunt.timeStamp
                }]
            }
        },
        convert_psd: {
            build: {
                src: 'pkg/psd/*.psd',
                dest: 'dist/__public/assets/raw'
            }
        }
    });

    grunt.registerMultiTask('convert_psd', 'Convert PSD files to PNG format', function() {
        var done = this.async(),
            fs = require('fs'),
            path = require('path'),
            parser = require('psd'),
            chalk = require('chalk'),
            totalSaved = 0;
        this.files.forEach(function(file) {
            grunt.log.writeln('Processing ' + file.src.length + ' files.');
            fs.mkdirSync(file.dest);
            file.src.forEach(function(f) {
                parser.open(f).then(function (psd) {
                    var dest = file.dest + '/' + path.basename(f, '.psd') + '.png';
                    grunt.log.writeln('File ' + chalk.cyan(dest) + ' created.');
                    return psd.image.saveAsPng(dest);
                }).then(function () {
                    totalSaved++;
                    if( totalSaved >= file.src.length) {
                        done(true);
                    }
                });
            });
        });
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('default', ['concat', 'uglify', 'less', 'cssmin', 'copy', 'replace', 'convert_psd', 'imagemin']);

};