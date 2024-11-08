---
title: 'attention-attention'
date: 2020-06-23
draft: false
summary: 'The university alarm that we missed during the pandemic.'
params:
  image: '/projects/attention-attention/cover.jpg'
  repository: 'https://github.com/starcraft66/attention-attention'
tags:
  - Python
  - Discord
---

## The Idea

Before COVID, I used to spend a lot of time at my university's student club,
[CEDILLE](http://cedille.etsmtl.ca). We’d mess around with software and servers
late into the night—staying productive while procrastinating on school work…
Anyway.

We'd often stay so late that we'd hear the 1:45am and 2:00am alarms go off,
reminding students to either head out or check in with security. That was
usually our cue to finally call it a night.

When the pandemic hit, everything moved online, and we were forced to hang out
on Discord instead. Without those alarms, it was way too easy to stay up way too
late, especially with nothing open anywhere.

To fix this, we created *Attention-Attention*, a Discord bot that joins your
voice channel at 1:45am and 2:00am to play the closing alarm. A good friend of
mine, [Tristan](https://github.com/starcraft66), and I built it over a couple of
days on screen share.

## How it Works

The bot itself is simple: it runs a cron job to check if there are users in any
voice channels at 1:45am and 2:00am. If there are, it joins the channel with the
most users and plays a sound clip. We recorded two sound samples, and getting
them was a bit of an adventure. We had to set up a laptop recording in an empty
classroom and wait for the alert to go off. We ended up calling these clips the
*Gold Master Record*.

### The recordings

___

#### 1:45 am

{{< audio "https://github.com/starcraft66/attention-attention/raw/refs/heads/master/attention_attention/media/attention-attention.mp3" >}}

___

#### 2:00 am

{{< audio "https://github.com/starcraft66/attention-attention/raw/refs/heads/master/attention_attention/media/attention-attention-2.mp3" >}}

___
