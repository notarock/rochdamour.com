---
title: 'Slopify'
date: 2024-09-20
draft: false
summary: 'Automagically create brainrot short-form content from reddit comment.'
params:
  image: '/projects/slopify/cover.png'
tags:
  - Go
  - Media
---

> **Note:** I decided against open sourcing this project. There is already too much low-effort content on the internet as-is...

## The idea

Automagically create brainrot short-form content from reddit comment.

If you have ever heard about the [Dead Internet
Theory](https://en.wikipedia.org/wiki/Dead_Internet_theory), this project was my
personnal attempt at judging how much effort was needed to recreate these videos
you see on social media. The phenomenon is actually so common that [Subway Surfer gameplay](https://knowyourmeme.com/memes/overstimulation-videos-sludge-content)
has become a meme online. The idea is that using a captivating video of random
gameplay and adding a voice on top will keep the average social media user's
attention long enough that the video will "Perform" well. People online,
especially Youtubers, often make videos about using paid tools in order to
automate this process and montize faceless social media profiles by running
those videos in bulk. Obviously, these youtubers are selling you a dream and probably make banks by promoting those tools.

This got me wondering, how hard (or easy?) Would it be to automate content creation by recycling Reddit comment thread and posting to a faceless channel?

By using ffmpeg, web scraping and a couple of cloud API, I could probably create
these videos and upload them to youtube with little to no efforts.

And this got me thinking: What if I actually tried? And that's how I got here.

## The Plan

The plan was to keep it simple. Build a CLI tool that take a reddit url as
inputs and spits out a video file that reads out the thread on top of an
overtimulating video. I really like working with GO, so naturally I picked that language.

Using [Viper](https://github.com/spf13/viper), you can build nice CLI's. In not time, I had a base CLI with a comprehensive menu.

Now for the meat

### Content sources

#### Reddit

Reddit has more content than anyone could read through in their lifetime, but
the API is not open anymore. Well, or so I heard. I didn't actually research the
API and went straight to Web Scraping because I thought that would be fun.

{{< center-image src="/projects/slopify/virgin-api-chad-scrape.png" alt="Virgin API vs Chad Web Scraping"  >}}

> **Note:** Sady this stopped working recently. Oh well...

``` go
func ParseHtml(body io.ReadCloser, threadURI string) Thread {
	thread := Thread{
		Url: threadURI,
	}

  // Load the HTML document we got from a "Permalink" to a reddit comment on old.reddit.com
	doc, __ := goquery.NewDocumentFromReader(body)
	a := doc.Find(".title .may-blank")
	thread.Title = a.Text()

	commentArea := doc.Find(".nestedlisting")

	s := commentArea.Find(".thing")
	Comment := Comment{}

	depth := 2 // Grab some replies along the way
	comments := s.Find(".md")
	comments.Each(func(i int, s *goquery.Selection) {
		if depth == 0 {
			return
		}

		commentText := s.Text()                                   // Get comment text
		cleanedText := strings.Replace(commentText, "\n", "", -1) // Remove newlines
		Comment.Comments = append(Comment.Comments, cleanedText)  // Add to comments list
		depth--
	})

	thread.CommentThreads = append(thread.CommentThreads, Comment)

	return thread
}
```

#### Copyright Free Gameplay Videos

Again, the internet has you covered. There are plenty of youtube channels who
focuses on posting copyright-free gameplay videos meant for use by tiktok users. The idea here is to build a small library of videos so that Slopify can simply pick any video file within the folder, pick 60 seconds of footage anywhere in the video and roll with it.

I won't include details on how to build the initial media library, but here are some helpfull links.

[Copyright Free Gameplay - Youtube](https://www.youtube.com/results?search_query=copyright+free+gameplay)

[https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)

### Stiching it together

Now that we have a way to parse dialog and some background footages, we nede to put everything together.

Fortunately, we can leverage some cloud API to generate audio and video
transcription. During every intermediate steps of the video editing phase, files
get written to a "Workspace" folder at `/tmp/slopify-$timestamp` . This way, you
can recover audio or video files that were used to build the final product if
needed. This was especially usefull while debugging imagemagick "Title Card"
generation or messy subtitles.

#### Handling Speech

Talking over the video myself wouldn't be as automated as I want it to. Instead, I've decided to use Google's text to speech service.
Using the GCP Client, we can pass this TTS service request and get our voice file in return pretty easily.

```go
	// Perform the text-to-speech request on the text input with the selected
	// voice parameters and audio file type.
	req := texttospeechpb.SynthesizeSpeechRequest{
		// Set the text input to be synthesized.
		Input: &texttospeechpb.SynthesisInput{
			InputSource: &texttospeechpb.SynthesisInput_Text{Text: toSay},
		},
		// Build the voice request, select the language code ("en-US") and the SSML
		// voice gender ("Male").
		Voice: &texttospeechpb.VoiceSelectionParams{
			LanguageCode: "en-US",
			Name:         "en-US-Wavenet-J",
			SsmlGender:   texttospeechpb.SsmlVoiceGender_MALE,
		},
		// Select the type of audio file you want returned.
		AudioConfig: &texttospeechpb.AudioConfig{
			AudioEncoding: texttospeechpb.AudioEncoding_MP3,
		},
	}

  ...

func Concatenate(title string, files []string, output string) {
	segment, _ := godub.NewLoader().Load(title)

	fmt.Print("Concatenating audio files...: ")
	fmt.Print(title)

	for _, file := range files {
		fmt.Print(", ", file)
		segmentToAdd, err := godub.NewLoader().Load(file)
		if err != nil {
			log.Fatal(err)
		}
		segment, err = segment.Append(segmentToAdd)
		if err != nil {
			log.Fatal(err)
		}
	}

	// Save the newly created audio segment as mp3 file.
	godub.NewExporter(output).WithDstFormat("mp3").WithBitRate(128000).Export(segment)
}

```

#### Audio Transcription

You guessed it, I'm using GCP Transcription API for this

Adding the "Title Card";

```shell
ffmpeg -i /tmp/slopify/slop-1712892471-subs.mp4 -filter_complex "[1:v]scale=-1:ih*min(iw/(iw*max(1,ih/ih)),iw/(iw*max(1,ih/ih)))[scaled];[0:v][scaled][0:v][1:v]overlay=(W-w)/2:(H-h)/2:enable='between(t,0,4)'" -i /tmp/slopify/title_image.png /tmp/slopify/slop-1712892471-complete.mp4
```
