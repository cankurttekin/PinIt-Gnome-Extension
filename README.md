# PinIt GNOME Shell Extension
 [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Zip and Release](https://github.com/cankurttekin/PinIt-gnome-shell-extension/actions/workflows/zip-and-release.yml/badge.svg?branch=main)](https://github.com/cankurttekin/PinIt-gnome-shell-extension/actions/workflows/zip-and-release.yml)

 <p align="center">
  <img height="64" width="64"  src="resources/pinit-ext-icon.png">
</p>

<h1 align="center">
  PinIt!
</h1>

> _GNOME Shell Extension to add your simple notes to the notification area._ 

[<img src="/resources/get_it_on_gnome_extensions.png"
     alt="Get it on GNOME Extensions"
     height="128">](https://extensions.gnome.org/extension/7083/pin-it/)

 
Click on tray icon, it will show up a dialog where you can input your notification title, message and optionally icon(default will be same as the extension icon).

_**Important**: This extension does not log your notifications to a file or system; do not put information that you would care if it's lost._
<br><br>
_~~Due to the limit on the GNOME Shell Version 45 & 46, only the 3 most recent notifications are shown per app, "so notifications can disappear before you have a chance to act on them"([blogs.gnome.org](https://blogs.gnome.org/shell-dev/2024/04/23/notifications-46-and-beyond/#A-single-messy-list)). <br> 
https://gitlab.gnome.org/GNOME/gnome-shell/blob/main/js/ui/messageTray.js#L563~~
<br>With this [commit](https://github.com/cankurttekin/PinIt-Gnome-Extension/commit/5c51d91dbca739858022900b40600432e2194c09) extension creates custom source so you can send unlimited notifications on GNOME Shell 45, 46 & 47 just like PinIt for older GNOME versions_ <br>


## Version
|Branch                   |Version|Compatible GNOME version|
|-------------------------|:-----:|------------------------|
| main                    |    21 | GNOME 45+          |
| [gnome-shell-before-45](https://github.com/cankurttekin/PinIt-Gnome-Extension/tree/gnome-shell-before-45)   |  4.2  | GNOME 3.4 -> 44        |
<br>
This extension supports GNOME Shell `3.4?` to `49`

_Tested on GNOME 42, 46 and 49._

## Installing
You can get this extension from [extensions.gnome.org](https://extensions.gnome.org/extension/7083/pin-it/) or you can download the source from [releases](https://github.com/cankurttekin/PinIt-Gnome-Extension/releases) and copy pinit@cankurttekin to your `/.local/share/gnome-shell/extensions/` directory.

## Screenshots & Features
![Screenshot_3](/screenshots/notifications.png)
<br>

## Contribute
You can help with development by contributing code, testing on other GNOME versions and reporting issues.
