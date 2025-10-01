from pathlib import Path
import re

def replace_once(text, old, new):
    if old not in text:
        raise ValueError(f'pattern not found for replacement:\n{old}')
    return text.replace(old, new, 1)

path = Path('apache/script.js')
text = path.read_text(encoding='utf-8')

old = """const HORIZONTAL_AXIS_DEADZONE = 0.25;\nconst horizontalControlState = {\n  keyboardLeft: false,\n  keyboardRight: false,\n  pointerLeft: false,\n  pointerRight: false,\n  joystickLeft: false,\n  joystickRight: false,\n};"""
new = """const HORIZONTAL_AXIS_DEADZONE = 0.25;\nconst horizontalControlState = {\n  keyboardLeft: false,\n  keyboardRight: false,\n  pointerLeft: false,\n  pointerRight: false,\n  joystickLeft: false,\n  joystickRight: false,\n};\n\nconst VERTICAL_AXIS_DEADZONE = 0.25;\nconst verticalControlState = {\n  keyboardUp: false,\n  keyboardDown: false,\n  joystickUp: false,\n  joystickDown: false,\n};"""
text = replace_once(text, old, new)

pattern = r"function syncHorizontalKeys\(\) {\n(?:.*\n)*?}\n\n"
match = re.search(pattern, text, re.DOTALL)
if not match:
    raise SystemExit('syncHorizontalKeys block not found')
vertical_sync = """function syncVerticalKeys() {\n  keys['ArrowUp'] = verticalControlState.keyboardUp ||\n    verticalControlState.joystickUp;\n  keys['ArrowDown'] = verticalControlState.keyboardDown ||\n    verticalControlState.joystickDown;\n}\n\n"""
text = text[:match.end()] + vertical_sync + text[match.end():]

old = """function isJoystickEngaged() {\n  return horizontalControlState.joystickLeft || horizontalControlState.joystickRight;\n}\n"""
new = """function isJoystickEngaged() {\n  return horizontalControlState.joystickLeft ||\n    horizontalControlState.joystickRight ||\n    verticalControlState.joystickUp ||\n    verticalControlState.joystickDown;\n}\n"""
text = replace_once(text, old, new)

pattern = r"function resetHorizontalControlState\(\) {\n(?:.*\n)*?}\n\n"
match = re.search(pattern, text, re.DOTALL)
if not match:
    raise SystemExit('resetHorizontalControlState block not found')
vertical_reset = """function resetVerticalControlState() {\n  verticalControlState.keyboardUp = false;\n  verticalControlState.keyboardDown = false;\n  verticalControlState.joystickUp = false;\n  verticalControlState.joystickDown = false;\n  syncVerticalKeys();\n}\n\n"""
text = text[:match.end()] + vertical_reset + text[match.end():]

pattern = r"function setHorizontalAxisFromJoystick\(value\) {\n(?:.*\n)*?}\n\n"
match = re.search(pattern, text, re.DOTALL)
if not match:
    raise SystemExit('setHorizontalAxisFromJoystick block not found')
vertical_axis = """function setVerticalAxisFromJoystick(value) {\n  if (!gameStarted) return;\n  const upActive = value < -VERTICAL_AXIS_DEADZONE;\n  const downActive = value > VERTICAL_AXIS_DEADZONE;\n  verticalControlState.joystickUp = upActive;\n  verticalControlState.joystickDown = downActive;\n  syncVerticalKeys();\n}\n\n"""
text = text[:match.end()] + vertical_axis + text[match.end():]

old = """  window.apacheControls = {\n    setHorizontalAxis: setHorizontalAxisFromJoystick,\n    pressJump: startJumpFromControl,\n    releaseJump: endJumpFromControl,\n    togglePause: togglePauseFromControl,\n  };\n"""
new = """  window.apacheControls = {\n    setHorizontalAxis: setHorizontalAxisFromJoystick,\n    setVerticalAxis: setVerticalAxisFromJoystick,\n    pressJump: startJumpFromControl,\n    releaseJump: endJumpFromControl,\n    togglePause: togglePauseFromControl,\n  };\n"""
text = replace_once(text, old, new)

old = "registerExternalControls();\nresetHorizontalControlState();\nlet goldCoins = [];"
new = "registerExternalControls();\nresetHorizontalControlState();\nresetVerticalControlState();\nlet goldCoins = [];"
text = replace_once(text, old, new)

old = "  resetHorizontalControlState();\n  discoBall = null;"
new = "  resetHorizontalControlState();\n  resetVerticalControlState();\n  discoBall = null;"
text = replace_once(text, old, new)

