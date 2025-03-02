# Generates the dependancy bundle for the plugin thread
browserify -r htmlparser2 -r cheerio -r dayjs -r urlencode > android/app/src/main/assets/plugin_deps/bundle.js