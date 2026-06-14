Environment Setup
=================

Install Ruby and Jekyll
-----------------------

Based on: https://jekyllrb.com/docs/installation/macos/


### Install `chruby`

```zsh
brew install chruby ruby-install
ruby-install ruby 3.4.1
```

Update `.zsh` to source  `chruby.sh` and `auto.sh`, and run `chruby ruby-3.4.1`
```zsh
source /opt/homebrew/opt/chruby/share/chruby/chruby.sh
source /opt/homebrew/opt/chruby/share/chruby/auto.sh
chruby ruby-3.4.1
```

In a new terminal, check ruby version:
```zsh
ruby --version # ruby 3.4.1
```


### Install `jekyll`

```
gem install jekyll
```


For new sites:
>
> In `repo/docs`, or the folder from where the site will be published:
> ```zsh
> jekyll new --skip-bundle .
> bundle install
> ```
>
> This will stage a demo site with the default jekyll gems.
>
> Replace the `Gemfile` contents to use `github-pages`, likely at the latest
> version available.
> ```zsh
> source "https://rubygems.org"
> gem "github-pages", "~> 232", group: :jekyll_plugins
> ```
>
> Install the bundle again to update `Gemfile.lock`
> ```zsh
> bundle install
> ```


### Run site locally

```zsh
# From docs folder
bundle exec jekyll serve
```