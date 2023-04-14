# Little Sera Scripts!

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
- Enabled Cycle means after your trigger word is activated + Cycle Delay minutes it will rotate to a new word selected from the list
- If Cycle is disabled and an override list of words is provided, all those words will be active triggers
- If Cycle is disabled and no overrides are provided it will select a random word from the large list and never change it
#### Hypnotic State:
- Lasts for configured number of minutes or until someone "snaps" in an emote or boops your nose
- While hypnotized, you will be unable to unable to speak, but other actions allowed for RP purposes
- While hypnotized incoming speech will be blanked unless spoken by whoever triggered you or if the speaker says your name
  - Note: anti-garble cheats still work here

### Lipstick Kisses
- Currently just uses the Mask slot and will not replace any existing masks (including Glitter)
- A lipstick mark will be applied if kissed on the cheek/forehead/neck by someone with "lipstick" on (non-default mouth color)
- Rubbing the mouth/head/neck with a towel will clean the lipstick marks in that area

### Chloroform
- Having chloroform applied to your mouth will start a ~30s chain of events that will result in your unconsciousness
- If you are able to remove the chloroform before fully passing out it will reset
- Removing chloroform after falling asleep will result in a gradual reawakening

### Boops
- Simple reactions to being booped in the nose
- If booped too rapidly, reaction emotes will evolve to reflect this, respecting if you are bound or not
- If continued to be booped your nose may 'overload' and pause reactions for a period of time
