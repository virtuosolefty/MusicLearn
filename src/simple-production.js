/* ═══════════════════════════════════════════════════════════════
   SIMPLE MODE — the making-music chapters, in small steps.
   ═══════════════════════════════════════════════════════════════ */
Object.assign(SIMPLE, {

bassline:{
  lede:'The bass is the low part under everything. Its job is simpler than you think: tell your ear which chord is playing, and lock in with the kick drum.',
  blocks:[
    { h:'Step 1 · What the bass is for' },
    { p:'When a chord plays, your ear listens to the <b>lowest</b> note to decide what the chord is. That lowest note is the bass. So the bass is not decoration — it is the part that names the chord.' },
    { p:'Its second job is to line up with the <b>kick drum</b>. When bass and kick hit together they turn into one big sound. That is the thing you feel in your chest at a gig.' },
    { h:'Step 2 · Just play the root' },
    { p:'Every chord has a <b>root</b> — the note it is named after. A C minor chord’s root is C.' },
    { p:'Play the root of each chord, one note per bar. Four chords, four notes. That is a real bassline. Most songs you know are not doing much more than this.' },
    { h:'Step 3 · Three ways to make it less boring' },
    { p:'Try them in this order, because each one is slightly riskier than the last:' },
    { keys:[
      '<b>Jump an octave.</b> Same note, but much higher or lower. Nothing can go wrong — it is the same note.',
      '<b>Add the 5th.</b> Bounce between the root and the 5th. Safe, because the 5th sounds the same in happy and sad chords.',
      '<b>Add a passing note.</b> One quick note that walks you into the next chord. Keep it short and put it right before the change.' ] },
    { h:'Step 4 · Leave gaps' },
    { p:'A note on every single box turns the bass into a long low hum, and the track gets muddy. Real basslines have holes in them.' },
    { p:'A good trick: tap the <em>rhythm</em> of the bass on the table first, without thinking about notes at all. Then decide which note goes on each tap.' },
    { h:'Step 5 · Keep it low, but not too low' },
    { p:'Bass lives roughly between <b>E1 and E3</b>. Below that, phones and laptops cannot play the sound at all — the note is there in the file and nobody ever hears it. Above that, it stops sounding like bass.' },
    { note:{ h:'One instrument, not two',
      p:'If the bass and the kick sound like mud together, you have two choices: move one of them so they do not land on the same box, or turn the bass down for a moment whenever the kick hits (that is what producers call sidechaining). Decide the notes first, though.' } },
    { try:{ h:'Build one, one step at a time', p:'A chord loop is playing. Start with roots, then add each move and listen to what changes.', use:true } },
    { keys:[
      'The lowest note tells your ear which chord it is.',
      'Roots only is already a finished bassline.',
      'Then: octaves, then the 5th, then passing notes.',
      'Leave gaps, and keep it between E1 and E3.' ] }
  ],
  quiz:[
    { q:'Under a C minor chord, the safest bass note is…', a:['E♭','G','C','B♭'], c:2,
      why:'C, the root — the note the chord is named after. It confirms what your ear already thinks it is hearing.' },
    { q:'What happens if the bass plays a note on every box?', a:['It sounds professional','It turns into a muddy hum','It gets louder','Nothing'], c:1,
      why:'The low end has no room to breathe. Gaps are what make a bassline groove.' }
  ]
},

velocity:{
  lede:'Two people program exactly the same drum pattern. One sounds like a machine, one sounds like a person playing. The notes are identical — what differs is how hard each hit is.',
  blocks:[
    { h:'Step 1 · Every note has a strength number' },
    { p:'When you draw a note, it carries a number from <b>1 to 127</b> called <b>velocity</b>. It means “how hard was this hit”.' },
    { p:'Most programs set every note to <b>100</b> automatically. Sixteen hits all at exactly 100 is the sound people mean when they say a beat is stiff or robotic.' },
    { h:'Step 2 · Hard hits are also brighter' },
    { p:'Velocity usually changes the volume — but hit a real drum harder and it also gets <b>brighter</b> and rings longer. Good drum sounds copy that. This is why changing velocity sounds like someone playing differently, not like someone moving a volume fader.' },
    { h:'Step 3 · Three strengths to use' },
    { keys:[
      '<b>Accent</b> — about 110 to 127. The hits you want people to notice.',
      '<b>Normal</b> — about 90 to 105. The main body of the pattern.',
      '<b>Ghost note</b> — about 20 to 45. So quiet you almost do not hear it as a hit. You feel it as movement.' ] },
    { p:'Quiet ghost notes between the loud ones are most of what makes a drum loop sound human.' },
    { h:'Step 4 · Timing does the rest' },
    { p:'<b>Swing</b> pushes every second small box slightly late, so hits go long-short-long-short instead of all even. Your app has a knob for it.' },
    { p:'Even smaller: moving a hit a few <b>milliseconds</b> early or late. Late feels relaxed and heavy. Early feels urgent. Real drummers do this without being asked, and it is the difference between a loop you tolerate and one you enjoy.' },
    { note:{ h:'How long the note is counts too',
      p:'A short note leaves space; a long note fills it in. On a bass especially, the same notes played short or long give you two completely different tracks.' } },
    { try:{ h:'Hear it — the boxes never move', p:'One pattern, four ways of playing it. Then add swing and nudge the snare.', use:true } },
    { keys:[
      'Velocity = how hard, from 1 to 127. Everything at 100 sounds robotic.',
      'Accent 110–127 · normal 90–105 · ghost 20–45.',
      'Swing makes pairs long-short. A few milliseconds early or late changes the feel even more.',
      'Note length is part of the groove.' ] }
  ],
  quiz:[
    { q:'A ghost note is…', a:['A note you cannot hear at all','A very quiet hit you feel more than hear','A note an octave lower','A mistake'], c:1,
      why:'Around 20 to 45. Quiet ghost hits between the loud ones are what make a beat feel played rather than typed.' },
    { q:'Everything in your beat is at velocity 100. It will sound…', a:['Professional','Stiff and machine-like','Too quiet','Out of tune'], c:1,
      why:'Nothing leans anywhere. Give some hits more and some hits much less and the pattern comes alive.' }
  ]
},

eightbar:{
  lede:'Time to put it together. Drums, bass, chords and a tune — eight bars. That is the smallest thing that sounds like actual music instead of an exercise.',
  blocks:[
    { h:'Step 1 · Build from the bottom up' },
    { p:'Do the layers in this order. Each one makes the next one easier, because it takes decisions away:' },
    { keys:[
      '<b>1 · Drums.</b> Kick and snare. Hats last.',
      '<b>2 · Chords.</b> Four chords, one per bar, all from one key.',
      '<b>3 · Bass.</b> The root of each chord, lined up with the kick.',
      '<b>4 · Tune.</b> A few notes on top, landing on chord notes at the start of each bar.' ] },
    { p:'By the time you get to the tune, the key is decided, the rhythm is decided and you know which notes land well. That is a small decision instead of a blank page.' },
    { h:'Step 2 · What makes 8 bars feel finished' },
    { p:'Think of it as two halves of four bars. The first half asks something, the second half answers it.' },
    { p:'To do that, change <b>one</b> thing in bars 5–8 — a different last note is enough. Change lots of things and it stops sounding like an answer and starts sounding like a different song.' },
    { note:{ h:'This is how real tracks are made',
      p:'Most songs are one 8-bar idea, repeated, with layers taken out and put back. Finishing eight bars is worth far more than starting thirty-two.' } },
    { h:'Step 3 · Your job' },
    { keys:[
      'Keep the drums and chords that are already playing.',
      'Write <b>six notes or fewer</b> in bars 1–4.',
      'Repeat them in bars 5–8, changing one note.',
      'Start each bar on a note that is in the chord.',
      'Leave at least one beat of silence somewhere.',
      'Press <b>Check my 8 bars</b>, then export it as a MIDI file.' ] },
    { try:{ h:'Build it', p:'Tap the roll to write your tune. The buttons will start you off, copy your first half, and check the list above for you.', use:true } }
  ],
  quiz:[
    { q:'Which order makes writing easiest?', a:['Tune, chords, bass, drums','Drums, chords, bass, tune','Chords, tune, drums, bass','Any order'], c:1,
      why:'Bottom up. Every layer you finish removes choices from the next one.' },
    { q:'How many things should change in bars 5–8?', a:['None','One','Most of them','All of them'], c:1,
      why:'One change sounds like an answer to the first four bars. Many changes sound like a new section.' }
  ]
},

structure:{
  lede:'A whole song is one good loop with bits taken out and put back. That is nearly all arrangement is.',
  blocks:[
    { h:'Step 1 · Read this grid differently' },
    { p:'Up to now a box has been a tiny slice of a bar. Here, <b>one box is one whole bar</b>, and each row is one instrument. So you are looking at sixteen bars of a song, from above.' },
    { p:'This is the same picture your music app shows you when you zoom all the way out.' },
    { h:'Step 2 · The parts of a song' },
    { keys:[
      '<b>Intro</b> — one or two layers. Sets the scene.',
      '<b>Verse</b> — the main idea, with room left over.',
      '<b>Build</b> — tension. Often the bass disappears here.',
      '<b>Chorus (or drop)</b> — everything at once. The payoff.',
      '<b>Breakdown</b> — strip almost everything away for contrast.',
      '<b>Outro</b> — take the layers off one at a time.' ] },
    { p:'These parts are almost always <b>4, 8 or 16 bars</b> long. Same reason as in a tune: the ear counts in twos and fours, so an odd length feels like a mistake.' },
    { h:'Step 3 · The big secret: take things away' },
    { p:'Beginners arrange by <em>adding</em> new stuff until something interesting happens. Producers write one good loop and then <b>remove</b> parts of it.' },
    { p:'The chorus does not sound huge because it is louder. It sounds huge because the bar before it was nearly empty.' },
    { keys:[
      '<b>Drop a layer</b> to start a new section. The classic: bass out for four bars, bass back for the chorus.',
      '<b>Silence is a transition.</b> One beat of nothing before the chorus beats any fancy effect.',
      '<b>Change the drums in the last bar</b> before a new part, so the join is obvious.',
      '<b>Keep one thing running</b> all the way through, or the sections stop sounding like the same song.' ] },
    { note:{ h:'How to get a whole track out of 8 bars',
      p:'Play your 8 bars four times over. Take layers <em>off</em> the first time through — that is your intro. Strip the third time right back — that is your breakdown. Put everything back for the fourth. You now have 32 bars, and you did not write anything new.' } },
    { try:{ h:'Arrange 16 bars', p:'Tap a box to turn a layer on or off for that bar. Load a shape, take something away, and hear what it does.', use:true } },
    { keys:[
      'One box = one bar. One row = one instrument.',
      'Sections are 4, 8 or 16 bars.',
      'Arrange by taking away, not by adding.',
      'Mark the joins, and keep one thing constant.' ] }
  ],
  quiz:[
    { q:'How long is a section usually?', a:['3, 5 or 7 bars','4, 8 or 16 bars','Any length','Exactly 10 bars'], c:1,
      why:'The ear groups in twos and fours all the way up, so those lengths feel natural and odd ones feel like a slip.' },
    { q:'What makes a chorus feel big?', a:['Turning it up','Having almost nothing in the bar before it','More reverb','A key change'], c:1,
      why:'Contrast. Empty the bar before it and the full arrangement lands enormously, without touching a volume control.' }
  ]
}

});

/* the new chapters load after the first attach pass, so attach again */
LESSONS.forEach(l => { if (SIMPLE[l.id]) l.simple = SIMPLE[l.id]; });
