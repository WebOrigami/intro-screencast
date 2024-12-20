This project uses Origami to generate the audio for an Origami intro video.

The dialogue of the video is defined in [script.yaml](script.yaml). This contains an array of lines the virtual actors should say. A line starts with the name of the actor that should say the line.

For example, this shows two lines of dialogue between the virtual actors named Alice and Bob:

```
- Alice: Hi there!
- Bob: Nice to be here.
```

A small Origami script [narrate.ori](src/narrate.ori) reads these array entries, then invokes the OpenAI text-to-speech API to obtain an MP3 file with the generated narration. This is then saved in a `.mp3` file with a name like `0-hi-there.mp3` that includes both the array index and the beginning of that entry's text so that it can be easily identified.

The final voice files are saved in the [narration](narration) folder.
