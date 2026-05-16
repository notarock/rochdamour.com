---
title: 'Strap'
date: 2026-05-15
draft: false
summary: 'A background agent harness that picks tasks from a checklist, hands them to an AI coding agent, and opens a pull request automatically. A short-lived experiment that taught me a lot about the agent automation loop.'
params:
  image: '/projects/strap/cover.png'
  repository: 'https://github.com/notarock/strap'
tags:
  - Go
  - AI
  - Automation
  - CLI
---

## The Idea

Strap started as a work hackathon project. The premise was simple: AI coding agents are getting good enough to handle real tasks, but wiring one up to a project still requires a lot of manual ceremony: write a prompt, launch the agent, wait, review, commit, open a PR, update your task list, repeat. The overhead adds up fast when you have a backlog of small-to-medium improvements sitting around.

The hackathon gave it a deadline, and the result was my attempt to cut that loop down to almost nothing. You write tasks as checkboxes in a `TASK.md` file, run `strap run`, and it handles the rest: renders a prompt, fires up `claude-code` or `opencode` as a subprocess, streams the output, commits the changes to a new branch, and opens a pull request on GitHub or GitLab.

## How It Works

The core loop is pretty straightforward. Strap reads `TASK.md` and picks the first unchecked `[ ]` item, then renders the task title and any indented description lines into a prompt. If you've configured context files, those get injected too along with the last ten git commits. The prompt goes to the agent CLI, output streams live to the terminal and gets saved to a log file. After a successful run, changes are committed to a branch named `strap/<id>-<slug>` and a PR or MR is opened via the `gh` or `glab` CLI. The checkbox flips to `[x]` or `[!]` depending on how it went, and the PR URL gets appended inline.

The task file format is plain GitHub-flavoured Markdown, so it doubles as readable project documentation and works in any editor.

## Server Mode

For multi-repo setups, Strap can run as a small HTTP server. Repos register themselves, workers poll for tasks and execute them, and a handful of `strap task` commands let you inspect the queue remotely. It's the same core loop, just distributed across multiple working directories and worker processes.

## Board Integrations

Not everyone wants to manage tasks in a text file. Strap can pull from Planka (open-source kanban) or Linear, appending open cards or issues as pending tasks and closing them automatically once the PR is merged. A `strap sync` is all it takes to stay in sync.

## Cost Tracking

Every run parses token usage from the agent output and writes it to `~/.strap/usage.jsonl`. `strap stats` gives a cost summary broken down by model, and `strap history` shows a per-run table with an optional cost column. Handy for keeping an eye on how much a batch of tasks actually ran you.

## Watch Mode

`strap watch` monitors `TASK.md` for filesystem changes and runs newly-added tasks automatically. Useful when you're actively adding tasks and want the agent to start on each one as soon as you save.

## The Stack

Strap is written in Go. The CLI is built with Cobra, and the server exposes a small REST API. The embedded web UI lives in `web/` and gets built separately with npm. The only external runtime dependencies are the `gh` or `glab` CLIs for PR creation.

## Wrapping Up

Strap is unabashedly slopware, vibe-coded and rough around the edges. In practice I only ran it for a few days before switching to @claude and @cursor inside Slack, which fit more naturally into how I actually work. Still, building it was a useful exercise in thinking through the agent automation loop, and the bones are solid enough that someone with a different workflow might find it genuinely useful.

The source is on [GitHub](https://github.com/notarock/strap) if you want to try it out.
