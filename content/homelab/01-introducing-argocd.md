---
title: 'Doing something about my CD situation'
date: 2024-10-02
draft: false
summary: '"The cobbler always wears the worst shoes"'
tags:
- CD
- GitOps
---

You know that saying: *The cobbler always wears the worst shoes*? It’s about how
people often don’t use their own skills on themselves, and yeah... that was
me—until I finally decided to set up Argo-CD in my lab.

Whenever I push a new version of one of my projects, a reusable workflow in
GitHub Actions builds and pushes a Docker image to ghcr.io. The continuous
integration part was covered. However, I still needed to SSH into one of the
servers and manually run a `docker pull` or a `kubectl edit deployment ...`. It
wasn’t too bad at first since I’d usually wait for a big enough feature before
bothering with all that. Manually pushing the tag and handling things wasn't a
big deal when I wasn’t doing it all the time.

But then I started working on this website, making smaller updates more often,
and suddenly that manual process got old really fast. So, here we are—time for
Argo-CD.

# Argo CD

For those unfamiliar, Argo-CD is a declarative **GitOps** tool for Kubernetes. It
automates the deployment of applications, syncing your Kubernetes cluster with
what’s defined in your Git repository. It is a part of the Argo project, which
gained the Graduated status under the CNCF in December 2022. 

Getting started with Argo-CD was straightforward. I just had to create a local
copy of the
[values.yaml](https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/values.yaml)
file, make a few tweaks to match my setup, and then deploy it using Helm.

```shell
helm repo add argo https://argoproj.github.io/argo-helm
helm install -f argo-values.yaml argocd argo/argo-cd --namespace argocd --create-namespace
```

Wait a bit, then argo-cd shows up on my local network. Neat!

## GitOps repository

To get Argo CD to sync your configuration into your cluster, you first need to
set up a repository and grant it read access. In my case, I’m using a repository called
**GitOps**, which contains a folder for each service. Each folder looks something
like this:


{{< center-image src="/lab/01-introducing-argocd/gitops-config.png" alt="GitOps repository with rochdamour.com folder containing deployment.yaml, ingress.yaml, kustomization.yaml, namespace.yaml and service.yaml"  >}}

The `kustomization.yaml` file is pretty straightforward. Argo CD recognizes that
this folder uses Kustomize and will automatically render the configuration for
us, making things a lot easier.

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - deployment.yaml
  - service.yaml
  - ingress.yaml
```

With those files pushed to the repository, I created a deploy key with read
access. This lets Argo CD sync with the repository and automatically apply any
new changes.

Since this is just a single-user setup, I don’t need separate repositories for
each service. I’m perfectly fine with connecting one repo that contains all the
manifests for my lab—it keeps things simple and easy to manage. Maybe I will
come back on this decision later, who knows.

{{< center-image src="/lab/01-introducing-argocd/repository.png" alt="Type: Git, Name: GitOps, Project: Default, Repository: notarock/gitops, Connection Status: Successful"  >}}

## Deploying the Application

In Argo CD, an **Application** is a defined bundle of manifests to be applied to
the cluster. This can be plain Kubernetes manifests, a Helm chart, or a
Kustomize bundle. From the Application menu, just select New App, connect the
repository, specify the path to your configurations.

{{< center-image src="/lab/01-introducing-argocd/application.png" alt="rochdamour.com application shown in Argo CD UI"  >}}

Clicking on an application in the list reveals all the components deployed as part of it. If anything goes wrong during a deployment, you’ll see the issue right there, making it easy to troubleshoot.

{{< center-image src="/lab/01-introducing-argocd/application-details.png" alt="rochdamour.com application shown in Argo CD UI"  >}}

#### *Voila*

The only downside now is the need to update the image's versions in my
`deployment.yaml` every time I make some change. This is already getting
annoying, I have to-do something about it soon...

