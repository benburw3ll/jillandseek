# The Claude API: install, check, turn on

Jill and Seek can read a missing dog's photo into the form's traits with the Claude API ([ADR-0007](adr/0007-claude-api-photo-fill.md)). It is off until the owner turns it on, and the app works fully without it.

This page is the install. Only the owner does steps 1 to 5: nobody else creates or pastes a key.

## Install

Steps 1 to 3 were done for the owner's install on 2026-11-28. They stay here for a new one.

1. In the [Claude Console](https://platform.claude.com/), create a workspace named `jillandseek`.
2. Set that workspace's monthly spend limit (Settings, Spend limits, Workspace limits). 20 USD is recommended. It is the backstop behind the app's own caps.
3. Leave auto-reload off (Settings, Billing).
4. Create an API key scoped to the `jillandseek` workspace, named `jillandseek-app`, and copy it. The Console shows it once.
5. Save it. From the repo's folder:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\save-api-key.ps1
   ```

   The script takes the key from the clipboard (or asks for it at a hidden prompt), stores it encrypted to this Windows account, clears the clipboard, and runs the check. It prints no part of the key.
6. Check it at any time. It lists the models, which costs nothing:

   ```powershell
   pnpm ai:check
   ```

   It says one of: works, no key saved, can't be decrypted, or refused by Anthropic.
7. Turn AI on for the app's own start only:

   ```powershell
   $env:JILL_AI = 'on'; pnpm start
   ```

   That sets it for this one PowerShell window. Start the app without it and AI is off again.

## Using it

With AI on and a key saved, the home screen says so under the photo area. Drop one photo of the missing dog there: the breed words, colours, size, sex, age and marks fill in from it, each marked "From the photo" until you change it. Anything the photo doesn't show stays empty or Not known, only a field that is still empty or Not known is filled, so what you typed is never overwritten, and the town and the time are always yours to give. With AI off, or when a read fails or a cap is reached, the form works by hand as before.

## Where the key lives

- In `%LOCALAPPDATA%\JillAndSeek\claude-api-key.dpapi`: under the user's profile, outside the repo and outside the data home, so a copy or backup of `data/` never carries it.
- Encrypted by Windows to the signed-in account (DPAPI). Another account or another computer can't read the file: save the key again there.
- The app decrypts it into memory when a read is asked for, and hands it to the one capped client. It is never logged, printed, written anywhere else or put in the environment.
- **Never** put the key in an `ANTHROPIC_API_KEY` variable, a shell profile, a `.env` file, a settings file, the repo or the data home. Other tools on the computer would bill it, and a file is one mistake from a commit. The app ignores every `ANTHROPIC_*` variable.
- An Admin key (`sk-ant-admin…`) and a login token are refused by the save script and by the app.

## Settings

Set these for the app's own start. All are optional.

| Setting | Default | Meaning |
| --- | --- | --- |
| `JILL_AI` | `off` | `on` lets the app call the Claude API |
| `JILL_AI_MODEL` | `claude-opus-5-5` | The model a read uses. `claude-sonnet-5-5` and `claude-haiku-5-5` cost less per call |
| `JILL_AI_DAILY_CAP` | `25` | The most calls in one UTC day |
| `JILL_AI_MONTHLY_CAP` | `300` | The most calls in one UTC month |
| `JILL_AI_KEY_FILE` | (see above) | Another place for the encrypted key file: a full path outside the repo and the data home |

## What a read sends, and what it costs

- One call for one photo the owner added. The request holds the photo, with its metadata (such as where it was taken) removed, and a fixed instruction. Nothing else: no name, notes, place, contact details, and no listing.
- Every call is counted in the database before it is sent, and the app refuses the call that would pass a cap. A failed call is not sent again.
- If Anthropic declines a read and runs it again on another Claude model inside the same request, that second run is counted as a call too.
- Anthropic deletes API inputs and outputs within 30 days, and does not train on them without permission (read 2026-11-28; ADR-0007 has the links).
- The calls and their cost show in the Console under Usage and Cost, filtered to the `jillandseek` workspace. The app's own log shows counts only: `ai: call id=… outcome=… in=… out=…`.

## Replace or revoke the key

- **Replace:** create a new key in the `jillandseek` workspace, run the save script again (it overwrites the file), then delete the old key in the Console. The running app picks up the new file on its next read.
- **Revoke:** delete the key in the Console (API keys). To remove it from this computer, delete `%LOCALAPPDATA%\JillAndSeek\claude-api-key.dpapi`. `pnpm ai:check` then says no key is saved.
- **Stop all spend at once:** start the app without `JILL_AI`, or set the workspace's spend limit to 0.

## When something is off

| `pnpm ai:check` says | What to do |
| --- | --- |
| no key saved | Do steps 4 and 5 |
| can't be decrypted | The file came from another Windows account or computer. Do steps 4 and 5 here |
| refused by Anthropic | The key is wrong or was deleted. Make a new one and save it |
| couldn't reach Anthropic | Check the connection, then try again |

On a system other than Windows the save script and the decryption don't run: the app says no key is saved, and everything else works.
