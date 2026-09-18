/* ═══════════════════════════════════════════════════════════════
   SIMPLE MODE — the same lessons, explained like you are five.
   Nothing is invented and nothing is dropped: every idea in the
   producer text also appears here, in smaller pieces.
   ═══════════════════════════════════════════════════════════════ */
const SIMPLE = {};

Object.assign(SIMPLE, {

grid:{
  lede:'Music is drawn on little boxes, like squares on graph paper. Learn to count the boxes and you can put a drum exactly where you want it.',
  blocks:[
    { h:'Step 1 · Clap along' },
    { p:'Put on any song and clap slowly and steadily with it. Each clap is called a <b>beat</b>.' },
    { h:'Step 2 · Count the claps in fours' },
    { p:'We never count claps forever. We count four, then start again:<br><span class="k a">1 2 3 4 · 1 2 3 4</span><br>One set of four is called a <b>bar</b>.' },
    { h:'Step 3 · Cut every clap into four little boxes' },
    { p:'Your music app cuts each clap into 4 tiny boxes. So one bar = 4 claps × 4 boxes = <b>16 boxes</b>. The grid floating above is exactly that: one bar, four groups of four.' },
    { p:'Those tiny boxes have a grown-up name: <b>16th notes</b>.' },
    { h:'Step 4 · Every box has a name you can say' },
    { p:'Say this out loud with the beat:<br><span class="k a">1 e and a · 2 e and a · 3 e and a · 4 e and a</span>' },
    { p:'The <b>number</b> is the clap. The <em>e</em>, <em>and</em>, <em>a</em> are the three little boxes in between. So if someone says “put the hat on the <em>and</em>”, they mean the third box of that clap. Now you know where that is.' },
    { table:{ head:['Name','How many fit in one bar','What it is'],
      rows:[
        ['Whole note','1','one long note for the whole bar'],
        ['Quarter note','4','the claps themselves'],
        ['8th note','8','two per clap'],
        ['16th note','16','four per clap — the little boxes'],
        ['Triplet','12','three squeezed into one clap'] ] } },
    { h:'Step 5 · Speed has a number' },
    { p:'<b>BPM</b> means “beats per minute” — how many <em>claps</em> happen in one minute. Not boxes, claps. At 120 BPM you clap twice every second.' },
    { p:'Different music likes different speeds: slow hip-hop about 85–95, trap 130–150, reggaetón 90–100, house 120–128.' },
    { note:{ h:'Do this now',
      p:'Press play above and count “1 e and a” out loud while the light moves. When you can do that without thinking, you can place any drum anywhere.' } },
    { try:{ h:'Make a beat', p:'A normal beat is already loaded. Tap any pad to turn a hit on or off, press play, and slide the speed around.', use:true } },
    { keys:[
      'Beat = one clap. Bar = four claps.',
      'Each clap has 4 little boxes, so a bar has 16.',
      'Say “1 e and a” and you can name every box.',
      'BPM counts claps, not boxes.',
      'A drum beat is just choosing which boxes are on.' ] }
  ],
  quiz:[
    { q:'How many little boxes are in one bar?', a:['4','8','16','32'], c:2,
      why:'4 claps, and 4 boxes inside each clap. 4 × 4 = 16.' },
    { q:'BPM counts…', a:['The little boxes','The claps (beats)','The bars','The instruments'], c:1,
      why:'Beats Per Minute — how many claps happen in a minute. The boxes just go by four times faster.' }
  ]
},

accents:{
  lede:'Some claps feel big and some feel small. Where you put your drums on the big and small ones is what makes a beat bounce.',
  blocks:[
    { h:'Step 1 · The claps are not all equal' },
    { p:'In a group of four, clap <b>1</b> is the biggest. Clap <b>3</b> is the next biggest. Claps <b>2</b> and <b>4</b> are smaller. The little boxes in between are the smallest of all.' },
    { p:'On the grid above, <b>tall blocks are the big claps</b> and flat ones are the small ones. Clap 1 has a special name: the <b>downbeat</b>.' },
    { h:'Step 2 · Big clap = safe, small box = exciting' },
    { p:'Put a drum on a big clap and it feels solid, like a foot stomping. Put the same drum on a tiny box in between and it feels like it is tipping forward, in a good way.' },
    { p:'Sitting on the big claps is called being <b>on the beat</b>. Hitting the little ones is <b>off-beat</b>.' },
    { h:'Step 3 · Doing it on purpose has a name' },
    { p:'When you hit the small, weak boxes on purpose so people move, that is called <b>syncopation</b>. Big word, simple idea: <em>hit where they do not expect it</em>.' },
    { p:'Reggaetón’s dembow pattern, funky guitar, and rolling trap hats are all syncopation.' },
    { h:'Step 4 · The clap you already know' },
    { p:'A snare or clap on beats <b>2</b> and <b>4</b> is called the <b>backbeat</b>. It is in almost every pop and rock song. Hip-hop keeps it and moves the kick drum around it. Reggaetón swaps it for a pattern that goes 3 + 3 + 2 and pushes against the beat all bar long.' },
    { note:{ h:'If your beat sounds boring',
      p:'You are probably only hitting the big claps. Move one drum onto a small box and listen — that is where the bounce lives. A weak beat is not a beat to avoid; it is a beat that <em>costs</em> something when you hit it, and that cost is the groove.' } },
    { try:{ h:'Hear it move', p:'Same drums, same speed, four different patterns. Notice where your head starts nodding.', use:true } },
    { keys:[
      'Strongest to weakest: <b>1</b>, then 3, then 2 and 4, then the little boxes.',
      'Syncopation = hitting the weak boxes on purpose.',
      'Backbeat = snare on 2 and 4.',
      'Bounce comes from mixing strong and weak, not from more drums.' ] }
  ],
  quiz:[
    { q:'Which clap is the biggest one in a group of four?', a:['1','2','3','4'], c:0,
      why:'Clap 1, the downbeat. Clap 3 is the second biggest, which is why kicks often sit on 1 and 3.' },
    { q:'Hitting the weak little boxes on purpose is called…', a:['A backbeat','Syncopation','A downbeat','Tempo'], c:1,
      why:'Syncopation. It is the main ingredient of groove in almost every style.' }
  ]
},

meter:{
  lede:'Some music walks. Some music gallops. That is all “meter” means. Here it is, one tiny step at a time.',
  blocks:[
    { h:'Step 1 · The tap' },
    { p:'Put your hand on the table. Tap slowly, like a clock: <b>tap … tap … tap … tap</b>.' },
    { p:'That tap is called a <b>beat</b>. Every song has it underneath, even when no drum is playing it. When you nod your head to music, your neck is tapping the beat.' },
    { h:'Step 2 · Taps come in little groups' },
    { p:'We count a few taps, then start again: <span class="k a">1 2 3 4 · 1 2 3 4</span>. One of those groups is a <b>bar</b>, and the <b>1</b> is the loud tap, like the first stomp when you march.' },
    { h:'Step 3 · Now cut each tap into pieces' },
    { p:'This is the only new idea in the whole chapter: <b>you can put more than one note inside one tap</b>. Keep tapping at the same slow speed and say a word on every tap:' },
    { keys:[
      'Say <b>AP-PLE</b> on every tap. That is <b>2 pieces</b> in one tap.',
      'Now say <b>STRAW-BER-RY</b> on every tap. That is <b>3 pieces</b> in one tap.' ] },
    { p:'Your hand never sped up. Only the number of pieces inside each tap changed — and that is the whole difference:' },
    { keys:[
      '<b>Simple meter</b> = apple. Each tap splits into <b>2</b>. It feels like <b>walking</b>. (4/4, 3/4, 2/4)',
      '<b>Compound meter</b> = strawberry. Each tap splits into <b>3</b>. It feels like a horse <b>galloping</b>. (6/8, 9/8, 12/8)' ] },
    { note:{ h:'How to hear which one a song is',
      p:'Tap along and try to fit “<b>1 and 2 and</b>” into it. Comfy? It is simple. If the song keeps wanting a third little word — “<b>1-la-li 2-la-li</b>” — it is compound. Galloping songs: lots of Afrobeats, gospel, blues shuffles, drill triplet flows, and anything swung.' } },
    { h:'Step 4 · The two numbers' },
    { p:'Written music squeezes this into two numbers stacked up, like <span class="k">4/4</span>. It is not a fraction — it is two separate answers:' },
    { keys:[
      '<b>Top number</b> = how many taps in one group.',
      '<b>Bottom number</b> = which size of note counts as one tap. 4 means a quarter note, 8 means an 8th note (a smaller one).' ] },
    { p:'So <span class="k">3/4</span> is three quarter-note taps — a waltz: <em>1</em> 2 3, <em>1</em> 2 3.' },
    { p:'And <span class="k">6/8</span> is six 8th notes. Six is a lot to count, so we bundle them in threes and feel <b>two big taps of three</b>. Bundling in threes is what makes it gallop. <span class="k">12/8</span> is the same trick with twelve: <b>four big taps of three</b>.' },
    { table:{ head:['Written','Kind','You feel','Sounds like'],
      rows:[
        ['4/4','Simple','4 taps, 2 pieces each','almost every song ever'],
        ['3/4','Simple','3 taps, 2 pieces each','a waltz, a slow ballad'],
        ['6/8','Compound','2 taps, 3 pieces each','rocking, lullabies, Afro rhythms'],
        ['12/8','Compound','4 taps, 3 pieces each','blues shuffle, gospel'],
        ['5/4 · 7/8','Odd','5 or 7 taps','a limp or a skip — prog, film music'] ] } },
    { p:'That last row is the leftovers drawer. Most groups have 2, 3 or 4 taps because that is what feels natural to walk to. A group of <b>5</b> or <b>7</b> will not split evenly, so it feels like someone skipping a step. It is rare, and it is allowed.' },
    { h:'Step 5 · What producers actually do' },
    { p:'Good news: in a music app you almost never touch the time signature. You leave it on 4/4 and get the gallop two other ways.' },
    { keys:[
      '<b>Triplets.</b> Put <b>3</b> notes where 2 normally go, in just a few places. That is one strawberry tap inside an apple song — exactly what a triplet hi-hat roll or a triplet rap flow is.',
      '<b>Swing.</b> A knob that nudges every second little note slightly late, so each pair goes <em>loooong-short</em>. At 0% it is robotic. Turn it up and the beat starts to lope. At 100% you have full triplets.' ] },
    { note:{ h:'One sentence to remember it all',
      p:'The tap stays the same speed. <b>Two</b> pieces inside it = walking = simple. <b>Three</b> pieces inside it = galloping = compound. Everything else is just how we write that down.' } },
    { try:{ h:'Now hear it', p:'The top row is the big taps. Press play, then switch between the two buttons. Keep your hand tapping — the speed never changes, only what is inside each tap.', use:true } },
    { keys:[
      'Beat = one tap. Bar = a little group of taps.',
      'Simple = 2 pieces per tap (apple). Compound = 3 pieces per tap (strawberry).',
      'Top number = taps per bar. Bottom number = which note is one tap.',
      '6/8 and 12/8 are written small but bundled in threes, so they gallop.',
      'In a DAW you stay in 4/4 and use triplets or swing.' ] }
  ],
  quiz:[
    { q:'You tap slowly and say “STRAW-BER-RY” on every tap. What is that?', a:['Simple','Compound','Odd','Neither'], c:1,
      why:'Three pieces inside one tap = compound. “AP-PLE”, with two pieces, would be simple.' },
    { q:'In 3/4, what does the top number 3 tell you?', a:['Three pieces in each tap','Three taps in each bar','Three bars in the song','Three instruments'], c:1,
      why:'The top number counts taps per bar. The bottom number says which size of note is one tap.' },
    { q:'You want a galloping feel but your song is in 4/4. Easiest fix?', a:['Change to 6/8','Use triplets, or turn up swing','Speed it up','Change the key'], c:1,
      why:'Triplets put 3 notes where 2 would go, and swing nudges every second note late. Both gallop without changing the time signature.' }
  ]
},

pianoroll:{
  lede:'A piano looks like a hundred keys. It is really just 12 keys, repeating over and over forever.',
  blocks:[
    { h:'Step 1 · Count to twelve, then start again' },
    { p:'Move from any key to the very next key — white or black, it does not matter — and you have moved one <b>semitone</b>. That is the smallest step in music.' },
    { p:'Take 12 of those steps and you land on a key that sounds like the same note, just higher. That jump is an <b>octave</b>. So C, then a higher C, then a higher C — same name, different height.' },
    { p:'Two semitones together are called a <b>tone</b> (some people say whole step).' },
    { h:'Step 2 · Find C using your eyes' },
    { p:'Look at the black keys. They come in a group of <b>2</b>, then a group of <b>3</b>, forever.' },
    { keys:[
      '<b>C</b> is the white key just to the left of the group of <b>two</b> black keys.',
      '<b>F</b> is the white key just to the left of the group of <b>three</b> black keys.' ] },
    { p:'You never have to memorise the others. Find C, then walk: C D E F G A B, and back to C.' },
    { h:'Step 3 · Two places have no black key' },
    { p:'Between <b>E and F</b>, and between <b>B and C</b>, there is no black key at all. Those pairs are only one semitone apart, while other white neighbours are two. This is why everything else in music sits where it does.' },
    { h:'Step 4 · One key, two names' },
    { p:'The black key between C and D can be called <b>C♯</b> (“C sharp”, because it is above C) or <b>D♭</b> (“D flat”, because it is below D). Same key, same sound, two spellings. Musicians call that <b>enharmonic</b>.' },
    { h:'Step 5 · What one note in your song actually stores' },
    { p:'Every little block you draw in a piano roll remembers four things:' },
    { keys:[
      '<b>Which key</b> it is (the pitch — which row it sits on).',
      '<b>When</b> it starts (which box).',
      '<b>How long</b> it lasts (how many boxes).',
      '<b>How hard</b> it is played — called <b>velocity</b>, a number from 1 to 127.' ] },
    { p:'Velocity is the one beginners forget. Make some notes a bit softer and a bit louder and a stiff part suddenly sounds like a person played it.' },
    { note:{ h:'Two names you will see',
      p:'The C in the middle of a piano is called <b>C4</b>, and computers call it note number <b>60</b>. If your app shows numbers instead of letters, 60 is the middle C.' } },
    { try:{ h:'Play and find', p:'Tap keys to hear them. Then press “Quiz me” — the names disappear and you find the note using the black-key groups.', use:true } },
    { keys:[
      '12 keys, then it all repeats an octave higher.',
      'One key to the next = a semitone. Two = a tone.',
      'C is left of the two black keys; F is left of the three.',
      'E–F and B–C have no black key between them.',
      'C♯ and D♭ are the same key with two names.',
      'A note stores pitch, start, length and velocity.' ] }
  ],
  quiz:[
    { q:'How many semitones until a note repeats higher up?', a:['7','8','12','13'], c:2,
      why:'12. That jump is called an octave — the same letter, higher.' },
    { q:'Which white keys have no black key between them?', a:['C and D','E and F','F and G','A and B'], c:1,
      why:'E–F (and also B–C). They are only one semitone apart.' }
  ]
},

intervals:{
  lede:'An interval is just “how far apart are these two notes”. You find it by counting keys. That is the whole trick.',
  blocks:[
    { h:'Step 1 · Count every key' },
    { p:'Put a finger on one key, then count each key you pass — <b>black ones too</b> — until you reach the other note. The number you get is the interval, counted in semitones.' },
    { p:'C up to G = 7 keys, so 7 semitones. C up to E♭ = 3 keys, so 3 semitones. The arc drawn above shows every key you step through.' },
    { h:'Step 2 · Every number has a feeling' },
    { p:'You already know these sounds from songs. Here is the name for each one:' },
    { table:{ head:['Count','Name','Feels like'],
      rows:[
        ['1','minor 2nd','scary, creeping'],
        ['2','major 2nd','one step, plain'],
        ['3','minor 3rd','sad'],
        ['4','major 3rd','happy'],
        ['5','perfect 4th','open, brave'],
        ['6','tritone','wobbly, wants to move'],
        ['7','perfect 5th','strong and empty'],
        ['8','minor 6th','longing'],
        ['9','major 6th','warm and sweet'],
        ['10','minor 7th','smooth, soulful'],
        ['11','major 7th','dreamy with an edge'],
        ['12','octave','the same note, higher'] ] } },
    { h:'Step 3 · The two that matter most' },
    { keys:[
      'The <b>3rd</b> is the happy/sad switch. <b>4</b> = happy (major). <b>3</b> = sad (minor). One key of difference changes the whole song.',
      'The <b>5th</b> (7) is the strong one. It sounds so agreeable it barely has an opinion, which is why big loud chords and 808 basslines lean on it.' ] },
    { small:'About “happy” and “sad”: those are what these gaps usually feel like in pop music, not a law of nature. A sad-sounding gap in a fast, loud, major-key song can feel triumphant. Use the words to recognise the sound, then trust your ears about what it means in <em>your</em> track.' },
    { h:'Step 4 · Why names have two words' },
    { p:'A name like “major 3rd” has a <b>number</b> (3rd, 5th, 7th) and a <b>quality</b> (major, minor, perfect). The number counts letter names, so a 3rd can come in two sizes — major (4) or minor (3). The word <b>perfect</b> is only used for 4ths, 5ths, octaves and unisons, because they only come in one normal size.' },
    { h:'Step 5 · Comfy notes and leaning notes' },
    { p:'Some pairs sound settled and comfy: the octave, 5th, 4th, 3rds and 6ths. These are <b>consonant</b>. Others sound like they are leaning and want to move: 2nds, 7ths and the tritone. These are <b>dissonant</b>.' },
    { p:'Dissonant is not wrong. It is fuel. You make a leaning sound, then let it fall into a comfy one — that is the oldest trick in music.' },
    { try:{ h:'Hear the gaps', p:'Pick a gap and hear it. Then press “Ear test”: the lab plays one and you tap the key you think it landed on.', use:true } },
    { keys:[
      'Interval = how many keys apart, counting black keys.',
      '3 = sad, 4 = happy, 7 = strong, 6 = wobbly, 12 = same note higher.',
      'Name = a number plus a quality.',
      'Leaning (dissonant) sounds are tension you can resolve.' ] }
  ],
  quiz:[
    { q:'How many semitones from C up to G?', a:['5','6','7','8'], c:2,
      why:'7 — count C♯ D D♯ E F F♯ G. That is a perfect 5th.' },
    { q:'Which gap makes a chord sound sad?', a:['4 semitones','3 semitones','7 semitones','12 semitones'], c:1,
      why:'3 semitones — a minor 3rd. Move it up one key to 4 and the chord turns happy.' }
  ]
},

scales:{
  lede:'A scale is a small team of notes that get along. Pick a team and it becomes very hard to play a wrong note.',
  blocks:[
    { h:'Step 1 · A scale is a walking pattern' },
    { p:'Start on any key and walk upwards using big steps (<b>T</b>, two keys) and small steps (<b>S</b>, one key), in this exact order:' },
    { p:'<span class="k a">T &nbsp; T &nbsp; S &nbsp; T &nbsp; T &nbsp; T &nbsp; S</span>' },
    { p:'That is the <b>major scale</b>. Do it from C and you use only white keys: <span class="k">C D E F G A B</span>. Do it from any other key and the pattern tells you which black keys you need — you never have to guess.' },
    { p:'Counted from the first note, the major scale is <span class="k">0 2 4 5 7 9 11</span>. Learn those seven numbers and you can build it anywhere.' },
    { h:'Step 2 · Give the notes numbers, not letters' },
    { p:'Inside a scale each note gets a number from 1 to 7, called its <b>degree</b>. Producers think in these numbers, because they work in every key.' },
    { keys:[
      '<b>1</b> is home. Its real name is the <b>tonic</b>. Songs feel finished here.',
      '<b>5</b> pulls hardest back to home. Its name is the <b>dominant</b>.',
      '<b>3</b> decides happy or sad.',
      '<b>7</b> leans right into home, so it is called the leading note.' ] },
    { p:'This is why a tune can move from one key to another and still work: the <em>numbers</em> stay the same, only the letters change.' },
    { h:'Step 3 · Minor is the same notes with a different home' },
    { p:'The <b>natural minor</b> scale walks <span class="k a">T S T T S T T</span>, or <span class="k">0 2 3 5 7 8 10</span>. Compared to major, the <b>3rd, 6th and 7th</b> are each one key lower. That lower 3rd is the whole difference between happy and serious.' },
    { p:'Here is the shortcut that saves hours: every major scale has a <b>relative minor</b> that uses <em>exactly the same notes</em>, starting from note number 6. C major and A minor are the same seven white keys. Nothing moved — only which note feels like home.' },
    { h:'Step 4 · The beginner’s cheat scale' },
    { p:'A <b>pentatonic</b> scale is a normal scale with the two most argumentative notes taken out, leaving five. Fewer notes means fewer ways to fight the chords, which is why so many hooks live here. If your tunes keep clashing, write them in minor pentatonic first and add the other notes back one at a time.' },
    { note:{ h:'One thing to be careful about',
      p:'Staying inside the scale keeps you in the <b>key</b>. It does <em>not</em> promise that every note will suit the <b>chord</b> playing underneath at that moment. F is in C major, but hold it over a C chord and it rubs against the E right below it. Lesson 20 is all about that, so do not be surprised when a “correct” note still sounds wrong — it is not you making a mistake.' } },
    { table:{ head:['Scale','Numbers','From C','Good for'],
      rows:[
        ['Major','0 2 4 5 7 9 11','C D E F G A B','pop, house, gospel'],
        ['Natural minor','0 2 3 5 7 8 10','C D E♭ F G A♭ B♭','rap, drill, most trap'],
        ['Minor pentatonic','0 3 5 7 10','C E♭ F G B♭','hooks and riffs'],
        ['Major pentatonic','0 2 4 7 9','C D E G A','safe, singable'],
        ['Blues','0 3 5 6 7 10','C E♭ F G♭ G B♭','gritty and soulful'] ] } },
    { try:{ h:'Build one', p:'Change the starting note and the scale type and watch which keys light up. The shape stays the same and just slides along.', use:true } },
    { keys:[
      'Major = T T S T T T S = 0 2 4 5 7 9 11.',
      'Minor = 0 2 3 5 7 8 10 — lower 3rd, 6th and 7th.',
      'Think in numbers 1–7, not letters.',
      'A major scale and the minor starting on its 6th note share every note.',
      'Pentatonic = five notes, almost no wrong answers.' ] }
  ],
  quiz:[
    { q:'What is the walking pattern of a major scale?', a:['T S T T S T T','T T S T T T S','T T T S T T S','S T T S T T T'], c:1,
      why:'Big Big small Big Big Big small. The two small steps land between notes 3–4 and 7–8.' },
    { q:'Which minor scale uses exactly the same notes as C major?', a:['C minor','A minor','E minor','G minor'], c:1,
      why:'A minor — it starts on the 6th note of C major and uses the same seven white keys.' }
  ]
},

modes:{
  lede:'Play only the white keys, but decide that D — not C — is home. Nothing about the notes changed, yet it sounds like a different world. That is a mode.',
  blocks:[
    { h:'Step 1 · Seven notes, seven places to start' },
    { p:'A major scale has seven notes, so there are seven different notes you could treat as “home”. Each choice gives a different pattern of big and small steps <em>counted from that home</em> — and so a different mood. Those seven results are the <b>modes</b>.' },
    { h:'Step 2 · Learn them as “major or minor, with one note moved”' },
    { p:'Forget the Greek names for a moment. Each mode is just major or minor with one or two notes nudged, and that nudged note is the whole personality:' },
    { keys:[
      '<b>Ionian</b> = plain major. Bright and finished.',
      '<b>Dorian</b> = minor, but the 6th is higher. That one note stops it sounding hopeless — minor but hopeful.',
      '<b>Phrygian</b> = minor with a lowered 2nd. That tiny step above home is the darkest move in the set. Trap and drill love it.',
      '<b>Lydian</b> = major with a raised 4th. Floaty and dreamy, like it never touches the ground.',
      '<b>Mixolydian</b> = major with a lowered 7th. Bluesy and cocky, with no strong pull home.',
      '<b>Aeolian</b> = plain natural minor. Sad and serious.',
      '<b>Locrian</b> = minor with a lowered 2nd <em>and</em> 5th. So wobbly that it cannot really be a home — use it for colour.' ] },
    { h:'Step 3 · Brightness is a dial' },
    { p:'Line them up from brightest to darkest:' },
    { p:'<span class="k a">Lydian → Ionian → Mixolydian → Dorian → Aeolian → Phrygian → Locrian</span>' },
    { p:'Every step down that line lowers exactly one note. This is the most useful thing about modes: if your loop feels too happy, move one step darker instead of rewriting it.' },
    { h:'Step 4 · A mode only works if you are stubborn' },
    { p:'A mode is notes <em>plus</em> a stubborn home note. Dorian over a Dm chord that keeps coming back sounds like Dorian. The exact same notes over a C chord just sound like C major. So keep landing on the home note and use the chord that contains the special note.' },
    { table:{ head:['Mode','White keys from','Nudged note','Mood'],
      rows:[
        ['Ionian','C','— (this is major)','bright'],
        ['Dorian','D','higher 6th','hopeful minor'],
        ['Phrygian','E','lower 2nd','dark, Spanish, trap'],
        ['Lydian','F','higher 4th','dreamy'],
        ['Mixolydian','G','lower 7th','bluesy, funky'],
        ['Aeolian','A','— (this is minor)','sad'],
        ['Locrian','B','lower 2nd and 5th','unstable'] ] } },
    { try:{ h:'Turn the brightness dial', p:'All seven modes starting on the same note, so you hear the mood change instead of the key change. Watch which single key moves each time.', use:true } },
    { keys:[
      'Same seven notes, different home = a different mode.',
      'Each mode is major or minor with one note moved.',
      'Brightest to darkest: Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian.',
      'Keep hammering the home note or the mode disappears.' ] }
  ],
  quiz:[
    { q:'Dorian is natural minor with which change?', a:['A higher 6th','A lower 2nd','A higher 3rd','A lower 5th'], c:0,
      why:'Just the 6th, raised one key. That single note is why Dorian sounds hopeful instead of sad.' },
    { q:'White keys only, but treating E as home, gives you…', a:['C major','E Phrygian','E minor','A Dorian'], c:1,
      why:'E Phrygian. Same white keys as C major, but from E the very first step is a small one — the dark lowered 2nd.' }
  ]
},

chords:{
  lede:'A chord is three or more notes played together. You build one by skipping — that is genuinely the whole method.',
  blocks:[
    { h:'Step 1 · Take one, skip one' },
    { p:'Pick a scale. Start on any note, <b>skip</b> the next one, take the one after, skip again, take the one after.' },
    { p:'From C major: take <b>C</b>, skip D, take <b>E</b>, skip F, take <b>G</b>. You just built a C major chord. Three notes like this are called a <b>triad</b>.' },
    { h:'Step 2 · The gaps are called 3rds, and they decide the mood' },
    { p:'Because you skipped a note each time, the gaps between your chord notes are <b>3rds</b>. Which size of 3rd you land on decides what kind of chord it is:' },
    { table:{ head:['Chord','Counted from the bottom','Sounds'],
      rows:[
        ['Major','0 4 7','happy, settled'],
        ['Minor','0 3 7','sad, settled'],
        ['Diminished','0 3 6','tense, unstable'],
        ['Augmented','0 4 8','strange, floating'] ] } },
    { p:'Look carefully: major and minor <em>both</em> have the 7. Only the middle note moves, by one key — that is the whole difference. People call it happy versus sad, and often it does feel like that, but it is a tendency and not a rule: there is plenty of joyful minor music and plenty of miserable major music. What the middle note definitely changes is the <b>colour</b>.' },
    { h:'Step 3 · Every scale hands you seven chords' },
    { p:'Do the skipping trick starting from each note of the scale and you get the seven chords that already fit that key. In a major key they always come out in this order:' },
    { p:'<span class="k v">1 major · 2 minor · 3 minor · 4 major · 5 major · 6 minor · 7 diminished</span>' },
    { p:'In a minor key: <span class="k v">1 minor · 2 diminished · 3 major · 4 minor · 5 minor · 6 major · 7 major</span>.' },
    { h:'Step 4 · Roman numerals are just those numbers' },
    { p:'Musicians write those seven with Roman numerals: <span class="k v">I ii iii IV V vi vii°</span>. A <b>BIG</b> letter means major, a <b>small</b> letter means minor, and the little circle ° means diminished.' },
    { p:'The point is that numerals do not name a key. <span class="k">I–V–vi–IV</span> is the same song shape whether you play it in C, in G or in F. That is how producers swap ideas with each other.' },
    { try:{ h:'Watch a chord get built', p:'Pick a number and the lab stacks that chord for you and names every gap. Switch between major and minor to see the pattern change.', use:true } },
    { keys:[
      'Triad = take one, skip one, take one, skip one, take one.',
      'Major 0 4 7 · minor 0 3 7 · diminished 0 3 6 · augmented 0 4 8.',
      'Only the middle note separates happy from sad.',
      'Major key: I ii iii IV V vi vii°. Minor key: i ii° III iv v VI VII.',
      'Big numeral = major, small = minor, ° = diminished.' ] }
  ],
  quiz:[
    { q:'A minor chord counted from its bottom note is…', a:['0 4 7','0 3 7','0 3 6','0 4 8'], c:1,
      why:'0 3 7. Raise that 3 to a 4 and it becomes major.' },
    { q:'In a major key, the chord built on note 5 is always…', a:['minor','major','diminished','augmented'], c:1,
      why:'Major — the famous V chord, the one that pulls hardest back home.' }
  ]
},

progressions:{
  lede:'Chords in a row tell a tiny story: leave home, get wobbly, come back home. Once you hear the three jobs, you can write progressions instead of guessing.',
  blocks:[
    { h:'Step 1 · Every chord has one of three jobs' },
    { keys:[
      '<b>Home</b> (chords I, vi, iii) — resting. Nothing needs to happen next.',
      '<b>Away</b> (chords IV, ii) — moving, but calm. You have left home, no panic.',
      '<b>Wobbly</b> (chords V, vii°) — tension. It really wants to fall back home, because it contains the note right below home (the <em>leading note</em>), which leans upward.' ] },
    { small:'Careful with one thing you will read elsewhere: people say the V chord “contains a tritone”. The plain three-note V does not — G B D has no tritone. You only get one when you add the 7th and make it G7 (the B and the F are 6 semitones apart). That is why V7 pulls even harder than V.' },
    { p:'A progression is just a walk through those three states. The classic shape is <b>home → away → wobbly → home</b>, and it is underneath thousands of songs.' },
    { h:'Step 2 · Chords with the same job can swap' },
    { p:'Once you know the job, you can trade one chord for another that does the same job — swap I for vi, or IV for ii — and the story still works. That is how you make a loop sound different without breaking it.' },
    { h:'Step 3 · The ones worth stealing' },
    { table:{ head:['Numbers','In the key of C','Where you have heard it'],
      rows:[
        ['I–V–vi–IV','C G Am F','the pop loop — everywhere'],
        ['vi–IV–I–V','Am F C G','the same loop starting sadder'],
        ['ii–V–I','Dm G C','jazz, neo-soul, R&B'],
        ['I–vi–IV–V','C Am F G','old ballads, doo-wop'],
        ['i–VI–III–VII','Cm A♭ E♭ B♭','big minor — trap, drill, film'],
        ['i–iv–i–V','Cm Fm Cm G','dark and cinematic'],
        ['i–VII–VI–VII','Cm B♭ A♭ B♭','vamp used in reggaetón'] ] } },
    { h:'Step 4 · How a phrase stops' },
    { p:'The ending of a phrase is called a <b>cadence</b>. There are four you will meet:' },
    { keys:[
      '<b>V → I</b> — a full stop. Completely finished. (Called <em>authentic</em>, or <em>perfect</em>.)',
      '<b>IV → I</b> — a soft landing, like an “amen”. (Called <em>plagal</em>.)',
      'Stopping <b>on V</b> — a comma. It leaves a question hanging. (Called <em>half</em>, or <em>imperfect</em>.)',
      '<b>V → vi</b> — a surprise. You expect the full stop and get a different chord instead. (Called <em>deceptive</em>, or <em>interrupted</em>.)' ] },
    { small:'Two sets of names exist for the same four things, because British and American theory books label them differently. Learn the sound; read whichever label your book uses.' },
    { note:{ h:'Loops do not want an ending',
      p:'Modern music loops 4 or 8 bars forever, so a full stop is often not what you want — a wobbly last chord (V, or VII, or IV) throws you back to bar 1. Try it both ways and listen: ending on home makes each pass feel complete, ending on the wobbly chord makes it circle. Neither is a rule.' } },
    { try:{ h:'Four slots, your choice', p:'Load a famous progression, then change any slot to another number. You will hear straight away which swaps keep the story and which break it.', use:true } },
    { keys:[
      'Three jobs: home, away, wobbly.',
      'home → away → wobbly → home is the default story.',
      'Swap chords that share a job to refresh a loop safely.',
      'End a loop on the wobbly chord so it pulls back to the start.' ] }
  ],
  quiz:[
    { q:'Which chord pulls hardest back to home?', a:['IV','ii','V','vi'], c:2,
      why:'V, the wobbly one. It contains the note that leans right into home.' },
    { q:'I–V–vi–IV in the key of G is…', a:['G D Em C','G C Am D','G Bm C D','G Em C D'], c:0,
      why:'In G: 1 = G, 5 = D, 6 = Em, 4 = C. Numbers work in every key.' }
  ]
},

'adv-intervals':{
  lede:'Anything wider than an octave is a gap you already know, wearing a bigger number. Two rules and the scary jazz names stop being scary.',
  blocks:[
    { h:'Step 1 · Add an octave, add 7 to the name' },
    { p:'If a gap is wider than 12 semitones, we call it <b>compound</b> — a fancy word for “it has an octave inside it”. To name it, take the small gap and add 7:' },
    { keys:[
      'a 2nd + an octave = a <b>9th</b>',
      'a 4th + an octave = an <b>11th</b>',
      'a 6th + an octave = a <b>13th</b>' ] },
    { p:'(Why 7 and not 8? Because the two gaps share the note in the middle, so one number overlaps.)' },
    { h:'Step 2 · Why bother, if it is the same note?' },
    { p:'Because <b>height changes the feeling</b>. A note sitting right next to the bottom note rubs and clashes. Move that same note up an octave and it turns into a sparkle on top of the chord. Same note name, completely different job.' },
    { table:{ head:['Count','Name','Same note as','Used in'],
      rows:[
        ['13','minor 9th','minor 2nd','very crunchy chords'],
        ['14','major 9th','major 2nd','add9, 9, m9 — the pretty one'],
        ['15','minor 10th','minor 3rd','a minor 3rd, spread wide'],
        ['17','11th','perfect 4th','m11 and sus — washy'],
        ['18','sharp 11th','tritone','dreamy major chords'],
        ['21','13th','major 6th','plush, soulful chords'] ] } },
    { h:'Step 3 · The flip rule (it always makes 9)' },
    { p:'Take the lower note and move it up an octave, so the two notes swap places. The gap becomes its <b>inversion</b>, and the two numbers always add up to <b>9</b>. Major turns into minor, minor into major, and perfect stays perfect.' },
    { keys:[
      'A 3rd flips to a 6th (3 + 6 = 9). Major 3rd → minor 6th.',
      'A 4th flips to a 5th. Both stay perfect.',
      'A 2nd flips to a 7th. Minor 2nd → major 7th.',
      'The tritone flips to itself — 6 + 6 = 12. That is exactly why it feels so homeless.' ] },
    { p:'This is a real shortcut: you only have to learn six gaps by ear, because the other six are their mirrors. And when a chord sounds muddy, flipping one gap is often the entire fix.' },
    { try:{ h:'Stretch it and flip it', p:'Play a small gap, then push the top note up an octave and hear the clash turn into colour.', use:true } },
    { keys:[
      'Compound = the small gap plus an octave. Add 7 to the name.',
      'Same note, higher up = sparkle instead of clash.',
      'Flipping a gap: the numbers add to 9, major swaps with minor.',
      'The tritone is its own flip.' ] }
  ],
  quiz:[
    { q:'A major 9th is the same note as…', a:['A major 2nd an octave higher','A minor 7th','A perfect 5th','A major 3rd higher'], c:0,
      why:'14 = 2 + 12. Same note name, one octave up, where it sounds sweet instead of clashing.' },
    { q:'A perfect 4th flips to…', a:['A perfect 4th','A perfect 5th','A major 6th','A minor 3rd'], c:1,
      why:'4 + 5 = 9, and perfect stays perfect.' }
  ]
},

sevenths:{
  lede:'Add one more note on top of a chord and it stops sounding like a beginner chord. This is the fastest upgrade you can make.',
  blocks:[
    { h:'Step 1 · Do not stop skipping' },
    { p:'You built a triad by skipping: notes <b>1 3 5</b>. Skip once more and you get note <b>7</b>. Now the chord is <b>1 3 5 7</b> — a <b>seventh chord</b>.' },
    { h:'Step 2 · The family (there are only six to know)' },
    { table:{ head:['Chord','Counted from the bottom','Written','Feels'],
      rows:[
        ['Major 7th','0 4 7 11','Cmaj7','dreamy, warm, lo-fi'],
        ['Minor 7th','0 3 7 10','Cm7','smooth, soulful, safe'],
        ['Dominant 7th','0 4 7 10','C7','tense, bluesy, wants to move'],
        ['Half-diminished','0 3 6 10','Cm7♭5','nervous, on the way somewhere'],
        ['Diminished 7th','0 3 6 9','Cdim7','pure scary-film tension'],
        ['Minor major 7th','0 3 7 11','Cm(maj7)','sneaky, spy-film'] ] } },
    { h:'Step 3 · The one mix-up everybody makes' },
    { p:'<span class="k">Cmaj7</span> and <span class="k">C7</span> are <b>not</b> the same chord.' },
    { keys:[
      '<b>Cmaj7</b> has the high 7 (11 semitones, one key below the octave). Gorgeous and still.',
      '<b>C7</b> has the lower 7 (10 semitones). It sounds like it is halfway out the door.' ] },
    { p:'Written on its own, “7” always means the restless one. If you want the pretty one you must write “maj7”.' },
    { h:'Step 4 · Where they land in a key' },
    { p:'Run the skipping trick through a whole major scale and the family always comes out in this order:' },
    { p:'<span class="k v">Imaj7 &nbsp; iim7 &nbsp; iiim7 &nbsp; IVmaj7 &nbsp; V7 &nbsp; vim7 &nbsp; viim7♭5</span>' },
    { p:'Notice there is only <b>one</b> dominant 7 in the key, on note 5. That is the tension chord. In a minor key you get <span class="k v">im7 iim7♭5 IIImaj7 ivm7 vm7 VImaj7 VII7</span> — and that <b>VII7</b> is the sound of a thousand drill loops.' },
    { note:{ h:'Try this on a loop you already have',
      p:'Add the 7th to every chord. The key and the numbers do not change, but the loop suddenly sounds expensive. If it turns muddy, take out the <b>5th</b> — in a seventh chord it is the note you need least.' } },
    { try:{ h:'Triad, then seventh', p:'Pick a type and compare it with the plain three-note version. The floating tiles name every note and gap.', use:true } },
    { keys:[
      'Seventh chord = 1 3 5 7, one more skip.',
      'maj7 dreamy · m7 smooth · 7 restless · m7♭5 nervous · dim7 scary.',
      'Cmaj7 is not C7.',
      'Only note 5 of a major key carries a dominant 7.',
      'Muddy? Remove the 5th.' ] }
  ],
  quiz:[
    { q:'Which notes are in Cmaj7?', a:['C E G B♭','C E G B','C E♭ G B♭','C E G A'], c:1,
      why:'C E G B = 0 4 7 11. With a B♭ instead it would be C7, which has a completely different job.' },
    { q:'Your seventh chords sound muddy. What do you take out first?', a:['The root','The 5th','The 7th','The 3rd'], c:1,
      why:'The 5th. The bottom note, the 3rd and the 7th carry the chord’s identity; the 5th just adds weight.' }
  ]
}

});
