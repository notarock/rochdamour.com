---
title: 'a_c_a_c'
date: 2026-02-01
draft: false
summary: 'A lightweight Twitch chatbot that learns from chat messages and generates responses using Markov chains.'
params:
  image: '/projects/acac/cover.jpg'
  repository: 'https://github.com/notarock/a_c_a_c'
tags:
  - Go
  - Twitch
  - Chatbot
---

{{< note >}}
I'm currently hosting an instance of the bot and can add channels upon request! If you want a_c_a_c to join your Twitch chat, you can open a hosting request issue on the GitHub repository.

If you're here by mistake, simply follow the link on the title of this page above to access the GitHub repo and open a hosting request!
{{< /note >}}

{{< note >}}
A public Discord server for a_c_a_c is in the works. An accessible place for Hosting requests, sharing funny generated messages, discussing out of pocket messages and how to prevent them in the future... Coming soonish?
{{< /note >}}

## The Idea

If you've ever spent time watching Twitch streams, you've probably seen chatbots that seem to randomly generate messages based on what people are saying. Bots like BinyotBot and a_n_i_v who say silly things, send random emotes and just... say funny word salads.

I wanted to build my own version of this kind of bot. The goal was simple: create a lightweight chatbot that learns from chat messages in real-time and generates responses using a Markov chain algorithm. The result is `a_c_a_c`, a cheap clone of a_n_i_v that's easy to deploy and occasionally produces some funny interactions.

The name itself is a playful nod to the original bot it was inspired by, following the same underscore-separated vowel pattern.

## How It Works

At its core, `a_c_a_c` uses Markov chains to learn from chat messages. Every message sent in the channel is read and used to build a probabilistic model of how words connect to each other. When it's time to send a message, the bot generates text by following the chains of words it has learned.

The bot keeps track of two types of messages:
- **Received messages**: Everything the bot reads from a channel's chat, stored in plaintext file
- **Sent messages**: Everything the bot itself has said, stored in plaintext

This allows the bot to learn continuously and also provides the option to review what it's been saying (which can be... interesting).

To prevent the bot from learning its own gibberish, there's an `IGNORE_PARROTS` feature that filters out users who simply repeat what the bot just said. This helps keep the learning process somewhat grounded in actual human conversation patterns.

## Configuration and Flexibility

One of the goals with `a_c_a_c` was to make it flexible enough to work across different channels with different behaviors. The bot uses a YAML configuration file that lets you customize settings per channel:

- **Message frequency**: How many messages to read before responding
- **Bot filtering**: Each channel can ignore specific bots to avoid learning from other automated accounts

There's also a global list of bot usernames that are ignored across all channels by default.

## The Fun Part

The real magic happens when the bot generates something unexpectedly coherent or hilarious. Because Markov chains work by probabilistically choosing the next word based on what it has seen before, the results can range from completely nonsensical to surprisingly... "insightful".

{{< center-image src="/projects/acac/acac_example.png" alt="Example of a_c_a_c generating messages in Twitch chat"  >}}

Sometimes it mirrors the vibe of the chat perfectly, other times it creates bizarre combinations that make everyone laugh.

## Wrapping Up

Building `a_c_a_c` was a fun dive into natural language processing (in a very loose sense of the term) and Twitch (irc) bot development. It's rewarding to see the bot learn and adapt to different chat cultures, and the occasional gems it produces make it all worthwhile.

If you're interested in running your own instance or just want to explore how it works, check out the [GitHub repository](https://github.com/notarock/a_c_a_c). And if you want to see it in action, feel free to request it for your channel!
