# SpeakiMod
A utility mod for the fan-made Speaki RPG game.

Unlike its evil twin, SpeakiMod **is fully safe** to use on your main account since it does not include any cheating functionality:

<img src="https://cdn.nest.rip/uploads/6fa443d9-3b25-4fed-8633-3434e1944b56.png">

## Features
- Nearby player count
- EXP tracker (EXP per minute and time until next level estimation)
- Channel tracker
- Dance anywhere
- Say "joayo!" anywhere
- Spin very fast (defeating the mobile monopoly)
- Lock the camera (like in old PS1 games)
- ViewClip (allow the camera to phase through walls)
- Watch the game from another player's perspective
- Hide other players' nametags
- Turn Speaki to face the camera (useful for posing)
- Quest pinning
- Automatically walk towards portals (**must be attended**, because no auto-eat & no obstacle avoidance)
- Fold the HUD by clicking on the mod title (up to 3 clicks)
- Control camera zoom (`!zoom` chat command)

### Preview
<img src="https://cdn.nest.rip/uploads/4ceeb213-8112-43ef-89fc-7ae3f0118133.png">
<img src="https://cdn.nest.rip/uploads/4e405b56-f8a9-4ef8-b3e1-2ae5e0623a5b.png">
<img src="https://cdn.nest.rip/uploads/bbb13c2f-014e-4278-b821-18eb481c5d8c.png">

## Injection Guide
### Method 1: Using a Chrome extension (Recommended)
1. Download the latest Injector extension from the [Releases page](https://github.com/Alluseri/SpeakiMod/releases)
2. Unpack the .zip into any folder of your choice (**you will need to reinstall the extension if you move the folder later!**)
3. Navigate to "Manage Extensions" (located at `chrome://extensions/`)
4. Enable Developer mode (usually a checkbox at the top right of the page)
5. Click "Load unpacked" (usually at the top left)
6. Find and select the folder you unpacked the extension into, click "Select Folder"
7. Final result (the ID and version may be different, and that's totally fine):

<img src="https://cdn.nest.rip/uploads/4a223e70-8252-443d-af14-0d406c541d24.png">

8. You're all set! Once you open Speaki RPG, SpeakiMod should just work™ without any additional actions on your behalf.

### Method 2: Using DevTools
> [!CAUTION]
> The script has been reported **not to work correctly on Firefox**. You can still inject it, but chat commands may not work!
>
> This injection method does not support internationalization. Features relying on it, such as the portal walker, will display internal values (e.g. `content.zone.2.name`).
>
> This injection method does not include the Quest Pinning functionality.

1. Open Speaki RPG
2. Do Ctrl+Shift+I to open DevTools
3. Navigate to the "Sources" tab ("Debugger" tab in Mozilla Firefox)
4. At the left, navigate to the "Page" tab
5. In the file tree, follow the following path: `top` -> `speakirpg.overture.io.kr` -> `assets` -> `index-(some characters here).js`
6. Once you have the `index` file open, press Ctrl+F and type in `k.connect(_)`
7. Click once at the left of the line, a blue chevron should appear next to the line
8. Right click the blue chevron and click "Edit breakpoint..."
9. Put `!(window.gameState = k)` into the breakpoint condition (see the screenshot below)
10. Refresh the tab and enter the game (DON'T CLOSE DEVTOOLS!)
11. Wait until you are fully loaded into the game
12. Copy the source code [from here](https://raw.githubusercontent.com/Alluseri/SpeakiMod/refs/heads/main/SpeakiMod.js) (Ctrl+A and Ctrl+C)
13. Paste it into the console (you may have to do the `allow pasting` trick first) and press Enter
14. You should see the SpeakiMod HUD at the left of the screen - that means it is successfully injected into the game and you can safely close DevTools and start playing the actual game

<img src="https://cdn.nest.rip/uploads/768ef322-bddc-4ad4-a84e-c10ab8d82efc.png">

### Why so complicated?
I haven't found a better way to get the game state. That's really it.

#### Old README
The old README for the "evil twin" of SpeakiMod, including my view on the farm botting (and fun botting) situation, can be found in the repo.

---

<img src="https://cdn.nest.rip/uploads/96578d20-4e61-4cab-9978-d01789edebbb.png">
