/**
 * Copyright 2014 ブドウの鳥 [develo.pe]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
                dest: 'dist/__public/assets/js/_infinitely_.js',
            }
        },
        uglify: {
            build: {
                src: 'dist/__public/assets/js/_infinitely_.js',
                dest: 'dist/__public/assets/js/_infinitely_.min.js'
            }
        },
        imagemin: {
            options: {
                cache: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/__public/assets/images',
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
        convert_psd: {
            build: {
                src: 'pkg/psd/*.psd',
                dest: 'dist/__public/assets/images'
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

    // grunt.registerTask('default', ['concat', 'uglify', 'less', 'cssmin', 'copy', 'replace', 'convert_psd', 'imagemin']);
    grunt.registerTask('default', ['concat', 'uglify', 'less', 'cssmin', 'copy', 'convert_psd']);

};