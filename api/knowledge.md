### How to kill process on specific port linux

Command is **kill -9 $(lsof -ti:portNumber)**
\nl

here's the command to kill process on port 7007:

pre.conr
kill -9 $(lsof -ti:7007)
pre.conr

### How to Authenticate to github API

We need to use [this](https://github.com/octokit/auth-app.js/) to authenticate to github (we use octokit/auth-app.js to generate a JWT token,
then exchanges it for an installation token and this installation token we will need for octokit/rest which is [here](https://github.com/octokit/rest.js)
to actually query for workflow data)

### Github Workflows

#### What Are GitHub Workflow Runs?

GitHub Workflow Runs are part of GitHub Actions, a built-in CI/CD (Continuous Integration/Continuous Deployment) platform that allows you to automate tasks in your software development lifecycle.

#### What Is a GitHub Workflow?

A GitHub workflow is a configurable, automated process that you define to handle repetitive tasks in your repository, such as building code, running tests, deploying applications, or even labeling issues. Workflows are written in YAML format and stored in files within the .github/workflows directory of your repository. You can have multiple workflows in a single repo, each tailored to different purposes (e.g., one for testing pull requests, another for deployments on releases). See [more](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows).

\nl

Workflows are _event-driven_: they kick off based on specific triggers, and they execute a series of jobs and steps on GitHub-hosted runners (virtual machines) or self-hosted ones.

#### How Are Workflows Structured?

Workflows follow a hierarchical structure defined in the YAML file. Here's a breakdown of the key components:

\nl

##### Triggers _(on)_

\nl

Events that start the workflow, such as code pushes, pull requests, issue creation, scheduled times (via cron), manual triggers, or external webhooks. GitHub checks the workflow file in the relevant branch or commit when an event occurs.

\nl

example in _.yaml_

pre.conr

on: [push, pull_request]
//or on:
schedule: - cron: '0 0 \* \* \*'
pre.conr

##### Jobs

The main units of work in a workflow. A workflow can have one or more jobs, which run in parallel by default (or sequentially if dependencies are set). Each job runs on a separate runner and consists of steps. Jobs can have names, conditions, and outputs.

\nl

example in _.yaml_:

pre.conr
jobs: build: runs-on: ubuntu-latest
pre.conr

##### Steps

Individual tasks within a job. A step can run a shell script you write or use a pre-built "action" (reusable code from the GitHub Marketplace or your own repo). Steps execute sequentially in a job.

\nl

example in _.yaml_:

pre.conr
steps: - name: Checkout code uses: actions/checkout@v4
//or

- run: npm test
  pre.conr

##### Runners and Environment

The execution environment (e.g., Ubuntu, Windows, macOS). GitHub provides variables like _GITHUB_SHA_ (commit hash) and _GITHUB_REF_ (branch/ref) during runs.

example in _.yaml_:

pre.conr
runs-on: ubuntu-latest
pre.conr


##### Other Elements

Includes permissions, concurrency controls, environment variables, secrets for secure data, and matrix strategies for running variations (e.g., testing across multiple OS versions).

\nl

example in _.yaml_:

pre.conr

strategy: matrix: os: [ubuntu-latest, windows-latest]

pre.conr

See more [here](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows)


#### What Do Workflow Runs Mean?

A workflow run is essentially an instance or execution of a workflow. When a triggering event matches the _on_ conditions in your YAML file, GitHub creates a new run using the workflow definition from the associated commit or branch. Each run is independent and represents a single pass through the workflow's jobs and steps.

\nl

What Happens in a Run?

\nl

The run progresses through the jobs and steps, logging outputs, statuses (success, failure, skipped, or cancelled), and any artifacts (like build files). You can monitor real-time progress, view logs for debugging, and see metrics like duration.

\nl

Status and History

\nl

Runs provide detailed insights into what worked or failed. For example, if a test step fails, the run marks the job as failed, and you can drill down into logs to troubleshoot.

### How to Stop stupid ZScaler service

run

pre.conr
sudo launchctl unload /Library/LaunchDaemons/com.zscaler.*
pre.conr

This unloads the service.

\nl

what does it mean to unload a service
Unloading a service means stopping it from running and removing it from the system’s active service list, at least temporarily. On macOS, services are managed by a system called _launchd_, and you can control them using the launchctl command in Terminal.

### How set up quick docker container postgres

pre.conr
docker run -d --name depo-postgres -p 5432:5432 -e POSTGRES_DB=depo -e POSTGRES_USER=depo -e POSTGRES_PASSWORD=yourpassword postgres
pre.conr

### How  fetch and checkout a single branch

pre.conr
git fetch origin branchName
git checkout branchName
pre.conr

### How compare 2 branches github no PR

pre.conr
  https://github.com/OWNER/REPO/compare/branchA...branchB
pre.conr

### How wildcard differs from domain in config

The difference between putting _azure.myDomain.com_ and _'*.azure.myDomain.com'_ in config file is the following:

\nl

The first one _azure.myDomain.com_ is an exact match so it will only allow requests to _https://azure.myDomain.com_, it is stricter and more secure.

\nl

The second one _'*.azure.myDomain.com'_ is a suffix match (a wildcard match) meaning it will allow requests to both _https://azure.myDomain.com_ and any subdomains
like _https://test.azure.myDomain.com_, _https://dev.azure.myDomain.com_ and so on...


### What did Joe eat last year?

Blue cheese with bacon
