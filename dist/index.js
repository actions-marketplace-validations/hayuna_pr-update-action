module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(56);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 56:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(335);
const github = __webpack_require__(539);

async function run() {
  try {


    const inputs = {
      token: core.getInput('repo-token', { required: true }),
      bodyTemplate: core.getInput('body-template', { required: true }),
      replaceBody: (core.getInput('replace-body').toLowerCase() === 'true')
    }

    const branch = github.context.payload.pull_request.head.ref;
    core.debug(`branch: ${branch}`);
    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    }
    const PORT = `100${request.pull_number}`
    const body = github.context.payload.pull_request.body || '';
    const tokenRegex = new RegExp('%host%', "g");
    const processedBody = inputs.bodyTemplate.replace(tokenRegex, `http://hayuna.pl:${PORT}`);
    core.debug(`processedBody: ${processedBody}`);

    const updateBody = inputs.replaceBody
      ? body.toLowerCase() !== processedBody.toLowerCase()
      : !body.toLowerCase().startsWith(processedBody.toLowerCase());

    if (updateBody) {
      request.body = inputs.replaceBody
        ? processedBody
        : processedBody.concat('\n'.repeat(2), body);
      core.debug(`new body: ${request.body}`);
    } else {
      core.warning('PR body is up to date already - no updates made');
    }

    const client = new github.GitHub(inputs.token);
    const response = await client.pulls.update(request);

    core.info(`response: ${response.status}`);
    if (response.status !== 200) {
      core.error('Updating the pull request has failed');
    }
  }
  catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()


/***/ }),

/***/ 335:
/***/ (function(module) {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 539:
/***/ (function(module) {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ });