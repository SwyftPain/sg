import {Command} from '@oclif/core'
import inquirer from 'inquirer'
import {simpleGit} from 'simple-git'
const git = simpleGit()

export default class Update extends Command {
  static description = 'Pull the latest changes from GitHub'

  static examples = [`$ sg update`]

  async run(): Promise<void> {
    async function runGitUpdate() {
      try {
        // Check if we're in a Git repository
        await git.checkIsRepo()
      } catch {
        console.error("You're not inside a Git repository.")
        return
      }

      try {
        const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
        
        const answers = await inquirer.prompt([
          {
            default: true,
            message: `You're currently on branch '${currentBranch}'. Do you want to update this branch?`,
            name: 'confirmBranch',
            type: 'confirm',
          },
          {
            message: 'Which branch would you like to switch to and update?',
            name: 'branch',
            type: 'input',
            validate: input => input.trim().length > 0 || 'Branch name cannot be empty.',
            when: (answers) => !answers.confirmBranch,
          }
        ]);

        if (!answers.confirmBranch && answers.branch) {
          console.log(`Switching to branch '${answers.branch}'...`);
          await git.reset(['--hard', `origin/${answers.branch || currentBranch}`]);
          await git.checkout(answers.branch);
        }

        console.log(`Pulling latest changes for branch '${answers.branch || currentBranch}'...`);
        await git.pull('origin', answers.branch || currentBranch);
        await git.reset(['--hard', `origin/${answers.branch || currentBranch}`]);

        console.log('Update complete!');
      } catch (error) {
        console.error('Failed to update:', error);
      }
    }

    await runGitUpdate().catch(console.error);
  }
}
