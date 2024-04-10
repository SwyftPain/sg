import {Command} from '@oclif/core'
import inquirer from 'inquirer'
import {simpleGit} from 'simple-git'
const git = simpleGit()

export default class Save extends Command {
  static description = 'Push to github'

  static examples = [`$ sg save`]

  async run(): Promise<void> {
    async function runGitSave() {
      try {
        // Check if we're in a Git repository
        await git.checkIsRepo()
      } catch {
        console.error("You're not inside a Git repository.")
        return
      }

      try {
        const answers = await inquirer.prompt([
          {
            default: '.',
            message: 'Which files would you like to add? (default: . for all)',
            name: 'files',
            type: 'input',
          },
          {
            message: 'Enter your commit message:',
            name: 'commitMessage',
            type: 'input',
            validate: (input) => input.trim().length > 0 || 'Commit message cannot be empty.',
          },
          {
            async default() {
              const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD'])
              return currentBranch
            },
            message: 'Which branch would you like to push to? (default: current branch)',
            name: 'branch',
            type: 'input',
          },
        ])

        // Execute Git commands based on user input
        console.log('Adding files...')
        await git.add(answers.files)

        console.log('Committing changes...')
        await git.commit(answers.commitMessage)

        console.log(`Pushing to ${answers.branch}...`)
        await git.push('origin', answers.branch)

        console.log('Done!')
      } catch (error) {
        console.error(error)
      }
    }

    runGitSave().then(() => {

    }).catch(console.error)
  }
}
