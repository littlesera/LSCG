// Single-line corpus. Every category is `draft` until the maintainer has reviewed the labels.
import { BASELINE_GAP_TEXTS } from "./baseline-gaps";
import { category, neg, neu, pos, type Category, type LineCase } from "./types";

const prof = (yes: boolean, ...texts: string[]): LineCase[] => texts.map(text => ({ text, profanity: yes }));
const hard = (...texts: string[]): LineCase[] => texts.map(text => ({ text, complex: true }));
const easy = (...texts: string[]): LineCase[] => texts.map(text => ({ text, complex: false }));

export const CATEGORIES: Category[] = [
	category("self-deprecation: copula", [
		...neg(
			"I am worthless", "i'm so stupid", "im useless", "I am a terrible person", "I'm such a failure",
			"i am pathetic", "I'm an idiot", "i'm so ugly", "I am nothing", "im a total mess",
			"I'm disgusting", "i am so dumb", "I'm a burden", "im the worst", "I'm hopeless",
			"it must be a drag to be around me"
		),
	]),
	category("self-deprecation: verbs and idioms", [
		...neg("I suck", "i suck at everything", "I hate myself", "i fail at everything", "I ruin everything",
			"i screw everything up", "nobody likes me", "everyone hates me", "i deserve nothing"),
		{ text: "I can't do anything right", tone: "negative", note: "modal guard treats it as circumstance" },
		{ text: "i cant do anything right", tone: "negative", note: "modal guard treats it as circumstance" },
	]),
	category("affirmations", [
		...pos(
			"I am a good girl", "I'm a good boy", "I'm a good puppy", "i'm so good", "I am proud of myself", "im a good pet", "I'm smart and strong",
			"i am beautiful", "I'm so lucky", "I am amazing", "im a great helper", "I love myself",
			"I'm very obedient", "i am worthy", "I'm the best", "im really pretty", "i did so well today",
		),
	]),
	category("neutral statements", [
		...neu(
			"hello everyone", "how are you all", "I am tired", "i'm going to sit over here", "I like cake",
			"I'm at the door", "i am here", "what time is it", "brb", "I'm ready",
			"the weather is nice", "let's go to the lounge", "I need a drink", "i'm back", "thanks for having me",
		),
	]),
	category("roleplay and kink vocabulary stays neutral", [
		...neu(
			"*tugs at the chains*", "I'm tied up", "i'm bound tight", "I am locked in", "*struggles against the cuffs*",
			"please tie me", "I want to be gagged", "I'm so helpless in this", "i am your toy", "I love being your pet",
			"I love being her slave", "I'm owned", "i'm a pet", "make me obey",
			"*shivers at the shock*", "I'm punished", "i'm restrained", "I'm wearing the collar", "I'm in a cage",
		).map(c => ({ ...c, tags: ["kink"] })),
		{ text: "I'm so helpless in this", tone: "neutral", note: "'helpless' is literal state here, scored as self-negative" },
		{ text: "I am at your mercy", tone: "neutral" },
	]),
	category("modals and circumstance", [
		...neu(
			"I can't relax", "i cant sleep", "I can't see anything", "i won't be long", "I can't move",
			"I can't hear you", "i can't reach it", "I couldn't find it", "I can't wait", "i can't breathe in this",
		).map(c => ({ ...c, tags: ["modal"] })),
		{ text: "I can't breathe in this", tone: "neutral" },
	]),
	category("negation", [
		...neu("I am not stupid", "i'm not a failure", "I'm not useless", "i am not ugly", "I'm not worthless").map(c => ({ ...c, tone: "positive" as const })),
		...neu("I'm not interrupting", "i am not leaving", "I'm not bored", "I'm not angry", "i'm not tired", "Now I can sass everyone without repercussions"),
		...pos("i can do it without fear", "I'm confident enough to ignore all the hate", "you can't put me down"),
		{ text: "I am not stupid", tone: "positive", note: "negated negative: neutral or positive is acceptable; labelled positive pending review" },
	]),
	category("intensifiers and hedges", [
		...neg("I am so incredibly stupid", "im really really useless", "i'm extremely pathetic"),
		...pos("I am so incredibly good", "im really really pretty", "i'm extremely proud of myself"),
		...neu("I'm a little tired", "i am kinda hungry", "I'm sort of sleepy"),
	]),
	category("but clauses", [
		...neg("I try but I am useless"),
		...pos("i was scared but I am proud of myself"),
		...neu("I wanted to go but it was late"),
		{ text: "I'm smart but lazy", tone: "neutral", note: "mixed; neutral is the sensible label" },
	]),
	category("comparisons", [
		{ text: "other people are cuter than me", tone: "negative", comparison: -1 },
		{ text: "everyone here is prettier than me", tone: "negative", comparison: -1 },
		{ text: "i'm not as good as her", tone: "negative", comparison: -1 },
		{ text: "she is so much smarter than me", tone: "negative", comparison: -1 },
		{ text: "I am the prettiest in the room", tone: "positive", comparison: 1 },
		{ text: "I'm cuter than you", tone: "positive", comparison: 1 },
		{ text: "i am better than everyone here", tone: "positive", comparison: 1 },
		{ text: "she's uglier than me", tone: "neutral", comparison: 0, note: "puts others down, not a lift for the speaker" },
		{ text: "he is dumber than me", tone: "neutral", comparison: 0 },
		{ text: "you're slower than a turtle", tone: "neutral", comparison: 0 },
		{ text: "that's bigger than the last one", tone: "neutral", comparison: 0 },
	]),
	category("gerund and progressive hedges", [
		...neu("I'm interrupting", "i'm helping", "I'm going to the bar", "im waiting here", "i'm still thinking"),
		...neg("I'm boring", "im annoying everyone", "I'm being stupid"),
		{ text: "I'm being helpful", tone: "positive", note: "label pending review: positive or neutral" },
	]),
	category("sarcasm and emoticons", [
		{ text: "Now I can sass Sylvin all I want without repercussions >.>", tone: "neutral" },
		{ text: "haha I'm so bad at this :P", tone: "neutral", note: "playful self-tease" },
		{ text: "oops I'm such a klutz lol", tone: "neutral" },
		{ text: "I'm the worst at hiding >.>", tone: "neutral" },
	]),
	category("third person and names", [
		...neu("Alice is stupid", "she is useless", "he's a failure", "they are so ugly", "Bob is hopeless"),
		...neg("Sera is stupid", "sera sucks").map(c => ({ ...c, note: "speaker's own nickname is Sera" })),
	]),
	category("profanity", [
		{ text: "fuck this", profanity: true },
		{ text: "what the hell", profanity: true, gap: true },
		{ text: "this is sh1t", profanity: true },
		{ text: "f u c k", profanity: true, gap: true, note: "spaced out letters" },
		{ text: "you're an asshole", profanity: true },
		{ text: "what a lovely day", profanity: false },
		{ text: "I love the classic pet names", profanity: false },
		{ text: "Scunthorpe has a nice football team", profanity: false },
		{ text: "I'll assess the class assignment", profanity: false },
		{ text: "cock-a-doodle-doo said the rooster", profanity: false, gap: true },
	]),
	category("reading level", [
		{ text: "I need to go now and get some food", complex: false },
		{ text: "see you all later, have fun", complex: false },
		{ text: "the dog ran to the park and played all day", complex: false },
		{ text: "Consequently, the aforementioned bureaucratic implementation necessitates comprehensive reconsideration", complex: true },
		{ text: "Notwithstanding the epistemological ramifications, the philosophical implications remain indisputably significant", complex: true },
		{ text: "The juxtaposition of ostentatious magnificence and ephemeral inconsequentiality is remarkably incongruous", complex: true },
		{ text: "ok", complex: false },
		{ text: "I am going to the store to buy milk", complex: false },
	]),
	category("chat shorthand and typos: negative", [
		...neg(
			"im so dumb lol", "i suk", "i'm such a looser", "im ugly af", "i hate my self", "i hate myself", "ugh im worthles",
			"im a failure tbh", "i'm a mess rn", "im trash", "i'm garbage at this", "im such a dork idk why anyone likes me",
			"i'm just stupid", "im literally useless", "i'm a horrible person", "im sooo pathetic", "i am so dumb omg",
			"yeah im the worst", "im a bad girl", "im awful", "i'm pathetic and i know it",
		),
	]),
	category("chat shorthand and typos: positive", [
		...pos(
			"im such a good girl", "i'm so proud of me", "im pretty af", "i am the bessst", "im a good boy",
			"i'm so smart lol", "im really good at this", "i'm a great pet", "im so helpful", "i am the cutest",
			"im doing so good", "i'm very brave", "im stronk", "i am kind and sweet", "i'm a good slave",
			"im a perfect little pet", "i am wonderful", "im really happy with myself", "i am so talented", "i'm such a sweetheart",
		),
	]),
	category("self-deprecation: varied constructions", [
		...neg(
			"I'm a stupid little slut who can't do anything", "what is wrong with me", "I hate how stupid I am",
			"I'm just a waste of space", "I'll never be good enough", "I am not good enough", "i'm not smart enough for this",
			"I'm not pretty", "i'm not worth it", "I am not a good girl", "I'm no good at this", "i'm not very good",
			"I never do anything right", "i always mess up", "I always ruin things", "I'm the one who is stupid",
			"i messed up again, im so dumb", "I feel so stupid", "i feel worthless", "I feel like a failure",
			"I know I'm useless", "I guess I'm just pathetic", "I'm too stupid to understand", "I'm too ugly for anyone",
			"someone like me doesn't deserve this", "I'm the ugliest one here", "I'm the dumbest person in this room",
		),
	]),
	category("affirmations: varied constructions", [
		...pos(
			"I'm proud of how far I've come", "I feel so good about myself", "I feel beautiful tonight", "I know I'm a good girl",
			"I'm really good at being obedient", "I'm the prettiest pet in the room", "I am so smart and capable",
			"I'm the best at this", "I did great", "I'm worth it", "I am worthy of love", "I'm a very good girl for you",
			"I think I'm pretty amazing", "I'm pretty great, actually", "I'm incredibly talented", "i am the cutest one here",
			"I know I'm adorable", "I'm good enough", "I'm so proud to be your pet", "I'm the luckiest girl alive",
		),
	]),
	category("neutral: everyday chat", [
		...neu(
			"good evening!", "hi hi", "what are you all up to", "anyone want to play a game?", "let's sit by the fire",
			"can someone help me with this lock", "I'll be right back", "I think I'll go to the other room", "who has the key?",
			"see you tomorrow", "that was fun", "I agree with you", "thank you so much!", "sorry, I missed that",
			"I'm going to get some water", "what's everyone's name?", "I've been here since noon", "it's so warm in here",
			"I'm new here, hi", "I just got here", "I'm thinking about lunch", "can you help me?", "I'm not sure",
			"I don't know", "I have to go soon", "I like your dress", "that's a cute outfit", "your hair looks nice",
			"you're so sweet", "you look great tonight", "I'm a bit hungry", "I'm going to bed", "I'm in the library",
			"I'm learning to knit", "I'm here for the party", "I work in an office", "I'm from Canada", "I'm twenty-five",
		),
	]),
	category("neutral: other people being negative", [
		...neu(
			"you're being silly", "he's such a jerk", "they are awful", "that movie was terrible", "the food here is gross",
			"she's a failure at cooking", "this game sucks", "it's so boring today", "the lag is terrible", "the lock is broken",
			"that's a stupid rule", "what a horrible day", "my computer is useless", "the stairs are ugly", "the music is bad",
			"this song is garbage", "they are worthless players", "the staff are useless", "he's so stupid sometimes", "she is the worst",
		),
	]),
	category("neutral: other people being positive", [
		...neu(
			"you're such a good girl", "she's so pretty", "he is amazing", "they are great", "what a beautiful day",
			"that's a lovely room", "the music is wonderful", "this game is awesome", "she's so smart", "you did so well",
			"Alice is adorable", "Bob is very kind", "the staff were helpful", "you're the best", "they did great",
		),
	]),
	category("roleplay actions and emotes", [
		...neu(
			"*blushes deeply*", "*looks down shyly*", "*kneels beside you*", "*giggles and wiggles in the ropes*", "*nods quickly*",
			"*pulls at the restraints but they hold*", "*mumbles something into the gag*", "*trembles*", "*hides behind the chair*",
			"*hugs you tight*", "*waits patiently for permission*", "*whimpers softly*", "*sits on the floor like a good pet*",
			"*wiggles in place, unable to move*", "*looks up at you with big eyes*", "*offers her wrists*", "*curtsies*",
			"*tries to escape but fails*", "*blinks sleepily*", "*shivers and squirms in the harness*",
		).map(c => ({ ...c, tags: ["kink"] })),
	]),
	category("kink roleplay in first person stays neutral", [
		...neu(
			"please punish me", "I've been bad", "I deserve to be punished", "i need to be restrained", "I'm your good little pet",
			"I'm locked in and can't escape", "I love being helpless", "I'm so stuck", "I'm completely at your disposal",
			"I want to serve you", "I'm ready to obey", "I belong to you", "I'm yours", "i'm a naughty girl",
			"I can't move at all", "I'm blindfolded", "I'm wearing so many restraints", "I'm helpless and I love it",
			"I am such a trapped little mouse", "I'm your property now", "I need permission first", "I'm under your control",
		).map(c => ({ ...c, tags: ["kink"] })),
	]),
	category("modals and circumstance: wider", [
		...neu(
			"I can't find my key", "I can't speak properly with this gag", "i cant see a thing", "I couldn't hear what you said",
			"I can't remember", "I can't get out", "I can't come tonight", "I can't stop giggling", "i cant stand up",
			"I can't read this", "I won't say", "I shouldn't stay long", "I can't feel my hands", "I can't focus",
			"I can't tell who is who", "I can't wait to see you", "I can't believe it", "I can't decide", "I cant login",
			"I can't lift this", "I couldn't sleep", "I can't log in right now",
		).map(c => ({ ...c, tags: ["modal"] })),
	]),
	category("every negation form", [
		...pos("I'm never going to be useless", "I never feel worthless", "I am no failure", "I'm not ugly at all"),
		...neu(
			"I'm not hungry", "I'm not ready", "I never said that", "I'm not leaving", "I don't want to leave",
			"I don't mind", "I'm not going anywhere", "I haven't decided", "I'm not here yet", "I wasn't there",
		),
		...neg("I don't deserve anything", "I never get anything right", "I'm not good at anything", "I can never do it right"),
		...pos("I've got nothing to worry about", "i am unafraid", "I am fearless"),
		...neu("I'm not sorry", "I didn't do it", "I won't do that", "I don't like spinach"),
	]),
	category("intensity and hedging: wider", [
		...neg("I'm pretty worthless", "I'm very stupid", "i'm totally hopeless"),
		...pos("I'm pretty good", "I'm very good", "i'm totally awesome"),
		...neu("im kinda pretty", "I'm somewhat tired", "I'm a bit cold", "I'm pretty hungry", "I'm very sleepy", "i'm so excited", "I'm really thirsty", "I'm extremely busy"),
	]),
	category("contrast clauses", [
		...neg("I tried so hard but I'm still useless", "I wanted to be good but I'm a failure", "i practiced but im still terrible"),
		...pos("I was nervous but I did great", "it was hard but I'm proud of myself", "I slipped up but I'm still a good girl"),
		...neu("I want to stay but I have to go", "it's late but I'm not tired", "I tried the soup but it was cold", "I like her but she's busy"),
	]),
	category("comparisons: wider", [
		{ text: "she's prettier than me", tone: "negative", comparison: -1 },
		{ text: "he's so much better than me at this", tone: "negative", comparison: -1 },
		{ text: "everyone else is smarter than me", tone: "negative", comparison: -1 },
		{ text: "I'm not as pretty as you", tone: "negative", comparison: -1 },
		{ text: "I'm not as smart as the others", tone: "negative", comparison: -1 },
		{ text: "you're all cuter than me", tone: "negative", comparison: -1 },
		{ text: "i wish i was as pretty as her", tone: "negative", comparison: -1 },
		{ text: "nobody is worse than me", tone: "negative", comparison: -1 },
		{ text: "I'm the ugliest one in the room", tone: "negative", comparison: -1 },
		{ text: "I'm the smartest one here", tone: "positive", comparison: 1 },
		{ text: "I'm prettier than her", tone: "positive", comparison: 1 },
		{ text: "I'm the best pet in this room", tone: "positive", comparison: 1 },
		{ text: "nobody is better than me", tone: "positive", comparison: 1 },
		{ text: "I'm more obedient than everyone else", tone: "positive", comparison: 1 },
		{ text: "I am as good as anyone here", tone: "positive" },
		{ text: "he's dumber than a rock", tone: "neutral", comparison: 0 },
		{ text: "she's slower than me", tone: "neutral", comparison: 0 },
		{ text: "you're uglier than my cat", tone: "neutral", comparison: 0 },
		{ text: "they're meaner than the others", tone: "neutral", comparison: 0 },
		{ text: "the red one is bigger than the blue one", tone: "neutral", comparison: 0 },
		{ text: "this is better than last time", tone: "neutral", comparison: 0 },
		{ text: "it's colder than yesterday", tone: "neutral", comparison: 0 },
		{ text: "this lock is tighter than the last", tone: "neutral", comparison: 0 },
		{ text: "she's the prettiest in the room", tone: "neutral", comparison: 0 },
		{ text: "Alice is the smartest here", tone: "neutral", comparison: 0 },
	]),
	category("gerunds and progressives: wider", [
		...neu("I'm typing", "im eating", "I'm reading", "i'm waiting for you", "I'm watching a movie", "I'm listening", "I'm trying to help", "I'm working on it", "i'm looking for my key", "I'm thinking"),
		...neg("I'm being pathetic", "I'm being a failure", "im acting so stupid", "I'm being such a brat about this", "I'm such a pain"),
		...neu("I'm being quiet", "I'm being patient", "I'm being careful", "i'm being silly", "I'm being serious"),
		...neg("I'm disappointing everyone", "I'm embarrassing myself", "I'm wasting your time", "im ruining it for everyone"),
	]),
	category("tone markers and emoticons", [
		{ text: "lol I'm so stupid :P", tone: "neutral", note: "playful self-tease" },
		{ text: "haha I'm the worst", tone: "neutral", note: "playful self-tease" },
		{ text: "*giggles* I'm such a dork", tone: "neutral", note: "playful self-tease" },
		{ text: "omg I'm such a klutz", tone: "neutral", note: "playful self-tease" },
		{ text: "I'm dumb as a box of rocks, hehe", tone: "neutral", note: "playful self-tease" },
		{ text: "I'm so stupid :(", tone: "negative" },
		{ text: "i'm useless T_T", tone: "negative" },
		{ text: "im so dumb... sorry", tone: "negative" },
		{ text: "I'm a good girl :)", tone: "positive" },
		{ text: "im so proud of me ^_^", tone: "positive" },
		{ text: "I am the best!!!", tone: "positive" },
		{ text: "I'M SO STUPID", tone: "negative" },
		{ text: "I AM A GOOD GIRL", tone: "positive" },
		{ text: "what's up :D", tone: "neutral" },
		{ text: ">.> <.<", tone: "neutral" },
	]),
	category("questions and rhetorical", [
		...neu("am I allowed to speak?", "is this ok?", "what do you think?", "how do I get out of this?", "do you like my outfit?", "can I sit here?"),
		...neg("am I that stupid?", "why am I so useless?", "why am I such a failure?", "how can I be so dumb?", "am I just worthless?", "why am I so ugly?"),
		...pos("am I not the prettiest?", "who is the best girl? me!", "aren't I a good girl?", "don't I look amazing?"),
		...neu("who is the worst?", "who's the prettiest?", "who is the smartest here?", "are you stupid?", "why are you so mean?"),
	]),
	category("third-person self reference and names", [
		...neg("Sera is useless", "sera is such a failure", "Sera is the worst", "this girl is worthless"),
		...pos("Sera is a good girl", "Sera is the best"),
		...neu("Alice is pretty", "Bob is useless", "Alice is being silly", "Sera is tired", "Sera is going to the bar", "Sera wants a snack"),
	]),
	category("addressed to the player", [
		...neu("you're stupid", "you're such a good girl", "you are a failure", "you look terrible", "nice work!", "you did great", "you suck", "you're so pretty"),
	]),
	category("profanity: present", [
		...prof(true,
			"fuck", "what the fuck", "this is bullshit", "shit", "damn it, shit", "you bastard", "bitch please", "that's so fucking dumb",
			"asshole", "dickhead", "motherfucker", "holy shit", "fucking hell", "son of a bitch", "piss off", "what a cunt",
			"sh1t", "fvck this", "f*ck", "b1tch", "a$$hole", "SHIT", "FUCK YOU", "fuuuuck", "shiiit", "bullshit lol",
		),
	]),
	category("profanity: absent", [
		...prof(false,
			"hello there", "I love this place", "that's a class act", "the assistant is helpful", "passing the pass",
			"Essex is lovely", "I'm going to Scunthorpe", "a shitake mushroom recipe", "the bass is loud", "I need to grab a glass",
			"Dickens wrote great books", "my cat is a great cocktail maker", "she sells sea shells", "that's a cute pussycat", "a hit single",
			"I'm going to sit on the bench", "the grass is green", "shoot, I dropped it", "darn it", "oh my gosh",
			"freaking cold out", "what the heck", "crud", "dang it", "a bloody good time",
		),
	]),
	category("profanity: boundaries", [
		{ text: "what the hell", profanity: true },
		{ text: "this hell is hot", profanity: false },
		{ text: "go to hell", profanity: true },
		{ text: "damn", profanity: true },
		{ text: "dammit", profanity: true },
		{ text: "goddamn it", profanity: true },
		{ text: "crap", profanity: true },
		{ text: "piss", profanity: true },
		{ text: "I need to pee", profanity: false },
	]),
	category("mild put-downs stay neutral", [
		...neu(
			"I am a bit stupid", "im kinda useless", "I'm slightly pathetic", "I'm a little bit dumb", "I'm kind of stupid sometimes",
			"I'm a bit proud", "I'm a little bit proud of myself", "I'm not a bad girl", "I don't have any fear",
			"I'm a bit rusty", "I could be better", "I'm not the best at this", "I'm not great at cooking", "I messed up a little",
			"I'm a little clumsy", "I'm not the smartest", "I made a mistake", "I'm somewhat lazy", "I'm not that pretty",
			"I forgot again", "I'm not perfect", "I'm just average", "I'm a bit slow today", "I'm not the fastest",
			"I'm not very experienced", "I'm kind of bad at this", "I'm not that good at singing", "I'm no expert", "I'm a bit shy",
		),
	]),
	category("tepid affirmations stay neutral", [
		...neu(
			"I'm okay", "I'm alright", "I'm not bad", "I did okay", "I'm decent", "I'm fairly smart", "I did fine",
			"I'm kind of good at this", "I'm not too bad", "I'm all right", "I'm fine", "I'm not terrible at this",
			"I'm average", "I'm somewhat pretty", "I'm okay at this", "I'm passable",
		),
	]),
	category("reading level: easy", [
		...easy(
			"hi there", "I'm going to the lounge now", "do you want to play a game with me", "that was a really fun night",
			"I will be back in five minutes", "lol ok sounds good", "can I have a hug please", "my cat sat on the keyboard again",
			"I like the blue one best", "what are you doing tonight", "let's go sit on the big couch", "I don't know where my shoes are",
			"it's so hot in here today", "thanks for the help with the lock", "I'm so tired after work today", "we should all go out for food",
			"the sky is blue and the grass is green", "I can see the moon from my window", "she gave me a red ball to play with",
			"he ran fast and won the race", "please sit down and have some tea", "the party starts at nine tonight",
			"I am a good pet and I like to sit", "tie my hands please", "good night everyone",
		),
	]),
	category("reading level: hard", [
		...hard(
			"Ostensibly, the multifaceted ramifications of this epistemological paradigm necessitate considerable introspection",
			"The phenomenological dimensions of consciousness remain fundamentally irreducible to mechanistic explanation",
			"Unquestionably, the proliferation of bureaucratic infrastructure undermines institutional accountability",
			"Her comprehensive articulation of socioeconomic disparities elucidated the underlying structural inequities",
			"The juxtaposition of deontological and consequentialist frameworks engenders insurmountable philosophical complications",
			"Notwithstanding considerable methodological limitations, the investigators substantiated their hypothesis comprehensively",
			"Such unprecedented technological advancement inevitably precipitates profound sociocultural transformation",
			"The pharmaceutical corporation's unscrupulous misrepresentation of clinical trial results constitutes egregious negligence",
			"Metaphysical speculation regarding transubstantiation exemplifies theological sophistication",
			"One must acknowledge the indispensable contributions of interdisciplinary collaboration to contemporary scholarship",
			"Indubitably, architectural magnificence frequently accompanies institutional aspirations toward immortality",
			"The aristocracy's unsustainable extravagance precipitated revolutionary upheaval throughout continental Europe",
			"Comprehending thermodynamic irreversibility necessitates rigorous mathematical sophistication",
			"His perpetual condescension demonstrates an astonishing deficiency of interpersonal sensitivity",
			"Retrospectively, the administration's deliberately ambiguous pronouncements facilitated considerable misinterpretation",
		),
	]),
	category("reading level: borderline chat", [
		...hard(
			"I'm genuinely concerned about the consequences of that decision",
			"Unfortunately, the situation requires considerably more deliberation",
			"I sincerely appreciate your understanding regarding the circumstances",
			"That explanation was surprisingly comprehensive and thoughtful",
			"We should seriously consider the implications before proceeding further",
			"Apparently the organization overlooked several important regulations",
		),
		...easy(
			"I'm really sorry about being late, traffic was terrible today",
			"Everyone seems happy with the decoration choices tonight",
			"Honestly I'm just exhausted from this whole week",
			"Yesterday I found an interesting little shop downtown",
			"Chocolate cake is definitely my favourite dessert ever",
			"Whenever you're ready we can start the next round",
			"My neighbour's dog keeps barking every single morning",
			"Absolutely nobody told me about the party tonight",
		),
	]),
	category("reading level: short lines stay easy", [
		...easy("ok", "yes", "no way", "lol", "brb", "hello", "thanks", "sure thing", "good girl", "yes ma'am", "I see", "oh no", "hm ok", "see you"),
	]),
];

export const ALL_LINES: { category: string; draft: boolean; case: LineCase }[] =
	CATEGORIES.flatMap(cat => cat.cases.map(c => ({
		category: cat.name,
		draft: cat.draft,
		case: BASELINE_GAP_TEXTS.has(c.text) ? { ...c, gap: true } : c,
	})));
