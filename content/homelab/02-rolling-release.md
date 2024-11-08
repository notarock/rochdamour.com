---
title: 'Doing something about my CD situation - 2'
date: 2024-11-07
draft: false
summary: 'The laziest rolling release ever.'
tags:
- CD
- GitOps
---

Last month, I got ArgoCD up and running in my lab and set it up to deploy all my
services straight from a GitHub repo. It’s made deploying way easier, but
there’s still a bit of manual work whenever I update this website. I actually
noticed this hassle in my last lab report:

{{< emphasis >}}

The only downside now is the need to update the image's versions in my
`deployment.yaml` every time I make some change. This is already getting
annoying, I have to-do something about it soon...

{{< /emphasis >}}

Luckily, a quick GitHub Action can take care of that.

Clone the code, bump the version, push the commit. Then let ArgoCD handle the rest of the deployment.

{{< note >}}
Regex might be one of the most volatile tools people tend to willfully ignore
and never fully learn. That sed command uses <a
href="https://regexone.com/lesson/capturing_groups">capturing groups</a>, which
makes updating the version in place much easier.
{{< /note >}}

``` yaml
  rolling-deployment:
    needs: [build-and-push-image]
    runs-on: ubuntu-latest
    env:
      VERSION: ${{needs.build-and-push-image.outputs.version}}

    steps:
    - uses: actions/checkout@master
      with:
        persist-credentials: false # otherwise, the token used is the GITHUB_TOKEN, instead of your personal token
        fetch-depth: 0             # otherwise, you will fail to push refs to dest repo
        token: ${{ secrets.GITOPS_TOKEN }}
        repository: "notarock/gitops"

    - name: Create local changes
      id: update
      run: |
        set -x
        sed -i -E "s|(ghcr.io.*):.*$|\1:$VERSION|" rochdamour.com/deployment.yaml
        git diff

    - name: Commit & Push changes
      uses: actions-js/push@master
      with:
        coauthor_name: ${{ github.actor }}
        github_token: ${{ secrets.GITOPS_TOKEN }}
        repository: 'notarock/gitops'
        message: "chore: autopublish rochdamour.com ${{needs.build-and-push-image.outputs.version}}"
```

{{< center-image src="/lab/02/actions.png" alt="github actions execution output"  >}}

