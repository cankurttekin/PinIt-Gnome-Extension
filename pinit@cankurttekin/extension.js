/* extension.js
 *
 * PinIt GNOME Shell Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PinIt GNOME Shell Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PinIt GNOME Shell Extension.  If not, see <http://www.gnu.org/licenses/>.
 *
 * License: GPL-3.0
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

// System icon names mapping
const ICON_MAPPING = {
    'Pin': 'view-pin-symbolic',
    'Calendar': 'x-office-calendar-symbolic',
    'Music': 'folder-music-symbolic',
    'Alarm': 'alarm-symbolic',
    'Information': 'dialog-information-symbolic',
    'Warning': 'dialog-warning-symbolic',
    'Error': 'dialog-error-symbolic'
};

const Pin = GObject.registerClass(
    class Pin extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, _('PinIt'));

            // Create a system tray icon
            this._icon = new St.Icon({
                icon_name: ICON_MAPPING['Pin'],
                style_class: 'system-status-icon',
            });
            this.add_child(this._icon);

            // Create extension functionality UI elements
            this.iconBox = this._createIconBox();
            this.titleEntry = this._createEntry(_("Title"));
            this.messageEntry = this._createEntry(_("Message"));

            const submitButton = this._createSubmitButton();

            // Create vertical box and add pop-up menu UI elements to it
            const vbox = new St.BoxLayout({
                vertical: true,
                style_class: 'popup-menu-box'
            });
            vbox.add_child(this.iconBox);
            vbox.add_child(this.titleEntry);
            vbox.add_child(this.messageEntry);
            vbox.add_child(submitButton);

            const popupEdit = new PopupMenu.PopupMenuSection();
            popupEdit.actor.add_child(vbox);
            this.menu.addMenuItem(popupEdit);
            this.menu.actor.add_style_class_name('note-entry');

            // Setting default notification icon
            this.selectedIcon = ICON_MAPPING['Pin'];

            this.timerId = null;
        }

        _createIconBox() {
            const box = new St.BoxLayout({
                x_align: Clutter.ActorAlign.CENTER,
                vertical: false,
            });

            // Adding notification icon buttons from ICON_MAPPING to icon box
            Object.keys(ICON_MAPPING).forEach(iconName => {
                const iconButton = this._createIconButton(iconName);
                box.add_child(iconButton);
            });
            return box;
        }

        _createIconButton(iconName) {
            const iconButton = new St.Button({
                style_class: 'quick-settings icon-button',
                style: 'margin: 4px; margin-top: 8px;',
                child: new St.Icon({
                    gicon: Gio.icon_new_for_string(ICON_MAPPING[iconName]),
                    can_focus: true,
                }),
            });

            // Click handler for icon buttons
            iconButton.connect('clicked', () => {
                this.selectedIcon = ICON_MAPPING[iconName];
                this._updateActiveButton(iconButton);
            });
            return iconButton;
        }

        // Create text field with hint
        _createEntry(hintText) {
            return new St.Entry({
                hint_text: hintText,
                can_focus: true,
                track_hover: true,
                style: 'margin: 4px;'
            });
        }

        // Submit button are with delay button
        _createSubmitButton() {
            // Create cycling Delay button
            // Delay values in minutes
            const delayOptions = [0, 5, 15, 30, 60, 90, 120];
            let currentDelayIndex = 0;

            const delayIcon = new St.Icon({
                gicon: Gio.icon_new_for_string('document-open-recent-symbolic'),
                style_class: 'system-status-icon'
            });

            const delayLabel = new St.Label({
                text: ` ${delayOptions[currentDelayIndex]}`,
                style_class: 'system-menu-action'
            });

            const delayBox = new St.BoxLayout({
                style_class: 'icon-label-box',
                vertical: false,
                reactive: true,
                track_hover: true,
                x_align: Clutter.ActorAlign.CENTER
            });

            delayBox.add_child(delayIcon);
            delayBox.add_child(delayLabel);

            const delayButton = new St.Button({
                //label: `${delayOptions[currentDelayIndex]}`,
                child: delayBox,
                style_class: 'quick-settings icon-button',
                style: 'margin: 4px; margin-bottom: 8px;',
                can_focus: true,
                x_expand: true,
                //x_align: Clutter.ActorAlign.START,
            });

            delayButton.connect('clicked', () => {
                // Cycle through delay options
                currentDelayIndex = (currentDelayIndex + 1) % delayOptions.length;
                delayLabel.text = ` ${delayOptions[currentDelayIndex]}`;
            });

            // Create "Pin It" button
            const submitIcon = new St.Icon({
                gicon: Gio.icon_new_for_string(ICON_MAPPING['Pin']),
                style_class: 'system-status-icon'
            });

            const submitLabel = new St.Label({
                text: ' Pin It ',
                style_class: 'system-menu-action'
            });

            const submitBox = new St.BoxLayout({
                style_class: 'icon-label-box',
                vertical: false,
                reactive: true,
                track_hover: true,

            });
            submitBox.add_child(submitIcon);
            submitBox.add_child(submitLabel);

            const submitButton = new St.Button({
                style_class: 'icon-button',
                child: submitBox,
                can_focus: true,
                style: 'margin: 4px; margin-bottom: 8px;',
                //x_align: Clutter.ActorAlign.END,
            });

            // Handle notification submission with delay
            submitButton.connect('clicked', () => {
                const title = this.titleEntry.get_text();
                const message = this.messageEntry.get_text();
                const iconName = this.selectedIcon;
                const delay = delayOptions[currentDelayIndex] * 60; // Convert minutes to seconds

                if (delay === 0) {
                    this._showNotification(title, message, iconName);
                } else {
                    this._scheduleNotification(title, message, iconName, delay);
                }

                this.titleEntry.set_text('');
                this.messageEntry.set_text('');
            });

            // Combine delay button and submit button
            const buttonBox = new St.BoxLayout({ vertical: false, x_expand: true, x_align: Clutter.ActorAlign.END, });
            buttonBox.add_child(delayButton);
            buttonBox.add_child(submitButton);

            return buttonBox;
        }

        _scheduleNotification(title, message, iconName, delay) {
            this.timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, delay, () => {
                this._showNotification(title, message, iconName);
                return false; // timer runs only once
            });
        }

        _updateActiveButton(button) {
            if (this.activeButton) {
                this.activeButton.remove_style_class_name('button-accent');
            }
            button.add_style_class_name('button-accent');
            this.activeButton = button;
        }

        // Creating notification with title, message and icon
        _showNotification(title, message, iconName) {
            const notificationIcon = new Gio.ThemedIcon({ name: iconName });
            let source = new MessageTray.Source({
                title: _('PinIt'),
                iconName: 'view-pin-symbolic',
            });

            const notification = new MessageTray.Notification({
                source: source,
                title: title,
                body: message,
                gicon: notificationIcon,
                isTransient: true,
                urgency: MessageTray.Urgency.LOW,
            });

            // Cleaning of message source when destroyed
            source.connect('destroy', () => {
                source = null;
            });

            Main.messageTray.add(source);
            source.addNotification(notification);
        }

        // Cancel the timer when the extension is disabled
        _cancelTimer() {
            if (this.timerId !== null) {
                GLib.source_remove(this.timerId);
                this.timerId = null;
            }
        }
    }
);

export default class PinItExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._pin = new Pin(this._settings);
        Main.panel.addToStatusArea(this.uuid, this._pin);
    }
    disable() {
        this._pin._cancelTimer();
        this._pin.destroy();
        this._pin = null;
        this._settings = null;
    }
}
