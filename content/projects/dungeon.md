---
title: 'Dungeon'
date: 2022-05-09
draft: false
summary: 'Simple text-based roguelike game to mess around with procedural map generation.'
params:
  image: '/projects/dungeon/cover.png'
  repository: 'https://github.com/notarock/dungeon'
tags:
  - Go
  - Game
---

## The Idea

While playing a roguelike video game, I found myself wondering: *How does this
game consistently generate a "new" level every time I start a new game?*

Inspired by this question, I decided to explore how to implement a procedural
level generator in Go. To test the generator, I created a simple text-based
dungeon crawler game. This project allowed me to dive into procedural generation
concepts and apply them in a fun, hands-on way.

## Gameplay

The game itself is intentionally simple: players can move around and discover
the map. My main goal was not to create a polished game but to explore and
implement the mechanics of procedural map generation.

Here’s a quick demo showing that the game is fully functional, even if
minimalistic:

{{< center-image src="/projects/dungeon/gameplay.gif" alt="Moving '@' character within a randomly generat text-based map"  >}}

# Level Generation

When a new map is generated, it begins as a blank canvas of tiles. In Dungeon, a
tile can represent a wall, a floor, or the player. To ensure the game remains
playable, the player is placed within a randomly selected room after the map is
fully generated, avoiding any chance of being trapped in a wall.

The number of rooms generated in a canvas depends on two factors: seeded
randomness and the current difficulty level. Additionally, there’s a hard cap on
the partitioning depth to prevent overly complex levels.

## Placing rooms using Binary Space Partitionning

When a new canvas is generated, it starts completely filled with walls. The
first step in map generation is determining where to place rooms and how large
they should be. Using Binary Space Partitioning (BSP), the entire canvas is
treated as a root node, and areas within the canvas are recursively partitioned
to define room boundaries.

From [the BDP article on Wikipedia](https://en.wikipedia.org/wiki/Binary_space_partitioning): 

{{< emphasis >}}
Binary space partitioning is a generic process of recursively dividing a scene into two until the partitioning satisfies one or more requirements.
</br>
<div class="d-flex justify-content-center align-items-center py-2"> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2D_Binary_Index.svg/1920px-2D_Binary_Index.svg.png" alt="BSP" style="width: 35%">
</div>
<img src= >

{{< /emphasis >}}

To fill the space, my BSP-based map generation algorithm uses a seeded random
number to decide whether to partition a region. The random number, ranging from
0 to 100, must exceed a threshold to trigger a split. This threshold decreases
as the difficulty level increases, resulting in more subdivisions and complex
maps for higher difficulties.

The canvas for the map is created with a fixed size, which makes it challenging
to dynamically adjust and place more rooms in heavily partitioned areas. While
it’s possible to normalize room sizes to address this, I decided to stick with
the simpler approach since my main interest was exploring the BSP algorithm
itself.

Here's the final product:

{{< center-image src="/projects/dungeon/full-map.png" alt="Fully generated map"  >}}

