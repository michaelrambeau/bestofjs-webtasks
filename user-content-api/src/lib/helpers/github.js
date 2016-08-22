/* globals fetch */
const http = require('./http')

function createGithubRoutes (app, auth, sendError) {
  app.post('/create-issue', auth, (req, res, next) => {
    const body = req.body
    const { content, repo } = body
    if (!content) return sendError(res, '`content` is required')
    if (!repo) return sendError(res, '`repo` is required')
    const token = res.githubToken // added by the middleware
    createGithubIssue(repo, content, token)
      .then(result => res.json(result))
      .catch(err => sendError(res, err.message))
  })
}

function createIssueAddHero ({ repo, username, comment, token }) {
  const url = `https://github.com/${username}`
  const content = {
    title: `Add \`${username}\` user to the Hall of Fame`,
    body: `${url}\n${comment}
    `,
    labels: ['user request', 'add hero', 'valid']
  }
  return createGithubIssue(repo, content, token)
}

function createIssueAddProject ({ repo, project, comment, token }) {
  const url = `https://github.com/${project}`
  const content = {
    title: `Add \`${project}\` project`,
    body: `${url}\n${comment}
    `,
    labels: ['user request', 'add project', 'valid']
  }
  return createGithubIssue(repo, content, token)
}

// Generic function to create an issue in a given Github repo
function createGithubIssue (repo, content, token) {
  console.log('Create an issue', repo, content, token.length)
  const url = `https://api.github.com/repos/${repo}/issues`
  const options = {
    body: JSON.stringify(content),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${token}`
    }
  }
  return fetch(url, options)
    .then(r => http.checkStatus(r))
    .then(r => r.json())
}

module.exports = {
  createGithubRoutes,
  createIssueAddHero,
  createIssueAddProject
}
