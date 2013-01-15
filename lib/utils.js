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
 * Contributor(s): (none)
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

var default_length = 16;
var default_strength = 2;

function strStartsWith(full, str) {
    return (full.match("^" + str) == str);
}

function substringAfter(full, str) {
    return (full.substring(full.indexOf(str) + str.length));
}

function toArray(s) {
    return Object.keys(s);
}

function grepUrl(url) {
    //^(?:[^.]+\.){0,1}((?:[^.]+\.)*(?:[^.]+))\.(?:[^.]{2,15})$
    //http://www.regexplanet.com/simple/index.html
    var reg = new RegExp("^https?://(?:([^:\\./ ]+?)|([0-9]{1,3}(?:\\.[0-9]{1,3}){3})|(?:[^:./ ]+\\.){0,1}((?:[^:./ ]+\\.)*(?:[^:. /]+))\\.(?:[^:. /]{2,15}))(?::\\d+)?/.*$");
    var m = reg.exec(url);
    try {
        for (var i = 0; i < 3; ++i) {
            if (null != m[i+1]) {
		console.log("grepurl: " + url + " = " + m[i+1]);
                return m[i+1];
            }
        }
        throw "unmatched";
    } catch (e) {
        return "chrome";
    }
}

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace (/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
}

if (typeof(exports) !== 'undefined') {
    exports.default_length = default_length;
    exports.default_strength = default_strength;
    exports.strStartsWith = strStartsWith;
    exports.substringAfter = substringAfter;
    exports.toArray = toArray;
    exports.grepUrl = grepUrl;
    exports.generateGuid = generateGuid;
}
