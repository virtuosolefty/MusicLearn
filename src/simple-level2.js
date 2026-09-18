Object.assign(SIMPLE, {

extensions:{
  lede:'Keep stacking past the 7th and you reach the sparkly notes that sit on top. They do not change happy or sad — they change how expensive it sounds.',
  blocks:[
    { h:'Step 1 · The stack keeps going' },
    { p:'You went <b>1 → 3 → 5 → 7</b>. Carry on skipping and you get <b>9 → 11 → 13</b>. After 13 you would be back at the bottom note again, so that is the whole list.' },
    { p:'Those top three are called <b>extensions</b>. They do not decide major or minor — the 3rd already did that. They only add colour.' },
    { keys:[
      '<b>9th</b> — the sweet one. Adds air and a modern shine. Safe on almost anything.',
      '<b>11th</b> — washy and floaty. Lovely on minor chords. On a major chord it sits one key above the 3rd and fights it, so we usually raise it (♯11) instead.',
      '<b>13th</b> — plush and soulful. It is the same note as the 6th, one octave higher.' ] },
    { h:'Step 2 · “add9” and “9” are different chords' },
    { keys:[
      '<span class="k">Cadd9</span> = the plain three-note chord plus the 9th, with <b>no 7th</b> (C E G D). Open and poppy.',
      '<span class="k">C9</span> = a dominant 7th chord plus the 9th (C E G B♭ D). Full, funky, and restless because the 7 is in there.' ] },
    { p:'Beginners often type “9” when they mean “add9”, then wonder why everything sounds unfinished.' },
    { p:'One more easy win: <span class="k">6/9</span> (C E G A D) — a major chord with no 7th at all, just the 6th and the 9th. It sounds finished and expensive at the same time, which is why so much neo-soul ends on it.' },
    { h:'Step 3 · You must leave notes out' },
    { p:'A full 13th chord has seven notes. Play them all down low and you get mud. Real players <b>leave notes out</b>. Keep:' },
    { keys:[
      'the <b>root</b> (often way down in the bass),',
      'the <b>3rd</b> — it says major or minor,',
      'the <b>7th</b> — it says what job the chord is doing,',
      'and whichever <b>extension</b> you actually want to hear.' ] },
    { p:'Drop the <b>5th</b> first. Then the 11th.' },
    { note:{ h:'Rootless is a real trick, not cheating',
      p:'If your bass or 808 is already hammering the bottom note, your chord does not need it. Play 3–5–7–9 and let the bass do the root. This one habit is most of why professional keys sit neatly in a mix instead of fighting the low end.' } },
    { try:{ h:'Add colour one layer at a time', p:'Start with the plain chord and switch layers on. Listen for the moment it stops sounding basic — usually the 9th.', use:true } },
    { keys:[
      'Extensions are 9, 11 and 13 — colour, not mood.',
      'add9 has no 7th; 9 does.',
      'The natural 11th clashes on major chords; use ♯11.',
      'Leave notes out: drop the 5th first.',
      'Rootless voicings let the bass carry the bottom note.' ] }
  ],
  quiz:[
    { q:'Cadd9 contains…', a:['C E G B♭ D','C E G D','C E G B D','C D E G'], c:1,
      why:'The plain chord plus the 9th and no 7th. Adding a B♭ would turn it into C9.' },
    { q:'Which note do you remove first when a big chord turns muddy?', a:['The root','The 3rd','The 5th','The 7th'], c:2,
      why:'The 5th says the least. The 3rd and 7th are what make the chord itself.' }
  ]
},

suspensions:{
  lede:'Take out the note that decides happy or sad, and the chord hangs in the air like an unfinished question.',
  blocks:[
    { h:'Step 1 · Remove the mood note' },
    { p:'The <b>3rd</b> is the note that makes a chord happy or sad. <b>Suspend</b> it — replace it with the note just above or just below — and the chord loses its mood completely:' },
    { keys:[
      '<b>sus4</b> = 0 5 7. The 3rd is pushed <em>up</em> to the 4th. Tense, big, anthem-like.',
      '<b>sus2</b> = 0 2 7. The 3rd is pulled <em>down</em> to the 2nd. Open and airy.' ] },
    { p:'Neither has a 3rd, so neither is major or minor. That is the point: a sus chord is a <b>question</b>. Moving that note back to the normal 3rd is the <b>answer</b>. Two chords, one complete sentence.' },
    { h:'Step 2 · sus2 and sus4 are secretly the same chord' },
    { p:'Csus2 is C D G. Gsus4 is G C D. The same three notes. Which one you call it depends on which note you put at the bottom — and that completely changes how it feels. Handy: you get a new chord without learning a new shape.' },
    { h:'Step 3 · What producers do with them' },
    { keys:[
      '<b>Never answer it.</b> Hold the sus chord and let it float — ambient, cinematic, dreamy intros.',
      '<b>Answer it on the last beat.</b> Three beats of sus4, one beat of the normal chord, every bar. The loop breathes.',
      '<b>Sus over a moving bass.</b> Hold one sus shape while the 808 walks underneath — that is the entire harmony of a lot of trap.',
      '<b>7sus4 → 7</b> is the heavier gospel and neo-soul version of the same move.' ] },
    { note:{ h:'“sus” and “add” are not the same word',
      p:'<b>sus</b> <em>replaces</em> the 3rd. <b>add</b> <em>keeps</em> it. Csus2 = C D G (no mood). Cadd9 = C E G D (still happy, just with extra colour). Same D, totally different chord.' } },
    { try:{ h:'Hang it, then land it', p:'Play the suspension and hear it resolve. Then try holding it and see how long your ear can take not knowing.', use:true } },
    { keys:[
      'sus4 = 0 5 7, sus2 = 0 2 7, neither has a 3rd.',
      'No 3rd = no happy or sad = a question.',
      'Csus2 and Gsus4 are the same three notes.',
      'sus replaces the 3rd; add keeps it.' ] }
  ],
  quiz:[
    { q:'A sus4 chord is…', a:['0 4 7','0 2 7','0 5 7','0 3 7'], c:2,
      why:'0 5 7 — the 3rd replaced by the 4th, so the chord has no mood.' },
    { q:'What is the difference between sus2 and add9?', a:['Nothing','sus2 removes the 3rd, add9 keeps it','add9 has no 5th','sus2 is always minor'], c:1,
      why:'That is exactly it, and it is why add9 still sounds happy while sus2 sounds undecided.' }
  ]
},

inversions:{
  lede:'Same chord, different note at the bottom. This is the cheapest way to stop your chords sounding clumsy.',
  blocks:[
    { h:'Step 1 · Roll the bottom note to the top' },
    { p:'Take C–E–G. Move the bottom note up an octave and you get E–G–C. Still a C major chord, but <b>E</b> is now the lowest note. That is <b>1st inversion</b>. Do it again — G–C–E — and that is <b>2nd inversion</b>. A four-note chord has a 3rd inversion too.' },
    { table:{ head:['Name','Bottom note','C major becomes','Written'],
      rows:[
        ['Root position','the root','C E G','C'],
        ['1st inversion','the 3rd','E G C','C/E'],
        ['2nd inversion','the 5th','G C E','C/G'],
        ['3rd inversion','the 7th','B C E G','Cmaj7/B'] ] } },
    { p:'That slash — <span class="k">C/E</span> — reads “C chord, with E at the bottom”. It is really an instruction for your bass line.' },
    { h:'Step 2 · Move your hand as little as possible' },
    { p:'Play C then F with both in normal position and every finger jumps across the keyboard. Now play C (C E G) then F as C–F–A. Only <em>two</em> notes moved, one step each. Same two chords, far smoother.' },
    { p:'The rule: <b>keep notes that both chords share exactly where they are, and move the rest to the nearest note.</b> That is called <b>voice leading</b>, and it is the difference between “some chords” and “a part”.' },
    { h:'Step 3 · Where you put the notes is called voicing' },
    { keys:[
      '<b>Close</b> — all the notes squashed inside one octave. Compact, but muddy if it is low.',
      '<b>Open / spread</b> — bottom note low, the rest up high with a gap in the middle. This is the professional keyboard sound.',
      '<b>Drop 2</b> — take the second note from the top and drop it an octave. Instantly classier on seventh chords.',
      '<b>Low rule</b> — below C3 (well under middle C), never more than two notes. There is no room down there.' ] },
    { note:{ h:'The trick that writes your bass line for you',
      p:'Inversions let the bass move while the chords barely change. C – C/B – Am – Am/G gives a bass line walking downward step by step. Half of all ballads are built exactly this way.' } },
    { try:{ h:'Roll it, then smooth a progression', p:'Flip one chord around first. Then play the same four chords twice — once jumping, once voice-led — and hear the difference.', use:true } },
    { keys:[
      'Inversion = same chord, different bottom note.',
      'C/E means “C chord with E in the bass”.',
      'Voice leading = move each note as little as possible.',
      'Below middle C, keep it to two notes.' ] }
  ],
  quiz:[
    { q:'G/B means…', a:['G and B together','A G chord with B at the bottom','B minor','G without its 5th'], c:1,
      why:'Chord on the left, bass note on the right. B is the 3rd of G, so this is 1st inversion.' },
    { q:'Voice leading means…', a:['Playing more notes','Moving each note as little as possible','Always using root position','Singing the melody'], c:1,
      why:'Small movements sound smooth and deliberate. Keep shared notes still and move the others to the nearest key.' }
  ]
},

'dom-dim-aug':{
  lede:'Most chords are furniture. These three are engines — they exist to push the music somewhere else.',
  blocks:[
    { h:'Step 1 · The dominant 7th, and why it pulls' },
    { p:'<span class="k">G7</span> is G–B–D–F. Look at just <b>B and F</b>: they are 6 semitones apart, which is that wobbly <b>tritone</b>. Both of those notes have somewhere they want to go:' },
    { keys:[
      '<b>B</b> wants to step <em>up</em> one key, to C.',
      '<b>F</b> wants to step <em>down</em> one key, to E.' ] },
    { p:'Let them go and you land on C–E–G: a C major chord. That is why <b>V7 → I</b> is the strongest “we are home” move in music.' },
    { p:'Producers use it on purpose: park on the V7 at the end of a 4-bar loop and the loop yanks itself back to bar 1.' },
    { h:'Step 2 · Borrowed engines (secondary dominants)' },
    { p:'You can build a dominant 7th on <em>any</em> note, and it will pull toward the chord a 5th below it. So <span class="k">A7</span> pulls into <b>Dm</b>, even in the key of C where A7 does not officially live. Instant strong arrival, wherever you want one.' },
    { h:'Step 3 · Diminished — the chord with no home' },
    { p:'<b>dim7</b> is 0 3 6 9: four notes with the exact same gap between each one. Because it is perfectly even, it does not belong to any key, so it fits almost anywhere. Its three jobs:' },
    { keys:[
      '<b>Passing chord</b> — slip one between two chords a tone apart so the bass walks smoothly.',
      '<b>Leading chord</b> — vii°7 falling into the home chord: a darker, tighter version of V7.',
      '<b>Dread</b> — hold one and it is pure suspense. Horror films live here.' ] },
    { h:'Step 4 · Augmented — the pivot' },
    { p:'<b>aug</b> is 0 4 8: two big 3rds stacked, also perfectly even. It sounds uneasy and weightless. Drop it in for one beat between two normal chords (<span class="k">C → Caug → Am</span>) and you get movement without committing to anything. Hold it for a whole bar and everything sounds like a dream sequence.' },
    { note:{ h:'The swap that makes things sound jazzy',
      p:'Any dominant 7th can be replaced by the dominant 7th a tritone away, because they share the same tritone inside. So <span class="k">G7 → C</span> can become <span class="k">D♭7 → C</span>, and the bass slides down by one key. That single swap is most of what people mean by “jazzy”. It is called a <b>tritone substitution</b>.' } },
    { try:{ h:'Feel the pull, then let it go', p:'Hear each engine chord on its own, then hear it land. Notice how little the notes actually move.', use:true } },
    { keys:[
      'V7 pulls home because of the tritone inside it.',
      'Any chord can get its own dominant 7th in front of it.',
      'dim7 = all equal gaps, fits anywhere, great for passing.',
      'aug = two big 3rds, a one-beat pivot.',
      'Tritone sub: swap G7 for D♭7.' ] }
  ],
  quiz:[
    { q:'What inside G7 makes it pull toward C?', a:['The 5th','The tritone between B and F','The bottom note','The octave'], c:1,
      why:'B steps up to C and F steps down to E — each by one key — and you land on a C chord.' },
    { q:'A dim7 chord is built from…', a:['Big 3rds','Equal small 3rds','4ths','Semitones'], c:1,
      why:'0 3 6 9 — every gap the same. That evenness is why it belongs to no key and fits between almost anything.' }
  ]
},

'harmonic-minor':{
  lede:'Raise one single note in a minor scale and two things happen: the key gets a proper way home, and the music starts sounding like a film.',
  blocks:[
    { h:'Step 1 · The problem' },
    { p:'In plain natural minor, the chord built on note <b>5</b> comes out <em>minor</em> (in C minor that is G–B♭–D). A minor chord there is weak — it does not really pull you home.' },
    { h:'Step 2 · The fix' },
    { p:'Raise note <b>7</b> of the scale by one key. In C minor, B♭ becomes B. Now the chord on 5 is <b>G major</b>, and with its 7th it is <b>G7</b> — which slams straight back into Cm.' },
    { p:'That new scale is <b>harmonic minor</b>: <span class="k">0 2 3 5 7 8 11</span>. It is natural minor with one raised note. That is all.' },
    { h:'Step 3 · The side effect you can hear' },
    { p:'Raising that note leaves a gap of <b>3 keys</b> between note 6 and note 7 (A♭ to B in C minor). Three keys in one step is the widest step in any common scale, and it is called an <b>augmented 2nd</b>.' },
    { p:'Your ear hears that big stride as dramatic, exotic and slightly sinister. It is the sound of flamenco, of Eastern European folk, of metal, of drill, and of nearly every film villain.' },
    { h:'Step 4 · The chords you get' },
    { table:{ head:['Number','Chord in C harmonic minor','Type','Use'],
      rows:[
        ['i','Cm','minor','home'],
        ['ii°','Ddim (D F A♭)','diminished','tense, leads to V'],
        ['III+','E♭aug','augmented','strange, in-between'],
        ['iv','Fm','minor','the dark one'],
        ['V','G or G7','major','the whole reason for this scale'],
        ['VI','A♭','major','big and cinematic'],
        ['vii°7','Bdim7','diminished 7th','maximum tension → home'] ] } },
    { p:'The two you will use constantly are <b>V</b> (or V7) and <b>vii°7</b>. Both only exist because of that one raised note, and both fall home with real force.' },
    { note:{ h:'Two cousins, in one line each',
      p:'<b>Melodic minor</b> raises the 6th as well going up (0 2 3 5 7 9 11), because singers found that big stride awkward; coming down it goes back to normal minor. <b>Phrygian dominant</b> is harmonic minor started on its 5th note (0 1 4 5 7 8 10) — a major chord with a dark step right above it. Flamenco and a lot of dark drill sit exactly there.' } },
    { try:{ h:'Hear the one note that changes everything', p:'Compare natural and harmonic minor, then play the chord on note 5 in each. The second one means it.', use:true } },
    { keys:[
      'Harmonic minor = natural minor with a raised 7th.',
      'That turns the weak minor v into a strong major V (or V7).',
      'The 3-key stride between 6 and 7 is the exotic sound.',
      'Melodic minor also raises the 6th going up.',
      'Phrygian dominant = harmonic minor starting from note 5.' ] }
  ],
  quiz:[
    { q:'Harmonic minor is natural minor with…', a:['A raised 6th','A raised 7th','A lowered 2nd','A raised 3rd'], c:1,
      why:'Just the 7th, up one key — and that turns the chord on 5 into a real dominant.' },
    { q:'Where does its exotic sound come from?', a:['The lowered 3rd','The 3-key stride between notes 6 and 7','The 5th','The octave'], c:1,
      why:'An unusually wide step between two notes right next to each other in the scale.' }
  ]
},

borrowed:{
  lede:'Sometimes you take one chord from the key next door. Used once, it is the bar people remember.',
  blocks:[
    { h:'Step 1 · Borrowing from your own minor' },
    { p:'You are in C <b>major</b>, but you play a chord out of C <b>minor</b>. Same home note, different family of notes — so it still feels like your key, just repainted. The name for this is <b>modal interchange</b> (some people say modal mixture).' },
    { table:{ head:['Borrowed chord','In C major','Comes from','What it does'],
      rows:[
        ['♭VI','A♭','C minor','huge, heroic lift'],
        ['♭VII','B♭','Mixolydian','rock and anthem energy'],
        ['iv','Fm','C minor','instant heartbreak'],
        ['♭III','E♭','C minor','dramatic, gospel'],
        ['II (major)','D','Lydian','bright surprise, leads to V'],
        ['♭II','D♭','Phrygian','dark one-bar shock'] ] } },
    { h:'Step 2 · The famous one' },
    { p:'<b>IV → iv</b>. Play F major, then F minor, then go home to C. Exactly one note moves (A drops to A♭) and the whole phrase turns bittersweet. Pop choruses use it for the final repeat all the time.' },
    { h:'Step 3 · Putting an engine in front of any chord' },
    { p:'Any chord in your key can have its <em>own</em> dominant 7th placed in front of it, even though that chord is not in the key. Want to arrive at Dm more strongly? Put <b>A7</b> just before it. Musicians write that <span class="k v">V7/ii</span> and say “five of two”. You get a surprise note, a strong arrival, and you never leave the key.' },
    { h:'Step 4 · Chords that exist only for the bass' },
    { p:'Some outside chords are really bass-line decisions: a <b>dim7</b> slotted between two chords so the bass can walk by single keys, or a <b>tritone sub</b> so you slide into home from one key above. Interesting harmony happens as a side effect.' },
    { note:{ h:'The one rule',
      p:'Borrow for <em>one or two bars</em>, then come home. An outside chord is an <b>event</b>. If everything is borrowed, nothing is surprising — and you have quietly changed key without meaning to.' } },
    { try:{ h:'Borrow something', p:'Each button plays a plain loop, then the same loop with one chord swapped for an outside one. Listen for the bar that grabs you.', use:true } },
    { keys:[
      'Modal interchange = take a chord from the same home note’s minor (or another mode).',
      'IV → iv is the classic bittersweet move.',
      'A secondary dominant (like A7 → Dm) makes any chord feel like an arrival.',
      'Borrow briefly, then return home.' ] }
  ],
  quiz:[
    { q:'Playing Fm in the key of C major is an example of…', a:['A key change','Modal interchange','An inversion','A cadence'], c:1,
      why:'It is the iv chord borrowed from C minor. Same home note, different family of notes.' },
    { q:'How long should a borrowed chord usually stay?', a:['The whole song','One or two bars, then home','Only in minor keys','Never use them'], c:1,
      why:'They work by contrast. Borrow everything and the surprise disappears.' }
  ]
},

circle:{
  lede:'A clock face with the twelve keys written around it, arranged so that every neighbour is a friend.',
  blocks:[
    { h:'Step 1 · How the clock is built' },
    { p:'Start at C and jump up a <b>perfect 5th</b> (7 keys) each time: C → G → D → A → E → B → F♯ → D♭ → A♭ → E♭ → B♭ → F → and you are back at C. Twelve jumps uses up all twelve notes exactly once.' },
    { p:'Going <b>clockwise</b> adds one sharp (♯) to the key each time. Going <b>anticlockwise</b> adds one flat (♭).' },
    { h:'Step 2 · The inner ring' },
    { p:'The smaller ring inside holds each key’s <b>relative minor</b> — the minor key made of exactly the same notes, three keys lower. C major and A minor sit together because they are the same seven notes with a different home.' },
    { h:'Step 3 · Why neighbours matter' },
    { p:'Two keys next to each other on the clock share <b>six of their seven notes</b>. Only one note is different. That one fact is the whole payoff:' },
    { keys:[
      'The keys either side of yours are your <b>IV</b> and <b>V</b> — the two most useful chords after home.',
      'Your key, its two neighbours, and the three minors underneath them give you <b>six chords guaranteed to fit</b> (I, IV, V, vi, ii, iii). That is a complete songwriting palette, without doing any maths.',
      'To change key smoothly, move <b>one step</b> around the clock. Only one note changes, so listeners follow you easily.',
      'To change key dramatically, <b>jump across</b>. Keys on opposite sides share almost nothing — instant shock or lift.' ] },
    { note:{ h:'Reading key signatures off it',
      p:'Clockwise from C: G has 1♯, D 2♯, A 3♯, E 4♯, B 5♯, F♯ 6♯. Anticlockwise: F has 1♭, B♭ 2♭, E♭ 3♭, A♭ 4♭, D♭ 5♭. You rarely write notation as a producer, but key-detection plugins and sample packs label things this way.' } },
    { try:{ h:'Use the wheel', p:'Tap any outer tile. The lab lights up that key’s neighbours and its relative minor, then plays you its six-chord palette so you can hear that it works.', use:true } },
    { keys:[
      'Clockwise = up a 5th = one more sharp. Anticlockwise = one more flat.',
      'Inner ring = the relative minor, same notes.',
      'Neighbours share six of seven notes.',
      'One step around = a smooth key change; across = a dramatic one.' ] }
  ],
  quiz:[
    { q:'Moving one step clockwise adds…', a:['A flat','A sharp','Nothing','A new note'], c:1,
      why:'Clockwise is up a perfect 5th, and each of those adds one sharp to the key signature.' },
    { q:'Two keys next to each other on the circle share…', a:['All seven notes','Six of seven notes','Three notes','No notes'], c:1,
      why:'Only one note differs, which is exactly why moving next door sounds effortless.' }
  ]
},

melody:{
  lede:'A tune is not a pile of nice notes. It is one little shape that you repeat and change — and the shape is what people remember.',
  blocks:[
    { h:'Step 1 · Write a tiny idea, not a tune' },
    { p:'A <b>motif</b> is a very short idea: two to four notes, less than a bar. It is the smallest thing a listener can recognise when it comes back. Write one, then build everything out of it.' },
    { p:'This is the opposite of what beginners do, which is write eight bars of brand new notes and wonder why none of it sticks.' },
    { h:'Step 2 · Four ways to change your idea' },
    { keys:[
      '<b>Repeat</b> it exactly. Free familiarity.',
      '<b>Move it</b> so it starts on a different scale note — same shape, new height. (Musicians say transpose.)',
      '<b>Flip it upside down</b>: up-up-down becomes down-down-up. (That is called inversion.)',
      '<b>Change the rhythm</b> but keep the same notes. Often the strongest option, and the one people forget.' ] },
    { h:'Step 3 · Contour is the line your tune draws' },
    { p:'<b>Contour</b> is the up-and-down shape — the ribbon floating above the roll. Strong tunes have a clear one: they climb to a high point (usually about two thirds of the way through) and then come home. Weak tunes wander in a narrow band or zigzag randomly.' },
    { keys:[
      'Move by <b>steps</b> (to the next scale note) most of the time.',
      'A <b>leap</b> is an event. Spend one or two, not ten.',
      'After a big leap, walk back down by step. The ear wants the gap filled in.' ] },
    { h:'Step 4 · Ask a question, then answer it' },
    { p:'Split your phrase in half. The first half <b>asks</b>: end it on an unsettled note, hanging. The second half <b>answers</b>: end it on the home note or the 3rd. That question-and-answer pair is what makes four and eight bars feel complete instead of just long.' },
    { note:{ h:'Silence is a note',
      p:'Beginner tunes are too busy. A rest lets the previous note land and leaves room for the vocal and the drums. Try deleting a third of your notes — the tune usually gets better, and more of what is left actually gets heard.' } },
    { try:{ h:'Write a shape', p:'Tap the roll to add or remove notes — only scale notes appear, so nothing can clash. Then use the buttons to change what you wrote.', use:true } },
    { keys:[
      'Motif = 2–4 notes you reuse.',
      'Change it by repeating, moving, flipping or re-timing it.',
      'Give the tune a clear rise and fall.',
      'Steps by default, leaps as events, then fill the gap back in.',
      'First half asks, second half answers.' ] }
  ],
  quiz:[
    { q:'A motif is…', a:['A whole 8-bar tune','A short idea you repeat and change','A chord progression','A drum pattern'], c:1,
      why:'Two to four notes is plenty. Everything memorable in pop is a short idea repeated with small changes.' },
    { q:'After a big jump upwards, the ear wants…', a:['Another big jump','Small steps back down','Silence','A new key'], c:1,
      why:'A leap leaves a gap, and walking back down fills it in. That is why the trick works every single time.' }
  ]
},

'melody-chords':{
  lede:'The very same note can sound lovely or awful. It depends entirely on which chord is playing underneath it at that moment.',
  blocks:[
    { h:'Step 1 · Two kinds of note' },
    { p:'While a chord is playing, the notes <em>inside</em> that chord are called <b>chord tones</b>. They sound settled — safe places to land. Every other note of the scale is a <b>non-chord tone</b>, and it sounds like movement.' },
    { p:'Neither is better. It is all about <em>when</em> you use them:' },
    { keys:[
      'Land on a <b>chord tone</b> on the strong beats and at the end of a phrase. That is what makes a tune sound right.',
      'Use the <b>other notes</b> on weak beats and in between. That is what stops it sounding like a boring exercise.',
      'The <b>3rd</b> and the <b>7th</b> are the tastiest landing notes — they carry the chord’s flavour. The 5th is the safest and the dullest.' ] },
    { h:'Step 2 · Three ways to travel between landings' },
    { keys:[
      '<b>Passing tone</b> — step through a note on your way from one chord tone to another (E → F → G).',
      '<b>Neighbour tone</b> — step away and come straight back (E → F → E).',
      '<b>Approach note</b> — arrive at your target from one key below, right before the chord changes. This is the single most professional-sounding little habit in melody writing.' ] },
    { h:'Step 3 · Colour notes on purpose' },
    { p:'Some non-chord tones are not passing through — they are deliberate colour. Over a minor 7th chord, the <b>9th</b> is gorgeous. Over a major chord, the <b>6th</b> is warm. Over a dominant 7th chord almost anything works, because the chord is already restless — which is why solos get busy there.' },
    { note:{ h:'The two notes to walk past, not sit on',
      p:'On a major chord, the 4th note of the scale sits one key above the 3rd and fights it. On a minor chord, the ♭6 does the same to the 5th. They are not banned — just do not <em>hold</em> them or land on them. Pass through and keep moving.' } },
    { try:{ h:'Same tune, four treatments', p:'A four-chord minor loop plays underneath. Hear a tune that only lands on chord tones, one that ignores the chords, one that uses approach notes, and one full of colour notes.', use:true } },
    { keys:[
      'Chord tones are landing pads; other notes are movement.',
      'Land on chord tones on strong beats and at phrase ends.',
      '3rd and 7th are the expressive landings; the 5th is plain.',
      'Passing, neighbour and approach notes get you between landings.',
      'Do not sit on the 4th over a major chord.' ] }
  ],
  quiz:[
    { q:'Where should chord tones go?', a:['Only on weak beats','On strong beats and at the end of phrases','Nowhere','Only in the bass'], c:1,
      why:'Landing on a chord tone at an important moment is what makes a melody sound settled.' },
    { q:'An approach note is…', a:['The first note of a song','A note one key below your target, played just before it','A chord','A drum fill'], c:1,
      why:'A one-key lean into the note you actually want. Cheap to write and it instantly sounds deliberate.' }
  ]
},

beatblock:{
  lede:'Staring at an empty project is not a talent problem. It is a too-many-choices problem, and you fix it by taking choices away.',
  blocks:[
    { h:'Step 1 · Decide three things and refuse to change them' },
    { p:'An empty project offers infinite options, and infinite options produce nothing. Before you write a single note, lock in: a <b>key</b>, a <b>tempo</b>, and <b>one reference track</b>. Now you are not writing music, you are answering a much smaller question.' },
    { h:'Step 2 · Five openings that always work' },
    { keys:[
      '<b>Steal the shape, not the notes.</b> Write out a progression you love as numbers (I–V–vi–IV), then use those numbers in a different key with different sounds. Numbers are grammar; nobody owns them.',
      '<b>Start with the bass.</b> Write four bass notes first. Work out the chords afterwards — each bass note can belong to several chords, so it hands you options.',
      '<b>Loop one chord.</b> Sit on a single m9 chord and put all the movement into rhythm and melody. Plenty of trap and ambient works exactly this way.',
      '<b>Randomise, then curate.</b> Generate something mechanical, keep the 20% that surprised you, delete the rest. Editing is far easier than inventing.',
      '<b>Write the big moment first.</b> Then work backwards — the intro is that melody stripped down to two notes.' ] },
    { h:'Step 3 · If it is boring, change what is underneath' },
    { p:'If you like the tune but the loop is dull, do not rewrite the tune. <b>Reharmonise</b>: swap a chord for another with the same job (vi for I, ii for IV), add a 7th or a 9th, borrow a iv, or just put a different note of the same chord in the bass. Same tune, new song.' },
    { note:{ h:'Finishing beats being good',
      p:'An 8-bar loop you actually finished teaches you more than a 32-bar arrangement you gave up on. Set the smallest possible target — one bar, one sound, one hook — then decide whether to keep going. Momentum is the real skill.' } },
    { try:{ h:'The idea generator', p:'Each press gives you a locked-in starting point: a key, a progression written in numbers, and a little tune that fits it. Keep whatever surprises you.', use:true } },
    { keys:[
      'Lock key, tempo and one reference before you write.',
      'Five starts: steal the shape, start with bass, loop one chord, randomise and curate, write the big moment first.',
      'Reharmonise instead of rewriting the melody.',
      'Finish something small.' ] }
  ],
  quiz:[
    { q:'The most reliable first move against beat-block is…', a:['Buy more samples','Take choices away by fixing key, tempo and a reference','Start mixing','Learn a new plugin'], c:1,
      why:'Fewer options means faster starts. The blank project stops being infinite.' },
    { q:'Reharmonising means…', a:['Rewriting the melody','Changing the chords under the same melody','Transposing everything','Adding drums'], c:1,
      why:'Keep the tune, change what is underneath. It is the cheapest way to make a tired loop feel new.' }
  ]
},

challenges:{
  lede:'Now close your eyes and use your ears. Ten minutes a day here will change your music more than ten hours of reading.',
  blocks:[
    { h:'How to use these' },
    { p:'Pick a drill, listen, then answer. If you get it wrong you will see the right answer with the notes lit up — and <em>that</em> moment is where the learning actually happens. Getting things wrong is the point.' },
    { keys:[
      '<b>Interval</b> — name the gap between two notes. Everything else is built on this one.',
      '<b>Chord quality</b> — is it happy, sad, tense or strange? Then the seventh-chord family.',
      '<b>Progression</b> — hear four chords and name the numbers.',
      '<b>Scale</b> — major, minor, harmonic minor, and the modes.',
      '<b>Scale degree</b> — a key is set up, then one note plays; say which number it is. This is the skill that lets you work tunes out by ear.' ] },
    { h:'The trick that speeds it up' },
    { p:'<b>Hum the two notes before you answer.</b> Your voice knows the gap before your brain knows its name, and singing forces you to really hear the distance instead of guessing from the sound of the instrument.' },
    { note:{ h:'A useful frustration',
      p:'Everyone mixes up two pairs at first: minor 3rd vs major 3rd, and perfect 4th vs perfect 5th. If those two pairs are the <em>only</em> things you can reliably tell apart, you can already work out most melodies by ear.' } },
    { try:{ h:'Run a drill', p:'Choose a type, then press Listen. You can replay as many times as you like before answering.', use:true } },
    { keys:[
      'Listen first, look second.',
      'Hum the notes before answering.',
      'Wrong answers with the correction shown are how ears get trained.',
      'Ten minutes a day beats one long session.' ] }
  ]
}

});

/* attach each simple version to its lesson */
LESSONS.forEach(l => { if (SIMPLE[l.id]) l.simple = SIMPLE[l.id]; });
