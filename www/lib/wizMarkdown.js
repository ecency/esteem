// 
//! MarkdownDeep - http://www.toptensoftware.com/markdowndeep
//! Copyright (C) 2010-2011 Topten Software
// 
//   Licensed under the Apache License, Version 2.0 (the "License"); you may not use this product except in 
//   compliance with the License. You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software distributed under the License is 
//   distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
//   See the License for the specific language governing permissions and limitations under the License.
//


/////////////////////////////////////////////////////////////////////////////
// Markdown

var MarkdownDeep = new function () {


    function array_indexOf(array, obj) {
        if (array.indexOf !== undefined)
            return array.indexOf(obj);

        for (var i = 0; i < array.length; i++) {
            if (array[i] === obj)
                return i;
        }

        return -1;
    };

    // private:p.
    // private:.m_*

    function Markdown() {
        this.m_SpanFormatter = new SpanFormatter(this);
        this.m_SpareBlocks = [];
        this.m_StringBuilder = new StringBuilder();
        this.m_StringBuilderFinal = new StringBuilder();
    }

    Markdown.prototype =
    {
        SafeMode: false,
        ExtraMode: false,
        MarkdownInHtml: false,
        AutoHeadingIDs: false,
        UrlBaseLocation: null,
        UrlRootLocation: null,
        NewWindowForExternalLinks: false,
        NewWindowForLocalLinks: false,
        NoFollowLinks: false,
        HtmlClassFootnotes: "footnotes",
        HtmlClassTitledImages: null,
        RenderingTitledImage: false,
        FormatCodeBlockAttributes: null,
        FormatCodeBlock: null,
        ExtractHeadBlocks: false,
        HeadBlockContent: ""
    };

    var p = Markdown.prototype;

    function splice_array(dest, position, del, ins) {
        return dest.slice(0, position).concat(ins).concat(dest.slice(position + del));
    }

    Markdown.prototype.GetListItems = function (input, offset) {
        // Parse content into blocks
        var blocks = this.ProcessBlocks(input);


        // Find the block        
        var i;
        for (i = 0; i < blocks.length; i++) {
            var b = blocks[i];

            if ((b.blockType == BlockType_Composite || b.blockType == BlockType_html || b.blockType == BlockType_HtmlTag) && b.children) {
                blocks = splice_array(blocks, i, 1, b.children);
                i--;
                continue;
            }

            if (offset < b.lineStart) {
                break;
            }
        }

        i--;

        // Quit if at top
        if (i < 0)
            return null;

        // Get the block before
        var block = blocks[i];

        // Check if it's a list
        if (block.blockType != BlockType_ul && block.blockType != BlockType_ol)
            return null;

        // Build list of line offsets
        var list = [];
        var items = block.children;
        for (var j = 0; j < items.length; j++) {
            list.push(items[j].lineStart);
        }

        // Also push the line offset of the following block
        i++;
        if (i < blocks.length) {
            list.push(blocks[i].lineStart);
        }
        else {
            list.push(input.length);
        }

        return list;
    }

    // Main entry point    
    Markdown.prototype.Transform = function (input) {
        // Normalize line ends
        var rpos = input.indexOf("\r");
        if (rpos >= 0) {
            var npos = input.indexOf("\n");
            if (npos >= 0) {
                if (npos < rpos) {
                    input = input.replace(/\n\r/g, "\n");
                }
                else {
                    input = input.replace(/\r\n/g, "\n");
                }
            }

            input = input.replace(/\r/g, "\n");
        }

        this.HeadBlockContent = "";

        var blocks = this.ProcessBlocks(input);

        // Sort abbreviations by length, longest to shortest
        if (this.m_Abbreviations != null) {
            var list = [];
            for (var a in this.m_Abbreviations) {
                list.push(this.m_Abbreviations[a]);
            }
            list.sort(
		        function (a, b) {
		            return b.Abbr.length - a.Abbr.length;
		        }
            );
            this.m_Abbreviations = list;
        }

        // Render
        var sb = this.m_StringBuilderFinal;
        sb.Clear();
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            b.Render(this, sb);
        }

        // Render footnotes
        if (this.m_UsedFootnotes.length > 0) {

            sb.Append("\n<div class=\"");
            sb.Append(this.HtmlClassFootnotes);
            sb.Append("\">\n");
            sb.Append("<hr />\n");
            sb.Append("<ol>\n");
            for (var i = 0; i < this.m_UsedFootnotes.length; i++) {
                var fn = this.m_UsedFootnotes[i];

                sb.Append("<li id=\"#fn:");
                sb.Append(fn.data); // footnote id
                sb.Append("\">\n");


                // We need to get the return link appended to the last paragraph
                // in the footnote
                var strReturnLink = "<a href=\"#fnref:" + fn.data + "\" rev=\"footnote\">&#8617;</a>";

                // Get the last child of the footnote
                var child = fn.children[fn.children.length - 1];
                if (child.blockType == BlockType_p) {
                    child.blockType = BlockType_p_footnote;
                    child.data = strReturnLink;
                }
                else {
                    child = new Block();
                    child.contentLen = 0;
                    child.blockType = BlockType_p_footnote;
                    child.data = strReturnLink;
                    fn.children.push(child);
                }


                fn.Render(this, sb);

                sb.Append("</li>\n");
            }
            sb.Append("</ol\n");
            sb.Append("</div>\n");
        }


        // Done
        return sb.ToString();
    }

    Markdown.prototype.OnQualifyUrl = function (url) {
        // Is the url already fully qualified?
        if (IsUrlFullyQualified(url))
            return url;

        if (starts_with(url, "/")) {
            var rootLocation = this.UrlRootLocation;
            if (!rootLocation) {
                // Quit if we don't have a base location
                if (!this.UrlBaseLocation)
                    return url;

                // Need to find domain root
                var pos = this.UrlBaseLocation.indexOf("://");
                if (pos == -1)
                    pos = 0;
                else
                    pos += 3;

                // Find the first slash after the protocol separator
                pos = this.UrlBaseLocation.indexOf('/', pos);

                // Get the domain name
                rootLocation = pos < 0 ? this.UrlBaseLocation : this.UrlBaseLocation.substr(0, pos);
            }

            // Join em
            return rootLocation + url;
        }
        else {
            // Quit if we don't have a base location
            if (!this.UrlBaseLocation)
                return url;

            if (!ends_with(this.UrlBaseLocation, "/"))
                return this.UrlBaseLocation + "/" + url;
            else
                return this.UrlBaseLocation + url;
        }
    }


    // Override and return an object with width and height properties
    Markdown.prototype.OnGetImageSize = function (image, TitledImage) {
        return null;
    }

    Markdown.prototype.OnPrepareLink = function (tag) {
        var url = tag.attributes["href"];

        // No follow?
        if (this.NoFollowLinks) {
            tag.attributes["rel"] = "nofollow";
        }

        // New window?
        if ((this.NewWindowForExternalLinks && IsUrlFullyQualified(url)) ||
			 (this.NewWindowForLocalLinks && !IsUrlFullyQualified(url))) {
            tag.attributes["target"] = "_blank";
        }

        // Qualify url
        tag.attributes["href"] = this.OnQualifyUrl(url);
    }

    Markdown.prototype.OnPrepareImage = function (tag, TitledImage) {
        // Try to determine width and height
        var size = this.OnGetImageSize(tag.attributes["src"], TitledImage);
        if (size != null) {
            tag.attributes["width"] = size.width;
            tag.attributes["height"] = size.height;
        }

        // Now qualify the url
        tag.attributes["src"] = this.OnQualifyUrl(tag.attributes["src"]);
    }

    // Get a link definition
    Markdown.prototype.GetLinkDefinition = function (id) {
        var x = this.m_LinkDefinitions[id];
        if (x == undefined)
            return null;
        else
            return x;
    }



    p.ProcessBlocks = function (str) {
        // Reset the list of link definitions
        this.m_LinkDefinitions = [];
        this.m_Footnotes = [];
        this.m_UsedFootnotes = [];
        this.m_UsedHeaderIDs = [];
        this.m_Abbreviations = null;

        // Process blocks
        return new BlockProcessor(this, this.MarkdownInHtml).Process(str);
    }

    // Add a link definition
    p.AddLinkDefinition = function (link) {
        this.m_LinkDefinitions[link.id] = link;
    }

    p.AddFootnote = function (footnote) {
        this.m_Footnotes[footnote.data] = footnote;
    }

    // Look up a footnote, claim it and return it's index (or -1 if not found)
    p.ClaimFootnote = function (id) {
        var footnote = this.m_Footnotes[id];
        if (footnote != undefined) {
            // Move the foot note to the used footnote list
            this.m_UsedFootnotes.push(footnote);
            delete this.m_Footnotes[id];

            // Return it's display index
            return this.m_UsedFootnotes.length - 1;
        }
        else
            return -1;
    }

    p.AddAbbreviation = function (abbr, title) {
        if (this.m_Abbreviations == null) {
            this.m_Abbreviations = [];
        }

        // Store abbreviation
        this.m_Abbreviations[abbr] = { Abbr: abbr, Title: title };
    }

    p.GetAbbreviations = function () {
        return this.m_Abbreviations;
    }




    // private
    p.MakeUniqueHeaderID = function (strHeaderText, startOffset, length) {
        if (!this.AutoHeadingIDs)
            return null;

        // Extract a pandoc style cleaned header id from the header text
        var strBase = this.m_SpanFormatter.MakeID(strHeaderText, startOffset, length);

        // If nothing left, use "section"
        if (!strBase)
            strBase = "section";

        // Make sure it's unique by append -n counter
        var strWithSuffix = strBase;
        var counter = 1;
        while (this.m_UsedHeaderIDs[strWithSuffix] != undefined) {
            strWithSuffix = strBase + "-" + counter.toString();
            counter++;
        }

        // Store it
        this.m_UsedHeaderIDs[strWithSuffix] = true;

        // Return it
        return strWithSuffix;
    }


    // private
    p.GetStringBuilder = function () {
        this.m_StringBuilder.Clear();
        return this.m_StringBuilder;
    }

    /////////////////////////////////////////////////////////////////////////////
    // CharTypes

    function is_digit(ch) {
        return ch >= '0' && ch <= '9';
    }
    function is_hex(ch) {
        return (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F');
    }
    function is_alpha(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }
    function is_alphadigit(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9');
    }
    function is_whitespace(ch) {
        return (ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n');
    }
    function is_linespace(ch) {
        return (ch == ' ' || ch == '\t');
    }
    function is_lineend(ch) {
        return (ch == '\r' || ch == '\n');
    }
    function is_emphasis(ch) {
        return (ch == '*' || ch == '_');
    }
    function is_escapable(ch, ExtraMode) {
        switch (ch) {
            case '\\':
            case '`':
            case '*':
            case '_':
            case '{':
            case '}':
            case '[':
            case ']':
            case '(':
            case ')':
            case '>':
            case '#':
            case '+':
            case '-':
            case '.':
            case '!':
                return true;

            case ':':
            case '|':
            case '=':
            case '<':
                return ExtraMode;
        }

        return false;
    }


    // Utility functions

    // Check if str[pos] looks like a html entity
    // Returns -1 if not, or offset of character after it yes.
    function SkipHtmlEntity(str, pos) {
        if (str.charAt(pos) != '&')
            return -1;

        var save = pos;
        pos++;

        var fn_test;
        if (str.charAt(pos) == '#') {
            pos++;
            if (str.charAt(pos) == 'x' || str.charAt(pos) == 'X') {
                pos++;
                fn_test = is_hex;
            }
            else {
                fn_test = is_digit;
            }
        }
        else {
            fn_test = is_alphadigit;
        }

        if (fn_test(str.charAt(pos))) {
            pos++;
            while (fn_test(str.charAt(pos)))
                pos++;

            if (str.charAt(pos) == ';') {
                pos++;
                return pos;
            }
        }

        pos = save;
        return -1;
    }

    function UnescapeString(str, ExtraMode) {
        // Find first backslash
        var bspos = str.indexOf('\\');
        if (bspos < 0)
            return str;

        // Build new string with escapable backslashes removed
        var b = new StringBuilder();
        var piece = 0;
        while (bspos >= 0) {
            if (is_escapable(str.charAt(bspos + 1), ExtraMode)) {
                if (bspos > piece)
                    b.Append(str.substr(piece, bspos - piece));

                piece = bspos + 1;
            }

            bspos = str.indexOf('\\', bspos + 1);
        }

        if (piece < str.length)
            b.Append(str.substr(piece, str.length - piece));

        return b.ToString();
    }

    function Trim(str) {
        var i = 0;
        var l = str.length;

        while (i < l && is_whitespace(str.charAt(i)))
            i++;
        while (l - 1 > i && is_whitespace(str.charAt(l - 1)))
            l--;

        return str.substr(i, l - i);
    }


    /*
    * These two functions IsEmailAddress and IsWebAddress
    * are intended as a quick and dirty way to tell if a 
    * <autolink> url is email, web address or neither.
    * 
    * They are not intended as validating checks.
    * 
    * (use of Regex for more correct test unnecessarily
    *  slowed down some test documents by up to 300%.)
    */

    // Check if a string looks like an email address
    function IsEmailAddress(str) {
        var posAt = str.indexOf('@');
        if (posAt < 0)
            return false;

        var posLastDot = str.lastIndexOf('.');
        if (posLastDot < posAt)
            return false;

        return true;
    }

    // Check if a string looks like a url
    function IsWebAddress(str) {
        str = str.toLowerCase();
        if (str.substr(0, 7) == "http://")
            return true;
        if (str.substr(0, 8) == "https://")
            return true;
        if (str.substr(0, 6) == "ftp://")
            return true;
        if (str.substr(0, 7) == "file://")
            return true;

        return false;
    }


    // Check if a string is a valid HTML ID identifier
    function IsValidHtmlID(str) {
        if (!str)
            return false;

        // Must start with a letter
        if (!is_alpha(str.charAt(0)))
            return false;

        // Check the rest
        for (var i = 0; i < str.length; i++) {
            var ch = str.charAt(i);
            if (is_alphadigit(ch) || ch == '_' || ch == '-' || ch == ':' || ch == '.')
                continue;

            return false;
        }

        // OK
        return true;
    }

    // Strip the trailing HTML ID from a header string
    // ie:      ## header text ##			{#<idhere>}
    //			^start           ^out end              ^end
    //
    // Returns null if no header id
    function StripHtmlID(str, start, end) {
        // Skip trailing whitespace
        var pos = end - 1;
        while (pos >= start && is_whitespace(str.charAt(pos))) {
            pos--;
        }

        // Skip closing '{'
        if (pos < start || str.charAt(pos) != '}')
            return null;

        var endId = pos;
        pos--;

        // Find the opening '{'
        while (pos >= start && str.charAt(pos) != '{')
            pos--;

        // Check for the #
        if (pos < start || str.charAt(pos + 1) != '#')
            return null;

        // Extract and check the ID
        var startId = pos + 2;
        var strID = str.substr(startId, endId - startId);
        if (!IsValidHtmlID(strID))
            return null;

        // Skip any preceeding whitespace
        while (pos > start && is_whitespace(str.charAt(pos - 1)))
            pos--;

        // Done!
        return { id: strID, end: pos };
    }

    function starts_with(str, match) {
        return str.substr(0, match.length) == match;
    }

    function ends_with(str, match) {
        return str.substr(-match.length) == match;
    }

    function IsUrlFullyQualified(url) {
        return url.indexOf("://") >= 0 || starts_with(url, "mailto:");
    }


    /////////////////////////////////////////////////////////////////////////////
    // StringBuilder

    function StringBuilder() {
        this.m_content = [];
    }

    p = StringBuilder.prototype;

    p.Append = function (value) {
        if (value)
            this.m_content.push(value);
    }
    p.Clear = function () {
        this.m_content.length = 0;
    }
    p.ToString = function () {
        return this.m_content.join("");
    }

    p.HtmlRandomize = function (url) {
        // Randomize
        var len = url.length;
        for (var i = 0; i < len; i++) {
            var x = Math.random();
            if (x > 0.90 && url.charAt(i) != '@') {
                this.Append(url.charAt(i));
            }
            else if (x > 0.45) {
                this.Append("&#");
                this.Append(url.charCodeAt(i).toString());
                this.Append(";");
            }
            else {
                this.Append("&#x");
                this.Append(url.charCodeAt(i).toString(16));
                this.Append(";");
            }
        }
    }

    p.HtmlEncode = function (str, startOffset, length) {
        var end = startOffset + length;
        var piece = startOffset;
        var i;
        for (i = startOffset; i < end; i++) {
            switch (str.charAt(i)) {
                case '&':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&amp;");
                    piece = i + 1;
                    break;

                case '<':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&lt;");
                    piece = i + 1;
                    break;

                case '>':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&gt;");
                    piece = i + 1;
                    break;

                case '\"':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&quot;");
                    piece = i + 1;
                    break;
            }
        }

        if (i > piece)
            this.Append(str.substr(piece, i - piece));
    }

    p.SmartHtmlEncodeAmpsAndAngles = function (str, startOffset, length) {
        var end = startOffset + length;
        var piece = startOffset;
        var i;
        for (i = startOffset; i < end; i++) {
            switch (str.charAt(i)) {
                case '&':
                    var after = SkipHtmlEntity(str, i);
                    if (after < 0) {
                        if (i > piece) {
                            this.Append(str.substr(piece, i - piece));
                        }
                        this.Append("&amp;");
                        piece = i + 1;
                    }
                    else {
                        i = after - 1;
                    }
                    break;

                case '<':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&lt;");
                    piece = i + 1;
                    break;

                case '>':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&gt;");
                    piece = i + 1;
                    break;

                case '\"':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&quot;");
                    piece = i + 1;
                    break;
            }
        }

        if (i > piece)
            this.Append(str.substr(piece, i - piece));
    }

    p.SmartHtmlEncodeAmps = function (str, startOffset, length) {
        var end = startOffset + length;
        var piece = startOffset;
        var i;
        for (i = startOffset; i < end; i++) {
            switch (str.charAt(i)) {
                case '&':
                    var after = SkipHtmlEntity(str, i);
                    if (after < 0) {
                        if (i > piece) {
                            this.Append(str.substr(piece, i - piece));
                        }
                        this.Append("&amp;");
                        piece = i + 1;
                    }
                    else {
                        i = after - 1;
                    }
                    break;
            }
        }

        if (i > piece)
            this.Append(str.substr(piece, i - piece));
    }


    p.HtmlEncodeAndConvertTabsToSpaces = function (str, startOffset, length) {
        var end = startOffset + length;
        var piece = startOffset;
        var pos = 0;
        var i;
        for (i = startOffset; i < end; i++) {
            switch (str.charAt(i)) {
                case '\t':

                    if (i > piece) {
                        this.Append(str.substr(piece, i - piece));
                    }
                    piece = i + 1;

                    this.Append(' ');
                    pos++;
                    while ((pos % 4) != 0) {
                        this.Append(' ');
                        pos++;
                    }
                    pos--; 	// Compensate for the pos++ below
                    break;

                case '\r':
                case '\n':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append('\n');
                    piece = i + 1;
                    continue;

                case '&':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&amp;");
                    piece = i + 1;
                    break;

                case '<':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&lt;");
                    piece = i + 1;
                    break;

                case '>':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&gt;");
                    piece = i + 1;
                    break;

                case '\"':
                    if (i > piece)
                        this.Append(str.substr(piece, i - piece));
                    this.Append("&quot;");
                    piece = i + 1;
                    break;
            }

            pos++;
        }

        if (i > piece)
            this.Append(str.substr(piece, i - piece));
    }




    /////////////////////////////////////////////////////////////////////////////
    // StringScanner

    function StringScanner() {
        this.reset.apply(this, arguments);
    }

    p = StringScanner.prototype;
    p.bof = function () {
        return this.m_position == this.start;
    }

    p.eof = function () {
        return this.m_position >= this.end;
    }

    p.eol = function () {
        if (this.m_position >= this.end)
            return true;
        var ch = this.buf.charAt(this.m_position);
        return ch == '\r' || ch == '\n' || ch == undefined || ch == '';
    }

    p.reset = function (/*string, position, length*/) {
        this.buf = arguments.length > 0 ? arguments[0] : null;
        this.start = arguments.length > 1 ? arguments[1] : 0;
        this.end = arguments.length > 2 ? this.start + arguments[2] : (this.buf == null ? 0 : this.buf.length);
        this.m_position = this.start;
        this.charset_offsets = {};
    }

    p.current = function () {
        if (this.m_position >= this.end)
            return "\0";
        return this.buf.charAt(this.m_position);
    }

    p.remainder = function () {
        return this.buf.substr(this.m_position);
    }

    p.SkipToEof = function () {
        this.m_position = this.end;
    }

    p.SkipForward = function (count) {
        this.m_position += count;
    }

    p.SkipToEol = function () {
        this.m_position = this.buf.indexOf('\n', this.m_position);
        if (this.m_position < 0)
            this.m_position = this.end;
    }

    p.SkipEol = function () {
        var save = this.m_position;
        if (this.buf.charAt(this.m_position) == '\r')
            this.m_position++;
        if (this.buf.charAt(this.m_position) == '\n')
            this.m_position++;
        return this.m_position != save;
    }

    p.SkipToNextLine = function () {
        this.SkipToEol();
        this.SkipEol();
    }

    p.CharAtOffset = function (offset) {
        if (this.m_position + offset >= this.end)
            return "\0";
        return this.buf.charAt(this.m_position + offset);
    }

    p.SkipChar = function (ch) {
        if (this.buf.charAt(this.m_position) == ch) {
            this.m_position++;
            return true;
        }
        return false;
    }
    p.SkipString = function (s) {
        if (this.buf.substr(this.m_position, s.length) == s) {
            this.m_position += s.length;
            return true;
        }
        return false;
    }
    p.SkipWhitespace = function () {
        var save = this.m_position;
        while (true) {
            var ch = this.buf.charAt(this.m_position);
            if (ch != ' ' && ch != '\t' && ch != '\r' && ch != '\n')
                break;
            this.m_position++;
        }
        return this.m_position != save;
    }
    p.SkipLinespace = function () {
        var save = this.m_position;
        while (true) {
            var ch = this.buf.charAt(this.m_position);
            if (ch != ' ' && ch != '\t')
                break;
            this.m_position++;
        }
        return this.m_position != save;
    }
    p.FindRE = function (re) {
        re.lastIndex = this.m_position;
        var result = re.exec(this.buf);
        if (result == null) {
            this.m_position = this.end;
            return false;
        }

        if (result.index + result[0].length > this.end) {
            this.m_position = this.end;
            return false;
        }

        this.m_position = result.index;
        return true;
    }
    p.FindOneOf = function (charset) {
        var next = -1;
        for (var ch in charset) {
            var charset_info = charset[ch];

            // Setup charset_info for this character
            if (charset_info == null) {
                charset_info = {};
                charset_info.m_searched_from = -1;
                charset_info.m_found_at = -1;
                charset[ch] = charset_info;
            }

            // Search again?
            if (charset_info.m_searched_from == -1 ||
                this.m_position < charset_info.m_searched_from ||
                (this.m_position >= charset_info.m_found_at && charset_info.m_found_at != -1)) {
                charset_info.m_searched_from = this.m_position;
                charset_info.m_found_at = this.buf.indexOf(ch, this.m_position);
            }

            // Is this character next?            
            if (next == -1 || charset_info.m_found_at < next) {
                next = charset_info.m_found_at;
            }

        }

        if (next == -1) {
            next = this.end;
            return false;
        }

        p.m_position = next;
        return true;
    }
    p.Find = function (s) {
        this.m_position = this.buf.indexOf(s, this.m_position);
        if (this.m_position < 0) {
            this.m_position = this.end;
            return false;
        }
        return true;
    }
    p.Mark = function () {
        this.mark = this.m_position;
    }
    p.Extract = function () {
        if (this.mark >= this.m_position)
            return "";
        else
            return this.buf.substr(this.mark, this.m_position - this.mark);
    }
    p.SkipIdentifier = function () {
        var ch = this.buf.charAt(this.m_position);
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_') {
            this.m_position++;
            while (true) {
                ch = this.buf.charAt(this.m_position);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_' || (ch >= '0' && ch <= '9'))
                    this.m_position++;
                else
                    return true;
            }
        }
        return false;
    }

    p.SkipFootnoteID = function () {
        var savepos = this.m_position;

        this.SkipLinespace();

        this.Mark();

        while (true) {
            var ch = this.current();
            if (is_alphadigit(ch) || ch == '-' || ch == '_' || ch == ':' || ch == '.' || ch == ' ')
                this.SkipForward(1);
            else
                break;
        }

        if (this.m_position > this.mark) {
            var id = Trim(this.Extract());
            if (id.length > 0) {
                this.SkipLinespace();
                return id;
            }
        }

        this.m_position = savepos;
        return null;
    }

    p.SkipHtmlEntity = function () {
        if (this.buf.charAt(this.m_position) != '&')
            return false;

        var newpos = SkipHtmlEntity(this.buf, this.m_position);
        if (newpos < 0)
            return false;

        this.m_position = newpos;
        return true;
    }

    p.SkipEscapableChar = function (ExtraMode) {
        if (this.buf.charAt(this.m_position) == '\\' && is_escapable(this.buf.charAt(this.m_position + 1), ExtraMode)) {
            this.m_position += 2;
            return true;
        }
        else {
            if (this.m_position < this.end)
                this.m_position++;
            return false;
        }
    }


    /////////////////////////////////////////////////////////////////////////////
    // HtmlTag

    var HtmlTagFlags_Block = 0x0001; 	// Block tag
    var HtmlTagFlags_Inline = 0x0002; 	// Inline tag
    var HtmlTagFlags_NoClosing = 0x0004; 	// No closing tag (eg: <hr> and <!-- -->)
    var HtmlTagFlags_ContentAsSpan = 0x0008;        // When markdown=1 treat content as span, not block


    function HtmlTag(name) {
        this.name = name;
        this.attributes = {};
        this.flags = 0;
        this.closed = false;
        this.closing = false;
    }

    p = HtmlTag.prototype;

    p.attributeCount = function () {
        if (!this.attributes)
            return 0;

        var count = 0;
        for (var x in this.attributes)
            count++;

        return count;
    }

    p.get_Flags = function () {
        if (this.flags == 0) {
            this.flags = tag_flags[this.name.toLowerCase()];
            if (this.flags == undefined) {
                this.flags = HtmlTagFlags_Inline;
            }
        }
        return this.flags;
    }

    p.IsSafe = function () {
        var name_lower = this.name.toLowerCase();

        // Check if tag is in whitelist
        if (!allowed_tags[name_lower])
            return false;

        // Find allowed attributes
        var allowed = allowed_attributes[name_lower];
        if (!allowed) {
            return this.attributeCount() == 0;
        }

        // No attributes?
        if (!this.attributes)
            return true;

        // Check all are allowed
        for (var i in this.attributes) {
            if (!allowed[i.toLowerCase()])
                return false;
        }

        // Check href attribute is ok
        if (this.attributes["href"]) {
            if (!IsSafeUrl(this.attributes["href"]))
                return false;
        }

        if (this.attributes["src"]) {
            if (!IsSafeUrl(this.attributes["src"]))
                return false;
        }

        // Passed all white list checks, allow it
        return true;
    }

    // Render opening tag (eg: <tag attr="value">
    p.RenderOpening = function (dest) {
        dest.Append("<");
        dest.Append(this.name);
        for (var i in this.attributes) {
            dest.Append(" ");
            dest.Append(i);
            dest.Append("=\"");
            dest.Append(this.attributes[i]);
            dest.Append("\"");
        }

        if (this.closed)
            dest.Append(" />");
        else
            dest.Append(">");
    }

    // Render closing tag (eg: </tag>)
    p.RenderClosing = function (dest) {
        dest.Append("</");
        dest.Append(this.name);
        dest.Append(">");
    }



    function IsSafeUrl(url) {
        url = url.toLowerCase();
        return (url.substr(0, 7) == "http://" ||
                url.substr(0, 8) == "https://" ||
                url.substr(0, 6) == "ftp://");
    }

    function ParseHtmlTag(p) {
        // Save position
        var savepos = p.m_position;

        // Parse it
        var ret = ParseHtmlTagHelper(p);
        if (ret != null)
            return ret;

        // Rewind if failed
        p.m_position = savepos;
        return null;
    }

    function ParseHtmlTagHelper(p) {
        // Does it look like a tag?
        if (p.current() != '<')
            return null;

        // Skip '<'
        p.SkipForward(1);

        // Is it a comment?
        if (p.SkipString("!--")) {
            p.Mark();

            if (p.Find("-->")) {
                var t = new HtmlTag("!");
                t.attributes["content"] = p.Extract();
                t.closed = true;
                p.SkipForward(3);
                return t;
            }
        }

        // Is it a closing tag eg: </div>
        var bClosing = p.SkipChar('/');

        // Get the tag name
        p.Mark();
        if (!p.SkipIdentifier())
            return null;

        // Probably a tag, create the HtmlTag object now
        var tag = new HtmlTag(p.Extract());
        tag.closing = bClosing;

        // If it's a closing tag, no attributes
        if (bClosing) {
            if (p.current() != '>')
                return null;

            p.SkipForward(1);
            return tag;
        }


        while (!p.eof()) {
            // Skip whitespace
            p.SkipWhitespace();

            // Check for closed tag eg: <hr />
            if (p.SkipString("/>")) {
                tag.closed = true;
                return tag;
            }

            // End of tag?
            if (p.SkipChar('>')) {
                return tag;
            }

            // attribute name
            p.Mark();
            if (!p.SkipIdentifier())
                return null;
            var attributeName = p.Extract();

            // Skip whitespace
            p.SkipWhitespace();

            // Skip equal sign
            if (!p.SkipChar('='))
                return null;

            // Skip whitespace
            p.SkipWhitespace();

            // Optional quotes
            if (p.SkipChar('\"')) {
                // Scan the value
                p.Mark();
                if (!p.Find('\"'))
                    return null;

                // Store the value
                tag.attributes[attributeName] = p.Extract();

                // Skip closing quote
                p.SkipForward(1);
            }
            else {
                // Scan the value
                p.Mark();
                while (!p.eof() && !is_whitespace(p.current()) && p.current() != '>' && p.current() != '/')
                    p.SkipForward(1);

                if (!p.eof()) {
                    // Store the value
                    tag.attributes[attributeName] = p.Extract();
                }
            }
        }

        return null;
    }


    var allowed_tags = {
        "b": 1, "blockquote": 1, "code": 1, "dd": 1, "dt": 1, "dl": 1, "del": 1, "em": 1,
        "h1": 1, "h2": 1, "h3": 1, "h4": 1, "h5": 1, "h6": 1, "i": 1, "kbd": 1, "li": 1, "ol": 1, "ul": 1,
        "p": 1, "pre": 1, "s": 1, "sub": 1, "sup": 1, "strong": 1, "strike": 1, "img": 1, "a": 1
    };

    var allowed_attributes = {
        "a": { "href": 1, "title": 1 },
        "img": { "src": 1, "width": 1, "height": 1, "alt": 1, "title": 1 }
    };

    var b = HtmlTagFlags_Block;
    var i = HtmlTagFlags_Inline;
    var n = HtmlTagFlags_NoClosing;
    var s = HtmlTagFlags_ContentAsSpan;
    var tag_flags = {
        "p": b | s,
        "div": b,
        "h1": b | s,
        "h2": b | s,
        "h3": b | s,
        "h4": b | s,
        "h5": b | s,
        "h6": b | s,
        "blockquote": b,
        "pre": b,
        "table": b,
        "dl": b,
        "ol": b,
        "ul": b,
        "form": b,
        "fieldset": b,
        "iframe": b,
        "script": b | i,
        "noscript": b | i,
        "math": b | i,
        "ins": b | i,
        "del": b | i,
        "img": b | i,
        "li": s,
        "dd": s,
        "dt": s,
        "td": s,
        "th": s,
        "legend": s,
        "address": s,
        "hr": b | n,
        "!": b | n,
        "head": b
    };
    delete b;
    delete i;
    delete n;



    /////////////////////////////////////////////////////////////////////////////
    // LinkDefinition

    function LinkDefinition(id, url, title) {
        this.id = id;
        this.url = url;
        if (title == undefined)
            this.title = null;
        else
            this.title = title;
    }

    p = LinkDefinition.prototype;
    p.RenderLink = function (m, b, link_text) {
        if (this.url.substr(0, 7).toLowerCase() == "mailto:") {
            b.Append("<a href=\"");
            b.HtmlRandomize(this.url);
            b.Append('\"');
            if (this.title) {
                b.Append(" title=\"");
                b.SmartHtmlEncodeAmpsAndAngles(this.title, 0, this.title.length);
                b.Append('\"');
            }
            b.Append('>');
            b.HtmlRandomize(link_text);
            b.Append("</a>");
        }
        else {
            var tag = new HtmlTag("a");

            // encode url
            var sb = m.GetStringBuilder();
            sb.SmartHtmlEncodeAmpsAndAngles(this.url, 0, this.url.length);
            tag.attributes["href"] = sb.ToString();

            // encode title
            if (this.title) {
                sb.Clear();
                sb.SmartHtmlEncodeAmpsAndAngles(this.title, 0, this.title.length);
                tag.attributes["title"] = sb.ToString();
            }

            // Do user processing
            m.OnPrepareLink(tag);

            // Render the opening tag
            tag.RenderOpening(b);

            b.Append(link_text);   // Link text already escaped by SpanFormatter
            b.Append("</a>");
        }
    }

    p.RenderImg = function (m, b, alt_text) {
        var tag = new HtmlTag("img");

        // encode url
        var sb = m.GetStringBuilder();
        sb.SmartHtmlEncodeAmpsAndAngles(this.url, 0, this.url.length);
        tag.attributes["src"] = sb.ToString();

        // encode alt text
        if (alt_text) {
            sb.Clear();
            sb.SmartHtmlEncodeAmpsAndAngles(alt_text, 0, alt_text.length);
            tag.attributes["alt"] = sb.ToString();
        }

        // encode title
        if (this.title) {
            sb.Clear();
            sb.SmartHtmlEncodeAmpsAndAngles(this.title, 0, this.title.length);
            tag.attributes["title"] = sb.ToString();
        }

        tag.closed = true;

        m.OnPrepareImage(tag, m.RenderingTitledImage);

        tag.RenderOpening(b);

        /*
        b.Append("<img src=\"");
        b.SmartHtmlEncodeAmpsAndAngles(this.url, 0, this.url.length);
        b.Append('\"');
        if (alt_text)
        {
        b.Append(" alt=\"");
        b.SmartHtmlEncodeAmpsAndAngles(alt_text, 0, alt_text.length);
        b.Append('\"');
        }
        if (this.title)
        {
        b.Append(" title=\"");
        b.SmartHtmlEncodeAmpsAndAngles(this.title, 0, this.title.length);
        b.Append('\"');
        }
        b.Append(" />");
        */
    }

    function ParseLinkDefinition(p, ExtraMode) {
        var savepos = p.m_position;
        var l = ParseLinkDefinitionInternal(p, ExtraMode);
        if (l == null)
            p.m_position = savepos;
        return l;
    }

    function ParseLinkDefinitionInternal(p, ExtraMode) {
        // Skip leading white space
        p.SkipWhitespace();

        // Must start with an opening square bracket
        if (!p.SkipChar('['))
            return null;

        // Extract the id
        p.Mark();
        if (!p.Find(']'))
            return null;
        var id = p.Extract();
        if (id.length == 0)
            return null;
        if (!p.SkipString("]:"))
            return null;

        // Parse the url and title
        var link = ParseLinkTarget(p, id, ExtraMode);

        // and trailing whitespace
        p.SkipLinespace();

        // Trailing crap, not a valid link reference...
        if (!p.eol())
            return null;

        return link;
    }

    // Parse just the link target
    // For reference link definition, this is the bit after "[id]: thisbit"
    // For inline link, this is the bit in the parens: [link text](thisbit)
    function ParseLinkTarget(p, id, ExtraMode) {
        // Skip whitespace
        p.SkipWhitespace();

        // End of string?
        if (p.eol())
            return null;

        // Create the link definition
        var r = new LinkDefinition(id);

        // Is the url enclosed in angle brackets
        if (p.SkipChar('<')) {
            // Extract the url
            p.Mark();

            // Find end of the url
            while (p.current() != '>') {
                if (p.eof())
                    return null;
                p.SkipEscapableChar(ExtraMode);
            }

            var url = p.Extract();
            if (!p.SkipChar('>'))
                return null;

            // Unescape it
            r.url = UnescapeString(Trim(url), ExtraMode);

            // Skip whitespace
            p.SkipWhitespace();
        }
        else {
            // Find end of the url
            p.Mark();
            var paren_depth = 1;
            while (!p.eol()) {
                var ch = p.current();
                if (is_whitespace(ch))
                    break;
                if (id == null) {
                    if (ch == '(')
                        paren_depth++;
                    else if (ch == ')') {
                        paren_depth--;
                        if (paren_depth == 0)
                            break;
                    }
                }

                p.SkipEscapableChar(ExtraMode);
            }

            r.url = UnescapeString(Trim(p.Extract()), ExtraMode);
        }

        p.SkipLinespace();

        // End of inline target
        if (p.current() == ')')
            return r;

        var bOnNewLine = p.eol();
        var posLineEnd = p.m_position;
        if (p.eol()) {
            p.SkipEol();
            p.SkipLinespace();
        }

        // Work out what the title is delimited with
        var delim;
        switch (p.current()) {
            case '\'':
            case '\"':
                delim = p.current();
                break;

            case '(':
                delim = ')';
                break;

            default:
                if (bOnNewLine) {
                    p.m_position = posLineEnd;
                    return r;
                }
                else
                    return null;
        }

        // Skip the opening title delimiter
        p.SkipForward(1);

        // Find the end of the title
        p.Mark();
        while (true) {
            if (p.eol())
                return null;

            if (p.current() == delim) {

                if (delim != ')') {
                    var savepos = p.m_position;

                    // Check for embedded quotes in title

                    // Skip the quote and any trailing whitespace
                    p.SkipForward(1);
                    p.SkipLinespace();

                    // Next we expect either the end of the line for a link definition
                    // or the close bracket for an inline link
                    if ((id == null && p.current() != ')') ||
					    (id != null && !p.eol())) {
                        continue;
                    }

                    p.m_position = savepos;
                }

                // End of title
                break;
            }

            p.SkipEscapableChar(ExtraMode);
        }

        // Store the title
        r.title = UnescapeString(p.Extract(), ExtraMode);

        // Skip closing quote
        p.SkipForward(1);

        // Done!
        return r;
    }


    /////////////////////////////////////////////////////////////////////////////
    // LinkInfo

    function LinkInfo(def, link_text) {
        this.def = def;
        this.link_text = link_text;
    }


    /////////////////////////////////////////////////////////////////////////////
    // Token

    var TokenType_Text = 0;
    var TokenType_HtmlTag = 1;
    var TokenType_Html = 2;
    var TokenType_open_em = 3;
    var TokenType_close_em = 4;
    var TokenType_open_strong = 5;
    var TokenType_close_strong = 6;
    var TokenType_code_span = 7;
    var TokenType_br = 8;
    var TokenType_link = 9;
    var TokenType_img = 10;
    var TokenType_opening_mark = 11;
    var TokenType_closing_mark = 12;
    var TokenType_internal_mark = 13;
    var TokenType_footnote = 14;
    var TokenType_abbreviation = 15;

    function Token(type, startOffset, length) {
        this.type = type;
        this.startOffset = startOffset;
        this.length = length;
        this.data = null;
    }

    /////////////////////////////////////////////////////////////////////////////
    // SpanFormatter

    function SpanFormatter(markdown) {
        this.m_Markdown = markdown;
        this.m_Scanner = new StringScanner();
        this.m_SpareTokens = [];
        this.m_DisableLinks = false;
        this.m_Tokens = [];
    }

    p = SpanFormatter.prototype;

    p.FormatParagraph = function (dest, str, start, len) {
        // Parse the string into a list of tokens
        this.Tokenize(str, start, len);

        // Titled image?
        if (this.m_Tokens.length == 1 && this.m_Markdown.HtmlClassTitledImages != null && this.m_Tokens[0].type == TokenType_img) {
            // Grab the link info
            var li = this.m_Tokens[0].data;

            // Render the div opening
            dest.Append("<div class=\"");
            dest.Append(this.m_Markdown.HtmlClassTitledImages);
            dest.Append("\">\n");

            // Render the img
            this.m_Markdown.RenderingTitledImage = true;
            this.Render(dest, str);
            this.m_Markdown.RenderingTitledImage = false;
            dest.Append("\n");

            // Render the title
            if (li.def.title) {
                dest.Append("<p>");
                dest.SmartHtmlEncodeAmpsAndAngles(li.def.title, 0, li.def.title.length);
                dest.Append("</p>\n");
            }

            dest.Append("</div>\n");
        }
        else {
            // Render the paragraph
            dest.Append("<p>");
            this.Render(dest, str);
            dest.Append("</p>\n");
        }

    }

    // Format part of a string into a destination string builder
    p.Format2 = function (dest, str) {
        this.Format(dest, str, 0, str.length);
    }

    // Format part of a string into a destination string builder
    p.Format = function (dest, str, start, len) {
        // Parse the string into a list of tokens
        this.Tokenize(str, start, len);

        // Render all tokens
        this.Render(dest, str);
    }

    // Format a string and return it as a new string
    // (used in formatting the text of links)
    p.FormatDirect = function (str) {
        var dest = new StringBuilder();
        this.Format(dest, str, 0, str.length);
        return dest.ToString();
    }

    p.MakeID = function (str, start, len) {
        // Parse the string into a list of tokens
        this.Tokenize(str, start, len);
        var tokens = this.m_Tokens;

        var sb = new StringBuilder();
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            switch (t.type) {
                case TokenType_Text:
                    sb.Append(str.substr(t.startOffset, t.length));
                    break;

                case TokenType_link:
                    sb.Append(t.data.link_text);
                    break;
            }
            this.FreeToken(t);
        }

        // Now clean it using the same rules as pandoc
        var p = this.m_Scanner;
        p.reset(sb.ToString());

        // Skip everything up to the first letter
        while (!p.eof()) {
            if (is_alpha(p.current()))
                break;
            p.SkipForward(1);
        }

        // Process all characters
        sb.Clear();
        while (!p.eof()) {
            var ch = p.current();
            if (is_alphadigit(ch) || ch == '_' || ch == '-' || ch == '.')
                sb.Append(ch.toLowerCase());
            else if (ch == ' ')
                sb.Append("-");
            else if (is_lineend(ch)) {
                sb.Append("-");
                p.SkipEol();
                continue;
            }

            p.SkipForward(1);
        }

        return sb.ToString();
    }



    // Render a list of tokens to a destination string builder.
    p.Render = function (sb, str) {
        var tokens = this.m_Tokens;
        var len = tokens.length;
        for (var i = 0; i < len; i++) {
            var t = tokens[i];
            switch (t.type) {
                case TokenType_Text:
                    // Append encoded text
                    sb.HtmlEncode(str, t.startOffset, t.length);
                    break;

                case TokenType_HtmlTag:
                    // Append html as is
                    sb.SmartHtmlEncodeAmps(str, t.startOffset, t.length);
                    break;

                case TokenType_Html:
                case TokenType_opening_mark:
                case TokenType_closing_mark:
                case TokenType_internal_mark:
                    // Append html as is
                    sb.Append(str.substr(t.startOffset, t.length));
                    break;

                case TokenType_br:
                    sb.Append("<br />\n");
                    break;

                case TokenType_open_em:
                    sb.Append("<em>");
                    break;

                case TokenType_close_em:
                    sb.Append("</em>");
                    break;

                case TokenType_open_strong:
                    sb.Append("<strong>");
                    break;

                case TokenType_close_strong:
                    sb.Append("</strong>");
                    break;

                case TokenType_code_span:
                    sb.Append("<code>");
                    sb.HtmlEncode(str, t.startOffset, t.length);
                    sb.Append("</code>");
                    break;

                case TokenType_link:
                    var li = t.data;
                    var sf = new SpanFormatter(this.m_Markdown);
                    sf.m_DisableLinks = true;

                    li.def.RenderLink(this.m_Markdown, sb, sf.FormatDirect(li.link_text));
                    break;

                case TokenType_img:
                    var li = t.data;
                    li.def.RenderImg(this.m_Markdown, sb, li.link_text);
                    break;

                case TokenType_footnote:
                    var r = t.data;
                    sb.Append("<sup id=\"fnref:");
                    sb.Append(r.id);
                    sb.Append("\"><a href=\"#fn:");
                    sb.Append(r.id);
                    sb.Append("\" rel=\"footnote\">");
                    sb.Append(r.index + 1);
                    sb.Append("</a></sup>");
                    break;

                case TokenType_abbreviation:
                    var a = t.data;
                    sb.Append("<abbr");
                    if (a.Title) {
                        sb.Append(" title=\"");
                        sb.HtmlEncode(a.Title, 0, a.Title.length);
                        sb.Append("\"");
                    }
                    sb.Append(">");
                    sb.HtmlEncode(a.Abbr, 0, a.Abbr.length);
                    sb.Append("</abbr>");
                    break;


            }

            this.FreeToken(t);
        }
    }

    p.Tokenize = function (str, start, len) {
        // Reset the string scanner
        var p = this.m_Scanner;
        p.reset(str, start, len);

        var tokens = this.m_Tokens;
        tokens.length = 0;

        var emphasis_marks = null;
        var Abbreviations = this.m_Markdown.GetAbbreviations();

        var re = Abbreviations == null ? /[\*\_\`\[\!\<\&\ \\]/g : null;

        var ExtraMode = this.m_Markdown.ExtraMode;

        // Scan string
        var start_text_token = p.m_position;
        while (!p.eof()) {
            if (re != null && !p.FindRE(re))
                break;

            var end_text_token = p.m_position;

            // Work out token
            var token = null;
            switch (p.current()) {
                case '*':
                case '_':

                    // Create emphasis mark
                    token = this.CreateEmphasisMark();

                    if (token != null) {
                        // Store marks in a separate list the we'll resolve later
                        switch (token.type) {
                            case TokenType_internal_mark:
                            case TokenType_opening_mark:
                            case TokenType_closing_mark:
                                if (emphasis_marks == null) {
                                    emphasis_marks = [];
                                }
                                emphasis_marks.push(token);
                                break;
                        }
                    }
                    break;

                case '`':
                    token = this.ProcessCodeSpan();
                    break;

                case '[':
                case '!':
                    // Process link reference
                    var linkpos = p.m_position;
                    token = this.ProcessLinkOrImageOrFootnote();

                    // Rewind if invalid syntax
                    // (the '[' or '!' will be treated as a regular character and processed below)
                    if (token == null)
                        p.m_position = linkpos;
                    break;

                case '<':
                    // Is it a valid html tag?
                    var save = p.m_position;
                    var tag = ParseHtmlTag(p);
                    if (tag != null) {
                        // Yes, create a token for it
                        if (!this.m_Markdown.SafeMode || tag.IsSafe()) {
                            // Yes, create a token for it
                            token = this.CreateToken(TokenType_HtmlTag, save, p.m_position - save);
                        }
                        else {
                            // No, rewrite and encode it
                            p.m_position = save;
                        }
                    }
                    else {
                        // No, rewind and check if it's a valid autolink eg: <google.com>
                        p.m_position = save;
                        token = this.ProcessAutoLink();

                        if (token == null)
                            p.m_position = save;
                    }
                    break;

                case '&':
                    // Is it a valid html entity
                    var save = p.m_position;
                    if (p.SkipHtmlEntity()) {
                        // Yes, create a token for it
                        token = this.CreateToken(TokenType_Html, save, p.m_position - save);
                    }

                    break;

                case ' ':
                    // Check for double space at end of a line
                    if (p.CharAtOffset(1) == ' ' && is_lineend(p.CharAtOffset(2))) {
                        // Yes, skip it
                        p.SkipForward(2);

                        // Don't put br's at the end of a paragraph
                        if (!p.eof()) {
                            p.SkipEol();
                            token = this.CreateToken(TokenType_br, end_text_token, 0);
                        }
                    }
                    break;

                case '\\':
                    // Check followed by an escapable character
                    if (is_escapable(p.CharAtOffset(1), ExtraMode)) {
                        token = this.CreateToken(TokenType_Text, p.m_position + 1, 1);
                        p.SkipForward(2);
                    }
                    break;
            }

            // Look for abbreviations.
            if (token == null && Abbreviations != null && !is_alphadigit(p.CharAtOffset(-1))) {
                var savepos = p.m_position;
                for (var i in Abbreviations) {
                    var abbr = Abbreviations[i];
                    if (p.SkipString(abbr.Abbr) && !is_alphadigit(p.current())) {
                        token = this.CreateDataToken(TokenType_abbreviation, abbr);
                        break;
                    }

                    p.position = savepos;
                }
            }


            // If token found, append any preceeding text and the new token to the token list
            if (token != null) {
                // Create a token for everything up to the special character
                if (end_text_token > start_text_token) {
                    tokens.push(this.CreateToken(TokenType_Text, start_text_token, end_text_token - start_text_token));
                }

                // Add the new token
                tokens.push(token);

                // Remember where the next text token starts
                start_text_token = p.m_position;
            }
            else {
                // Skip a single character and keep looking
                p.SkipForward(1);
            }
        }

        // Append a token for any trailing text after the last token.
        if (p.m_position > start_text_token) {
            tokens.push(this.CreateToken(TokenType_Text, start_text_token, p.m_position - start_text_token));
        }

        // Do we need to resolve and emphasis marks?
        if (emphasis_marks != null) {
            this.ResolveEmphasisMarks(tokens, emphasis_marks);
        }
    }

    /*
    * Resolving emphasis tokens is a two part process
    * 
    * 1. Find all valid sequences of * and _ and create `mark` tokens for them
    *		this is done by CreateEmphasisMarks during the initial character scan
    *		done by Tokenize
    *		
    * 2. Looks at all these emphasis marks and tries to pair them up
    *		to make the actual <em> and <strong> tokens
    *		
    * Any unresolved emphasis marks are rendered unaltered as * or _
    */

    // Create emphasis mark for sequences of '*' and '_' (part 1)
    p.CreateEmphasisMark = function () {
        var p = this.m_Scanner;

        // Capture current state
        var ch = p.current();
        var altch = ch == '*' ? '_' : '*';
        var savepos = p.m_position;

        // Check for a consecutive sequence of just '_' and '*'
        if (p.bof() || is_whitespace(p.CharAtOffset(-1))) {
            while (is_emphasis(p.current()))
                p.SkipForward(1);

            if (p.eof() || is_whitespace(p.current())) {
                return this.CreateToken(TokenType_Html, savepos, p.m_position - savepos);
            }

            // Rewind
            p.m_position = savepos;
        }

        // Scan backwards and see if we have space before
        while (is_emphasis(p.CharAtOffset(-1)))
            p.SkipForward(-1);
        var bSpaceBefore = p.bof() || is_whitespace(p.CharAtOffset(-1));
        p.m_position = savepos;

        // Count how many matching emphasis characters
        while (p.current() == ch) {
            p.SkipForward(1);
        }
        var count = p.m_position - savepos;

        // Scan forwards and see if we have space after
        while (is_emphasis(p.CharAtOffset(1)))
            p.SkipForward(1);
        var bSpaceAfter = p.eof() || is_whitespace(p.current());
        p.m_position = savepos + count;

        if (bSpaceBefore) {
            return this.CreateToken(TokenType_opening_mark, savepos, p.m_position - savepos);
        }

        if (bSpaceAfter) {
            return this.CreateToken(TokenType_closing_mark, savepos, p.m_position - savepos);
        }

        if (this.m_Markdown.ExtraMode && ch == '_')
            return null;


        return this.CreateToken(TokenType_internal_mark, savepos, p.m_position - savepos);
    }

    // Split mark token
    p.SplitMarkToken = function (tokens, marks, token, position) {
        // Create the new rhs token
        var tokenRhs = this.CreateToken(token.type, token.startOffset + position, token.length - position);

        // Adjust down the length of this token
        token.length = position;

        // Insert the new token into each of the parent collections
        marks.splice(array_indexOf(marks, token) + 1, 0, tokenRhs);
        tokens.splice(array_indexOf(tokens, token) + 1, 0, tokenRhs);

        // Return the new token
        return tokenRhs;
    }

    // Resolve emphasis marks (part 2)
    p.ResolveEmphasisMarks = function (tokens, marks) {
        var input = this.m_Scanner.buf;

        var bContinue = true;
        while (bContinue) {
            bContinue = false;
            for (var i = 0; i < marks.length; i++) {
                // Get the next opening or internal mark
                var opening_mark = marks[i];
                if (opening_mark.type != TokenType_opening_mark && opening_mark.type != TokenType_internal_mark)
                    continue;

                // Look for a matching closing mark
                for (var j = i + 1; j < marks.length; j++) {
                    // Get the next closing or internal mark
                    var closing_mark = marks[j];
                    if (closing_mark.type != TokenType_closing_mark && closing_mark.type != TokenType_internal_mark)
                        break;

                    // Ignore if different type (ie: `*` vs `_`)
                    if (input.charAt(opening_mark.startOffset) != input.charAt(closing_mark.startOffset))
                        continue;

                    // strong or em?
                    var style = Math.min(opening_mark.length, closing_mark.length);

                    // Triple or more on both ends?
                    if (style >= 3) {
                        style = (style % 2) == 1 ? 1 : 2;
                    }

                    // Split the opening mark, keeping the RHS
                    if (opening_mark.length > style) {
                        opening_mark = this.SplitMarkToken(tokens, marks, opening_mark, opening_mark.length - style);
                        i--;
                    }

                    // Split the closing mark, keeping the LHS
                    if (closing_mark.length > style) {
                        this.SplitMarkToken(tokens, marks, closing_mark, style);
                    }

                    // Connect them
                    opening_mark.type = style == 1 ? TokenType_open_em : TokenType_open_strong;
                    closing_mark.type = style == 1 ? TokenType_close_em : TokenType_close_strong;

                    // Remove the matched marks
                    marks.splice(array_indexOf(marks, opening_mark), 1);
                    marks.splice(array_indexOf(marks, closing_mark), 1);
                    bContinue = true;

                    break;
                }
            }
        }
    }

    // Process auto links eg: <google.com>
    p.ProcessAutoLink = function () {
        if (this.m_DisableLinks)
            return null;

        var p = this.m_Scanner;

        // Skip the angle bracket and remember the start
        p.SkipForward(1);
        p.Mark();

        var ExtraMode = this.m_Markdown.ExtraMode;

        // Allow anything up to the closing angle, watch for escapable characters
        while (!p.eof()) {
            var ch = p.current();

            // No whitespace allowed
            if (is_whitespace(ch))
                break;

            // End found?
            if (ch == '>') {
                var url = UnescapeString(p.Extract(), ExtraMode);

                var li = null;
                if (IsEmailAddress(url)) {
                    var link_text;
                    if (url.toLowerCase().substr(0, 7) == "mailto:") {
                        link_text = url.substr(7);
                    }
                    else {
                        link_text = url;
                        url = "mailto:" + url;
                    }

                    li = new LinkInfo(new LinkDefinition("auto", url, null), link_text);
                }
                else if (IsWebAddress(url)) {
                    li = new LinkInfo(new LinkDefinition("auto", url, null), url);
                }

                if (li != null) {
                    p.SkipForward(1);
                    return this.CreateDataToken(TokenType_link, li);
                }

                return null;
            }

            p.SkipEscapableChar(ExtraMode);
        }

        // Didn't work
        return null;
    }

    // Process [link] and ![image] directives
    p.ProcessLinkOrImageOrFootnote = function () {
        var p = this.m_Scanner;

        // Link or image?
        var token_type = p.SkipChar('!') ? TokenType_img : TokenType_link;

        // Opening '['
        if (!p.SkipChar('['))
            return null;

        // Is it a foonote?
        var savepos = this.m_position;
        if (this.m_Markdown.ExtraMode && token_type == TokenType_link && p.SkipChar('^')) {
            p.SkipLinespace();

            // Parse it
            p.Mark();
            var id = p.SkipFootnoteID();
            if (id != null && p.SkipChar(']')) {
                // Look it up and create footnote reference token
                var footnote_index = this.m_Markdown.ClaimFootnote(id);
                if (footnote_index >= 0) {
                    // Yes it's a footnote
                    return this.CreateDataToken(TokenType_footnote, { index: footnote_index, id: id });
                }
            }

            // Rewind
            this.m_position = savepos;
        }

        if (this.m_DisableLinks)
            return null;

        var ExtraMode = this.m_Markdown.ExtraMode;

        // Find the closing square bracket, allowing for nesting, watching for 
        // escapable characters
        p.Mark();
        var depth = 1;
        while (!p.eof()) {
            var ch = p.current();
            if (ch == '[') {
                depth++;
            }
            else if (ch == ']') {
                depth--;
                if (depth == 0)
                    break;
            }

            p.SkipEscapableChar(ExtraMode);
        }

        // Quit if end
        if (p.eof())
            return null;

        // Get the link text and unescape it
        var link_text = UnescapeString(p.Extract(), ExtraMode);

        // The closing ']'
        p.SkipForward(1);

        // Save position in case we need to rewind
        savepos = p.m_position;

        // Inline links must follow immediately
        if (p.SkipChar('(')) {
            // Extract the url and title
            var link_def = ParseLinkTarget(p, null, this.m_Markdown.ExtraMode);
            if (link_def == null)
                return null;

            // Closing ')'
            p.SkipWhitespace();
            if (!p.SkipChar(')'))
                return null;

            // Create the token
            return this.CreateDataToken(token_type, new LinkInfo(link_def, link_text));
        }

        // Optional space or tab
        if (!p.SkipChar(' '))
            p.SkipChar('\t');

        // If there's line end, we're allow it and as must line space as we want
        // before the link id.
        if (p.eol()) {
            p.SkipEol();
            p.SkipLinespace();
        }

        // Reference link?
        var link_id = null;
        if (p.current() == '[') {
            // Skip the opening '['
            p.SkipForward(1);

            // Find the start/end of the id
            p.Mark();
            if (!p.Find(']'))
                return null;

            // Extract the id
            link_id = p.Extract();

            // Skip closing ']'
            p.SkipForward(1);
        }
        else {
            // Rewind to just after the closing ']'
            p.m_position = savepos;
        }

        // Link id not specified?
        if (!link_id) {
            link_id = link_text;

            // Convert all whitespace+line end to a single space
            while (true) {
                // Find carriage return
                var i = link_id.indexOf("\n");
                if (i < 0)
                    break;

                var start = i;
                while (start > 0 && is_whitespace(link_id.charAt(start - 1)))
                    start--;

                var end = i;
                while (end < link_id.length && is_whitespace(link_id.charAt(end)))
                    end++;

                link_id = link_id.substr(0, start) + " " + link_id.substr(end);
            }
        }

        // Find the link definition, abort if not defined
        var def = this.m_Markdown.GetLinkDefinition(link_id);
        if (def == null)
            return null;

        // Create a token
        return this.CreateDataToken(token_type, new LinkInfo(def, link_text));
    }

    // Process a ``` code span ```
    p.ProcessCodeSpan = function () {
        var p = this.m_Scanner;
        var start = p.m_position;

        // Count leading ticks
        var tickcount = 0;
        while (p.SkipChar('`')) {
            tickcount++;
        }

        // Skip optional leading space...
        p.SkipWhitespace();

        // End?
        if (p.eof())
            return this.CreateToken(TokenType_Text, start, p.m_position - start);

        var startofcode = p.m_position;

        // Find closing ticks
        if (!p.Find(p.buf.substr(start, tickcount)))
            return this.CreateToken(TokenType_Text, start, p.m_position - start);

        // Save end position before backing up over trailing whitespace
        var endpos = p.m_position + tickcount;
        while (is_whitespace(p.CharAtOffset(-1)))
            p.SkipForward(-1);

        // Create the token, move back to the end and we're done
        var ret = this.CreateToken(TokenType_code_span, startofcode, p.m_position - startofcode);
        p.m_position = endpos;
        return ret;
    }

    p.CreateToken = function (type, startOffset, length) {
        if (this.m_SpareTokens.length != 0) {
            var t = this.m_SpareTokens.pop();
            t.type = type;
            t.startOffset = startOffset;
            t.length = length;
            t.data = null;
            return t;
        }
        else
            return new Token(type, startOffset, length);
    }

    // CreateToken - create or re-use a token object
    p.CreateDataToken = function (type, data) {
        if (this.m_SpareTokens.length != 0) {
            var t = this.m_SpareTokens.pop();
            t.type = type;
            t.data = data;
            return t;
        }
        else {
            var t = new Token(type, 0, 0);
            t.data = data;
            return t;
        }
    }

    // FreeToken - return a token to the spare token pool
    p.FreeToken = function (token) {
        token.data = null;
        this.m_SpareTokens.push(token);
    }



    /////////////////////////////////////////////////////////////////////////////
    // Block

    var BlockType_Blank = 0;
    var BlockType_h1 = 1;
    var BlockType_h2 = 2;
    var BlockType_h3 = 3;
    var BlockType_h4 = 4;
    var BlockType_h5 = 5;
    var BlockType_h6 = 6;
    var BlockType_post_h1 = 7;
    var BlockType_post_h2 = 8;
    var BlockType_quote = 9;
    var BlockType_ol_li = 10;
    var BlockType_ul_li = 11;
    var BlockType_p = 12;
    var BlockType_indent = 13;
    var BlockType_hr = 14;
    var BlockType_html = 15;
    var BlockType_unsafe_html = 16;
    var BlockType_span = 17;
    var BlockType_codeblock = 18;
    var BlockType_li = 19;
    var BlockType_ol = 20;
    var BlockType_ul = 21;
    var BlockType_HtmlTag = 22;
    var BlockType_Composite = 23;
    var BlockType_table_spec = 24;
    var BlockType_dd = 25;
    var BlockType_dt = 26;
    var BlockType_dl = 27;
    var BlockType_footnote = 28;
    var BlockType_p_footnote = 29;


    function Block() {
    }


    p = Block.prototype;
    p.buf = null;
    p.blockType = BlockType_Blank;
    p.contentStart = 0;
    p.contentLen = 0;
    p.lineStart = 0;
    p.lineLen = 0;
    p.children = null;
    p.data = null;

    p.get_Content = function () {
        if (this.buf == null)
            return null;
        if (this.contentStart == -1)
            return this.buf;

        return this.buf.substr(this.contentStart, this.contentLen);
    }


    p.get_CodeContent = function () {
        var s = new StringBuilder();
        for (var i = 0; i < this.children.length; i++) {
            s.Append(this.children[i].get_Content());
            s.Append('\n');
        }
        return s.ToString();
    }


    p.RenderChildren = function (m, b) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].Render(m, b);
        }
    }

    p.ResolveHeaderID = function (m) {
        // Already resolved?
        if (this.data != null)
            return this.data;

        // Approach 1 - PHP Markdown Extra style header id
        var res = StripHtmlID(this.buf, this.contentStart, this.get_contentEnd());
        var id = null;
        if (res != null) {
            this.set_contentEnd(res.end);
            id = res.id;
        }
        else {
            // Approach 2 - pandoc style header id
            id = m.MakeUniqueHeaderID(this.buf, this.contentStart, this.contentLen);
        }

        this.data = id;
        return id;
    }

    p.Render = function (m, b) {
        switch (this.blockType) {
            case BlockType_Blank:
                return;

            case BlockType_p:
                m.m_SpanFormatter.FormatParagraph(b, this.buf, this.contentStart, this.contentLen);
                break;

            case BlockType_span:
                m.m_SpanFormatter.Format(b, this.buf, this.contentStart, this.contentLen);
                b.Append("\n");
                break;

            case BlockType_h1:
            case BlockType_h2:
            case BlockType_h3:
            case BlockType_h4:
            case BlockType_h5:
            case BlockType_h6:
                if (m.ExtraMode && !m.SafeMode) {
                    b.Append("<h" + (this.blockType - BlockType_h1 + 1).toString());
                    var id = this.ResolveHeaderID(m);
                    if (id) {
                        b.Append(" id=\"");
                        b.Append(id);
                        b.Append("\">");
                    }
                    else {
                        b.Append(">");
                    }
                }
                else {
                    b.Append("<h" + (this.blockType - BlockType_h1 + 1).toString() + ">");
                }
                m.m_SpanFormatter.Format(b, this.buf, this.contentStart, this.contentLen);
                b.Append("</h" + (this.blockType - BlockType_h1 + 1).toString() + ">\n");
                break;

            case BlockType_hr:
                b.Append("<hr />\n");
                return;

            case BlockType_ol_li:
            case BlockType_ul_li:
                b.Append("<li>");
                m.m_SpanFormatter.Format(b, this.buf, this.contentStart, this.contentLen);
                b.Append("</li>\n");
                break;

            case BlockType_html:
                b.Append(this.buf.substr(this.contentStart, this.contentLen));
                return;

            case BlockType_unsafe_html:
                b.HtmlEncode(this.buf, this.contentStart, this.contentLen);
                return;

            case BlockType_codeblock:
                b.Append("<pre");
                if (m.FormatCodeBlockAttributes != null) {
                    b.Append(m.FormatCodeBlockAttributes(this.data));
                }
                b.Append("><code>");

                var btemp = b;
                if (m.FormatCodeBlock) {
                    btemp = b;
                    b = new StringBuilder();
                }

                for (var i = 0; i < this.children.length; i++) {
                    var line = this.children[i];
                    b.HtmlEncodeAndConvertTabsToSpaces(line.buf, line.contentStart, line.contentLen);
                    b.Append("\n");
                }

                if (m.FormatCodeBlock) {
                    btemp.Append(m.FormatCodeBlock(b.ToString(), this.data));
                    b = btemp;
                }
                b.Append("</code></pre>\n\n");
                return;

            case BlockType_quote:
                b.Append("<blockquote>\n");
                this.RenderChildren(m, b);
                b.Append("</blockquote>\n");
                return;

            case BlockType_li:
                b.Append("<li>\n");
                this.RenderChildren(m, b);
                b.Append("</li>\n");
                return;

            case BlockType_ol:
                b.Append("<ol>\n");
                this.RenderChildren(m, b);
                b.Append("</ol>\n");
                return;

            case BlockType_ul:
                b.Append("<ul>\n");
                this.RenderChildren(m, b);
                b.Append("</ul>\n");
                return;

            case BlockType_HtmlTag:
                var tag = this.data;

                // Prepare special tags
                var name = tag.name.toLowerCase();
                if (name == "a") {
                    m.OnPrepareLink(tag);
                }
                else if (name == "img") {
                    m.OnPrepareImage(tag, m.RenderingTitledImage);
                }

                tag.RenderOpening(b);
                b.Append("\n");
                this.RenderChildren(m, b);
                tag.RenderClosing(b);
                b.Append("\n");
                return;

            case BlockType_Composite:
            case BlockType_footnote:
                this.RenderChildren(m, b);
                return;

            case BlockType_table_spec:
                this.data.Render(m, b);
                return;

            case BlockType_dd:
                b.Append("<dd>");
                if (this.children != null) {
                    b.Append("\n");
                    this.RenderChildren(m, b);
                }
                else
                    m.m_SpanFormatter.Format(b, this.buf, this.contentStart, this.contentLen);
                b.Append("</dd>\n");
                break;

            case BlockType_dt:
                if (this.children == null) {
                    var lines = this.get_Content().split("\n");
                    for (var i = 0; i < lines.length; i++) {
                        var l = lines[i];
                        b.Append("<dt>");
                        m.m_SpanFormatter.Format2(b, Trim(l));
                        b.Append("</dt>\n");
                    }
                }
                else {
                    b.Append("<dt>\n");
                    this.RenderChildren(m, b);
                    b.Append("</dt>\n");
                }
                break;

            case BlockType_dl:
                b.Append("<dl>\n");
                this.RenderChildren(m, b);
                b.Append("</dl>\n");
                return;

            case BlockType_p_footnote:
                b.Append("<p>");
                if (this.contentLen > 0) {
                    m.m_SpanFormatter.Format(b, this.buf, this.contentStart, this.contentLen);
                    b.Append("&nbsp;");
                }
                b.Append(this.data);
                b.Append("</p>\n");
                break;

        }
    }

    p.RevertToPlain = function () {
        this.blockType = BlockType_p;
        this.contentStart = this.lineStart;
        this.contentLen = this.lineLen;
    }

    p.get_contentEnd = function () {
        return this.contentStart + this.contentLen;
    }

    p.set_contentEnd = function (value) {
        this.contentLen = value - this.contentStart;
    }

    // Count the leading spaces on a block
    // Used by list item evaluation to determine indent levels
    // irrespective of indent line type.
    p.get_leadingSpaces = function () {
        var count = 0;
        for (var i = this.lineStart; i < this.lineStart + this.lineLen; i++) {
            if (this.buf.charAt(i) == ' ') {
                count++;
            }
            else {
                break;
            }
        }
        return count;
    }

    p.CopyFrom = function (other) {
        this.blockType = other.blockType;
        this.buf = other.buf;
        this.contentStart = other.contentStart;
        this.contentLen = other.contentLen;
        this.lineStart = other.lineStart;
        this.lineLen = other.lineLen;
        return this;
    }

    /////////////////////////////////////////////////////////////////////////////
    // BlockProcessor


    function BlockProcessor(m, MarkdownInHtml) {
        this.m_Markdown = m;
        this.m_parentType = BlockType_Blank;
        this.m_bMarkdownInHtml = MarkdownInHtml;
    }

    p = BlockProcessor.prototype;

    p.Process = function (str) {
        // Reset string scanner
        var p = new StringScanner(str);

        return this.ScanLines(p);
    }

    p.ProcessRange = function (str, startOffset, len) {
        // Reset string scanner
        var p = new StringScanner(str, startOffset, len);

        return this.ScanLines(p);
    }

    p.StartTable = function (p, spec, lines) {
        // Mustn't have more than 1 preceeding line
        if (lines.length > 1)
            return false;

        // Rewind, parse the header row then fast forward back to current pos
        if (lines.length == 1) {
            var savepos = p.m_position;
            p.m_position = lines[0].lineStart;
            spec.m_Headers = spec.ParseRow(p);
            if (spec.m_Headers == null)
                return false;
            p.m_position = savepos;
            lines.length = 0;
        }

        // Parse all .m_Rows
        while (true) {
            var savepos = p.m_position;

            var row = spec.ParseRow(p);
            if (row != null) {
                spec.m_Rows.push(row);
                continue;
            }

            p.m_position = savepos;
            break;
        }

        return true;
    }



    p.ScanLines = function (p) {
        // The final set of blocks will be collected here
        var blocks = [];

        // The current paragraph/list/codeblock etc will be accumulated here
        // before being collapsed into a block and store in above `blocks` list
        var lines = [];

        // Add all blocks
        var PrevBlockType = -1;
        while (!p.eof()) {
            // Remember if the previous line was blank
            var bPreviousBlank = PrevBlockType == BlockType_Blank;

            // Get the next block
            var b = this.EvaluateLine(p);
            PrevBlockType = b.blockType;

            // For dd blocks, we need to know if it was preceeded by a blank line
            // so store that fact as the block's data.
            if (b.blockType == BlockType_dd) {
                b.data = bPreviousBlank;
            }


            // SetExt header?
            if (b.blockType == BlockType_post_h1 || b.blockType == BlockType_post_h2) {
                if (lines.length > 0) {
                    // Remove the previous line and collapse the current paragraph
                    var prevline = lines.pop();
                    this.CollapseLines(blocks, lines);

                    // If previous line was blank, 
                    if (prevline.blockType != BlockType_Blank) {
                        // Convert the previous line to a heading and add to block list
                        prevline.RevertToPlain();
                        prevline.blockType = b.blockType == BlockType_post_h1 ? BlockType_h1 : BlockType_h2;
                        blocks.push(prevline);
                        continue;
                    }
                }


                // Couldn't apply setext header to a previous line

                if (b.blockType == BlockType_post_h1) {
                    // `===` gets converted to normal paragraph
                    b.RevertToPlain();
                    lines.push(b);
                }
                else {
                    // `---` gets converted to hr
                    if (b.contentLen >= 3) {
                        b.blockType = BlockType_hr;
                        blocks.push(b);
                    }
                    else {
                        b.RevertToPlain();
                        lines.push(b);
                    }
                }

                continue;
            }


            // Work out the current paragraph type
            var currentBlockType = lines.length > 0 ? lines[0].blockType : BlockType_Blank;

            // Starting a table?
            if (b.blockType == BlockType_table_spec) {
                // Get the table spec, save position
                var spec = b.data;
                var savepos = p.m_position;
                if (!this.StartTable(p, spec, lines)) {
                    // Not a table, revert the tablespec row to plain,
                    // fast forward back to where we were up to and continue
                    // on as if nothing happened
                    p.m_position = savepos;
                    b.RevertToPlain();
                }
                else {
                    blocks.push(b);
                    continue;
                }
            }

            // Process this line
            switch (b.blockType) {
                case BlockType_Blank:
                    switch (currentBlockType) {
                        case BlockType_Blank:
                            this.FreeBlock(b);
                            break;

                        case BlockType_p:
                            this.CollapseLines(blocks, lines);
                            this.FreeBlock(b);
                            break;

                        case BlockType_quote:
                        case BlockType_ol_li:
                        case BlockType_ul_li:
                        case BlockType_dd:
                        case BlockType_footnote:
                        case BlockType_indent:
                            lines.push(b);
                            break;
                    }
                    break;

                case BlockType_p:
                    switch (currentBlockType) {
                        case BlockType_Blank:
                        case BlockType_p:
                            lines.push(b);
                            break;

                        case BlockType_quote:
                        case BlockType_ol_li:
                        case BlockType_ul_li:
                        case BlockType_dd:
                        case BlockType_footnote:
                            var prevline = lines[lines.length - 1];
                            if (prevline.blockType == BlockType_Blank) {
                                this.CollapseLines(blocks, lines);
                                lines.push(b);
                            }
                            else {
                                lines.push(b);
                            }
                            break;

                        case BlockType_indent:
                            this.CollapseLines(blocks, lines);
                            lines.push(b);
                            break;
                    }
                    break;

                case BlockType_indent:
                    switch (currentBlockType) {
                        case BlockType_Blank:
                            // Start a code block
                            lines.push(b);
                            break;

                        case BlockType_p:
                        case BlockType_quote:
                            var prevline = lines[lines.length - 1];
                            if (prevline.blockType == BlockType_Blank) {
                                // Start a code block after a paragraph
                                this.CollapseLines(blocks, lines);
                                lines.push(b);
                            }
                            else {
                                // indented line in paragraph, just continue it
                                b.RevertToPlain();
                                lines.push(b);
                            }
                            break;


                        case BlockType_ol_li:
                        case BlockType_ul_li:
                        case BlockType_indent:
                        case BlockType_dd:
                        case BlockType_footnote:
                            lines.push(b);
                            break;
                    }
                    break;

                case BlockType_quote:
                    if (currentBlockType != BlockType_quote) {
                        this.CollapseLines(blocks, lines);
                    }
                    lines.push(b);
                    break;

                case BlockType_ol_li:
                case BlockType_ul_li:
                    switch (currentBlockType) {
                        case BlockType_Blank:
                            lines.push(b);
                            break;

                        case BlockType_p:
                        case BlockType_quote:
                            var prevline = lines[lines.length - 1];
                            if (prevline.blockType == BlockType_Blank || this.m_parentType == BlockType_ol_li || this.m_parentType == BlockType_ul_li || this.m_parentType == BlockType_dd) {
                                // List starting after blank line after paragraph or quote
                                this.CollapseLines(blocks, lines);
                                lines.push(b);
                            }
                            else {
                                // List's can't start in middle of a paragraph
                                b.RevertToPlain();
                                lines.push(b);
                            }
                            break;

                        case BlockType_ol_li:
                        case BlockType_ul_li:
                        case BlockType_dd:
                        case BlockType_footnote:
                            if (b.blockType != currentBlockType) {
                                this.CollapseLines(blocks, lines);
                            }
                            lines.push(b);
                            break;

                        case BlockType_indent:
                            // List after code block
                            this.CollapseLines(blocks, lines);
                            lines.push(b);
                            break;
                    }
                    break;

                case BlockType_dd:
                case BlockType_footnote:
                    switch (currentBlockType) {
                        case BlockType_Blank:
                        case BlockType_p:
                        case BlockType_dd:
                        case BlockType_footnote:
                            this.CollapseLines(blocks, lines);
                            lines.push(b);
                            break;

                        default:
                            b.RevertToPlain();
                            lines.push(b);
                            break;
                    }
                    break;

                default:
                    this.CollapseLines(blocks, lines);
                    blocks.push(b);
                    break;
            }
        }

        this.CollapseLines(blocks, lines);

        if (this.m_Markdown.ExtraMode) {
            this.BuildDefinitionLists(blocks);
        }

        return blocks;
    }

    p.CreateBlock = function (lineStart) {
        var b;
        if (this.m_Markdown.m_SpareBlocks.length > 1) {
            b = this.m_Markdown.m_SpareBlocks.pop();
        }
        else {
            b = new Block();
        }
        b.lineStart = lineStart;
        return b;
    }

    p.FreeBlock = function (b) {
        this.m_Markdown.m_SpareBlocks.push(b);
    }

    p.FreeBlocks = function (blocks) {
        for (var i = 0; i < blocks.length; i++)
            this.m_Markdown.m_SpareBlocks.push(blocks[i]);
        blocks.length = 0;
    }

    p.RenderLines = function (lines) {
        var b = this.m_Markdown.GetStringBuilder();
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            b.Append(l.buf.substr(l.contentStart, l.contentLen));
            b.Append('\n');
        }
        return b.ToString();
    }

    p.CollapseLines = function (blocks, lines) {
        // Remove trailing blank lines
        while (lines.length > 0 && lines[lines.length - 1].blockType == BlockType_Blank) {
            this.FreeBlock(lines.pop());
        }

        // Quit if empty
        if (lines.length == 0) {
            return;
        }


        // What sort of block?
        switch (lines[0].blockType) {
            case BlockType_p:
                // Collapse all lines into a single paragraph
                var para = this.CreateBlock(lines[0].lineStart);
                para.blockType = BlockType_p;
                para.buf = lines[0].buf;
                para.contentStart = lines[0].contentStart;
                para.set_contentEnd(lines[lines.length - 1].get_contentEnd());
                blocks.push(para);
                this.FreeBlocks(lines);
                break;

            case BlockType_quote:
                // Get the content
                var str = this.RenderLines(lines);

                // Create the new block processor
                var bp = new BlockProcessor(this.m_Markdown, this.m_bMarkdownInHtml);
                bp.m_parentType = BlockType_quote;

                // Create a new quote block
                var quote = this.CreateBlock(lines[0].lineStart);
                quote.blockType = BlockType_quote;
                quote.children = bp.Process(str);
                this.FreeBlocks(lines);
                blocks.push(quote);
                break;

            case BlockType_ol_li:
            case BlockType_ul_li:
                blocks.push(this.BuildList(lines));
                break;

            case BlockType_dd:
                if (blocks.length > 0) {
                    var prev = blocks[blocks.length - 1];
                    switch (prev.blockType) {
                        case BlockType_p:
                            prev.blockType = BlockType_dt;
                            break;

                        case BlockType_dd:
                            break;

                        default:
                            var wrapper = this.CreateBlock(prev.lineStart);
                            wrapper.blockType = BlockType_dt;
                            wrapper.children = [];
                            wrapper.children.push(prev);
                            blocks.pop();
                            blocks.push(wrapper);
                            break;
                    }

                }
                blocks.push(this.BuildDefinition(lines));
                break;

            case BlockType_footnote:
                this.m_Markdown.AddFootnote(this.BuildFootnote(lines));
                break;


            case BlockType_indent:
                var codeblock = this.CreateBlock(lines[0].lineStart);
                codeblock.blockType = BlockType_codeblock;
                codeblock.children = [];
                var firstline = lines[0].get_Content();
                if (firstline.substr(0, 2) == "{{" && firstline.substr(firstline.length - 2, 2) == "}}") {
                    codeblock.data = firstline.substr(2, firstline.length - 4);
                    lines.splice(0, 1);
                }
                for (var i = 0; i < lines.length; i++) {
                    codeblock.children.push(lines[i]);
                }
                blocks.push(codeblock);
                lines.length = 0;
                break;
        }
    }

    p.EvaluateLine = function (p) {
        // Create a block
        var b = this.CreateBlock(p.m_position);

        // Store line start
        b.buf = p.buf;

        // Scan the line
        b.contentStart = p.m_position;
        b.contentLen = -1;
        b.blockType = this.EvaluateLineInternal(p, b);


        // If end of line not returned, do it automatically
        if (b.contentLen < 0) {
            // Move to end of line
            p.SkipToEol();
            b.contentLen = p.m_position - b.contentStart;
        }

        // Setup line length
        b.lineLen = p.m_position - b.lineStart;

        // Next line
        p.SkipEol();

        // Create block
        return b;
    }

    p.EvaluateLineInternal = function (p, b) {
        // Empty line?
        if (p.eol())
            return BlockType_Blank;

        // Save start of line position
        var line_start = p.m_position;

        // ## Heading ##		
        var ch = p.current();
        if (ch == '#') {
            // Work out heading level
            var level = 1;
            p.SkipForward(1);
            while (p.current() == '#') {
                level++;
                p.SkipForward(1);
            }

            // Limit of 6
            if (level > 6)
                level = 6;

            // Skip any whitespace
            p.SkipLinespace();

            // Save start position
            b.contentStart = p.m_position;

            // Jump to end
            p.SkipToEol();

            // In extra mode, check for a trailing HTML ID
            if (this.m_Markdown.ExtraMode && !this.m_Markdown.SafeMode) {
                var res = StripHtmlID(p.buf, b.contentStart, p.m_position);
                if (res != null) {
                    b.data = res.id;
                    p.m_position = res.end;
                }
            }

            // Rewind over trailing hashes
            while (p.m_position > b.contentStart && p.CharAtOffset(-1) == '#') {
                p.SkipForward(-1);
            }

            // Rewind over trailing spaces
            while (p.m_position > b.contentStart && is_whitespace(p.CharAtOffset(-1))) {
                p.SkipForward(-1);
            }

            // Create the heading block
            b.contentLen = p.m_position - b.contentStart;

            p.SkipToEol();
            return BlockType_h1 + (level - 1);
        }

        // Check for entire line as - or = for setext h1 and h2
        if (ch == '-' || ch == '=') {
            // Skip all matching characters
            var chType = ch;
            while (p.current() == chType) {
                p.SkipForward(1);
            }

            // Trailing whitespace allowed
            p.SkipLinespace();

            // If not at eol, must have found something other than setext header
            if (p.eol()) {
                return chType == '=' ? BlockType_post_h1 : BlockType_post_h2;
            }

            p.m_position = line_start;
        }

        if (this.m_Markdown.ExtraMode) {
            // MarkdownExtra Table row indicator?
            var spec = TableSpec_Parse(p);
            if (spec != null) {
                b.data = spec;
                return BlockType_table_spec;
            }

            p.m_position = line_start;


            // Fenced code blocks?
            if (ch == '~') {
                if (this.ProcessFencedCodeBlock(p, b))
                    return b.blockType;

                // Rewind
                p.m_position = line_start;
            }
        }

        // Scan the leading whitespace, remembering how many spaces and where the first tab is
        var tabPos = -1;
        var leadingSpaces = 0;
        while (!p.eol()) {
            if (p.current() == ' ') {
                if (tabPos < 0)
                    leadingSpaces++;
            }
            else if (p.current() == '\t') {
                if (tabPos < 0)
                    tabPos = p.m_position;
            }
            else {
                // Something else, get out
                break;
            }
            p.SkipForward(1);
        }

        // Blank line?
        if (p.eol()) {
            b.contentLen = 0;
            return BlockType_Blank;
        }

        // 4 leading spaces?
        if (leadingSpaces >= 4) {
            b.contentStart = line_start + 4;
            return BlockType_indent;
        }

        // Tab in the first 4 characters?
        if (tabPos >= 0 && tabPos - line_start < 4) {
            b.contentStart = tabPos + 1;
            return BlockType_indent;
        }

        // Treat start of line as after leading whitespace
        b.contentStart = p.m_position;

        // Get the next character
        ch = p.current();

        // Html block?
        if (ch == '<') {
            if (this.ScanHtml(p, b))
                return b.blockType;

            // Rewind
            p.m_position = b.contentStart;
        }

        // Block quotes start with '>' and have one space or one tab following
        if (ch == '>') {
            // Block quote followed by space
            if (is_linespace(p.CharAtOffset(1))) {
                // Skip it and create quote block
                p.SkipForward(2);
                b.contentStart = p.m_position;
                return BlockType_quote;
            }

            p.SkipForward(1);
            b.contentStart = p.m_position;
            return BlockType_quote;
        }

        // Horizontal rule - a line consisting of 3 or more '-', '_' or '*' with optional spaces and nothing else
        if (ch == '-' || ch == '_' || ch == '*') {
            var count = 0;
            while (!p.eol()) {
                var chType = p.current();
                if (p.current() == ch) {
                    count++;
                    p.SkipForward(1);
                    continue;
                }

                if (is_linespace(p.current())) {
                    p.SkipForward(1);
                    continue;
                }

                break;
            }

            if (p.eol() && count >= 3) {
                return BlockType_hr;
            }

            // Rewind
            p.m_position = b.contentStart;
        }

        // Abbreviation definition?
        if (this.m_Markdown.ExtraMode && ch == '*' && p.CharAtOffset(1) == '[') {
            p.SkipForward(2);
            p.SkipLinespace();

            p.Mark();
            while (!p.eol() && p.current() != ']') {
                p.SkipForward(1);
            }

            var abbr = Trim(p.Extract());
            if (p.current() == ']' && p.CharAtOffset(1) == ':' && abbr) {
                p.SkipForward(2);
                p.SkipLinespace();

                p.Mark();

                p.SkipToEol();

                var title = p.Extract();

                this.m_Markdown.AddAbbreviation(abbr, title);

                return BlockType_Blank;
            }

            p.m_position = b.contentStart;
        }


        // Unordered list
        if ((ch == '*' || ch == '+' || ch == '-') && is_linespace(p.CharAtOffset(1))) {
            // Skip it
            p.SkipForward(1);
            p.SkipLinespace();
            b.contentStart = p.m_position;
            return BlockType_ul_li;
        }

        // Definition
        if (ch == ':' && this.m_Markdown.ExtraMode && is_linespace(p.CharAtOffset(1))) {
            p.SkipForward(1);
            p.SkipLinespace();
            b.contentStart = p.m_position;
            return BlockType_dd;
        }

        // Ordered list
        if (is_digit(ch)) {
            // Ordered list?  A line starting with one or more digits, followed by a '.' and a space or tab

            // Skip all digits
            p.SkipForward(1);
            while (is_digit(p.current()))
                p.SkipForward(1);

            if (p.SkipChar('.') && p.SkipLinespace()) {
                b.contentStart = p.m_position;
                return BlockType_ol_li;
            }

            p.m_position = b.contentStart;
        }

        // Reference link definition?
        if (ch == '[') {
            // Footnote definition?
            if (this.m_Markdown.ExtraMode && p.CharAtOffset(1) == '^') {
                var savepos = p.m_position;

                p.SkipForward(2);

                var id = p.SkipFootnoteID();
                if (id != null && p.SkipChar(']') && p.SkipChar(':')) {
                    p.SkipLinespace();
                    b.contentStart = p.m_position;
                    b.data = id;
                    return BlockType_footnote;
                }

                p.m_position = savepos;
            }

            // Parse a link definition
            var l = ParseLinkDefinition(p, this.m_Markdown.ExtraMode);
            if (l != null) {
                this.m_Markdown.AddLinkDefinition(l);
                return BlockType_Blank;
            }
        }

        // Nothing special
        return BlockType_p;
    }

    var MarkdownInHtmlMode_NA = 0;
    var MarkdownInHtmlMode_Block = 1;
    var MarkdownInHtmlMode_Span = 2;
    var MarkdownInHtmlMode_Deep = 3;
    var MarkdownInHtmlMode_Off = 4;

    p.GetMarkdownMode = function (tag) {
        // Get the markdown attribute
        var md = tag.attributes["markdown"];
        if (md == undefined) {
            if (this.m_bMarkdownInHtml)
                return MarkdownInHtmlMode_Deep;
            else
                return MarkdownInHtmlMode_NA;
        }

        // Remove it
        delete tag.attributes["markdown"];

        // Parse mode
        if (md == "1")
            return (tag.get_Flags() & HtmlTagFlags_ContentAsSpan) != 0 ? MarkdownInHtmlMode_Span : MarkdownInHtmlMode_Block;

        if (md == "block")
            return MarkdownInHtmlMode_Block;

        if (md == "deep")
            return MarkdownInHtmlMode_Deep;

        if (md == "span")
            return MarkdownInHtmlMode_Span;

        return MarkdownInHtmlMode_Off;
    }

    p.ProcessMarkdownEnabledHtml = function (p, b, openingTag, mode) {
        // Current position is just after the opening tag

        // Scan until we find matching closing tag
        var inner_pos = p.m_position;
        var depth = 1;
        var bHasUnsafeContent = false;
        while (!p.eof()) {
            // Find next angle bracket
            if (!p.Find('<'))
                break;

            // Is it a html tag?
            var tagpos = p.m_position;
            var tag = ParseHtmlTag(p);
            if (tag == null) {
                // Nope, skip it 
                p.SkipForward(1);
                continue;
            }

            // In markdown off mode, we need to check for unsafe tags
            if (this.m_Markdown.SafeMode && mode == MarkdownInHtmlMode_Off && !bHasUnsafeContent) {
                if (!tag.IsSafe())
                    bHasUnsafeContent = true;
            }

            // Ignore self closing tags
            if (tag.closed)
                continue;

            // Same tag?
            if (tag.name == openingTag.name) {
                if (tag.closing) {
                    depth--;
                    if (depth == 0) {
                        // End of tag?
                        p.SkipLinespace();
                        p.SkipEol();

                        b.blockType = BlockType_HtmlTag;
                        b.data = openingTag;
                        b.set_contentEnd(p.m_position);

                        switch (mode) {
                            case MarkdownInHtmlMode_Span:
                                var span = this.CreateBlock(inner_pos);
                                span.buf = p.buf;
                                span.blockType = BlockType_span;
                                span.contentStart = inner_pos;
                                span.contentLen = tagpos - inner_pos;

                                b.children = [];
                                b.children.push(span);
                                break;

                            case MarkdownInHtmlMode_Block:
                            case MarkdownInHtmlMode_Deep:
                                // Scan the internal content
                                var bp = new BlockProcessor(this.m_Markdown, mode == MarkdownInHtmlMode_Deep);
                                b.children = bp.ProcessRange(p.buf, inner_pos, tagpos - inner_pos);
                                break;

                            case MarkdownInHtmlMode_Off:
                                if (bHasUnsafeContent) {
                                    b.blockType = BlockType_unsafe_html;
                                    b.set_contentEnd(p.m_position);
                                }
                                else {
                                    var span = this.CreateBlock(inner_pos);
                                    span.buf = p.buf;
                                    span.blockType = BlockType_html;
                                    span.contentStart = inner_pos;
                                    span.contentLen = tagpos - inner_pos;

                                    b.children = [];
                                    b.children.push(span);
                                }
                                break;
                        }


                        return true;
                    }
                }
                else {
                    depth++;
                }
            }
        }

        // Missing closing tag(s).  
        return false;
    }

    p.ScanHtml = function (p, b) {
        // Remember start of html
        var posStartPiece = p.m_position;

        // Parse a HTML tag
        var openingTag = ParseHtmlTag(p);
        if (openingTag == null)
            return false;

        // Closing tag?
        if (openingTag.closing)
            return false;

        // Safe mode?
        var bHasUnsafeContent = false;
        if (this.m_Markdown.SafeMode && !openingTag.IsSafe())
            bHasUnsafeContent = true;

        var flags = openingTag.get_Flags();

        // Is it a block level tag?
        if ((flags & HtmlTagFlags_Block) == 0)
            return false;

        // Closed tag, hr or comment?
        if ((flags & HtmlTagFlags_NoClosing) != 0 || openingTag.closed) {
            p.SkipLinespace();
            p.SkipEol();
            b.contentLen = p.m_position - b.contentStart;
            b.blockType = bHasUnsafeContent ? BlockType_unsafe_html : BlockType_html;
            return true;
        }

        // Can it also be an inline tag?
        if ((flags & HtmlTagFlags_Inline) != 0) {
            // Yes, opening tag must be on a line by itself
            p.SkipLinespace();
            if (!p.eol())
                return false;
        }

        // Head block extraction?
        var bHeadBlock = this.m_Markdown.ExtractHeadBlocks && openingTag.name.toLowerCase() == "head";
        var headStart = p.m_position;

        // Work out the markdown mode for this element
        if (!bHeadBlock && this.m_Markdown.ExtraMode) {
            var MarkdownMode = this.GetMarkdownMode(openingTag);
            if (MarkdownMode != MarkdownInHtmlMode_NA) {
                return this.ProcessMarkdownEnabledHtml(p, b, openingTag, MarkdownMode);
            }
        }

        var childBlocks = null;

        // Now capture everything up to the closing tag and put it all in a single HTML block
        var depth = 1;

        while (!p.eof()) {
            if (!p.Find('<'))
                break;

            // Save position of current tag
            var posStartCurrentTag = p.m_position;

            var tag = ParseHtmlTag(p);
            if (tag == null) {
                p.SkipForward(1);
                continue;
            }

            // Safe mode checks
            if (this.m_Markdown.SafeMode && !tag.IsSafe())
                bHasUnsafeContent = true;


            // Ignore self closing tags
            if (tag.closed)
                continue;

            // Markdown enabled content?
            if (!bHeadBlock && !tag.closing && this.m_Markdown.ExtraMode && !bHasUnsafeContent) {
                var MarkdownMode = this.GetMarkdownMode(tag);
                if (MarkdownMode != MarkdownInHtmlMode_NA) {
                    var markdownBlock = this.CreateBlock(posStartPiece);
                    if (this.ProcessMarkdownEnabledHtml(p, markdownBlock, tag, MarkdownMode)) {
                        if (childBlocks == null) {
                            childBlocks = [];
                        }

                        // Create a block for everything before the markdown tag
                        if (posStartCurrentTag > posStartPiece) {
                            var htmlBlock = this.CreateBlock(posStartPiece);
                            htmlBlock.buf = p.buf;
                            htmlBlock.blockType = BlockType_html;
                            htmlBlock.contentStart = posStartPiece;
                            htmlBlock.contentLen = posStartCurrentTag - posStartPiece;

                            childBlocks.push(htmlBlock);
                        }

                        // Add the markdown enabled child block
                        childBlocks.push(markdownBlock);

                        // Remember start of the next piece
                        posStartPiece = p.m_position;

                        continue;
                    }
                    else {
                        this.FreeBlock(markdownBlock);
                    }
                }
            }

            // Same tag?
            if (tag.name == openingTag.name && !tag.closed) {
                if (tag.closing) {
                    depth--;
                    if (depth == 0) {
                        // End of tag?
                        p.SkipLinespace();
                        p.SkipEol();

                        // If anything unsafe detected, just encode the whole block
                        if (bHasUnsafeContent) {
                            b.blockType = BlockType_unsafe_html;
                            b.set_contentEnd(p.m_position);
                            return true;
                        }

                        // Did we create any child blocks
                        if (childBlocks != null) {
                            // Create a block for the remainder
                            if (p.m_position > posStartPiece) {
                                var htmlBlock = this.CreateBlock(posStartPiece);
                                htmlBlock.buf = p.buf;
                                htmlBlock.blockType = BlockType_html;
                                htmlBlock.contentStart = posStartPiece;
                                htmlBlock.contentLen = p.m_position - posStartPiece;

                                childBlocks.push(htmlBlock);
                            }

                            // Return a composite block
                            b.blockType = BlockType_Composite;
                            b.set_contentEnd(p.m_position);
                            b.children = childBlocks;
                            return true;
                        }

                        // Extract the head block content
                        if (bHeadBlock) {
                            var content = p.buf.substr(headStart, posStartCurrentTag - headStart);
                            this.m_Markdown.HeadBlockContent = this.m_Markdown.HeadBlockContent + Trim(content) + "\n";
                            b.blockType = BlockType_html;
                            b.contentStart = p.position;
                            b.contentEnd = p.position;
                            b.lineStart = p.position;
                            return true;
                        }

                        // Straight html block
                        b.blockType = BlockType_html;
                        b.contentLen = p.m_position - b.contentStart;
                        return true;
                    }
                }
                else {
                    depth++;
                }
            }
        }

        // Missing closing tag(s).  
        return BlockType_Blank;
    }

    /* 
    * BuildList - build a single <ol> or <ul> list
    */
    p.BuildList = function (lines) {
        // What sort of list are we dealing with
        var listType = lines[0].blockType;

        // Preprocess
        // 1. Collapse all plain lines (ie: handle hardwrapped lines)
        // 2. Promote any unindented lines that have more leading space 
        //    than the original list item to indented, including leading 
        //    special chars
        var leadingSpace = lines[0].get_leadingSpaces();
        for (var i = 1; i < lines.length; i++) {
            // Join plain paragraphs
            if ((lines[i].blockType == BlockType_p) &&
				(lines[i - 1].blockType == BlockType_p || lines[i - 1].blockType == listType)) {
                lines[i - 1].set_contentEnd(lines[i].get_contentEnd());
                this.FreeBlock(lines[i]);
                lines.splice(i, 1);
                i--;
                continue;
            }

            if (lines[i].blockType != BlockType_indent && lines[i].blockType != BlockType_Blank) {
                var thisLeadingSpace = lines[i].get_leadingSpaces();
                if (thisLeadingSpace > leadingSpace) {
                    // Change line to indented, including original leading chars 
                    // (eg: '* ', '>', '1.' etc...)
                    lines[i].blockType = BlockType_indent;
                    var saveend = lines[i].get_contentEnd();
                    lines[i].contentStart = lines[i].lineStart + thisLeadingSpace;
                    lines[i].set_contentEnd(saveend);
                }
            }
        }


        // Create the wrapping list item
        var List = this.CreateBlock(0);
        List.blockType = (listType == BlockType_ul_li ? BlockType_ul : BlockType_ol);
        List.children = [];

        // Process all lines in the range		
        for (var i = 0; i < lines.length; i++) {
            // Find start of item, including leading blanks
            var start_of_li = i;
            while (start_of_li > 0 && lines[start_of_li - 1].blockType == BlockType_Blank)
                start_of_li--;

            // Find end of the item, including trailing blanks
            var end_of_li = i;
            while (end_of_li < lines.length - 1 && lines[end_of_li + 1].blockType != listType)
                end_of_li++;

            // Is this a simple or complex list item?
            if (start_of_li == end_of_li) {
                // It's a simple, single line item item
                List.children.push(this.CreateBlock().CopyFrom(lines[i]));
            }
            else {
                // Build a new string containing all child items
                var bAnyBlanks = false;
                var sb = this.m_Markdown.GetStringBuilder();
                for (var j = start_of_li; j <= end_of_li; j++) {
                    var l = lines[j];
                    sb.Append(l.buf.substr(l.contentStart, l.contentLen));
                    sb.Append('\n');

                    if (lines[j].blockType == BlockType_Blank) {
                        bAnyBlanks = true;
                    }
                }

                // Create the item and process child blocks
                var item = this.CreateBlock();
                item.blockType = BlockType_li;
                item.lineStart = lines[start_of_li].lineStart;
                var bp = new BlockProcessor(this.m_Markdown);
                bp.m_parentType = listType;
                item.children = bp.Process(sb.ToString());

                // If no blank lines, change all contained paragraphs to plain text
                if (!bAnyBlanks) {
                    for (var j = 0; j < item.children.length; j++) {
                        var child = item.children[j];
                        if (child.blockType == BlockType_p) {
                            child.blockType = BlockType_span;
                        }
                    }
                }

                // Add the complex item
                List.children.push(item);
            }

            // Continue processing from end of li
            i = end_of_li;
        }

        List.lineStart = List.children[0].lineStart;

        this.FreeBlocks(lines);
        lines.length = 0;

        // Continue processing after this item
        return List;
    }

    /* 
    * BuildDefinition - build a single <dd> item
    */
    p.BuildDefinition = function (lines) {
        // Collapse all plain lines (ie: handle hardwrapped lines)
        for (var i = 1; i < lines.length; i++) {
            // Join plain paragraphs
            if ((lines[i].blockType == BlockType_p) &&
				(lines[i - 1].blockType == BlockType_p || lines[i - 1].blockType == BlockType_dd)) {
                lines[i - 1].set_contentEnd(lines[i].get_contentEnd());
                this.FreeBlock(lines[i]);
                lines.splice(i, 1);
                i--;
                continue;
            }
        }

        // Single line definition
        var bPreceededByBlank = lines[0].data;
        if (lines.length == 1 && !bPreceededByBlank) {
            var ret = lines[0];
            lines.length = 0;
            return ret;
        }

        // Build a new string containing all child items
        var sb = this.m_Markdown.GetStringBuilder();
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            sb.Append(l.buf.substr(l.contentStart, l.contentLen));
            sb.Append('\n');
        }

        // Create the item and process child blocks
        var item = this.CreateBlock(lines[0].lineStart);
        item.blockType = BlockType_dd;
        var bp = new BlockProcessor(this.m_Markdown);
        bp.m_parentType = BlockType_dd;
        item.children = bp.Process(sb.ToString());

        this.FreeBlocks(lines);
        lines.length = 0;

        // Continue processing after this item
        return item;
    }

    p.BuildDefinitionLists = function (blocks) {
        var currentList = null;
        for (var i = 0; i < blocks.length; i++) {
            switch (blocks[i].blockType) {
                case BlockType_dt:
                case BlockType_dd:
                    if (currentList == null) {
                        currentList = this.CreateBlock(blocks[i].lineStart);
                        currentList.blockType = BlockType_dl;
                        currentList.children = [];
                        blocks.splice(i, 0, currentList);
                        i++;
                    }

                    currentList.children.push(blocks[i]);
                    blocks.splice(i, 1);
                    i--;
                    break;

                default:
                    currentList = null;
                    break;
            }
        }
    }


    p.BuildFootnote = function (lines) {
        // Collapse all plain lines (ie: handle hardwrapped lines)
        for (var i = 1; i < lines.length; i++) {
            // Join plain paragraphs
            if ((lines[i].blockType == BlockType_p) &&
				(lines[i - 1].blockType == BlockType_p || lines[i - 1].blockType == BlockType_footnote)) {
                lines[i - 1].set_contentEnd(lines[i].get_contentEnd());
                this.FreeBlock(lines[i]);
                lines.splice(i, 1);
                i--;
                continue;
            }
        }

        // Build a new string containing all child items
        var sb = this.m_Markdown.GetStringBuilder();
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            sb.Append(l.buf.substr(l.contentStart, l.contentLen));
            sb.Append('\n');
        }

        var bp = new BlockProcessor(this.m_Markdown);
        bp.m_parentType = BlockType_footnote;

        // Create the item and process child blocks
        var item = this.CreateBlock(lines[0].lineStart);
        item.blockType = BlockType_footnote;
        item.data = lines[0].data;
        item.children = bp.Process(sb.ToString());

        this.FreeBlocks(lines);
        lines.length = 0;

        // Continue processing after this item
        return item;
    }


    p.ProcessFencedCodeBlock = function (p, b) {
        var fenceStart = p.m_position;

        // Extract the fence
        p.Mark();
        while (p.current() == '~')
            p.SkipForward(1);
        var strFence = p.Extract();

        // Must be at least 3 long
        if (strFence.length < 3)
            return false;

        // Rest of line must be blank
        p.SkipLinespace();
        if (!p.eol())
            return false;

        // Skip the eol and remember start of code
        p.SkipEol();
        var startCode = p.m_position;

        // Find the end fence
        if (!p.Find(strFence))
            return false;

        // Character before must be a eol char
        if (!is_lineend(p.CharAtOffset(-1)))
            return false;

        var endCode = p.m_position;

        // Skip the fence
        p.SkipForward(strFence.length);

        // Whitespace allowed at end
        p.SkipLinespace();
        if (!p.eol())
            return false;

        // Create the code block
        b.blockType = BlockType_codeblock;
        b.children = [];

        // Remove the trailing line end
        // (Javascript version has already normalized line ends to \n)
        endCode--;

        // Create the child block with the entire content
        var child = this.CreateBlock(fenceStart);
        child.blockType = BlockType_indent;
        child.buf = p.buf;
        child.contentStart = startCode;
        child.contentLen = endCode - startCode;
        b.children.push(child);

        // Done
        return true;
    }


    var ColumnAlignment_NA = 0;
    var ColumnAlignment_Left = 1;
    var ColumnAlignment_Right = 2;
    var ColumnAlignment_Center = 3;

    function TableSpec() {
        this.m_Columns = [];
        this.m_Headers = null;
        this.m_Rows = [];
    }

    p = TableSpec.prototype;

    p.LeadingBar = false;
    p.TrailingBar = false;

    p.ParseRow = function (p) {
        p.SkipLinespace();

        if (p.eol())
            return null; 	// Blank line ends the table

        var bAnyBars = this.LeadingBar;
        if (this.LeadingBar && !p.SkipChar('|')) {
            bAnyBars = true;
            return null;
        }

        // Create the row
        var row = [];

        // Parse all columns except the last

        while (!p.eol()) {
            // Find the next vertical bar
            p.Mark();
            while (!p.eol() && p.current() != '|')
                p.SkipForward(1);

            row.push(Trim(p.Extract()));

            bAnyBars |= p.SkipChar('|');
        }

        // Require at least one bar to continue the table
        if (!bAnyBars)
            return null;

        // Add missing columns
        while (row.length < this.m_Columns.length) {
            row.push("&nbsp;");
        }

        p.SkipEol();
        return row;
    }

    p.RenderRow = function (m, b, row, type) {
        for (var i = 0; i < row.length; i++) {
            b.Append("\t<");
            b.Append(type);

            if (i < this.m_Columns.length) {
                switch (this.m_Columns[i]) {
                    case ColumnAlignment_Left:
                        b.Append(" align=\"left\"");
                        break;
                    case ColumnAlignment_Right:
                        b.Append(" align=\"right\"");
                        break;
                    case ColumnAlignment_Center:
                        b.Append(" align=\"center\"");
                        break;
                }
            }

            b.Append(">");
            m.m_SpanFormatter.Format2(b, row[i]);
            b.Append("</");
            b.Append(type);
            b.Append(">\n");
        }
    }

    p.Render = function (m, b) {
        b.Append("<table>\n");
        if (this.m_Headers != null) {
            b.Append("<thead>\n<tr>\n");
            this.RenderRow(m, b, this.m_Headers, "th");
            b.Append("</tr>\n</thead>\n");
        }

        b.Append("<tbody>\n");
        for (var i = 0; i < this.m_Rows.length; i++) {
            var row = this.m_Rows[i];
            b.Append("<tr>\n");
            this.RenderRow(m, b, row, "td");
            b.Append("</tr>\n");
        }
        b.Append("</tbody>\n");

        b.Append("</table>\n");
    }

    function TableSpec_Parse(p) {
        // Leading line space allowed
        p.SkipLinespace();

        // Quick check for typical case
        if (p.current() != '|' && p.current() != ':' && p.current() != '-')
            return null;

        // Don't create the spec until it at least looks like one
        var spec = null;

        // Leading bar, looks like a table spec
        if (p.SkipChar('|')) {
            spec = new TableSpec();
            spec.LeadingBar = true;
        }


        // Process all columns
        while (true) {
            // Parse column spec
            p.SkipLinespace();

            // Must have something in the spec
            if (p.current() == '|')
                return null;

            var AlignLeft = p.SkipChar(':');
            while (p.current() == '-')
                p.SkipForward(1);
            var AlignRight = p.SkipChar(':');
            p.SkipLinespace();

            // Work out column alignment
            var col = ColumnAlignment_NA;
            if (AlignLeft && AlignRight)
                col = ColumnAlignment_Center;
            else if (AlignLeft)
                col = ColumnAlignment_Left;
            else if (AlignRight)
                col = ColumnAlignment_Right;

            if (p.eol()) {
                // Not a spec?
                if (spec == null)
                    return null;

                // Add the final spec?
                spec.m_Columns.push(col);
                return spec;
            }

            // We expect a vertical bar
            if (!p.SkipChar('|'))
                return null;

            // Create the table spec
            if (spec == null)
                spec = new TableSpec();

            // Add the column
            spec.m_Columns.push(col);

            // Check for trailing vertical bar
            p.SkipLinespace();
            if (p.eol()) {
                spec.TrailingBar = true;
                return spec;
            }

            // Next column
        }
    }

    // Exposed stuff
    this.Markdown = Markdown;
    this.HtmlTag = HtmlTag;
} ();


