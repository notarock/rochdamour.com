---
title: 'The "Command" design pattern in Golang'
date: 2024-12-05
draft: true
summary: 'Building Slopify recipes out of ingredients'
tags:
- Slopify
- Golang
---

# Command Pattern

In object oriented programming (OOP), there is a ton of design patterns that can
be used in order to make everything easier to maintain and build new things with. Some
OOP designs idioms are strictly limited to pure object oriented designs, but
GoLang is not a OOP language per say. There's a posibility to use `struct`
and/or `interface`to achieve similar things, but they are not exactly the same.

While working on my current personal project, [Slopify](/projects/slopify), I
started to feel the need for an implementation of the "Command" design pattern.
What started out as a PoC actually became fun to work on and expand, but
executing and testing the video montage was very painful. By using the Command
pattern, I could make every "actions" testable and reusable across different
types of videos, if I ever felt the need to build new ones.

If you are not familiar with Object Oriented Programming, here's a lil refresher

{{< emphasis >}}
In object-oriented programming, the command pattern is a behavioral design pattern in which an object is used to encapsulate all information needed to perform an action or trigger an event at a later time. This information includes the method name, the object that owns the method and values for the method parameters.
{{< /emphasis >}}

Obviously, Golang is not a OOP language, but we can implement this design pattern using `interfaces` and functions with a reciever.

# Defining the Ingredients behaviour

To follow the theming of Slopify, I decided to call my videos `recipe` and the video montages actions that creates them, `ingredient`.

In Slopify, the `ingredient` is the core of the Command patterns. It consists of one `interface` and two structs, `input` and `output`.


```go {class="table-responsive"}

package ingredients

type ExecutableIngredient interface {
	Execute() (bool, error)
	GetOutput() Output
}

type Input struct {
	WorkingDirectory string
	OutputFilename   string
}

type Output struct {
	Filename string
	Lenght   int
	String   string
	Any      map[string]interface{}
}
```

In Golang, an interfaces defines a behaviour that a struct should implement. The interface does not have to be mentionned anywhere in the struct definition, as long as it implements the proper functions as required by the interface.

To implement the functions on a stuct, simply define a function with the same arguments, return types and add a pointer recievers on the function that recieves your struct.

```go {class="table-responsive"}
func (m *MergeVideoAndAudio) Execute() (bool, error) {
    // Do stuff here!
    complementFile := "output.mp4"
    // other stuff here

    // Update the ingredient's output
    m.Output = ingredient.Output{Filename: complementFile} 
    return true, nil
}

func (m *MergeVideoAndAudio) GetOutput() ingredients.Output {
    return m.Output
}
```

Go understands now, with the two function being implemented, that a MergeVideoAndAudio ingredient satisfies the requirement for the ExecutableIngredient interface and can be manipulated as one.

```go {class="table-responsive"}
mergeIngredient := MergeVideoAndAudio{
    Input: ingredients.Input{
        WorkingDirectory: ".",
    },
}

// Test usiing the executable ingredient interface
ing := ingredients.ExecutableIngredient(&mergeIngredient)

ing.Execute()

output := ing.GetOutput()
```

# Implementing an ingredient

Now that we have the core of the pattern in place, we can fill in the boilerplace with things that are usefull within the ingredient. It all starts with a new struct definition that takes in the `input` and `output`

```go {class="table-responsive"}
type MergeVideoAndAudio struct {
    ingredients.Input
    Options MergeVideoAndAudioOptions
    ingredients.Output
}

type MergeVideoAndAudioOptions struct {
    VideoFilename    string
    AudioFilename    string
    TrimToShortest   bool
    StartTimeSeconds int
    StartTimeMinutes int
}
```

As the ingredient gets initialized with it's specific type, you can define the options according to what is required. Once that's done, we can turn it into an `ExecutableIngredient`and do whatever we want with it. Even if we manipulate is as a `ExecutableIngredient`, the  `Execute()` function will still execute the code from the original ingredient type.

```go {class="table-responsive"}
func (m *MergeVideoAndAudio) Execute() (ok bool, err error) {
    ...
    out := ffmpeg.
        Output(
            []*ffmpeg.Stream{ffmpegVideo, ffmpegAudio},
            processedVideo,
            kwArgs...,
        )
    ...

    m.Output = ingredients.Output{
        Filename: processedVideo,
    }

    return true, nil
}

func (m *MergeVideoAndAudio) GetOutput() ingredients.Output {
    return m.Output
}
```
