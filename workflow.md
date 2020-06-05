Git workflow for contributors
=============================

### 1. [Fork](http://help.github.com/fork-a-repo/) the repository on GitHub and clone your fork to your development environment

```
git clone git@github.com:YOUR-GITHUB-USERNAME/dg.git
```

If you have trouble setting up Git with GitHub in Linux, or are getting errors like "Permission Denied (publickey)",
then you must [setup your Git installation to work with GitHub](http://help.github.com/linux-set-up-git/)

### 2. Add this repository as an additional git remote called "upstream"

Change to the directory where you cloned your project, normally, "dg". Then enter the following command:

```
git remote add upstream git://github.com/fl0v/dg.git
```

Working on bugs and features
----------------------------

### 1. Pull the latest code from the main branch

```
git pull upstream
```

You should start at this point for every new contribution to make sure you are working on the latest code.

### 2. Create a new branch for your feature/bugfix based on the current master branch

> That's very important

Each separate bug fix or change should go in its own branch. Branch names should be descriptive and start with 'bugfix' or 'feature' as in example:

```
git checkout upstream/master
git checkout -b bugfix-the-planets-list-conflicts-with-another-script
```

```
git checkout upstream/master
git checkout -b feature-message-planet-owner
```

### 3. Do your magic

Make sure it works :)

### 4. Commit your changes

add the files/changes you want to commit to the [staging area](http://git.github.io/git-reference/basic/#add) with

```
git add path/to/my/file
```

You can use the `-p` option to select the changes you want to have in your commit.

Commit your changes with a descriptive commit message.

```
git commit -m "A brief description of this change which fixes some bug"
```

### 5. Pull the latest code updates from upstream into your branch

```
git pull upstream master
```

This ensures you have the latest code in your branch before you open your pull request. If there are any merge conflicts,
you should fix them now and commit the changes again.

### 6. Having resolved any conflicts, push your code to GitHub

```
git push -u origin name-of-your-branch-goes-here
```

The `-u` parameter ensures that your branch will now automatically push and pull from the GitHub branch. That means
if you type `git push` the next time it will know where to push to. This is useful if you want to later add more commits
to the pull request.

### 7. Open a [pull request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/) against upstream.

Go to your repository on GitHub and click "Pull Request", choose your branch on the right and enter some more details
in the comment box.

> Note that each pull-request should fix a single change. For multiple, unrelated changes, please open multiple pull requests.

### 8. I will accept your request or maybe ask for some changes

If your code is accepted it will be merged into the main branch. If not, don't be disheartened, different people need different features, 
but your code will still be available on GitHub as a reference for those who need it.

### 9. Cleaning it up

After your code was either accepted or declined you can delete branches you've worked with from your local repository
and `origin`.

```
git checkout master
git branch -D name-of-your-branch-goes-here
git push origin --delete name-of-your-branch-goes-here
```

### Command overview (for advanced contributors)

```
git clone git@github.com:YOUR-GITHUB-USERNAME/dg.git
git remote add upstream git://github.com/fl0v/dg.git
```

```
git fetch upstream
git checkout upstream/master
git checkout -b name-of-your-branch-goes-here

/* do your magic, update changelog if needed */

git add path/to/my/file
git commit -m "A brief description of this changee"
git pull upstream master
git push -u origin name-of-your-branch-goes-here
```
