# aurelia-bundler

[![ZenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.io)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains a library for bundling HTML, JavaScript and CSS for use with SystemJS.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/). If you have questions, we invite you to [join us on Gitter](https://gitter.im/aurelia/discuss). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome Extension and visit any of our repository's boards. You can get an overview of all Aurelia work by visiting [the framework board](https://github.com/aurelia/framework#boards).

## Example Gulp Task  

```javascript

var gulp = require('gulp');
var bundler = require('aurelia-bundler');

var bundles = {
  "dist/app-build": {                   // Should be within `baseURL`
    "includes": [
      "[*.js]",                         // Module names to be included in the bundle. May be a pattern too. eg. `*`, `**/**/*`, `[*]`
      "*.html!text",
      "*.css!text"
    ],
    "excludes": [
      "dist/donot-bundle"               // Module names to be excluded
    ],
    "options": {
      "inject": true,                   // Default is true
      "minify": true,                   // Default is false
      "htmlminopts": {
                                        // Supports all options here https://github.com/kangax/html-minifier#options-quick-reference 
      },
      "cssminopts" : {
                                        // Supports all options here https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-api 
      }
      "rev": true                       // Set it to true for revison suport. Default is false
    }
  },
  "dist/app-build": {
    "skip": true,                       // We can skip bundle. 
    "includes": [
      "[*]"
    ],
    "options": {
      "inject": true,
      "minify": true,
      "rev": true
    }
  },
  "view-bundle": {
    "skip" : true
    "htmlimport": true,                 // Set it to `true` for html import based view bundle.
    "includes": "dist/*.html",
    "options": {
      "inject": {                      // Default is false.
        "indexFile": "index.html",
        "destFile": "dest_index.html"
      }
    }
  },
  "dist/aurelia": {
    "includes": [
      "aurelia-framework",
      "aurelia-bootstrapper",
      "aurelia-fetch-client",
      "aurelia-router",
      "aurelia-animator-css",
      "aurelia-templating-binding",
      "aurelia-templating-resources",
      "aurelia-templating-router",
      "aurelia-loader-default",
      "aurelia-history-browser",
      "aurelia-logging-console",
      "bootstrap",
      "bootstrap/css/bootstrap.css!text"
    ],
    "options": {
      "inject": true,
      "minify": true,
      "rev": true
    }
  }
};

var config = {
  force: true,                    // Force overwrite bundle file if already exists. Default false
  baseURL: '.',                   // `baseURL of the application` 
  configPath: './config.js',      // `config.js` path. Must be within `baseURL` 
  bundles: bundles
};

gulp.task('unbundle', function() {
  return bundler.unbundle(config);
});

gulp.task('bundle', ['unbundle'],  function() {   // Running `unbundle` before bundling is a good practice.
  return bundler.bundle(config);
});

```

> Output file will be `baseURL/bundle/name.js`. 
