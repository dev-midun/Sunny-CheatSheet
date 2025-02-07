import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { glob } from 'glob';

function GetFilesArray(query) {
    return glob.sync(query);
}

const cssFiles = GetFilesArray('resources/css/pages/**/*.scss');
const jsFiles = GetFilesArray('resources/js/pages/**/*.js');

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.scss',
                ...cssFiles,
                'resources/js/app.js',
                'resources/js/velzon/layout.js',
                'resources/js/velzon/app.js',
                ...jsFiles
            ],
            refresh: true,
        }),
    ],
});