// 
//! MarkdownDeep - http://www.toptensoftware.com/markdowndeep
//! Copyright (C) 2010-2011 Topten Software
// 
//   Licensed under the Apache License, Version 2.0 (the "License"); you may not use this product except in 
//   compliance with the License. You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software distributed under the License is 
//   distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
//   See the License for the specific language governing permissions and limitations under the License.
//

/*
Usage:

// 1. Create the editor an bind to a text area, output div and an optional source view div
        - text area: the text area that user types to.
        - output div: a div where the transformed html will be displayed
        - source view view: an optional div where a "source" view of the rendered html will be placed
      
    var editor=new MarkdownDeepEditor.Editor(textarea_element, output_div, source_div)
    
// 2. Optionally set options

        editor.disableShortCutKeys=true;    // Disable Ctrl+B, Ctrl+I etc...
        editor.disableAutoIndent=true;      // Disable auto indent on enter key
        editor.disableTabHandling=true;     // Disable tab/shift+tab for indent
    
// 3. Optionally install hooks
    
        editor.onPreTransform=function(editor, markdown) {}
        editor.onPostTransform=function(editor, html) {}
        editor.onPostUpdateDom=function(editor) {}

// 4. Optionally create a toolbar/UI that calls editor.InvokeCommand(cmd) where cmd is one of:        

        - "undo",
        - "redo",
        - "bold",
        - "italic",
        - "heading",
        - "code",
        - "ullist",
        - "ollist",
        - "indent",
        - "outdent",
        - "link",
        - "img",
        - "hr",
        - "h0",
        - "h1",
        - "h2",
        - "h3",
        - "h4",
        - "h5",
        - "h6"
        
      eg: editor.InvokeCommand("heading") to toggle heading style of selection
    
*/

