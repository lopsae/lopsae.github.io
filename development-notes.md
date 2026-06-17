Development Notes
=================

To run local server:
```zsh
# From docs folder
bundle exec jekyll serve
```


Jekyll Resources
----------------
[Setting up Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-a-theme-to-your-github-pages-site-using-jekyll)

[Testing Jekyll Locally](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)

[Values propagated to `site.github`](https://jekyll.github.io/github-metadata/)


Github Pages DNS Configuration
------------------------------
For a custom domain to properly work with github pages, the DNS configuration needs at least the following records:
+ An `ALIAS` record redirecting the default domain (www.domain.com) to the apex domain (https://example.com).
+ An `A` record pointing to either `repo-name.github.io` or the addresses listed in [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
