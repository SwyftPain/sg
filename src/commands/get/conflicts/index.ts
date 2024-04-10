import {Command} from '@oclif/core'
import inquirer from 'inquirer'
import {simpleGit} from 'simple-git'
const git = simpleGit()

export default class Conflicts extends Command {
  static description = 'Synchronize the branch with the latest changes, ready for conflict resolution in IDE'

  static examples = [
    `$ sg get conflicts`
  ]

  async run(): Promise<void> {
    async function runGitSync() {
      try {
        // Check if we're in a Git repository
        await git.checkIsRepo()
      } catch {
        console.error("You're not inside a Git repository.")
        return
      }

      const {branch} = await inquirer.prompt([
        {
          message: 'Enter the branch name to sync with:',
          name: 'branch',
          type: 'input',
          validate: input => input.trim().length > 0 || 'Branch name cannot be empty.',
        }
      ]);

      try {
        console.log(`Fetching updates from '${branch}'...`);
        await git.fetch('origin', branch);

        const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
        if (currentBranch !== branch) {
          console.log(`Checking out to '${branch}'...`);
          await git.checkout(branch);
        }

        console.log(`Merging updates from '${branch}' into current branch...`);
        await git.merge(['origin', branch]);

        console.log('Synchronization complete. Ready for conflict resolution if any.');
      } catch (error) {
        console.error('Failed to synchronize:', error);
      }
    }

    await runGitSync().catch(console.error);
  }
}
