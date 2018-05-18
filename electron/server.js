const Bluebird = require('bluebird');
const JiraApi = require('jira-client');

const config = require('./config.json');

const jira = new JiraApi({
  protocol: 'https',
  host: config.jira.host,
  username: config.jira.username,
  password: config.jira.password,
  apiVersion: '2',
  strictSSL: true
});

const sendMessage = Bluebird.promisify(require('gmail-send')({
  user: config.email.username,
  pass: config.email.password,
  from: config.email.from,
  to: config.email.recipient,
  subject: 'Report'
}));

const mailTemplate = `
##MESSAGE##

@windmill-frontend
##WORKLOGS##
Spent: ##HOURS##h`;

async function onSubmit(event, arg) {
  const data = arg;

  let totalTime = 0;
  const descriptions = [];

  const promises = [];

  let jiraResponse = '';
  let gmailResponse = '';

  data.tasks.forEach(({id: taskId, workLogs}) => {
    workLogs.forEach(({id, description, time: spentTime}) => {
      totalTime += Number(spentTime);
      descriptions.push(`- ${description}`);

      if (config.jira.enabled) {
        promises.push(
          jira.addWorklog(taskId, {
            comment: id ? `${id}: ${description}` : description,
            timeSpentSeconds: hoursToSeconds(spentTime)
          }, '0d')
        );
      }
    })
  });

  if (config.jira.enabled) {
    try {
      jiraResponse = await Promise.all(promises);
    } catch (e) {
      jiraResponse = e;
    }
  }

  const text = mailTemplate
    .replace(/##MESSAGE##/, data.message)
    .replace(/##WORKLOGS##/, descriptions.join('\n'))
    .replace(/##HOURS##/, totalTime.toString());

  if (config.email.enabled) {
    try {
      gmailResponse = await sendMessage({text});
    } catch (e) {
      gmailResponse = e;
    }
  } else {
    console.log(text);
  }

  event.sender.send('submit-reply', {
    status: 'SUCCESS',
    jira: jiraResponse,
    gmail: gmailResponse
  })
}

async function findIssue(event) {
  try {
    const [my, wm] = await Promise.all([
      jira.searchJira('assignee in (currentUser()) ORDER BY updated DESC, lastViewed ASC', {maxResults: 100}),
      jira.searchJira('project=WMINT ORDER BY created ASC', {maxResults: 100})
    ]);
    event.sender.send('findIssue', {issues: [...my.issues, ...wm.issues]});
  } catch (e) {
    console.log(e);
  }
}

function hoursToSeconds(hours) {
  return Number(hours) * 60 * 60;
}


module.exports.onSubmit = onSubmit;
module.exports.findIssue = findIssue;
