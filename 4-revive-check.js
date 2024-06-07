// ==UserScript==
// @name         4 - Revive check
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  spam revive, with conditions
// @author       You
// @match        https://www.torn.com/profiles.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    let targetChance = 0;
    let failCounter = 0;

    $('body').append('<input type="button" value="Revive" id="TitleButton">');
    $("#TitleButton").css("position", "fixed").css("top", 300).css("right", 0).css("height","70px").css("width","120px").css("border-radius", "10px 0px 0px 10px").css("border-width","thick").css("box-shadow","0px 0px 5px -1px").css("font-size","13px");

    $('#TitleButton').on('click', async () => {
        if (GM_getValue("minChance",50) && !targetChance) {
            await getAction({
                type: 'get',
                action: 'revive.php',
                data: {
                    action: 'revive',
                    ID: location.href.match(/[0-9]+/)[0],
                    links: 'no'
                },
                success: (str) => {
                    try {
                        const msg = JSON.parse(str);
                        if (msg.msg.indexOf("Early Discharge")>0) {
                             $("#TitleButton").attr("value", "ED available.");
                        } else if (msg.msg.indexOf("%</b> chance")>0) {
                            targetChance = parseFloat(msg.msg.substring(msg.msg.indexOf("%</b> chance")-6,msg.msg.indexOf("%</b> chance")).replace(">",""));
                            $("#TitleButton").attr("value", "Chance\nchecked.");
                        } else if (msg.msg.startsWith("This user")) {
                            $("#TitleButton").attr("value", "Out of hosp.");
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        } else {
            if (targetChance >= GM_getValue("minChance",50)) {
                await getAction({
                    type: 'get',
                    action: 'revive.php',
                    data: {
                        action: 'revive',
                        step: 'revive',
                        ID: location.href.match(/[0-9]+/)[0]
                    },
                    success: (str) => {
                        try {
                            const msg = JSON.parse(str);
                            if (msg.msg.startsWith("This person")) {
                                $("#TitleButton").attr("value", "Revs off.");
                                targetChance = 0;
                            } else {
                                if (msg.msg.substring(26).startsWith("success")) {
                                    $("#TitleButton").attr("value", "Success!");
                                    targetChance = 0;
                                    failCounter = 0;
                                } else if (msg.msg.substring(24).startsWith("attempt")) {
                                    failCounter++;
                                    $("#TitleButton").attr("value", "Fail ("+failCounter+")");
                                } else if (msg.msg.startsWith("This user")) {
                                    $("#TitleButton").attr("value", "Out of hosp.");
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            } else {
                $("#TitleButton").attr("value","Chance is below\n"+GM_getValue("minChance",50)+"% min.");
                targetChance = 0;
            }
        }
    });

    $('#TitleButton').on('contextmenu', async (e) => {
        e.preventDefault();
        try {
            GM_setValue("minChance", parseInt(prompt("Enter minimum rev chance.")));
        } catch (e) {
            console.log(e);
        }
    });
})();
