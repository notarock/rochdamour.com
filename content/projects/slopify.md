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
## The idea

{{< note >}}
I’ve decided against open-sourcing this project. There is already an abundance of low-effort content on the internet as it is...
{{< /note >}}

Automagically create brainrot short-form content from reddit comment.

[Like this](https://www.youtube.com/shorts/HSGBtyGVu7Q)
or [That](https://www.youtube.com/shorts/W15L4nmEJDc) or [anything here](https://www.youtube.com/@skyshadowpeak/shorts).

If you are familiar with the [Dead Internet
Theory](https://en.wikipedia.org/wiki/Dead_Internet_theory), this project was my
personnal experiment to see how much effort is required to recreate the type of
videos you see on social media. This trend has become so widespread that [Subway
Surfer
gameplay](https://knowyourmeme.com/memes/overstimulation-videos-sludge-content)
have even turned into a meme. The core concept is simple: pairing a random,
visually engaging video—like a gameplay clip—with a voiceover to hold the
attention of the average social media user just long enough for the video to
“perform” well in terms of engagement.

Many content creators on Youtube promote running this kind of "Faceless" content
machines. The idea is to create a faceless social media account and monetize it
by generating an endless amount of content effortlressly. Howerver, these
youtubers are often selling a dream and are making a significant profits
promoting the very tools they recommends.

This led me to wonder: How difficult (or easy) would it be to automate content
creation by repurposing Reddit comment threads and posting them on a faceless
social media channel? With tools like ffmpeg, web scraping, and a few cloud
APIs, I could likely automate the entire process of creating and uploading
videos to YouTube with minimal manual efforts.

And that's what I did.

## The Plan

The plan was straightforward: build a CLI tool that takes a Reddit URL as input
and generates a video that reads out the thread, layered over a visually
stimulating background video. Since I enjoy working with Go, it was the natural
language choice for this project.

With the [Viper](https://github.com/spf13/viper) package, building user-friendly CLIs is easy. In no time, I had a functional base CLI with a decent interface.

```shell {class="table-responsive"}
❄️notarock@Hectasio:~/src/slopify (main) [?] ❯ go run main.go reddit --help
Generate a video from a reddit URL or a file containing the HTML of the thread.

Usage:
  slopify reddit https://old.reddit.com/r/... [flags]

Flags:
  -h, --help                help for reddit
      --workingDir string   Directory to store temporary files.

Global Flags:
      --footage string           Directory to search for footage. If not provided, the default footage will be used.
      --oauthConfigFile string   Path to your 0AUTH client secret file. (default "youtubeConfig.json")
      --tokenFile string         Path to your token file where you want to store your YouTube token.
```

With the boilerplate code out of the way, it was time to dive into the real stuff.

## Sourcing content

The goal here is to avoid worrying about sourcing content, right? Why bother
creating anything original? (Just kidding, of course.) Instead, let's explore
some copyright-free resources we can use and adapt to make them our own.

### Reddit

Reddit contains more content than anyone could read in a lifetime, but I had
heard that the API is no longer as open as it once was. Rather than looking into
the API, I decided to jump straight into web scraping—mainly because I thought
it would be more fun.

{{< center-image src="/projects/slopify/virgin-api-chad-scrape.png" alt="Virgin API vs Chad Web Scraping"  >}}

Using the [goquery](https://github.com/PuerkitoBio/goquery) package, you can
load an HTML page and navigate its elements with jQuery-like syntax. While it's
not groundbreaking or particularly exciting, it does get the job done.

Given an HTML page, I can construct a comment thread structure that follows the
hierarchy of a Reddit comment thread. By limiting the depth to two, we only
retrieve the title of the thread, the permalinked comment, and its replies.

{{< note >}}
Sady this stopped working recently. Oh well...
{{< /note >}}

``` go {class="table-responsive"}
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

For example, given this [Reddit
link](https://www.reddit.com/r/AskReddit/comments/99eh6b/without_saying_what_the_category_is_what_are_your/e4nmr4b/),
the script will scrape the content and output something like this:

{{< emphasis >}}
Without saying what the category is, what are your top five?
<br/>
<br/>
Keeps this thread going and buzzfeed will have video ideas for years!
<br/>
<br/>
WHAT HAVE I DONE?
<br/>
<br/>
Dude, this has freakin made my day!
{{< /emphasis >}}

### Copyright Free Gameplay Videos

Once again, the internet comes to the rescue. There are plenty of YouTube
channels that focus on posting copyright-free gameplay videos intended for
TikTok users. The idea is to build a small library of these videos, allowing
Slopify to randomly select any video file from the folder, extract 60 seconds of
footage, and roll with it.

I won’t go into the details of building the initial media library, but here are some helpful links:

[Copyright Free Gameplay - Youtube](https://www.youtube.com/results?search_query=copyright+free+gameplay)

[https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)

## Building the blocks

Now that we have a method to parse dialogue and a collection of background
footage, we need to put everything together.

Fortunately, we can leverage cloud APIs to generate audio and video
transcriptions. During each intermediate step of the video editing phase, files
are written to a "Workspace" folder at `/tmp/slopify-$timestamp.` This allows us
to recover audio or video files used to create the final product if needed. This
was especially useful for debugging ImageMagick's "Title Card"
generation or addressing messy subtitles.

### Speech

Talking over the video myself wouldn't be as automated as I want it to be.
Instead, I’ve decided to use Google’s Text-to-Speech (TTS) service.
By using the GCP client, we can easily send a TTS service request and receive
the generated voice file in return.

All gathered comments will be converted into audio files, which will then be concatenated into a single `audio.mp3` file for use in the video.

```go {class="table-responsive"}
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

### Subtitles

You guessed it—I’m using the GCP Transcription API for this.

The GCP API requires that the video be uploaded to a Google Cloud Storage (GCS)
bucket. I used some Terraform code to create this resource in my personal GCP
project. Slopify uploads the video along with the corresponding voice-over
audio, and the transcription API returns what it detects. The response includes
a timestamp for every word spoken in the video, along with their respective
timestamps.

From this information, we can build a [SRT
File](https://www.speechpad.com/captions/srt) and have `ffmpeg` handle the
captions on the video.

```go {class="table-responsive"}

func BuildSubtitlesFromGoogle(transcript []*videopb.SpeechTranscription, skipUpToTime float64) Transcription {
	var transcription Transcription

	fmt.Printf("\nTranscripts\n%+v\n", transcript)

	for _, t := range transcript {
		alternative := t.GetAlternatives()[0]
		for _, wordInfo := range alternative.GetWords() {
			startTime := wordInfo.GetStartTime()
			endTime := wordInfo.GetEndTime()
			startTimeFloat := float64(startTime.GetSeconds()) + float64(startTime.GetNanos())*1e-9
			if startTimeFloat > skipUpToTime {
				transcription.Results = append(transcription.Results, Subtitle{
					StartTime:  fmt.Sprintf("%4.1f", float64(startTime.GetSeconds())+float64(startTime.GetNanos())*1e-9),
					EndTime:    fmt.Sprintf("%4.1f", float64(endTime.GetSeconds())+float64(endTime.GetNanos())*1e-9),
					Transcript: wordInfo.GetWord(),
				})
			}
		}
	}
	return transcription
}

func ConvertToSRT(transcription Transcription) string {
	var srtBuilder strings.Builder

	for i, item := range transcription.Results {
		startTime := formatTimestamp(item.StartTime)
		endTime := formatTimestamp(item.EndTime)
		srtBuilder.WriteString(fmt.Sprintf("%d\n%s --> %s\n%s\n\n", i+1, startTime, endTime, item.Transcript))
	}

	return srtBuilder.String()
}

```

### Title Card

Simply displaying the video with word-for-word subtitles felt a bit bland, so I
wanted to create a title card that would be visible while the title of the
Reddit thread is being read. Using ImageMagick, I managed to create a square PNG
containing the title text.

Meh, Good enough.

```shell {class="table-responsive"}
ffmpeg \
  -i /tmp/slopify/slop-1712892471-subs.mp4 \
  -filter_complex "[1:v]scale=-1:ih*min(iw/(iw*max(1,ih/ih)),iw/(iw*max(1,ih/ih)))[scaled];[0:v][scaled][0:v][1:v]overlay=(W-w)/2:(H-h)/2:enable='between(t,0,4)'" \
  -i /tmp/slopify/title_image.png \
  /tmp/slopify/slop-1712892471-complete.mp4
```

## Actually editing the video together

This was actually the hardest part of creating Slopify. Programmatically
assembling the video required learning how to use
[ffmpeg-go](github.com/u2takey/ffmpeg-go) as well as FFmpeg itself. The package
simplifies this task by providing bindings to help construct FFmpeg commands.

This code snippet demonstrates how to crop a video to match the shorter of the
two input files: the gameplay video and the thread being read out by the TTS
voice.

```go {class="table-responsive"}
	kwArgs := []ffmpeg.KwArgs{
		ffmpeg.KwArgs{"shortest": ""},
		ffmpeg.KwArgs{"vf": fmt.Sprintf("crop=%d:%d", width, height)},
	}

	ffmpegVideo := ffmpeg.Input(videoFile, ffmpeg.KwArgs{"ss": fmt.Sprintf("00:%d:00", randomNumber)}).Video()
	ffmpegAudio := ffmpeg.Input(fullAudioPath).Audio()

	outputFile := input.WorkingDirectory + "/" + "slop-" + strconv.FormatInt(time.Now().Unix(), 10)
	outputFileWithSubs := outputFile + "-subs.mp4"
	outputFile = outputFile + ".mp4"

	out := ffmpeg.
		Output(
			[]*ffmpeg.Stream{ffmpegVideo, ffmpegAudio},
			outputFile,
			kwArgs...,
		)

	err = out.Run()
	if err != nil {
		return vid, fmt.Errorf("Error generating video: %v", err)
	}

```

Now, wrap this with an API call to YouTube's video upload API, and you can
quickly generate videos in just a few minutes. However, the GCP API endpoint for
uploading videos to YouTube has a quota limitation, allowing only six uploads
per day unless you contact them to request an upgrade.

I *really* doubt my experiments would be considered valid enough to justify uploading a short every hour of the day.

## Conclusion

Well, in the end, it did work.

I had a lot of fun building this project, especially when I realized that it
could actually function. It’s quite scary to think that someone could
potentially weaponize such software and take over the internet. Who knows, this
might already be happening. I wouldn't be surprised at all.

YouTube actually filters out low-effort content, so my videos never ended up
getting recommended to anyone (phew!). Anyone looking to make actual money with
this approach would need to invest more effort into the editing—my basic FFmpeg
edits felt pretty bland compared to what you typically find on TikTok.

For the sake of experimentation, I would definitely say it was worth the effort.

{{< center-image src="/projects/slopify/science.jpg" alt="Dog in lab coat captioned I have no idea what I am doing"  >}}

