---
title: 'Tuyauterie'
date: 2025-10-29
draft: false
summary: 'A collection of reusable GitHub Actions workflows to streamline CI/CD pipelines.'
params:
  repository: 'https://github.com/notarock/tuyauterie'
  image: '/projects/tuyauterie/water-pipe.jpg'
tags:
  - DevOps
  - CI/CD
  - GitHub Actions
---

## The Idea

As I built more projects and maintained multiple repositories, I found myself
copying the same GitHub Actions workflows over and over again. Each time I
wanted to build a Docker image, deploy to Kubernetes, or build a Nix flake, I'd
have to duplicate the same YAML files across repositories. Over time, things would
get outdated and I constantly needed to backport improvements from newer projects into older ones. *Ugh*

*Tuyauterie* (French for "plumbing") is my solution to this problem: a
centralized collection of reusable GitHub Actions workflows that can be
referenced from any of my projects. Instead of maintaining dozens of copies of
similar workflows, I can now reference a single source of truth and keep my CI/CD
pipelines consistent and up-to-date.

## What It Does

Tuyauterie provides a single entrypoint workflow (`tuyauterie.yaml`) that orchestrates various CI/CD processes and their executions. This centralized workflow handles different automation tasks based on your configuration, making it easy to manage complex pipelines from one place.

## How It Works

The workflow is configured through a `.tuyauterie.yaml` file in each repository
that uses it. This configuration file defines the build type, release strategy,
and deployment settings. Here's an example:

```yaml
version: 1

build:
  type: golang  # python, nix, or docker
  dockerfile: Dockerfile
  upload_artifacts: true

release:
  rolling: false  # publish on every commit to main
  on-tag: true    # publish when a tag is created

deploy:
  gitops:
    enable: true
    repository: "notarock/kubernetes-manifests"
    manifest: "k8s/deployment.yaml"
```

To use Tuyauterie in a project, you reference the main workflow and it reads
your configuration file to orchestrate the appropriate build, release, and
deployment steps:

```yaml
jobs:
  tuyauterie:
    uses: notarock/tuyauterie/.github/workflows/tuyauterie.yml@main
    with:
      tuyauterie-path: '.tuyauterie.yaml'
    secrets:
      GITOPS_REPOSITORY_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Based on the configuration, Tuyauterie orchestrates multiple jobs:

{{< center-image src="/projects/tuyauterie/graph.png" alt="Workflow execution graph showing job dependencies"  >}}

The workflow provides clear feedback through GitHub Actions job summaries,
showing exactly what was built, tested, and deployed:

{{< center-image src="/projects/tuyauterie/job-summary.png" alt="Job summary showing build and deployment details"  >}}

This approach keeps my CI/CD logic DRY (Don't Repeat Yourself) and makes it much
easier to maintain and improve my workflows over time. When I optimize a
workflow in Tuyauterie, all my projects benefit from the improvement
automatically.

