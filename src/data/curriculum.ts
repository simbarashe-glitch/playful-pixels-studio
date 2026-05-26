export type BlockCard = {
  label: string;
  description: string;
  example?: string;
  color: "motion" | "looks" | "sound" | "events" | "control" | "sensing" | "operators" | "variables" | "neutral";
};

export type ConceptCard = {
  title: string;
  body: string;
  emoji: string;
};

export type QuizQuestion = {
  q: string;
  choices: string[];
  answer: number; // index
  explain?: string;
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  emoji: string;
  tagline: string;
  color: "sky" | "sunshine" | "mint" | "coral" | "grape";
  concepts: ConceptCard[];
  blocks?: BlockCard[];
  quiz: QuizQuestion[];
  badge: { name: string; emoji: string };
};

export const lessons: Lesson[] = [
  {
    id: "intro",
    order: 1,
    title: "What is Scratch?",
    emoji: "🎬",
    tagline: "Meet the magical place where you make things move!",
    color: "sky",
    concepts: [
      { emoji: "🐱", title: "Scratch is a playground for code", body: "Scratch lets you drag colorful blocks together like LEGO to tell sprites what to do — no typing needed!" },
      { emoji: "🖥️", title: "The Stage", body: "The Stage is the big white area on the top right. It's like a tiny theatre where your sprites perform." },
      { emoji: "🧩", title: "The Block Palette", body: "On the left you find blocks. Each color is a different family: blue is Motion, purple is Looks, yellow is Events, and more!" },
      { emoji: "📜", title: "The Script Area", body: "Drag blocks into the middle. Snap them together top-to-bottom to make a script — that's your code!" },
    ],
    quiz: [
      { q: "Where do your sprites perform?", choices: ["The Block Palette", "The Stage", "The Costume Tab", "The Backpack"], answer: 1 },
      { q: "How do you write code in Scratch?", choices: ["Type words on a keyboard", "Snap blocks together", "Draw pictures", "Sing to the computer"], answer: 1 },
      { q: "What color are Motion blocks?", choices: ["Yellow", "Purple", "Blue", "Green"], answer: 2 },
      { q: "Each color of blocks is a...", choices: ["Game", "Sprite", "Family", "Sound"], answer: 2, explain: "Each block family does different things!" },
      { q: "Do you need to know typing to start Scratch?", choices: ["Yes, a lot", "No, just drag blocks"], answer: 1 },
    ],
    badge: { name: "Scratch Explorer", emoji: "🧭" },
  },
  {
    id: "sprites",
    order: 2,
    title: "Sprites",
    emoji: "🐱",
    tagline: "The characters and objects that come alive in your project!",
    color: "coral",
    concepts: [
      { emoji: "🐱", title: "A sprite is a character", body: "Scratch Cat is the most famous sprite. A sprite can be anything: a ball, a rocket, a person, a pizza!" },
      { emoji: "📚", title: "The Sprite Library", body: "Click the cat icon at the bottom right to open the library. Hundreds of ready-made sprites are there!" },
      { emoji: "🖼️", title: "Upload your own", body: "You can upload a photo from your computer or draw your own sprite with the Paint editor." },
      { emoji: "👗", title: "Costumes", body: "Each sprite can have many costumes — like outfits. Switching costumes quickly is how you make animations!" },
    ],
    blocks: [
      { label: "switch costume to ▾", description: "Changes how the sprite looks", color: "looks" },
      { label: "next costume", description: "Flip to the next costume — make it walk!", color: "looks" },
    ],
    quiz: [
      { q: "What is a sprite?", choices: ["A type of fizzy drink only", "A character in your Scratch project", "A block color", "A keyboard key"], answer: 1 },
      { q: "Where do you find ready-made sprites?", choices: ["Sprite Library", "Sound tab", "Variables menu", "The Stage"], answer: 0 },
      { q: "Costumes are like...", choices: ["Different outfits the sprite can wear", "Different songs", "Different levels", "Different keyboards"], answer: 0 },
      { q: "Can you draw your own sprite?", choices: ["Yes!", "Only the Cat is allowed"], answer: 0 },
      { q: "Quickly switching costumes creates...", choices: ["A noise", "An animation", "A new project", "A bug"], answer: 1 },
    ],
    badge: { name: "Sprite Wrangler", emoji: "🦸" },
  },
  {
    id: "motion",
    order: 3,
    title: "Motion Blocks",
    emoji: "🏃",
    tagline: "Make your sprite walk, jump, glide and spin!",
    color: "sky",
    concepts: [
      { emoji: "➡️", title: "Move steps", body: "‘move 10 steps’ slides your sprite forward. A bigger number means a bigger leap." },
      { emoji: "🔄", title: "Turn degrees", body: "‘turn ↻ 15 degrees’ rotates your sprite. 360 degrees is a full spin!" },
      { emoji: "🪂", title: "Glide", body: "‘glide 1 secs to x: y:’ floats your sprite smoothly from where it is to a new spot." },
      { emoji: "🧱", title: "If on edge, bounce", body: "This block stops your sprite from running off the stage. Great for bouncing balls!" },
    ],
    blocks: [
      { label: "move 10 steps", description: "Slide forward 10 little steps", color: "motion" },
      { label: "turn ↻ 15 degrees", description: "Spin a bit clockwise", color: "motion" },
      { label: "go to x: 0 y: 0", description: "Jump to the middle of the stage", color: "motion" },
      { label: "glide 1 secs to ▾", description: "Smoothly slide to a spot", color: "motion" },
      { label: "if on edge, bounce", description: "Bounce off the wall", color: "motion" },
    ],
    quiz: [
      { q: "What does ‘move 10 steps’ do?", choices: ["Plays a sound", "Slides the sprite forward", "Changes color", "Hides the sprite"], answer: 1 },
      { q: "‘turn 90 degrees’ will...", choices: ["Make a full spin", "Make a quarter turn", "Do nothing"], answer: 1 },
      { q: "Which block makes a sprite move smoothly to a spot?", choices: ["move 10 steps", "glide 1 secs to ▾", "go to mouse-pointer"], answer: 1 },
      { q: "What does ‘if on edge, bounce’ help with?", choices: ["Bouncing off the stage edge", "Making sound", "Switching costumes"], answer: 0 },
      { q: "What color family are motion blocks?", choices: ["Yellow", "Blue", "Purple", "Green"], answer: 1 },
    ],
    badge: { name: "Motion Master", emoji: "🏎️" },
  },
  {
    id: "looks",
    order: 4,
    title: "Looks Blocks",
    emoji: "💬",
    tagline: "Make your sprite talk, change size, and use cool effects.",
    color: "grape",
    concepts: [
      { emoji: "💬", title: "Say & Think", body: "‘say Hello! for 2 secs’ puts a speech bubble over your sprite. ‘think’ makes a thought cloud." },
      { emoji: "👗", title: "Switch costume", body: "Pick a specific costume by name, or use ‘next costume’ to animate." },
      { emoji: "🔍", title: "Change size", body: "‘set size to 200%’ makes the sprite huge. 50% makes it tiny." },
      { emoji: "✨", title: "Graphic effects", body: "Try ‘change color effect by 25’ for rainbow colors, or ‘ghost’ to fade." },
      { emoji: "👻", title: "Show / Hide", body: "Make sprites appear and disappear — perfect for surprises!" },
    ],
    blocks: [
      { label: "say Hello! for 2 secs", description: "Speech bubble", color: "looks" },
      { label: "set size to 100", description: "Resize the sprite", color: "looks" },
      { label: "change color effect by 25", description: "Cycle colors", color: "looks" },
      { label: "hide / show", description: "Disappear / reappear", color: "looks" },
    ],
    quiz: [
      { q: "Which block shows a speech bubble?", choices: ["move 10 steps", "say Hello!", "play drum"], answer: 1 },
      { q: "‘set size to 50’ makes the sprite...", choices: ["Bigger", "Smaller", "Invisible"], answer: 1 },
      { q: "Which effect makes a sprite fade?", choices: ["Color", "Pixelate", "Ghost"], answer: 2 },
      { q: "‘hide’ makes the sprite...", choices: ["Disappear", "Sing", "Spin"], answer: 0 },
      { q: "Looks blocks are which color?", choices: ["Blue", "Purple", "Yellow"], answer: 1 },
    ],
    badge: { name: "Style Wizard", emoji: "🪄" },
  },
  {
    id: "sound",
    order: 5,
    title: "Sound Blocks",
    emoji: "🎵",
    tagline: "Add music, drums and silly noises to your project.",
    color: "mint",
    concepts: [
      { emoji: "🎶", title: "Play sound", body: "‘play sound Meow until done’ plays a sound from your Sounds tab." },
      { emoji: "🥁", title: "Drums & Instruments", body: "With the Music extension you can play piano keys and drums — like a tiny band!" },
      { emoji: "🔊", title: "Volume", body: "Change volume to make sounds quieter or louder." },
      { emoji: "📁", title: "Sound Library", body: "Click the Sounds tab to add sounds from the library, record your own, or upload a file." },
    ],
    blocks: [
      { label: "play sound Meow until done", description: "Play a sound to the end", color: "sound" },
      { label: "start sound Meow", description: "Play and keep going", color: "sound" },
      { label: "set volume to 100%", description: "Loud or soft", color: "sound" },
    ],
    quiz: [
      { q: "Where do you add new sounds?", choices: ["Costumes tab", "Sounds tab", "Stage"], answer: 1 },
      { q: "‘play sound … until done’ waits for the sound to...", choices: ["Stop", "Repeat", "Fade"], answer: 0 },
      { q: "Can you record your own voice?", choices: ["Yes!", "No"], answer: 0 },
      { q: "Volume 0 means...", choices: ["Super loud", "Silent"], answer: 1 },
      { q: "Sound blocks are which color?", choices: ["Pink/Magenta", "Blue", "Yellow"], answer: 0 },
    ],
    badge: { name: "Sound DJ", emoji: "🎧" },
  },
  {
    id: "events",
    order: 6,
    title: "Events",
    emoji: "🚩",
    tagline: "Decide when things start happening!",
    color: "sunshine",
    concepts: [
      { emoji: "🚩", title: "When flag clicked", body: "The most important event! Code under it runs when the green flag is clicked." },
      { emoji: "⌨️", title: "When key pressed", body: "Make a sprite jump when SPACE is pressed, or move when arrows are pressed." },
      { emoji: "👆", title: "When this sprite clicked", body: "Run code when the player clicks on a sprite — perfect for buttons!" },
      { emoji: "📢", title: "Broadcast", body: "Send a secret message that other sprites listen for. Great for coordinating scenes." },
    ],
    blocks: [
      { label: "when 🚩 clicked", description: "Starts your program", color: "events" },
      { label: "when [space ▾] key pressed", description: "Reacts to a key", color: "events" },
      { label: "when this sprite clicked", description: "Reacts to a click", color: "events" },
      { label: "broadcast [message ▾]", description: "Send a signal to other sprites", color: "events" },
    ],
    quiz: [
      { q: "Which block starts when you click the green flag?", choices: ["when 🚩 clicked", "say Hello!", "forever"], answer: 0 },
      { q: "Broadcasts are used to...", choices: ["Make sprites listen for a message", "Add color", "Spin"], answer: 0 },
      { q: "Event blocks are which color?", choices: ["Yellow", "Blue", "Green"], answer: 0 },
      { q: "Can two scripts start from the same flag click?", choices: ["Yes — they run at the same time", "No"], answer: 0 },
      { q: "‘when sprite clicked’ runs when...", choices: ["You click the sprite", "The flag is clicked", "A key is pressed"], answer: 0 },
    ],
    badge: { name: "Event Captain", emoji: "🎖️" },
  },
  {
    id: "control",
    order: 7,
    title: "Control",
    emoji: "🔁",
    tagline: "Wait, repeat, decide — control the flow!",
    color: "sunshine",
    concepts: [
      { emoji: "⏱️", title: "Wait", body: "‘wait 1 secs’ pauses for one second before the next block runs." },
      { emoji: "🔁", title: "Repeat", body: "‘repeat 10’ does the blocks inside ten times in a row. Great for shapes!" },
      { emoji: "♾️", title: "Forever", body: "‘forever’ keeps running the blocks inside, again and again, never stopping." },
      { emoji: "🤔", title: "If / Else", body: "Make decisions! ‘if touching edge then bounce else move’ — choose what to do." },
      { emoji: "🛑", title: "Stop", body: "‘stop all’ stops every script in the project." },
    ],
    blocks: [
      { label: "wait 1 secs", description: "Pause", color: "control" },
      { label: "repeat 10", description: "Do it 10 times", color: "control" },
      { label: "forever", description: "Loop forever", color: "control" },
      { label: "if <> then …", description: "Choose what to do", color: "control" },
    ],
    quiz: [
      { q: "What does ‘repeat 4’ do?", choices: ["Runs the inside blocks 4 times", "Waits 4 seconds", "Stops"], answer: 0 },
      { q: "‘forever’ stops when?", choices: ["After 1 second", "Never (until you press stop)", "After 10 times"], answer: 1 },
      { q: "‘wait 2 secs’ does what?", choices: ["Pauses 2 seconds", "Plays a sound", "Hides sprite"], answer: 0 },
      { q: "‘if … then …’ is for...", choices: ["Making decisions", "Playing sound", "Drawing"], answer: 0 },
      { q: "Control blocks are which color?", choices: ["Orange/Yellow", "Blue", "Purple"], answer: 0 },
    ],
    badge: { name: "Loop Champion", emoji: "🏆" },
  },
  {
    id: "sensing",
    order: 8,
    title: "Sensing",
    emoji: "👀",
    tagline: "Let your sprite see, listen and feel.",
    color: "mint",
    concepts: [
      { emoji: "🤝", title: "Touching", body: "‘touching mouse-pointer?’ is true when the sprite touches the mouse arrow." },
      { emoji: "⌨️", title: "Key pressed?", body: "Check if a key is being held down right now." },
      { emoji: "❓", title: "Ask & Answer", body: "‘ask What's your name? and wait’ — Scratch asks the player and saves the reply in ‘answer’." },
      { emoji: "🖱️", title: "Mouse x / Mouse y", body: "These tell you where the mouse is on the stage so the sprite can follow it." },
    ],
    blocks: [
      { label: "touching [edge ▾]?", description: "True or false", color: "sensing" },
      { label: "key [space ▾] pressed?", description: "Is it held down?", color: "sensing" },
      { label: "ask … and wait", description: "Get a typed answer", color: "sensing" },
      { label: "mouse x / mouse y", description: "Where is the mouse?", color: "sensing" },
    ],
    quiz: [
      { q: "‘ask … and wait’ stores the reply in...", choices: ["answer", "variable", "costume"], answer: 0 },
      { q: "‘touching mouse-pointer?’ gives a...", choices: ["Sound", "True/false answer", "Number only"], answer: 1 },
      { q: "Sensing blocks help your sprite...", choices: ["See and feel things", "Make sounds", "Change color"], answer: 0 },
      { q: "Mouse x tells you...", choices: ["The mouse left/right position", "The score", "The size"], answer: 0 },
      { q: "Sensing blocks are which color?", choices: ["Light blue", "Purple", "Yellow"], answer: 0 },
    ],
    badge: { name: "Super Sensor", emoji: "🛰️" },
  },
  {
    id: "operators-variables",
    order: 9,
    title: "Operators & Variables",
    emoji: "🧮",
    tagline: "Math, randomness, and remembering things.",
    color: "grape",
    concepts: [
      { emoji: "➕", title: "Math operators", body: "Green blocks let you add, subtract, multiply and divide. ‘(2) + (3)’ equals 5." },
      { emoji: "🎲", title: "Pick random", body: "‘pick random 1 to 10’ gives you a surprise number — perfect for dice!" },
      { emoji: "⚖️", title: "Compare", body: "‘(score) > 5’ is true when score is bigger than 5. Use with ‘if’ blocks." },
      { emoji: "📦", title: "Make a variable", body: "Variables are boxes that remember a number or word — like ‘score’ or ‘lives’." },
      { emoji: "🔢", title: "Change a variable", body: "‘change score by 1’ adds 1. ‘set score to 0’ resets it." },
    ],
    blocks: [
      { label: "( ) + ( )", description: "Add two numbers", color: "operators" },
      { label: "pick random 1 to 10", description: "Surprise number", color: "operators" },
      { label: "( ) > ( )", description: "Is it bigger?", color: "operators" },
      { label: "set [score ▾] to 0", description: "Reset a variable", color: "variables" },
      { label: "change [score ▾] by 1", description: "Add 1 to it", color: "variables" },
    ],
    quiz: [
      { q: "What does ‘pick random 1 to 6’ act like?", choices: ["A clock", "A dice roll", "A song"], answer: 1 },
      { q: "A variable is...", choices: ["A box that remembers something", "A sound", "A sprite"], answer: 0 },
      { q: "‘change lives by -1’ does what?", choices: ["Adds 1", "Subtracts 1", "Doubles lives"], answer: 1 },
      { q: "‘(5) > (3)’ is...", choices: ["true", "false"], answer: 0 },
      { q: "Operator blocks are which color?", choices: ["Green", "Orange", "Purple"], answer: 0 },
    ],
    badge: { name: "Variable Genius", emoji: "🧠" },
  },
];

export const getLesson = (id: string) => lessons.find((l) => l.id === id);

export const blockColorClass: Record<BlockCard["color"], string> = {
  motion: "bg-sky text-white",
  looks: "bg-grape text-white",
  sound: "bg-coral text-white",
  events: "bg-sunshine text-foreground",
  control: "bg-amber-400 text-foreground",
  sensing: "bg-cyan-400 text-foreground",
  operators: "bg-mint text-foreground",
  variables: "bg-orange-400 text-white",
  neutral: "bg-muted text-foreground",
};

export const lessonAccentClass: Record<NonNullable<Lesson["color"]>, string> = {
  sky: "bg-sky text-white",
  sunshine: "bg-sunshine text-foreground",
  mint: "bg-mint text-foreground",
  coral: "bg-coral text-white",
  grape: "bg-grape text-white",
};
