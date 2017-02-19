// ==UserScript==
// @name       Smart Quotes
// @author xadamxk
// @namespace  https://github.com/xadamxk/HF-Scripts
// @version    1.1.3
// @description  Enhances quotes by adding style & highlights mentioned quotes
// @require https://code.jquery.com/jquery-3.1.1.js
// @match      *://hackforums.net/showthread.php?tid=*
// @copyright  2016+
// @updateURL https://github.com/xadamxk/HF-Userscripts/releases/download/HFSQ/Smart.Quotes.user.js
// @downloadURL https://github.com/xadamxk/HF-Userscripts/releases/download/HFSQ/Smart.Quotes.user.js
// @iconURL https://raw.githubusercontent.com/xadamxk/HF-Userscripts/master/scripticon.jpg
// ==/UserScript==
// ------------------------------ Change Log ----------------------------
// version 1.1.3: Removed console.log statements
// version 1.1.2: Added 'Always Quote' to quote on closed threads
// version 1.1.1: Replaced update/download URLs with release
// version 1.1.0: Now shows 'smartQuoteNotifications' next to the thread title
// version 1.0.3: Bug fix: document-start
// version 1.0.2: Bug fix - fixed notification selector to work on threads without page nav (<10 posts)
// version 1.0.1: Initial Release
// version 1.0.0: Beta Release
// ------------------------------ Dev Notes -----------------------------
// TODO: Add support for code and other blocks.
// Colors: http://ios7colors.com/
// ------------------------------ SETTINGS ------------------------------
// Quote Body Colors (Entire Quote Block)
var smartQuoteBackgroundColor = "#adb1a1"; // (Default: #adb1a1)
var smartQuoteTextColor = "#111111"; // (Default: #111111)
// Quote Header Colors (Header of Quote Block)
var smartQuoteHeaderTextColor = "#000000"; // (Default: #000000)
var smartQuoteHeaderBackgroundColor = "#b1d8bf"; // (Default: #b1d8bf)
// Notification Text - Username Quoted (Mention text at top of page)
var showsmartQuoteNotification = true; // (Default: true)
var smartQuoteNotificationColor = "#FF3B30"; // (Default: #FF3B30)
// Quote Header Colors - Username Quoted
var smartQuoteHeaderMatchBackgroundColor = "#bc3232"; // (Default: #bc3232)
var smartQuoteHeaderMatchTextColor = "#000000"; // (Default: #000000)
// Debug
var debug = false;
// ------------------------------ ON PAGE LOAD ------------------------------
var username = $("#panel strong a:eq(0)").text();
var usernameCount = 0;
// Blockquotes
if (debug){console.log("Number of Quotes: "+$("*").find("blockquote").length);}
if ($("*").find("blockquote").length > 0){
    // Each Block Quote
    $("*").find("blockquote").each(function() {
        $(this)
            .css("border-radius","5px")
            .css("border","1px solid black")
            .css("padding","1px 4px 1px 4px")
            .css("background-color",smartQuoteBackgroundColor)
            .css("color",smartQuoteTextColor);
    });
    // Each Block Quote Header
    $("*").find("blockquote cite").each(function() {
        // Standard QuoteCite Settings
        $(this)
            .css("border-bottom","1px solid #999")
            .css("padding","2px 8px 2px 8px");
        // Username Quoted
        if ($(this).text().includes(username)){
            usernameCount++;
            if (debug){console.log("Username found.");}
            $(this)
                .css("background-color",smartQuoteHeaderMatchBackgroundColor)
                .css("color",smartQuoteHeaderMatchTextColor);
        }
        // No username match
        else{
            $(this)
                .css("background-color",smartQuoteHeaderBackgroundColor)
                .css("color",smartQuoteHeaderTextColor);
        }
    });
}
if (showsmartQuoteNotification){
    var mentionString = ") Mention";
    var thead = $("strong:contains(Thread Options)").parent().parent().parent();
    // Strong that contains thread title
    if (usernameCount < 1)
        $(thead.find("strong:contains("+thead.find("div strong").text().replace("Thread Options","")+")")).after($("<a>").text(" No Mentions").attr("id","smartQuoteMentions"));
    else{
        if (usernameCount > 1)
            mentionString+= "s";
        $(thead.find("strong:contains("+thead.find("div strong").text().replace("Thread Options","")+")")).after($("<a>").text(" ("+usernameCount+mentionString).attr("id","smartQuoteMentions"));
    }
    $("#smartQuoteMentions").css("color",smartQuoteNotificationColor);
}
if($(".quick_keys").find($("a[title='Thread Closed']")).length > 0){
    // Append quote buttons
    $(".quick_keys").find($("a[title='Report this post to a moderator']")).each(function( index ) {
        $(this).before($("<a>").addClass("bitButton closedQuote").text("Quote").css("margin","5px").attr("id","closedQuote"+index));
    });
    // Quote event listeners
    $( ".closedQuote" ).click(function() {
        var postBlock = $(this).parent().parent().parent().parent();
        //console.log(postBlock);
        // Post Link
        var postLink = postBlock.find("strong a").attr("href").split("&pid=");
        if(postLink[1].includes("#pid")){ postLink[1] = postLink[1].substring(0,postLink[1].indexOf("#pid")); }
        console.log("Post ID: "+postLink[1]);
        // Username
        var postUsername = postBlock.children().next().children().eq(0).find(".post_author").find("strong span a span").text();
        //console.log("Username: "+postUsername);
        // Post Content
        var postContent = $("#pid_"+postLink[1]).text();
        var postContentHTML = $("#pid_"+postLink[1]).html();
        var parsedPostHTML = $('<div/>').append(postContentHTML);
        //console.log(parsedPostHTML);
        // Spoilers
        if(parsedPostHTML.find(".spoiler_header").length > 0){
            $(parsedPostHTML).find(".spoiler_header").each(function( index ) {
                var spoilerHead = $(this).text().replace(" (Click to View)","");
                var spoilerBody = $(parsedPostHTML).find(".spoiler_body:eq("+index+")").text();
                postContent = postContent.replace($(this).text(),"[sp="+spoilerHead+"]"+spoilerBody+"[/sp]");
            });
        }
        // Hyperlinks
        if(parsedPostHTML.find("a").length > 0){
            $(parsedPostHTML).find("a").each(function( index ) {
                // Exclude spoilers
                if(!$(this).text().includes("(Click to View)")){
                    // Add hyperlink to text
                    postContent = postContent.replace($(this).text(),"[url="+$(this).attr("href")+"]"+$(this).text()+"[/url]");
                }
            });
        }
        postContent = "[quote='"+postUsername+"' pid='"+postLink[1]+"']"+postContent+"[/quote]";
        //console.log("new content: "+postContent);
        prompt(postUsername+"'s Quote: ",postContent);
    });
}
// ------------------------------ Functions ------------------------------
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};