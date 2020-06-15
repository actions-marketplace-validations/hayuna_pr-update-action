const core = require('@actions/core');
const github = require('@actions/github');

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
