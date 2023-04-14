Little Sera Scripts!

TamperMonkey install:
https://github.com/littlesera/LSCG/raw/main/lscgLoader.user.js

Bookmark:
```
javascript:(()=>{fetch('https://littlesera.github.io/LSCG/bundle.js').then(r=>r.text()).then(r=>eval(r));})();
```



**HELP:**

Hypnosis Trigger Words:
- By default this module will select a random word from a filtered list of common english words as your active trigger word
  - If a 'Override Words' list is set it will use this list instead.
- Enabled Cycle means after your trigger word is activated + Cycle Delay minutes it will rotate to a new word selected from the list
- If Cycle is disabled and an override list of words is provided, all those words will be active triggers
- If Cycle is disabled and no overrides are provided it will select a random word from the large list and never change it
