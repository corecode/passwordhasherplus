/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Password Hasher Plus
 *
 * The Initial Developer of the Original Code is Eric Woodruff.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Oren Ben-Kiki
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * <script type="text/javascript" src="../lib/jquery-1.7.1.min.js"></script>
 <script type="text/javascript" src="../lib/compat.js"></script>
 <script type="text/javascript" src="../../lib/utils.js"></script>
 <script type="text/javascript" src="../lib/common.js"></script>

 */

function setNewGuid () {
    $("#seed").val(generateGuid());
}

function saveOptions () {
    var options = new Object ();
    options.defaultLength = $("#length").val();
    options.defaultStrength = $("#strength").val();
    options.compatibilityMode = $("#compatibility").val();
    options.privateSeed = $("#seed").val();
    options.backedUp = $("#backedup").val();
    compat.saveOptions(options, function() {
        refreshStorage();
    });
}

function restoreOptions(cb) {
    compat.loadOptions(function(options) {
        $("#length").val(options.defaultLength);
        $("#strength").val(options.defaultStrength);
        $("#compatibility").val(options.compatibilityMode);
        $("#seed").val(options.privateSeed);
	$("#backedup").val(options.backedUp);
        if (typeof(cb) === 'function') {
            cb();
        }
    });
}

function refreshStorage () {
    compat.loadStorage(function(entries) {
        var entries_str = JSON.stringify(entries);

        $("#everything").val(entries_str);
    });
}

function clearStorage () {
    if (confirm ("You are about to erase all of the Password Hasher Plus database. " +
                 "This is typically done before loading a snapshot of a previous database state. " +
                 "Are you certain you want to erase the database?")) {
        compat.setStorage({}, function() {
            alert ("Your database is now empty. " +
                   "You probably want to paste a previous snapshot of the database to the text area to the right, " +
                   "and hit \"Load\" to re-populate the database. " +
                   "Good luck.");
        });
    }
}

function loadStorage () {
    try {
        everything = JSON.parse($("#everything").val());
    } catch(e) {
        alert("Sorry, the data in the text area to the right is not valid JSON.");
        return;
    }
    compat.setStorage(everything, function() {
        restoreOptions();
        refreshStorage();
    });
}

function cleanupStorage() {
    compat.cleanupStorage(function() {
	refreshStorage();
    });
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    restoreOptions();
    refreshStorage();

    $("#generate").click(setNewGuid);
    $("#backupSave").click(saveOptions);
    $("#backupRevert").click(restoreOptions);
    $("#removeUnUsedTags").click(cleanupStorage);
    $("#dbClear").click(function() {
        clearStorage();
        refreshStorage();
    });
    $("#dbSave").click(loadStorage);
    $("#dbRevert").click(refreshStorage);

    $('#portablePage').click(function() {chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/data/html/passhashplus.html'});});
});
