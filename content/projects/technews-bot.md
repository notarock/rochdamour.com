---
title: 'Technews Bot'
date: 2022-12-10
draft: false
summary: 'Read technology news sites and send articles of interest to Discord.'
params:
  image: '/projects/technews-bot/cover.png'
  repository: 'https://github.com/notarock/technews-bot'
tags:
  - Go
  - Discord
  - Chatbot
---

# The Idea

Lately, I’ve been feeling nostalgic for the good old days of RSS feeds. You
would subscribe to a feed, and all your favorite articles and news would
magically show up in one place. It was simple and so effective!

Now, tech news and interesting articles are scattered all over, and if I want to
keep up, I have to jump between sites like Hacker News, Reddit, Lobste.rs etc.

I wanted a way to filter all that noise and pull in only the stuff that actually
interests me. That’s when it hit me: why not make a bot that does this for me? I
already have a little Discord server set up for my personal projects and random
notes, so adding a bot to aggregate news seemed like a fun experiment.

## The Plan: A News Bot with Chat Commands

The idea was pretty simple—build a bot that checks news sites, filter articles
that fit my interests, and send them straight into a channel on my server.
since it’s Discord, I thought it’d be cool to make the bot configurable via chat
commands. That way, I can tweak filters or just get it to spit
out an update, all with a quick message.

{{< center-image src="/projects/technews-bot/status.png" alt="Example output of a !status command"  >}}

This little bot brings back the feel of RSS but with more control and
customization. And it’s nice to have everything I’m interested in waiting for me
in one place. Technews Bot sends articles during the day, so
I don’t have to keep checking various sites. It’s like having my own little
research assistant that curates content while I focus on other things. By the
time I check Discord, there’s usually a handful of interesting reads waiting for
me.

{{< center-image src="/projects/technews-bot/example.png" alt="Technews Bot posted 3 articles to a discord channel"  >}}