var MarkdownDeepEditor=new function(){

    // private:priv.
    // private:.m_*
    // private:.m_listType
    // private:.m_prefixLen
    

    var ie=false;
    
    // Various keycodes
    var keycode_tab = 9;
    var keycode_enter = 13;
    var keycode_pgup = 33;
    var keycode_pgdn = 34;
    var keycode_home = 36;
    var keycode_end = 35;
    var keycode_left = 37;
    var keycode_right = 39;
    var keycode_up = 38;
    var keycode_down = 40;
    var keycode_backspace = 8;
    var keycode_delete = 46;
    
    // Undo modes for the undo stack
    var undomode_unknown = 0;
    var undomode_text = 1;
    var undomode_erase = 2;
    var undomode_navigate = 3;
    var undomode_whitespace = 4;
    
    // Shortcut keys Ctrl+key
    var shortcut_keys={
        "Z": "undo",
        "Y": "redo",
        "B": "bold",
        "I": "italic",
        "H": "heading",
        "K": "code",
        "U": "ullist",
        "O": "ollist",
        "Q": "indent",
        "E": "outdent",
        "L": "link",
        "G": "img",
        "R": "hr",
        "0": "h0",
        "1": "h1",
        "2": "h2",
        "3": "h3",
        "4": "h4",
        "5": "h5",
        "6": "h6"
    }

    function starts_with(str, match)
    {
        return str.substr(0, match.length)==match;
    }
    
    function ends_with(str, match)
    {
        return str.substr(-match.length)==match;
    }

    function is_whitespace(ch)
    {
        return (ch==' ' || ch=='\t' || ch=='\r' || ch=='\n');
    }
    
    function is_crlf(ch)
    {
        return (ch=='\r' || ch=='\n');
    }
    
    function trim(str)
    {
        var i=0;
        var l=str.length;
        
        while (i<l && is_whitespace(str.charAt(i)))
            i++;
        while (l-1>i && is_whitespace(str.charAt(l-1)))
            l--;
            
        return str.substr(i, l-i);
    }


    // Helper for binding events
    function BindEvent(obj, event, handler)
    {
        if (obj.addEventListener)
        {
            obj.addEventListener(event, handler, false);
        }
        else if (obj.attachEvent)
        {
            obj.attachEvent("on"+event, handler);
        }
    }
    
    // Helper for unbinding events
    function UnbindEvent(obj, event, handler)
    {
        if (obj.removeEventListener)
        {
            obj.removeEventListener(event, handler, false);
        }
        else if (obj.detachEvent)
        {
            obj.detachEvent("on"+event, handler);
        }
    }
    
    function PreventEventDefault(event)
    {
        if (event.preventDefault)
        {
            event.preventDefault();
        }
        if (event.cancelBubble!==undefined)
        {
            event.cancelBubble=true;
            event.keyCode=0;
            event.returnValue=false;
        }
        return false;
    }
    
    function offsetToRangeCharacterMove(el, offset) 
    {
        return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
    }

    // EditorState represents the initial and final state of an edit
    function EditorState()
    {
    }

    priv=EditorState.prototype;

    priv.InitFromTextArea=function(textarea)
    {
        this.m_textarea=textarea;
        if (ie)
        {
            var sel=document.selection.createRange();
            var temp=sel.duplicate();
            temp.moveToElementText(textarea);
            var basepos=-temp.moveStart('character', -10000000);
            
            this.m_selectionStart = -sel.moveStart('character', -10000000)-basepos;
            this.m_selectionEnd = -sel.moveEnd('character', -10000000)-basepos;
            this.m_text=textarea.value.replace(/\r\n/gm,"\n");
        }
        else
        {
            this.m_selectionStart = textarea.selectionStart;
            this.m_selectionEnd = textarea.selectionEnd;
            this.m_text=textarea.value;
        }
    }
    
    priv.Duplicate=function()
    {
        var other=new EditorState();
        other.m_textarea=this.m_textarea;
        other.m_selectionEnd=this.m_selectionEnd;
        other.m_selectionStart=this.m_selectionStart;
        other.m_text=this.m_text;
        return other;
    }
    
    priv.Apply=function()
    {
        if (ie)
        {
            this.m_textarea.value=this.m_text;
            this.m_textarea.focus();
            var r=this.m_textarea.createTextRange();
            r.collapse(true);
            r.moveEnd("character", this.m_selectionEnd);
            r.moveStart("character", this.m_selectionStart);
            r.select();
        }
        else
        {
            // Set the new text 
            var scrollTop=this.m_textarea.scrollTop;
            this.m_textarea.value=this.m_text;
            this.m_textarea.focus();
            this.m_textarea.setSelectionRange(this.m_selectionStart, this.m_selectionEnd);
            this.m_textarea.scrollTop=scrollTop;
        }
    }
    
    priv.ReplaceSelection=function(str)
    {
        this.m_text=this.m_text.substr(0, this.m_selectionStart) + str + this.m_text.substr(this.m_selectionEnd);
        this.m_selectionEnd=this.m_selectionStart + str.length;
    }

    function adjust_pos(pos2, editpos, del, ins)
    {
        if (pos2<editpos)
            return pos2;
        return pos2<editpos+del ? editpos : pos2 + ins - del;
    }
    
    priv.ReplaceAt=function(pos, len, str)
    {
        this.m_text=this.m_text.substr(0, pos) + str + this.m_text.substr(pos+len);
        this.m_selectionStart=adjust_pos(this.m_selectionStart, pos, len, str.length);
        this.m_selectionEnd=adjust_pos(this.m_selectionEnd, pos, len, str.length);
    }
    
    priv.getSelectedText=function()
    {
        return this.m_text.substr(this.m_selectionStart, this.m_selectionEnd-this.m_selectionStart);
    }
    
    priv.InflateSelection=function(ds, de)
    {
        this.m_selectionEnd+=de;
        this.m_selectionStart-=ds;
    }
    
    priv.PreceededBy=function(str)
    {
        return this.m_selectionStart >= str.length && this.m_text.substr(this.m_selectionStart-str.length, str.length)==str;
    }
    
    priv.FollowedBy=function(str)
    {
        return this.m_text.substr(this.m_selectionEnd, str.length)==str;
    }
    
    priv.TrimSelection=function()
    {
        while (is_whitespace(this.m_text.charAt(this.m_selectionStart)))
            this.m_selectionStart++;
        while (this.m_selectionEnd>this.m_selectionStart && is_whitespace(this.m_text.charAt(this.m_selectionEnd-1)))
            this.m_selectionEnd--;
    }
    
    priv.IsStartOfLine=function(pos)
    {
        return pos==0 || is_crlf(this.m_text.charAt(pos-1));
    }
    
    priv.FindStartOfLine=function(pos)
    {
        // Move start of selection back to line start
        while (pos>0 && !is_crlf(this.m_text.charAt(pos-1)))
        {  
            pos--;
        }
        return pos;
    }    
    
    priv.FindEndOfLine=function(pos)
    {
        while (pos<this.m_text.length && !is_crlf(this.m_text.charAt(pos)))
        {
            pos++;
        }
        return pos;
    }
    
    priv.FindNextLine=function(pos)
    {
        return this.SkipEol(this.FindEndOfLine(pos));
    }
    
    priv.SkipWhiteSpace=function(pos)
    {
        while (pos<this.m_text.length && is_whitespace(this.m_text.charAt(pos)))
            pos++;
        return pos;
    }
    
    priv.SkipEol=function(pos)
    {
        if (this.m_text.substr(pos, 2)=="\r\n")
            return pos+2;
        if (is_crlf(this.m_text.charAt(pos)))
            return pos+1;
        return pos;
    }
    
    priv.SkipPreceedingEol=function(pos)
    {
        if (pos>2 && this.m_text.substr(pos-2, 2)=="\r\n")
            return pos-2;
        if (pos>1 && is_crlf(this.m_text.charAt(pos-1)))
            return pos-1;
        return pos;
    }
    
    priv.SelectWholeLines=function()
    {
        // Move selection to start of line
        this.m_selectionStart=this.FindStartOfLine(this.m_selectionStart);
        
        // Move end of selection to start of the next line
        if (!this.IsStartOfLine(this.m_selectionEnd))
        {
            this.m_selectionEnd=this.SkipEol(this.FindEndOfLine(this.m_selectionEnd));
        }
    }
    
    priv.SkipPreceedingWhiteSpace=function(pos)
    {
        while (pos>0 && is_whitespace(this.m_text.charAt(pos-1)))
        {
            pos--;
        }
        return pos;
    }
    
    priv.SkipFollowingWhiteSpace=function(pos)
    {
        while (is_whitespace(this.m_text.charAt(pos)))
        {
            pos++;
        }
        return pos;
    }
    priv.SelectSurroundingWhiteSpace=function()
    {
        this.m_selectionStart=this.SkipPreceedingWhiteSpace(this.m_selectionStart);
        this.m_selectionEnd=this.SkipFollowingWhiteSpace(this.m_selectionEnd);
    }
    
    priv.CheckSimpleSelection=function()
    {
        var text=this.getSelectedText();
        var m=text.match(/\n[ \t\r]*\n/);
        
        if (m)
        {
            alert("Please make a selection that doesn't include a paragraph break");
            return false;
        }
        
        return true;
    }

    // Check if line is completely blank    
    priv.IsBlankLine=function(p)
    {
        var len=this.m_text.length;
        for (var i=p; i<len; i++)
        {
            var ch=this.m_text[i];
            if (is_crlf(ch))
                return true;
            if (!is_whitespace(this.m_text.charAt(i)))
                return false;
        }
        
        return true;
    }
    
    priv.FindStartOfParagraph=function(pos)
    {
        var savepos=pos;
        
        // Move to start of first line
        pos=this.FindStartOfLine(pos);
        
        if (this.IsBlankLine(pos))
            return pos;

        // Move to first line after blank line
        while (pos>0)
        {
            var p=this.FindStartOfLine(this.SkipPreceedingEol(pos));
            if (p==0)
                break;
            if (this.IsBlankLine(p))
                break;
            pos=p;
        }
        
        // Is it a list?
        if (this.DetectListType(pos).m_prefixLen!=0)
        {
            // Do it again, but stop at line with list prefix
            pos=this.FindStartOfLine(savepos);
            
            // Move to first line after blank line
            while (pos>0)
            {
                if (this.DetectListType(pos).m_prefixLen!=0)
                    return pos;
                    
                // go to line before
                pos=this.FindStartOfLine(this.SkipPreceedingEol(pos));
            }
        }
        
        return pos;
    }
    
    priv.FindEndOfParagraph=function(pos)
    {
        // Skip all lines that aren't blank
        while (pos<this.m_text.length)
        {
            if (this.IsBlankLine(pos))
                break;
                
            pos=this.FindNextLine(pos);
        }
        
        return pos;
    }
    
    // Select the paragraph
    priv.SelectParagraph=function()
    {
        this.m_selectionStart=this.FindStartOfParagraph(this.m_selectionStart);
        this.m_selectionEnd=this.FindEndOfParagraph(this.m_selectionStart);        
    }
    
    // Starting at position pos, return the list type
    // returns { m_listType, m_prefixLen } 
    priv.DetectListType=function(pos)
    {
        var prefix=this.m_text.substr(pos, 10);
        var m=prefix.match(/^\s{0,3}(\*|\d+\.)(?:\ |\t)*/);
        if (!m)
            return {m_listType:"", m_prefixLen:0};
            
        if (m[1]=='*')
            return {m_listType:"*", m_prefixLen:m[0].length};
        else
            return {m_listType:"1", m_prefixLen:m[0].length};
    }
    
    
    

    // Editor
    function Editor(textarea, div_html)
    {
        // Is it IE?
        if (!textarea.setSelectionRange)
        {
            ie=true;
        }
    
        // Initialize
        this.m_lastContent=null;
        this.m_undoStack=[];
        this.m_undoPos=0;
        this.m_undoMode=undomode_navigate;
        this.Markdown=new MarkdownDeep.Markdown();
        this.Markdown.SafeMode=false;
        this.Markdown.ExtraMode=true;
        this.Markdown.NewWindowForLocalLinks=true;
        this.Markdown.NewWindowForExternalLinks=true;
        
        // Store DOM elements
        this.m_textarea=textarea;
        this.m_divHtml=div_html;

        // Bind events
        var ed=this;
        BindEvent(textarea, "keyup", function(){ed.onMarkdownChanged();});
        BindEvent(textarea, "keydown", function(e){return ed.onKeyDown(e);});
        BindEvent(textarea, "paste", function(){ed.onMarkdownChanged();});
        BindEvent(textarea, "input", function(){ed.onMarkdownChanged();});
        BindEvent(textarea, "mousedown", function(){ed.SetUndoMode(undomode_navigate);});

        // Do initial update
        this.onMarkdownChanged();
    }

    var priv=Editor.prototype;
    var pub=Editor.prototype;
    
    
    priv.onKeyDown=function(e)
    {
        var newMode=null;
        var retv=true;
        
        // Normal keys only
        if(e.ctrlKey || e.metaKey)
        {
            var key=String.fromCharCode(e.charCode||e.keyCode);
                    
            // Built in short cut key?
            if (!this.disableShortCutKeys && shortcut_keys[key]!=undefined)
            {
                this.InvokeCommand(shortcut_keys[key]);
                return PreventEventDefault(e);
            }
            
            // Standard keys
            switch (key)
            {
                case "V":   // Paste
                    newMode=undomode_text;
                    break;
                    
                case "X":   // Cut
                    newMode=undomode_erase;
                    break;
            }
        }
        else
        {
            switch (e.keyCode)
            {
                case keycode_tab:
                    if (!this.disableTabHandling)
                    {
                        this.InvokeCommand(e.shiftKey ? "untab" : "tab");
                        return PreventEventDefault(e);
                    }
                    else
                    {
                        newMode=undomode_text;
                    }
                    break;
                        
            
                case keycode_left:
                case keycode_right:
                case keycode_up:
                case keycode_down:
                case keycode_home:
                case keycode_end:
                case keycode_pgup:
                case keycode_pgdn:
                    // Navigation mode
                    newMode=undomode_navigate;
                    break;

                case keycode_backspace:
                case keycode_delete:
                    // Delete mode
                    newMode=undomode_erase;
                    break;
                
                case keycode_enter:
                    // New lines mode
                    newMode=undomode_whitespace;
                    break;
                
                default:
                    // Text mode
                    newMode=undomode_text;
            }
        }

        if (newMode!=null)
            this.SetUndoMode(newMode);

        // Special handling for enter key
        if (!this.disableAutoIndent)
        {
            if (e.keyCode==keycode_enter && (!ie || e.ctrlKey))
            {
                this.IndentNewLine();
            }
        }
    } 

    priv.SetUndoMode=function(newMode)
    {
        // Same mode?
        if (this.m_undoMode==newMode)
            return;
            
        // Enter new mode, after capturing current state
        this.m_undoMode=newMode;
        
        // Capture undo state
        this.CaptureUndoState();
    }

    
    priv.CaptureUndoState=function()
    {
        // Store a copy on the undo stack
        var state=new EditorState();
        state.InitFromTextArea(this.m_textarea);
        this.m_undoStack.splice(this.m_undoPos, this.m_undoStack.length-this.m_undoPos, state);        
        this.m_undoPos=this.m_undoStack.length;
    }
    
    priv.onMarkdownChanged=function(bCreateUndoUnit)
    {
        // Get the markdown, see if it's changed
        var new_content=this.m_textarea.value;
        if (new_content===this.m_lastContent && this.m_lastContent!==null)
	        return;
	        
    	// Call pre hook
    	if (this.onPreTransform)
    	    this.onPreTransform(this, new_content);
    
        // Transform
        var output=this.Markdown.Transform(new_content);

        // Call post hook
    	if (this.onPostTransform)
    	    this.onPostTransform(this, output);

    	// Update the DOM
        if (this.m_divHtml)
            this.m_divHtml.innerHTML=output;
            /*
        if (this.m_divSource)
        {
            this.m_divSource.innerHTML="";
            this.m_divSource.appendChild(document.createTextNode(output));
        }
        */
        
        // Call post update dom handler
        if (this.onPostUpdateDom)
            this.onPostUpdateDom(this);

        // Save previous content
        this.m_lastContent=new_content;
    }

    // Public method, should be called by client code if any of the MarkdownDeep
    // transform options have changed
    pub.onOptionsChanged=function()
    {
        this.m_lastContent=null;
        this.onMarkdownChanged();
    }
    
    pub.cmd_undo=function()
    {
        if (this.m_undoPos > 0)
        {
            // Capture current state at end of undo buffer.
            if (this.m_undoPos==this.m_undoStack.length)
            {
                this.CaptureUndoState();
                this.m_undoPos--;
            }

            this.m_undoPos--;
            this.m_undoStack[this.m_undoPos].Apply();
            this.m_undoMode=undomode_unknown;

            // Update markdown rendering
            this.onMarkdownChanged();
        }
    }
    
    pub.cmd_redo=function()
    {
        if (this.m_undoPos+1 < this.m_undoStack.length)
        {
            this.m_undoPos++;
            this.m_undoStack[this.m_undoPos].Apply();
            this.m_undoMode=undomode_unknown;

            // Update markdown rendering
            this.onMarkdownChanged();

            // We're back at the current state            
            if (this.m_undoPos==this.m_undoStack.length-1)
            {
                this.m_undoStack.pop();
            }
        }
    }
    
    priv.setHeadingLevel=function(state, headingLevel)
    {
        // Select the entire heading
        state.SelectParagraph();
        state.SelectSurroundingWhiteSpace();
        
        // Get the selected text
        var text=state.getSelectedText();
        
        // Trim all whitespace
        text=trim(text);

        var currentHeadingLevel=0;
        var m=text.match(/^(\#+)(.*?)(\#+)?$/);
        if (m)
        {
            text=trim(m[2]);
            currentHeadingLevel=m[1].length;
        }
        else
        {
            m=text.match(/^(.*?)(?:\r\n|\n|\r)\s*(\-*|\=*)$/);
            if (m)
            {
                text=trim(m[1]);
                currentHeadingLevel=m[2].charAt(0)=="=" ? 1 : 0;
            }
            else
            {
                // Remove blank lines        
                text=text.replace(/(\r\n|\n|\r)/gm,"");
                currentHeadingLevel=0;
            }
        }
        
        if (headingLevel==-1)
            headingLevel=(currentHeadingLevel+1) % 4;
        
        // Removing a heading
        var selOffset=0;
        var selLen=0;
        if (headingLevel==0)
        {
            // Deleting selection
            if (text=="Heading")
            {
                state.ReplaceSelection("");
                return true;
            }
            
            selLen=text.length;
            selOffset=0;
        }
        else
        {
            if (text=="")
                text="Heading";

            selOffset=headingLevel+1;
            selLen=text.length;
                
            var h="";
            for (var i=0; i<headingLevel; i++)
                h+="#";
                
            text=h + " " + text + " " + h;
            
        }
        
        // Require blank after
        text+="\n\n";

        if (state.m_selectionStart!=0)
        {
            text="\n\n" + text;
            selOffset+=2;
        }

        // Replace text
        state.ReplaceSelection(text);
        
        // Update selection
        state.m_selectionStart+=selOffset;
        state.m_selectionEnd=state.m_selectionStart + selLen;

        return true;
    }
    
    pub.cmd_heading=function(state)
    {
        return this.setHeadingLevel(state, -1);
    }
    
    pub.cmd_h0=function(state)
    {
        return this.setHeadingLevel(state, 0);
    }

    pub.cmd_h1=function(state)
    {
        return this.setHeadingLevel(state, 1);
    }

    pub.cmd_h2=function(state)
    {
        return this.setHeadingLevel(state, 2);
    }

    pub.cmd_h3=function(state)
    {
        return this.setHeadingLevel(state, 3);
    }

    pub.cmd_h4=function(state)
    {
        return this.setHeadingLevel(state, 4);
    }

    pub.cmd_h5=function(state)
    {
        return this.setHeadingLevel(state, 5);
    }

    pub.cmd_h6=function(state)
    {
        return this.setHeadingLevel(state, 6);
    }

    priv.IndentCodeBlock=function(state, indent)
    {
        // Make sure whole lines are selected
        state.SelectWholeLines();
        
        // Get the text, split into lines 
        var lines=state.getSelectedText().split("\n");
        
		// Convert leading tabs to spaces   
        for (var i=0; i<lines.length; i++)
        {
			if (lines[i].charAt(0)=="\t")
			{
				var newLead="";
				var p=0;
				while (lines[i].charAt(p)=="\t")
				{
					newLead+="    ";
					p++;
				}
				
				var newLine=newLead + lines[i].substr(p);
				lines.splice(i, 1, newLine);
			}
        }

        // Toggle indent/unindent?
        if (indent===null)
        {
            var i;
            for (i=0; i<lines.length; i++)
            {
                // Blank lines are allowed
                if (trim(lines[i])=="")
                    continue;
                 
				// Convert leading tabs to spaces   
				if (lines[i].charAt(0)=="\t")
				{
					var newLead="";
					var p=0;
					while (lines[i].charAt(p)=="\t")
					{
						newLead+="    ";
						p++;
					}
					
					var newLine=newLead + lines[i].substr(i);
					lines.splice(i, 1, newLine);
				}
					
                // Tabbed line
                if (!starts_with(lines[i], "    "))
                    break;
            }

            // Are we adding or removing indent
            indent=i!=lines.length;
        }
        
        // Apply the changes
        for (var i=0; i<lines.length; i++)
        {
            // Blank line?
            if (trim(lines[i])=="")
                continue;
                
            // Tabbed line
            var newline=lines[i];
            if (indent)
            {
                newline="    " + lines[i];
            }
            else
            {
                if (starts_with(lines[i], "\t"))
                    newline=lines[i].substr(1);
                else if (starts_with(lines[i], "    "))
                    newline=lines[i].substr(4);
            }
            
            lines.splice(i, 1, newline);
        }
        
        // Replace
        state.ReplaceSelection(lines.join("\n"));
    }
    
    // Code
    pub.cmd_code=function(state)
    {
        // Cursor on a blank line?
		if (state.m_selectionStart==state.m_selectionEnd)
		{
			var line=state.FindStartOfLine(state.m_selectionStart);
			if (state.IsBlankLine(line))
			{
				state.SelectSurroundingWhiteSpace();
				state.ReplaceSelection("\n\n    Code\n\n");
				state.m_selectionStart+=6;
				state.m_selectionEnd=state.m_selectionStart + 4;
				return true;
			}
		}       
	
        // If the current text is preceeded by a non-whitespace, or followed by a non-whitespace
        // then do an inline code
        if (state.getSelectedText().indexOf("\n")<0)
        {
            // Expand selection to include leading/trailing stars
            state.TrimSelection();
            if (state.PreceededBy("`"))
                state.m_selectionStart--;
            if (state.FollowedBy("`"))
                state.m_selectionEnd++;
            return this.bold_or_italic(state, "`");
        }
        
        this.IndentCodeBlock(state, null);    
        return true;        
    }
    
    pub.cmd_tab=function(state)
    {
        if (state.getSelectedText().indexOf("\n")>0)
        {
            this.IndentCodeBlock(state, true);
        }
        else
        {
            // If we're in the leading whitespace of a line
            // insert spaces instead of an actual tab character
            var lineStart=state.FindStartOfLine(state.m_selectionStart);
            var p;
            for (p=lineStart; p<state.m_selectionStart; p++)
            {
                if (state.m_text.charAt(p)!=' ')
                    break;
            }
            
            // All spaces?
            if (p==state.m_selectionStart)
            {
                var spacesToNextTabStop=4-((p-lineStart)%4);
                state.ReplaceSelection("    ".substr(0, spacesToNextTabStop));
            }
            else
            {  
                state.ReplaceSelection("\t");
            }
            state.m_selectionStart=state.m_selectionEnd;
        }
        return true;
    }
    
    pub.cmd_untab=function(state)
    {
        if (state.getSelectedText().indexOf("\n")>0)
        {
            this.IndentCodeBlock(state, false);
            return true;
        }
        return false;
    }
    
    priv.bold_or_italic=function(state, marker)
    {
        var t=state.m_text;
        var ml=marker.length;
        
        // Work out if we're adding or removing bold markers
        var text=state.getSelectedText();
        if (starts_with(text, marker) && ends_with(text, marker))
        {
            // Remove 
            state.ReplaceSelection(text.substr(ml, text.length-ml*2));
        }
        else
        {
            // Add
            state.TrimSelection();
            text=state.getSelectedText();
            if (!text)
                text="text";
            else
                text=text.replace(/(\r\n|\n|\r)/gm,"");
            state.ReplaceSelection(marker + text + marker);
            state.InflateSelection(-ml, -ml);
        }
        return true;
    }
    
    // Bold
    pub.cmd_bold=function(state)
    {
        if (!state.CheckSimpleSelection())
            return false;
        state.TrimSelection();
            
        // Expand selection to include leading/trailing stars
        if (state.PreceededBy("**"))
            state.m_selectionStart-=2;
        if (state.FollowedBy("**"))
            state.m_selectionEnd+=2;
            
        return this.bold_or_italic(state, "**");
    }
    
    // Italic
    pub.cmd_italic=function(state)
    {
        if (!state.CheckSimpleSelection())
            return false;
        state.TrimSelection();
            
        // Expand selection to include leading/trailing stars
        if ((state.PreceededBy("*") && !state.PreceededBy("**")) || state.PreceededBy("***"))
            state.m_selectionStart-=1;
        if ((state.FollowedBy("*") && !state.PreceededBy("**")) || state.FollowedBy("***"))
            state.m_selectionEnd+=1;
            
        return this.bold_or_italic(state, "*");
    }
    
    priv.indent_or_outdent=function(state, outdent)
    {
        if (false && state.m_selectionStart==state.m_selectionEnd)
        {
            state.SelectSurroundingWhiteSpace();
            state.ReplaceSelection("\n\n> Quote\n\n");
            state.m_selectionStart+=4;
            state.m_selectionEnd=state.m_selectionStart+5;
            return true;
        }
        
        // Make sure whole lines are selected
        state.SelectWholeLines();
        
        // Get the text, split into lines and check if all lines
        // are indented
        var lines=state.getSelectedText().split("\n");
        
        // Apply the changes
        for (var i=0; i<lines.length-1; i++)
        {
            // Tabbed line
            var newline=lines[i];
            if (outdent)
            {
                if (starts_with(lines[i], "> "))
                    newline=lines[i].substr(2);
            }
            else
            {
                newline="> " + lines[i];
            }
            
            lines.splice(i, 1, newline);
        }
        
        // Replace
        state.ReplaceSelection(lines.join("\n"));
        
        return true;        
    }
    
    // Quote
    pub.cmd_indent=function(state)
    {
        return this.indent_or_outdent(state, false);
    }
    
    pub.cmd_outdent=function(state)
    {
        return this.indent_or_outdent(state, true);
    }

    priv.handle_list=function(state, type)
    {
        // Build an array of selected line offsets        
        var lines=[];
        if (state.getSelectedText().indexOf("\n")>0)
        {
            state.SelectWholeLines();
            
            var line=state.m_selectionStart;
            lines.push(line);
            
            while (true)
            {
                line=state.FindNextLine(line);
                if (line>=state.m_selectionEnd)
                    break;  
                lines.push(line);
            }
        }
        else
        {
            lines.push(state.FindStartOfLine(state.m_selectionStart));
        }
        
        // Now work out the new list type
        // If the current selection only contains the current list type
        // then remove list items
        var prefix = type=="*" ? "* " : "1. ";
        for (var i=0; i<lines.length; i++)
        {
            var lt=state.DetectListType(lines[i]);
            if (lt.m_listType==type)
            {
                prefix="";
                break;
            }
        }

        // Update the prefix on all lines
        for (var i=lines.length-1; i>=0; i--)
        {
            var line=lines[i];
            var lt=state.DetectListType(line);
            state.ReplaceAt(line, lt.m_prefixLen, prefix);
        }
        
        // We now need to find any surrounding lists and renumber them
        var mdd=new MarkdownDeep.Markdown();
        mdd.ExtraMode=true;
        var listitems=mdd.GetListItems(state.m_text, state.m_selectionStart);
        
        while (listitems!=null)
        {
            // Process each list item
            var dx=0;
            for (var i=0; i<listitems.length-1; i++)
            {
                // Detect the list type
                var lt=state.DetectListType(listitems[i]+dx);
                if (lt.m_listType!="1")
                    break;
                    
                // Format new number prefix
                var newNumber=(i+1).toString() + ". ";
                
                // Replace it
                state.ReplaceAt(listitems[i]+dx, lt.m_prefixLen, newNumber);
                
                // Adjust things if new prefix is different length to the previos
                dx += newNumber.length - lt.m_prefixLen;
            }
            
            
            var newlistitems=mdd.GetListItems(state.m_text, listitems[listitems.length-1]+dx);
            if (newlistitems!=null && newlistitems[0]!=listitems[0])
                listitems=newlistitems;
            else
                listitems=null;
        }
        
        
        // Select lines
        if (lines.length>1)
        {
            state.SelectWholeLines();
        }
        
        return true;
    }
    
    
    pub.cmd_ullist=function(state)
    {
        return this.handle_list(state, "*");
    }
    
    pub.cmd_ollist=function(state)
    {
        return this.handle_list(state, "1");
    }
    
    pub.cmd_link=function(ctx)
    {
        ctx.TrimSelection();
        if (!ctx.CheckSimpleSelection())
            return false;
            
        var url=prompt("Enter the target URL:");
        if (url===null)
            return false;

        var text=ctx.getSelectedText();
        if (text.length==0)
        {
            text="link text";
        }
            
        var str="[" + text + "](" + url + ")";
        
        ctx.ReplaceSelection(str);
        ctx.m_selectionStart++;
        ctx.m_selectionEnd=ctx.m_selectionStart + text.length;
        return true;
    }
        
    pub.cmd_img=function(ctx)
    {
        ctx.TrimSelection();
        if (!ctx.CheckSimpleSelection())
            return false;

        var url=prompt("Enter the image URL");
        if (url===null)
            return false;
            
        var alttext=ctx.getSelectedText();
        if (alttext.length==0)
        {
            alttext="Image Text";
        }
        
        var str="![" + alttext + "](" + url + ")";
        
        ctx.ReplaceSelection(str);
        ctx.m_selectionStart+=2;
        ctx.m_selectionEnd=ctx.m_selectionStart + alttext.length;
        return true;
    }
        
    pub.cmd_hr=function(state)
    {
        state.SelectSurroundingWhiteSpace();
        if (state.m_selectionStart==0)
            state.ReplaceSelection("----------\n\n");
        else
            state.ReplaceSelection("\n\n----------\n\n");
        state.m_selectionStart=state.m_selectionEnd;;
        return true;
    }
    
    pub.IndentNewLine=function()
    {
        var editor=this;
        var timer;
        var handler=function() 
        {
            window.clearInterval(timer);
                    
            // Create an editor state from the current selection
            var state=new EditorState();
            state.InitFromTextArea(editor.m_textarea);

            // Find start of previous line
            var prevline=state.FindStartOfLine(state.SkipPreceedingEol(state.m_selectionStart));
            
            // Count spaces and tabs
            var i=prevline;
            while (true)
            {
                var ch=state.m_text.charAt(i);
                if (ch!=' ' && ch!='\t')
                    break;
                i++;
            }
            
            // Copy spaces and tabs to the new line
            if (i>prevline)
            {
                state.ReplaceSelection(state.m_text.substr(prevline, i-prevline));
                state.m_selectionStart=state.m_selectionEnd;
            }
            
            state.Apply();
        }

        timer=window.setInterval(handler, 1);

        return false;
    }
    
    pub.cmd_indented_newline=function(state)
    {
        // Do default new line
        state.ReplaceSelection("\n");
        state.m_selectionStart=state.m_selectionEnd;
        
        // Find start of previous line
        var prevline=state.FindStartOfLine(state.SkipPreceedingEol(state.m_selectionStart));
        
        // Count spaces and tabs
        var i=prevline;
        while (true)
        {
            var ch=state.m_text.charAt(i);
            if (ch!=' ' && ch!='\t')
                break;
            i++;
        }
        
        // Copy spaces and tabs to the new line
        if (i>prevline)
        {
            state.ReplaceSelection(state.m_text.substr(prevline, i-prevline));
            state.m_selectionStart=state.m_selectionEnd;
        }

        return true;
    }
    
    // Handle toolbar button
    pub.InvokeCommand=function(id)
    {
        // Special handling for undo and redo
        if (id=="undo" || id=="redo")
        {
            this["cmd_"+id]();
            this.m_textarea.focus();
            return;
        }
    
        // Create an editor state from the current selection
        var state=new EditorState();
        state.InitFromTextArea(this.m_textarea);

        // Create a copy for undo buffer
        var originalState=state.Duplicate();        
        
        // Call the handler and apply changes
        if (this["cmd_"+id](state))
        {
            // Save current state on undo stack
            this.m_undoMode=undomode_unknown;
            this.m_undoStack.splice(this.m_undoPos, this.m_undoStack.length-this.m_undoPos, originalState);        
            this.m_undoPos++;

            // Apply new state
            state.Apply();
            
            // Update markdown rendering
            this.onMarkdownChanged();
            
            return true;
        }
        else
        {
            this.m_textarea.focus();
            return false;
        }
    }
    
    delete priv;
    delete pub;

    // Exports
    this.Editor=Editor;
}();

var hljs=new function(){function k(v){return v.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(v){return v.nodeName.toLowerCase()}function i(w,x){var v=w&&w.exec(x);return v&&v.index==0}function d(v){return Array.prototype.map.call(v.childNodes,function(w){if(w.nodeType==3){return b.useBR?w.nodeValue.replace(/\n/g,""):w.nodeValue}if(t(w)=="br"){return"\n"}return d(w)}).join("")}function r(w){var v=(w.className+" "+(w.parentNode?w.parentNode.className:"")).split(/\s+/);v=v.map(function(x){return x.replace(/^language-/,"")});return v.filter(function(x){return j(x)||x=="no-highlight"})[0]}function o(x,y){var v={};for(var w in x){v[w]=x[w]}if(y){for(var w in y){v[w]=y[w]}}return v}function u(x){var v=[];(function w(y,z){for(var A=y.firstChild;A;A=A.nextSibling){if(A.nodeType==3){z+=A.nodeValue.length}else{if(t(A)=="br"){z+=1}else{if(A.nodeType==1){v.push({event:"start",offset:z,node:A});z=w(A,z);v.push({event:"stop",offset:z,node:A})}}}}return z})(x,0);return v}function q(w,y,C){var x=0;var F="";var z=[];function B(){if(!w.length||!y.length){return w.length?w:y}if(w[0].offset!=y[0].offset){return(w[0].offset<y[0].offset)?w:y}return y[0].event=="start"?w:y}function A(H){function G(I){return" "+I.nodeName+'="'+k(I.value)+'"'}F+="<"+t(H)+Array.prototype.map.call(H.attributes,G).join("")+">"}function E(G){F+="</"+t(G)+">"}function v(G){(G.event=="start"?A:E)(G.node)}while(w.length||y.length){var D=B();F+=k(C.substr(x,D[0].offset-x));x=D[0].offset;if(D==w){z.reverse().forEach(E);do{v(D.splice(0,1)[0]);D=B()}while(D==w&&D.length&&D[0].offset==x);z.reverse().forEach(A)}else{if(D[0].event=="start"){z.push(D[0].node)}else{z.pop()}v(D.splice(0,1)[0])}}return F+k(C.substr(x))}function m(y){function v(z){return(z&&z.source)||z}function w(A,z){return RegExp(v(A),"m"+(y.cI?"i":"")+(z?"g":""))}function x(D,C){if(D.compiled){return}D.compiled=true;D.k=D.k||D.bK;if(D.k){var z={};function E(G,F){if(y.cI){F=F.toLowerCase()}F.split(" ").forEach(function(H){var I=H.split("|");z[I[0]]=[G,I[1]?Number(I[1]):1]})}if(typeof D.k=="string"){E("keyword",D.k)}else{Object.keys(D.k).forEach(function(F){E(F,D.k[F])})}D.k=z}D.lR=w(D.l||/\b[A-Za-z0-9_]+\b/,true);if(C){if(D.bK){D.b=D.bK.split(" ").join("|")}if(!D.b){D.b=/\B|\b/}D.bR=w(D.b);if(!D.e&&!D.eW){D.e=/\B|\b/}if(D.e){D.eR=w(D.e)}D.tE=v(D.e)||"";if(D.eW&&C.tE){D.tE+=(D.e?"|":"")+C.tE}}if(D.i){D.iR=w(D.i)}if(D.r===undefined){D.r=1}if(!D.c){D.c=[]}var B=[];D.c.forEach(function(F){if(F.v){F.v.forEach(function(G){B.push(o(F,G))})}else{B.push(F=="self"?D:F)}});D.c=B;D.c.forEach(function(F){x(F,D)});if(D.starts){x(D.starts,C)}var A=D.c.map(function(F){return F.bK?"\\.?\\b("+F.b+")\\b\\.?":F.b}).concat([D.tE]).concat([D.i]).map(v).filter(Boolean);D.t=A.length?w(A.join("|"),true):{exec:function(F){return null}};D.continuation={}}x(y)}function c(S,L,J,R){function v(U,V){for(var T=0;T<V.c.length;T++){if(i(V.c[T].bR,U)){return V.c[T]}}}function z(U,T){if(i(U.eR,T)){return U}if(U.eW){return z(U.parent,T)}}function A(T,U){return !J&&i(U.iR,T)}function E(V,T){var U=M.cI?T[0].toLowerCase():T[0];return V.k.hasOwnProperty(U)&&V.k[U]}function w(Z,X,W,V){var T=V?"":b.classPrefix,U='<span class="'+T,Y=W?"":"</span>";U+=Z+'">';return U+X+Y}function N(){var U=k(C);if(!I.k){return U}var T="";var X=0;I.lR.lastIndex=0;var V=I.lR.exec(U);while(V){T+=U.substr(X,V.index-X);var W=E(I,V);if(W){H+=W[1];T+=w(W[0],V[0])}else{T+=V[0]}X=I.lR.lastIndex;V=I.lR.exec(U)}return T+U.substr(X)}function F(){if(I.sL&&!f[I.sL]){return k(C)}var T=I.sL?c(I.sL,C,true,I.continuation.top):g(C);if(I.r>0){H+=T.r}if(I.subLanguageMode=="continuous"){I.continuation.top=T.top}return w(T.language,T.value,false,true)}function Q(){return I.sL!==undefined?F():N()}function P(V,U){var T=V.cN?w(V.cN,"",true):"";if(V.rB){D+=T;C=""}else{if(V.eB){D+=k(U)+T;C=""}else{D+=T;C=U}}I=Object.create(V,{parent:{value:I}})}function G(T,X){C+=T;if(X===undefined){D+=Q();return 0}var V=v(X,I);if(V){D+=Q();P(V,X);return V.rB?0:X.length}var W=z(I,X);if(W){var U=I;if(!(U.rE||U.eE)){C+=X}D+=Q();do{if(I.cN){D+="</span>"}H+=I.r;I=I.parent}while(I!=W.parent);if(U.eE){D+=k(X)}C="";if(W.starts){P(W.starts,"")}return U.rE?0:X.length}if(A(X,I)){throw new Error('Illegal lexeme "'+X+'" for mode "'+(I.cN||"<unnamed>")+'"')}C+=X;return X.length||1}var M=j(S);if(!M){throw new Error('Unknown language: "'+S+'"')}m(M);var I=R||M;var D="";for(var K=I;K!=M;K=K.parent){if(K.cN){D=w(K.cN,D,true)}}var C="";var H=0;try{var B,y,x=0;while(true){I.t.lastIndex=x;B=I.t.exec(L);if(!B){break}y=G(L.substr(x,B.index-x),B[0]);x=B.index+y}G(L.substr(x));for(var K=I;K.parent;K=K.parent){if(K.cN){D+="</span>"}}return{r:H,value:D,language:S,top:I}}catch(O){if(O.message.indexOf("Illegal")!=-1){return{r:0,value:k(L)}}else{throw O}}}function g(y,x){x=x||b.languages||Object.keys(f);var v={r:0,value:k(y)};var w=v;x.forEach(function(z){if(!j(z)){return}var A=c(z,y,false);A.language=z;if(A.r>w.r){w=A}if(A.r>v.r){w=v;v=A}});if(w.language){v.second_best=w}return v}function h(v){if(b.tabReplace){v=v.replace(/^((<[^>]+>|\t)+)/gm,function(w,z,y,x){return z.replace(/\t/g,b.tabReplace)})}if(b.useBR){v=v.replace(/\n/g,"<br>")}return v}function p(z){var y=d(z);var A=r(z);if(A=="no-highlight"){return}var v=A?c(A,y,true):g(y);var w=u(z);if(w.length){var x=document.createElementNS("http://www.w3.org/1999/xhtml","pre");x.innerHTML=v.value;v.value=q(w,u(x),y)}v.value=h(v.value);z.innerHTML=v.value;z.className+=" hljs "+(!A&&v.language||"");z.result={language:v.language,re:v.r};if(v.second_best){z.second_best={language:v.second_best.language,re:v.second_best.r}}}var b={classPrefix:"hljs-",tabReplace:null,useBR:false,languages:undefined};function s(v){b=o(b,v)}function l(){if(l.called){return}l.called=true;var v=document.querySelectorAll("pre code");Array.prototype.forEach.call(v,p)}function a(){addEventListener("DOMContentLoaded",l,false);addEventListener("load",l,false)}var f={};var n={};function e(v,x){var w=f[v]=x(this);if(w.aliases){w.aliases.forEach(function(y){n[y]=v})}}function j(v){return f[v]||f[n[v]]}this.highlight=c;this.highlightAuto=g;this.fixMarkup=h;this.highlightBlock=p;this.configure=s;this.initHighlighting=l;this.initHighlightingOnLoad=a;this.registerLanguage=e;this.getLanguage=j;this.inherit=o;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.CLCM={cN:"comment",b:"//",e:"$"};this.CBLCLM={cN:"comment",b:"/\\*",e:"\\*/"};this.HCM={cN:"comment",b:"#",e:"$"};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM={cN:"number",b:this.BNR,r:0};this.REGEXP_MODE={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}}();hljs.registerLanguage("bash",function(b){var a={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)\}/}]};var d={cN:"string",b:/"/,e:/"/,c:[b.BE,a,{cN:"variable",b:/\$\(/,e:/\)/,c:[b.BE]}]};var c={cN:"string",b:/'/,e:/'/};return{l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for break continue while in do done exit return set declare case esac export exec",literal:"true false",built_in:"printf echo read cd pwd pushd popd dirs let eval unset typeset readonly getopts source shopt caller type hash bind help sudo",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:true,c:[b.inherit(b.TM,{b:/\w[\w\d_]*/})],r:0},b.HCM,b.NM,d,c,a]}});hljs.registerLanguage("cs",function(b){var a="abstract as base bool break byte case catch char checked const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual volatile void while async await ascending descending from get group into join let orderby partial select set value var where yield";return{k:a,c:[{cN:"comment",b:"///",e:"$",rB:true,c:[{cN:"xmlDocTag",b:"///|<!--|-->"},{cN:"xmlDocTag",b:"</?",e:">"}]},b.CLCM,b.CBLCLM,{cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line region endregion pragma checksum"},{cN:"string",b:'@"',e:'"',c:[{b:'""'}]},b.ASM,b.QSM,b.CNM,{bK:"protected public private internal",e:/[{;=]/,k:a,c:[{bK:"class namespace interface",starts:{c:[b.TM]}},{b:b.IR+"\\s*\\(",rB:true,c:[b.TM]}]}]}});hljs.registerLanguage("ruby",function(e){var h="[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?";var g="and false then defined module in return redo if BEGIN retry end for true self when next until do begin unless END rescue nil else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor";var a={cN:"yardoctag",b:"@[A-Za-z]+"};var i={cN:"comment",v:[{b:"#",e:"$",c:[a]},{b:"^\\=begin",e:"^\\=end",c:[a],r:10},{b:"^__END__",e:"\\n$"}]};var c={cN:"subst",b:"#\\{",e:"}",k:g};var d={cN:"string",c:[e.BE,c],v:[{b:/'/,e:/'/},{b:/"/,e:/"/},{b:"%[qw]?\\(",e:"\\)"},{b:"%[qw]?\\[",e:"\\]"},{b:"%[qw]?{",e:"}"},{b:"%[qw]?<",e:">",r:10},{b:"%[qw]?/",e:"/",r:10},{b:"%[qw]?%",e:"%",r:10},{b:"%[qw]?-",e:"-",r:10},{b:"%[qw]?\\|",e:"\\|",r:10},{b:/\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/}]};var b={cN:"params",b:"\\(",e:"\\)",k:g};var f=[d,i,{cN:"class",bK:"class module",e:"$|;",i:/=/,c:[e.inherit(e.TM,{b:"[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?"}),{cN:"inheritance",b:"<\\s*",c:[{cN:"parent",b:"("+e.IR+"::)?"+e.IR}]},i]},{cN:"function",bK:"def",e:" |$|;",r:0,c:[e.inherit(e.TM,{b:h}),b,i]},{cN:"constant",b:"(::)?(\\b[A-Z]\\w*(::)?)+",r:0},{cN:"symbol",b:":",c:[d,{b:h}],r:0},{cN:"symbol",b:e.UIR+"(\\!|\\?)?:",r:0},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{cN:"variable",b:"(\\$\\W)|((\\$|\\@\\@?)(\\w+))"},{b:"("+e.RSR+")\\s*",c:[i,{cN:"regexp",c:[e.BE,c],i:/\n/,v:[{b:"/",e:"/[a-z]*"},{b:"%r{",e:"}[a-z]*"},{b:"%r\\(",e:"\\)[a-z]*"},{b:"%r!",e:"![a-z]*"},{b:"%r\\[",e:"\\][a-z]*"}]}],r:0}];c.c=f;b.c=f;return{k:g,c:f}});hljs.registerLanguage("diff",function(a){return{c:[{cN:"chunk",r:10,v:[{b:/^\@\@ +\-\d+,\d+ +\+\d+,\d+ +\@\@$/},{b:/^\*\*\* +\d+,\d+ +\*\*\*\*$/},{b:/^\-\-\- +\d+,\d+ +\-\-\-\-$/}]},{cN:"header",v:[{b:/Index: /,e:/$/},{b:/=====/,e:/=====$/},{b:/^\-\-\-/,e:/$/},{b:/^\*{3} /,e:/$/},{b:/^\+\+\+/,e:/$/},{b:/\*{5}/,e:/\*{5}$/}]},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"change",b:"^\\!",e:"$"}]}});hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require"},c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBLCLM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBLCLM,a.REGEXP_MODE,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBLCLM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});hljs.registerLanguage("xml",function(a){var c="[A-Za-z0-9\\._:-]+";var d={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"};var b={eW:true,i:/</,r:0,c:[d,{cN:"attribute",b:c,r:0},{b:"=",r:0,c:[{cN:"value",v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html"],cI:true,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},{cN:"comment",b:"<!--",e:"-->",r:10},{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[b],starts:{e:"</style>",rE:true,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[b],starts:{e:"<\/script>",rE:true,sL:"javascript"}},{b:"<%",e:"%>",sL:"vbscript"},d,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:"[^ /><]+",r:0},b]}]}});hljs.registerLanguage("markdown",function(a){return{c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|\t)",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].+?[\\)\\]]",rB:true,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:true,rE:true,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:true,eE:true},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:true,eE:true,}],r:10},{b:"^\\[.+\\]:",e:"$",rB:true,c:[{cN:"link_reference",b:"\\[",e:"\\]",eB:true,eE:true},{cN:"link_url",b:"\\s",e:"$"}]}]}});hljs.registerLanguage("css",function(a){var b="[a-zA-Z-][a-zA-Z0-9_-]*";var c={cN:"function",b:b+"\\(",e:"\\)",c:["self",a.NM,a.ASM,a.QSM]};return{cI:true,i:"[=/|']",c:[a.CBLCLM,{cN:"id",b:"\\#[A-Za-z0-9_-]+"},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"pseudo",b:":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:true,eE:true,r:0,c:[c,a.ASM,a.QSM,a.NM]}]},{cN:"tag",b:b,r:0},{cN:"rules",b:"{",e:"}",i:"[^\\s]",r:0,c:[a.CBLCLM,{cN:"rule",b:"[^\\s]",rB:true,e:";",eW:true,c:[{cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:true,i:"[^\\s]",starts:{cN:"value",eW:true,eE:true,c:[c,a.NM,a.QSM,a.ASM,a.CBLCLM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]}]}]}});hljs.registerLanguage("http",function(a){return{i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:true,e:"$",c:[{cN:"string",b:" ",e:" ",eB:true,eE:true}]},{cN:"attribute",b:"^\\w",e:": ",eE:true,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:"",eW:true}}]}});hljs.registerLanguage("java",function(b){var a="false synchronized int abstract float private char boolean static null if const for true while long throw strictfp finally protected import native final return void enum else break transient new catch instanceof byte super volatile case assert short package default double public try this switch continue throws";return{k:a,i:/<\//,c:[{cN:"javadoc",b:"/\\*\\*",e:"\\*/",c:[{cN:"javadoctag",b:"(^|\\s)@[A-Za-z]+"}],r:10},b.CLCM,b.CBLCLM,b.ASM,b.QSM,{bK:"protected public private",e:/[{;=]/,k:a,c:[{cN:"class",bK:"class interface",eW:true,i:/[:"<>]/,c:[{bK:"extends implements",r:10},b.UTM]},{b:b.UIR+"\\s*\\(",rB:true,c:[b.UTM]}]},b.CNM,{cN:"annotation",b:"@[A-Za-z]+"}]}});hljs.registerLanguage("php",function(b){var e={cN:"variable",b:"\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*"};var a={cN:"preprocessor",b:/<\?(php)?|\?>/};var c={cN:"string",c:[b.BE,a],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},b.inherit(b.ASM,{i:null}),b.inherit(b.QSM,{i:null})]};var d={v:[b.BNM,b.CNM]};return{cI:true,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[b.CLCM,b.HCM,{cN:"comment",b:"/\\*",e:"\\*/",c:[{cN:"phpdoc",b:"\\s@[A-Za-z]+"},a]},{cN:"comment",b:"__halt_compiler.+?;",eW:true,k:"__halt_compiler",l:b.UIR},{cN:"string",b:"<<<['\"]?\\w+['\"]?$",e:"^\\w+;",c:[b.BE]},a,e,{cN:"function",bK:"function",e:/[;{]/,i:"\\$|\\[|%",c:[b.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",e,b.CBLCLM,c,d]}]},{cN:"class",bK:"class interface",e:"{",i:/[:\(\$"]/,c:[{bK:"extends implements",r:10},b.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[b.UTM]},{bK:"use",e:";",c:[b.UTM]},{b:"=>"},c,d]}});hljs.registerLanguage("python",function(a){var f={cN:"prompt",b:/^(>>>|\.\.\.) /};var b={cN:"string",c:[a.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[f],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[f],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/,},{b:/(b|br)"/,e:/"/,},a.ASM,a.QSM]};var d={cN:"number",r:0,v:[{b:a.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:a.CNR+"[lLjJ]?"}]};var e={cN:"params",b:/\(/,e:/\)/,c:["self",f,d,b]};var c={e:/:/,i:/[${=;\n]/,c:[a.UTM,e]};return{k:{keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},i:/(<\/|->|\?)/,c:[f,d,b,a.HCM,a.inherit(c,{cN:"function",bK:"def",r:10}),a.inherit(c,{cN:"class",bK:"class"}),{cN:"decorator",b:/@/,e:/$/},{b:/\b(print|exec)\(/}]}});hljs.registerLanguage("sql",function(a){return{cI:true,i:/[<>]/,c:[{cN:"operator",b:"\\b(begin|end|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant|merge)\\b(?!:)",e:";",eW:true,k:{keyword:"all partial global month current_timestamp using go revoke smallint indicator end-exec disconnect zone with character assertion to add current_user usage input local alter match collate real then rollback get read timestamp session_user not integer bit unique day minute desc insert execute like ilike|2 level decimal drop continue isolation found where constraints domain right national some module transaction relative second connect escape close system_user for deferred section cast current sqlstate allocate intersect deallocate numeric public preserve full goto initially asc no key output collation group by union session both last language constraint column of space foreign deferrable prior connection unknown action commit view or first into float year primary cascaded except restrict set references names table outer open select size are rows from prepare distinct leading create only next inner authorization schema corresponding option declare precision immediate else timezone_minute external varying translation true case exception join hour default double scroll value cursor descriptor values dec fetch procedure delete and false int is describe char as at in varchar null trailing any absolute current_time end grant privileges when cross check write current_date pad begin temporary exec time update catalog user sql date on identity timezone_hour natural whenever interval work order cascade diagnostics nchar having left call do handler load replace truncate start lock show pragma exists number trigger if before after each row merge matched database",aggregate:"count sum min max avg"},c:[{cN:"string",b:"'",e:"'",c:[a.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[a.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[a.BE]},a.CNM]},a.CBLCLM,{cN:"comment",b:"--",e:"$"}]}});hljs.registerLanguage("ini",function(a){return{cI:true,i:/\S/,c:[{cN:"comment",b:";",e:"$"},{cN:"title",b:"^\\[",e:"\\]"},{cN:"setting",b:"^[a-z0-9\\[\\]_-]+[ \\t]*=[ \\t]*",e:"$",c:[{cN:"value",eW:true,k:"on off true false yes no",c:[a.QSM,a.NM],r:0}]}]}});hljs.registerLanguage("perl",function(c){var d="getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when";var f={cN:"subst",b:"[$@]\\{",e:"\\}",k:d};var g={b:"->{",e:"}"};var a={cN:"variable",v:[{b:/\$\d/},{b:/[\$\%\@\*](\^\w\b|#\w+(\:\:\w+)*|{\w+}|\w+(\:\:\w*)*)/},{b:/[\$\%\@\*][^\s\w{]/,r:0}]};var e={cN:"comment",b:"^(__END__|__DATA__)",e:"\\n$",r:5};var h=[c.BE,f,a];var b=[a,c.HCM,e,{cN:"comment",b:"^\\=\\w",e:"\\=cut",eW:true},g,{cN:"string",c:h,v:[{b:"q[qwxr]?\\s*\\(",e:"\\)",r:5},{b:"q[qwxr]?\\s*\\[",e:"\\]",r:5},{b:"q[qwxr]?\\s*\\{",e:"\\}",r:5},{b:"q[qwxr]?\\s*\\|",e:"\\|",r:5},{b:"q[qwxr]?\\s*\\<",e:"\\>",r:5},{b:"qw\\s+q",e:"q",r:5},{b:"'",e:"'",c:[c.BE]},{b:'"',e:'"'},{b:"`",e:"`",c:[c.BE]},{b:"{\\w+}",c:[],r:0},{b:"-?\\w+\\s*\\=\\>",c:[],r:0}]},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\/\\/|"+c.RSR+"|\\b(split|return|print|reverse|grep)\\b)\\s*",k:"split return print reverse grep",r:0,c:[c.HCM,e,{cN:"regexp",b:"(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",r:10},{cN:"regexp",b:"(m|qr)?/",e:"/[a-z]*",c:[c.BE],r:0}]},{cN:"sub",bK:"sub",e:"(\\s*\\(.*?\\))?[;{]",r:5},{cN:"operator",b:"-\\w\\b",r:0}];f.c=b;g.c=b;return{k:d,c:b}});hljs.registerLanguage("objectivec",function(a){var d={keyword:"int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign self synchronized id nonatomic super unichar IBOutlet IBAction strong weak @private @protected @public @try @property @end @throw @catch @finally @synthesize @dynamic @selector @optional @required",literal:"false true FALSE TRUE nil YES NO NULL",built_in:"NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController UINavigationBar UINavigationController UITabBarController UIPopoverController UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor UIFont UIApplication NSNotFound NSNotificationCenter NSNotification UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection UIInterfaceOrientation MPMoviePlayerController dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once"};var c=/[a-zA-Z@][a-zA-Z0-9_]*/;var b="@interface @class @protocol @implementation";return{k:d,l:c,i:"</",c:[a.CLCM,a.CBLCLM,a.CNM,a.QSM,{cN:"string",b:"'",e:"[^\\\\]'",i:"[^\\\\][^']"},{cN:"preprocessor",b:"#import",e:"$",c:[{cN:"title",b:'"',e:'"'},{cN:"title",b:"<",e:">"}]},{cN:"preprocessor",b:"#",e:"$"},{cN:"class",b:"("+b.split(" ").join("|")+")\\b",e:"({|$)",k:b,l:c,c:[a.UTM]},{cN:"variable",b:"\\."+a.UIR,r:0}]}});hljs.registerLanguage("coffeescript",function(c){var b={keyword:"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not",literal:"true false null undefined yes no on off",reserved:"case default function var void with const let enum export import native __hasProp __extends __slice __bind __indexOf",built_in:"npm require console print module exports global window document"};var a="[A-Za-z$_][0-9A-Za-z$_]*";var f=c.inherit(c.TM,{b:a});var e={cN:"subst",b:/#\{/,e:/}/,k:b};var d=[c.BNM,c.inherit(c.CNM,{starts:{e:"(\\s*/)?",r:0}}),{cN:"string",v:[{b:/'''/,e:/'''/,c:[c.BE]},{b:/'/,e:/'/,c:[c.BE]},{b:/"""/,e:/"""/,c:[c.BE,e]},{b:/"/,e:/"/,c:[c.BE,e]}]},{cN:"regexp",v:[{b:"///",e:"///",c:[e,c.HCM]},{b:"//[gim]*",r:0},{b:"/\\S(\\\\.|[^\\n])*?/[gim]*(?=\\s|\\W|$)"}]},{cN:"property",b:"@"+a},{b:"`",e:"`",eB:true,eE:true,sL:"javascript"}];e.c=d;return{k:b,c:d.concat([{cN:"comment",b:"###",e:"###"},c.HCM,{cN:"function",b:"("+a+"\\s*=\\s*)?(\\(.*\\))?\\s*\\B[-=]>",e:"[-=]>",rB:true,c:[f,{cN:"params",b:"\\(",rB:true,c:[{b:/\(/,e:/\)/,k:b,c:["self"].concat(d)}]}]},{cN:"class",bK:"class",e:"$",i:/[:="\[\]]/,c:[{bK:"extends",eW:true,i:/[:="\[\]]/,c:[f]},f]},{cN:"attribute",b:a+":",e:":",rB:true,eE:true,r:0}])}});hljs.registerLanguage("nginx",function(c){var b={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+c.UIR}]};var a={eW:true,l:"[a-z/_]+",k:{built_in:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[c.HCM,{cN:"string",c:[c.BE,b],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{cN:"url",b:"([a-z]+):/",e:"\\s",eW:true,eE:true},{cN:"regexp",c:[c.BE,b],v:[{b:"\\s\\^",e:"\\s|{|;",rE:true},{b:"~\\*?\\s+",e:"\\s|{|;",rE:true},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},b]};return{c:[c.HCM,{b:c.UIR+"\\s",e:";|{",rB:true,c:[c.inherit(c.UTM,{starts:a})],r:0}],i:"[^\\s\\}]"}});hljs.registerLanguage("json",function(a){var e={literal:"true false null"};var d=[a.QSM,a.CNM];var c={cN:"value",e:",",eW:true,eE:true,c:d,k:e};var b={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:true,eE:true,c:[a.BE],i:"\\n",starts:c}],i:"\\S"};var f={b:"\\[",e:"\\]",c:[a.inherit(c,{cN:null})],i:"\\S"};d.splice(d.length,0,b,f);return{c:d,k:e,i:"\\S"}});hljs.registerLanguage("apache",function(a){var b={cN:"number",b:"[\\$%]\\d+"};return{cI:true,c:[a.HCM,{cN:"tag",b:"</?",e:">"},{cN:"keyword",b:/\w+/,r:0,k:{common:"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"},starts:{e:/$/,r:0,k:{literal:"on off all"},c:[{cN:"sqbracket",b:"\\s\\[",e:"\\]$"},{cN:"cbracket",b:"[\\$%]\\{",e:"\\}",c:["self",b]},b,a.QSM]}}],i:/\S/}});hljs.registerLanguage("cpp",function(a){var b={keyword:"false int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long throw volatile static protected bool template mutable if public friend do return goto auto void enum else break new extern using true class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype noexcept nullptr static_assert thread_local restrict _Bool complex _Complex _Imaginary",built_in:"std string cin cout cerr clog stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf"};return{aliases:["c"],k:b,i:"</",c:[a.CLCM,a.CBLCLM,a.QSM,{cN:"string",b:"'\\\\?.",e:"'",i:"."},{cN:"number",b:"\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"},a.CNM,{cN:"preprocessor",b:"#",e:"$",c:[{b:"include\\s*<",e:">",i:"\\n"},a.CLCM]},{cN:"stl_container",b:"\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",e:">",k:b,r:10,c:["self"]}]}});hljs.registerLanguage("makefile",function(a){var b={cN:"variable",b:/\$\(/,e:/\)/,c:[a.BE]};return{c:[a.HCM,{b:/^\w+\s*\W*=/,rB:true,r:0,starts:{cN:"constant",e:/\s*\W*=/,eE:true,starts:{e:/$/,r:0,c:[b],}}},{cN:"title",b:/^[\w]+:\s*$/},{cN:"phony",b:/^\.PHONY:/,e:/$/,k:".PHONY",l:/[\.\w]+/},{b:/^\t+/,e:/$/,c:[a.QSM,b]}]}});
angular.module('wiz.markdown', [
	'ngSanitize'
]);
angular.module('wiz.markdown')

.factory('wizMarkdownSvc', [function () {
	var markdownSvc = new MarkdownDeep.Markdown();
	markdownSvc.ExtraMode = true;
	markdownSvc.SafeMode = false;
	markdownSvc.NewWindowForExternalLinks = true;
	markdownSvc.AutoHeadingIDs = true;
    markdownSvc.MarkdownDeepEditor = MarkdownDeepEditor;

	return markdownSvc;
}]);
angular.module('wiz.markdown')

.filter('wizMarkdownFltr', ['wizMarkdownSvc', function (wizMarkdownSvc) {
	return function (input) {
		if (input) return wizMarkdownSvc.Transform(input);
	};
}]);
angular.module('wiz.markdown')

.directive('wizMarkdown', ['$filter', 'wizMarkdownSvc', function ($filter, wizMarkdownSvc) {
	return {
		restrict: 'E',
		scope: {
			'content': '='
		},
		replace: true,
		template: '<div class="markdown-output"></div>',
		link: function (scope, elem, attrs) {
			scope.$watch('content', function () {
				if (!scope.content) {
					elem.html('');
					return;
				}
				elem.html(wizMarkdownSvc.Transform(scope.content));
				// Apply highlighting when required
				angular.forEach(elem.find('pre'), function (value) {
					hljs.highlightBlock(value);
				});
			});
		}
	};
}]);
angular.module('wiz.markdown')

.directive('wizMarkdownEditor', ['$timeout', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			'content': '=',
			'textareaclass':'@?'
		},
		replace: true,
		transclude: true,
		template: '<div class="markdown-editor">' +
		            '<div class="markdown-toolbar" ng-if="!toolbarBottom" ng-transclude></div>' +
		            '<textarea class="markdown-input {{textareaclass}}" ng-model="content"></textarea>' +
		            '<div class="markdown-toolbar" ng-if="toolbarBottom" ng-transclude></div>' +
		          '</div>',
		controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) { }],
		link: function (scope, elem, attrs, ctrl) {
			var editor = new MarkdownDeepEditor.Editor(elem.find('textarea')[0], null);
			editor.onPostUpdateDom = function (editor) {
				$timeout(function () {
					scope.content = elem.find('textarea').val();
				});
			};
			scope.toolbarBottom = attrs.toolbar === 'bottom';
			// Exposes editor to other directives
			ctrl.editor = editor;
		}
	};
}]);

angular.module('wiz.markdown')

.directive('wizMarkdownInput', ['$timeout', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			'content': '='
		},
		replace: true,
		transclude: true,
		template: '<textarea class="markdown-input" ng-model="content"></textarea>',
		link: function (scope, elem, attrs, ctrl) {
			var editor = new MarkdownDeepEditor.Editor(elem[0], null);
			editor.onPostUpdateDom = function (editor) {
				$timeout(function () {
					scope.content = elem.val();
				});
			};
		}
	};
}]);

angular.module('wiz.markdown')

.directive('wizToolbarButton', function () {
	return {
		require: '^wizMarkdownEditor',
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			'buttonclass':'@?'
		},
		template: '<button class="{{buttonclass}}" type="button" ng-click="format()" ng-transclude></button>',
		link: function (scope, elem, attrs, wizMarkdownEditorCtrl) {
			if (attrs.command) {
				scope.format = function () {
					wizMarkdownEditorCtrl.editor.InvokeCommand(attrs.command);
				};
			} else {
				console.error('wiz-toolbar-button requires a "command" attribute e.g: command="bold" ')
			}
		}
	};
});
