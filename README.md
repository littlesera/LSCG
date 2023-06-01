# Little Sera Scripts!
***DISCLAIMER***: Script under rapid development, if you have crashing errors suggestion is to disable for a little bit :3

### TamperMonkey install:
https://github.com/littlesera/LSCG/raw/main/lscgLoader.user.js

### Bookmark:
```
javascript:(()=>{fetch('https://littlesera.github.io/LSCG/bundle.js').then(r=>r.text()).then(r=>eval(r));})();
```



## **Help --**

### Hypnosis
#### Trigger Words:
- By default this module will select a random word from a filtered list of common english words as your active trigger word
  - If a 'Override Words' list is set it will use this list instead.
  - Override Words and Override Members can all be comma-separated lists
- Enabled Cycle means after your trigger word is activated + Cycle Delay minutes it will rotate to a new word selected from the list
- If Cycle is disabled and an override list of words is provided, all those words will be active triggers
- If Cycle is disabled and no overrides are provided it will select a random word from the large list and never change it
#### Hypnotic State:
- Lasts for configured number of minutes or until someone "snaps" in an emote or boops your nose
- While hypnotized, you will be unable to unable to speak, but other actions allowed for RP purposes
- While hypnotized incoming speech will be blanked unless spoken by whoever triggered you or if the speaker says your name
  - Note: anti-garble cheats still work here
#### Immersive Hypnosis:
- Will prevent LSCG settings access while hypnotized
- Disables hypno console commands
- Prevents leaving rooms while hypnotized

### Lipstick Kisses
- Currently just uses the Mask slot and will not replace any existing masks (including Glitter)
- A lipstick mark will be applied if kissed on the cheek/forehead/neck by someone with "lipstick" on (non-default mouth color)
- Rubbing the mouth/head/neck with a towel will clean the lipstick marks in that area

### Chloroform
- Having chloroform applied to your mouth will start a ~30s chain of events that will result in your unconsciousness
- If you are able to remove the chloroform before fully passing out it will reset
- Once asleep your chat will be blocked similarly to being under hypnosis
- Removing chloroform after falling asleep will result in a gradual reawakening
#### Immersive Chloroform:
- Will prevent LSCG settings access while asleep
- Prevents self or other character access, leaving rooms, accessing wardrobe while asleep
- Blinds and deafens while asleep

### Boops
- Simple reactions to being booped in the nose
- If booped too rapidly, reaction emotes will evolve to reflect this, respecting if you are bound or not
- If continued to be booped your nose may 'overload' and pause reactions for a period of time

### Hand Choking
- Adds an escalating series of events if repeatedly choked by others.
- Enabled under General, off by default.
- Will automatically release after a minute if not choked further.
- Repeated actions will lead to passout and release.

### Gag Suffocation
- Enabled under General, off by default.
- If you are sufficiently gagged (>8 gag level) and have nose plugs you will be unable to breath
- After just over 2 minutes (to allow for futiristic play) you will passout
- Note: the nose plugs will "fall out" when you lose consciousness, I am not interested in simulating full actual suffocation

### Custom Activities
Currently all enabled, potential toggles coming. These all behave like normal activities, respecting item permissions and can be configured with arousal in BC standard settings (further testing needed to make sure configured arousal works ok).
#### Basic Activities (Simple action emotes)
- Hug, Tackle, Flop, Kiss Eyes, Rub Pussy/Penis, Nibble Tail, Fuck with Pussy, Fuck with Ass
#### Special Activities
- Grab Tongue
  - If reciever is also using LSCG, grabbing will garble their speech for 45 seconds, similar to FBC's hand clamping
- Hold/Release Hand
  - If the reciever is also using LSCG, will behave like a leash. Holder can "Release Hand" or use vanilla "let go of leash" to release leashing.


# Special Thanks

 - Lilly ([@DrBranestawm](https://github.com/DrBranestawm/BCAR))
    - Great help getting started and becoming familiar with the BCT api
    - Excellent extension and examples
    - Encouragement and collaborative ideas (special activities)
 - Andrew, Bean, & Megg
    - Testing and feedback 
