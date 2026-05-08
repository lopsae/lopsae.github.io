Environment Setup
=================

Jekyll Instalation
https://jekyllrb.com/docs/installation/macos/

```
brew install chruby ruby-install
ruby-install ruby 3.4.1
```

Update `.zsh` to source  `chruby.sh` and `auto.sh`, and run `chruby ruby-3.4.1`
```
source /opt/homebrew/opt/chruby/share/chruby/chruby.sh
source /opt/homebrew/opt/chruby/share/chruby/auto.sh
chruby ruby-3.4.1
```

Install Jekyll
```
gem install jekyll
```


In `repo/docs`:
```
jekyll new --skip-bundle .
bundle install
```


To locally run the site:
```
bundle exec jekyll serve
```