old = """    dart() {\n      const t = ctx.currentTime;\n      const n = pulseOsc(1200, 0.5, t); // Started higher for more \"zip\"\n      n.rampFreq(600, t, t + 0.06); // Quick downward ramp for \"pew\" effect\n      const e = envADSR(n.out, t, 0.001, 0.02, 0, 0.08, 1.0, 0); // Increased peak volume, slight duration tweak\n      e.out.connect(masterGain);\n      n.stop(t + 0.12); // Slightly longer tail\n      e.release(t + 0.05);\n    },\n    enemyDown() {"""
new = """    dart() {\n      const t = ctx.currentTime;\n      const n = pulseOsc(1200, 0.5, t); // Started higher for more \"zip\"\n      n.rampFreq(600, t, t + 0.06); // Quick downward ramp for \"pew\" effect\n      const e = envADSR(n.out, t, 0.001, 0.02, 0, 0.08, 1.0, 0); // Increased peak volume, slight duration tweak\n      e.out.connect(masterGain);\n      n.stop(t + 0.12); // Slightly longer tail\n      e.release(t + 0.05);\n    },\n    uiHover() {\n      const t = ctx.currentTime;\n      const { out, stop } = pulseOsc(midiToHz(90), 0.3, t);\n      const e = envADSR(out, t, 0.0015, 0.04, 0, 0.06, 0.6, 0);\n      e.out.connect(masterGain);\n      stop(t + 0.1);\n      e.release(t + 0.05);\n    },\n    uiClick() {\n      const t = ctx.currentTime;\n      const { out, stop, rampFreq } = pulseOsc(midiToHz(72), 0.22, t);\n      rampFreq(midiToHz(67), t, t + 0.06);\n      const e = envADSR(out, t, 0.001, 0.03, 0, 0.08, 0.85, 0);\n      e.out.connect(masterGain);\n      stop(t + 0.14);\n      e.release(t + 0.07);\n    },\n    enemyDown() {"""
text = replace_once(text, old, new)

old = "const collectNextButton = document.getElementById('collectNextButton');\n\nif (startGameButton) {"
button_sound_setup = """function setupStartMenuButtonSounds() {\n  if (!startScreen) {\n    return;\n  }\n\n  const buttons = startScreen.querySelectorAll('button');\n  if (!buttons.length) {\n    return;\n  }\n\n  const playHoverSound = () => {\n    ensureAudioActive();\n    if (AudioKit && AudioKit.sfx && typeof AudioKit.sfx.uiHover === 'function') {\n      AudioKit.sfx.uiHover();\n    }\n  };\n\n  const playClickSound = () => {\n    ensureAudioActive();\n    if (AudioKit && AudioKit.sfx && typeof AudioKit.sfx.uiClick === 'function') {\n      AudioKit.sfx.uiClick();\n    }\n  };\n\n  buttons.forEach((button) => {\n    button.addEventListener('mouseenter', playHoverSound);\n    button.addEventListener('focus', () => {\n      let shouldPlay = true;\n      if (typeof button.matches === 'function') {\n        try {\n          shouldPlay = button.matches(':focus-visible');\n        } catch (err) {\n          shouldPlay = true;\n        }\n      }\n      if (shouldPlay) {\n        playHoverSound();\n      }\n    });\n    button.addEventListener('click', playClickSound);\n  });\n}\n\nsetupStartMenuButtonSounds();\n\n"""
new = "const collectNextButton = document.getElementById('collectNextButton');\n\n" + button_sound_setup + "if (startGameButton) {"
text = replace_once(text, old, new)

old = """  if (e.code === 'ArrowRight') {\n    horizontalControlState.keyboardRight = true;\n    syncHorizontalKeys();\n  }\n\n  if (e.code === 'ControlLeft') {"""
new = """  if (e.code === 'ArrowRight') {\n    horizontalControlState.keyboardRight = true;\n    syncHorizontalKeys();\n  }\n\n  if (e.code === 'ArrowUp') {\n    verticalControlState.keyboardUp = true;\n    syncVerticalKeys();\n  }\n\n  if (e.code === 'ArrowDown') {\n    verticalControlState.keyboardDown = true;\n    syncVerticalKeys();\n  }\n\n  if (e.code === 'ControlLeft') {"""
text = replace_once(text, old, new)

old = """  if (e.code === 'ArrowRight') {\n    horizontalControlState.keyboardRight = false;\n    syncHorizontalKeys();\n  }\n\n  if (e.code === 'ControlLeft') {"""
new = """  if (e.code === 'ArrowRight') {\n    horizontalControlState.keyboardRight = false;\n    syncHorizontalKeys();\n  }\n\n  if (e.code === 'ArrowUp') {\n    verticalControlState.keyboardUp = false;\n    syncVerticalKeys();\n  }\n\n  if (e.code === 'ArrowDown') {\n    verticalControlState.keyboardDown = false;\n    syncVerticalKeys();\n  }\n\n  if (e.code === 'ControlLeft') {"""
text = replace_once(text, old, new)

path.write_text(text, encoding='utf-8')
