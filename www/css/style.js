import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "wrap": {
        "textOverflow": "wrap!important",
        "whiteSpace": "normal!important"
    },
    "twrap": {
        "textOverflow": "ellipsis",
        "wordWrap": "break-word",
        "whiteSpace": "nowrap"
    },
    "item wrap": {
        "textOverflow": "wrap!important",
        "whiteSpace": "normal!important"
    },
    "itemcomments p": {
        "whiteSpace": "pre-wrap !important"
    },
    "itemcomments nowrap": {
        "whiteSpace": "nowrap!important"
    },
    "itemcomments h5": {
        "whiteSpace": "nowrap!important"
    },
    "ion-commentitem": {
        "borderTop": "solid 1px #ddd"
    },
    "ion-commentitem h1": {
        "whiteSpace": "pre-wrap"
    },
    "ion-commentitem h2": {
        "whiteSpace": "pre-wrap"
    },
    "ion-commentitem h3": {
        "whiteSpace": "pre-wrap"
    },
    "item-icon-left iicon": {
        "fontSize": "20px!important"
    },
    "hr": {
        "color": "#ddd"
    },
    "padding": {
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10
    },
    "leftpadding": {
        "paddingLeft": 10,
        "marginLeft": 10
    },
    "pull-right": {
        "float": "right"
    },
    "bold": {
        "fontWeight": "bold"
    },
    "footinfo": {
        "fontSize": 3.5 * vw,
        "width": "100%"
    },
    "mpb": {
        "WebkitBackgroundSize": "cover!important",
        "MozBackgroundSize": "cover!important",
        "OBackgroundSize": "cover!important",
        "backgroundSize": "cover!important"
    },
    "platform-browser mysubheader": {
        "top": 0,
        "height": "227px!important"
    },
    "platform-android mysubheader": {
        "top": 0,
        "height": "227px!important"
    },
    "platform-ios mysubheader": {
        "paddingTop": "20px!important",
        "top": "0px!important",
        "height": "247px!important"
    },
    "platform-browser has-mysubheader": {
        "paddingTop": "227px!important"
    },
    "platform-android has-mysubheader": {
        "paddingTop": "227px!important"
    },
    "platform-ios has-mysubheader": {
        "paddingTop": "247px!important"
    },
    "platform-browser footprofileinfo": {
        "marginTop": "15px!important"
    },
    "platform-android footprofileinfo": {
        "marginTop": "15px!important"
    },
    "platform-ios footprofileinfo": {
        "marginTop": "25px!important"
    },
    "footprofileinfomenu div": {
        "color": "#fff"
    },
    "pane img": {
        "maxWidth": "100%"
    },
    "gray": {
        "color": "gray"
    },
    "searchitem-select": {
        "width": "30%"
    },
    "searchitem-select select": {
        "left": 0,
        "paddingRight": 0,
        "marginRight": 0
    },
    "italic": {
        "fontStyle": "italic"
    },
    "error": {
        "color": "red"
    },
    "capital": {
        "textTransform": "uppercase"
    },
    "profilebar-footer button-bar buttonicon": {
        "display": "block",
        "textAlign": "center",
        "fontSize": "11pt"
    },
    "profilebar-footer button-bar buttonicon:before": {
        "display": "block",
        "textAlign": "center",
        "marginTop": 3,
        "marginRight": "auto",
        "marginBottom": "auto",
        "marginLeft": "auto",
        "paddingTop": "auto",
        "paddingRight": "auto",
        "paddingBottom": "auto",
        "paddingLeft": "auto",
        "width": 25,
        "height": 25,
        "lineHeight": 25
    },
    "profilebar-footer button-bar button": {
        "borderTopLeftRadius": 0,
        "borderBottomLeftRadius": 0,
        "borderTopRightRadius": 0,
        "borderBottomRightRadius": 0
    },
    "profilebar-footer": {
        "height": 60,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "has-footer": {
        "bottom": 60
    },
    "exchange header col": {
        "backgroundColor": "lightgrey"
    },
    "exchange col": {
        "border": "solid 1px grey",
        "borderBottomStyle": "none",
        "borderRightStyle": "none"
    },
    "exchange col:last-child": {
        "borderRight": "solid 1px grey"
    },
    "exchange row:last-child col": {
        "borderBottom": "solid 1px grey"
    },
    "textareamarkdown-input": {
        "width": "100%",
        "height": 40 * vh
    },
    "bodytext ol": {
        "listStyleType": "decimal!important",
        "paddingLeft": 15
    },
    "bodytext ul": {
        "listStyleType": "disc!important",
        "paddingLeft": 15
    },
    "bodytext em": {
        "fontStyle": "italic!important"
    },
    "bodytext i": {
        "fontStyle": "italic!important"
    },
    "markdown-toolbar button": {
        "width": "20px!important"
    },
    "profilebtn": {
        "position": "absolute!important"
    },
    "profilebtn_follow": {
        "position": "absolute!important",
        "right": "0!important",
        "marginRight": "5px!important",
        "marginBottom": "5px!important",
        "bottom": "0!important"
    },
    "ion-comment": {
        "fontSize": 12,
        "paddingTop": 4,
        "paddingRight": 15,
        "paddingBottom": 4,
        "paddingLeft": 15,
        "overflow": "visible",
        "whiteSpace": "normal",
        "border": "none"
    },
    "ion-comment item-options button": {
        "backgroundColor": "#fff"
    },
    "ion-comment--text p": {
        "overflow": "visible",
        "whiteSpace": "normal"
    },
    "ion-comment item-content": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "overflow": "visible",
        "whiteSpace": "normal",
        "fontSize": 14,
        "color": "#111"
    },
    "ion-comment item-content p": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "overflow": "visible",
        "whiteSpace": "normal",
        "fontSize": 14,
        "color": "#111"
    },
    "ion-comment--author": {
        "color": "#111",
        "marginBottom": 6
    },
    "ion-comment--op": {
        "color": "#8899a6"
    },
    "ion-comment--replies": {
        "color": "#8899a6",
        "textAlign": "right"
    },
    "ion-comment--score": {
        "textAlign": "right",
        "position": "absolute",
        "top": 0,
        "right": 0,
        "color": "#8899a6",
        "WebkitTransition": "color 0.1s",
        "transition": "color 0.1s"
    },
    "positives": {
        "backgroundColor": "#387ef5"
    },
    "calms": {
        "backgroundColor": "#11c1f3"
    },
    "spinner svg": {
        "width": 16,
        "height": 16
    },
    "ion-comment--container": {
        "backgroundColor": "#f8f8f8"
    },
    "ion-comment--children": {
        "marginLeft": 10
    },
    "ion-android-arrow-dropup-circle": {
        "fontSize": 20
    },
    "ion-android-arrow-dropup": {
        "fontSize": 20
    },
    "ion-android-arrow-dropdown": {
        "fontSize": 20
    },
    "ion-android-arrow-dropdown-circle": {
        "fontSize": 20
    },
    "item ion-android-arrow-dropup-circle": {
        "fontSize": 18
    },
    "item ion-android-arrow-dropup": {
        "fontSize": 18
    },
    "item ion-android-arrow-dropdown": {
        "fontSize": 18
    },
    "item ion-android-arrow-dropdown-circle": {
        "fontSize": 18
    },
    "tright": {
        "textAlign": "right"
    },
    "tcenter": {
        "textAlign": "center!important"
    },
    "center": {
        "marginLeft": "auto",
        "marginRight": "auto",
        "textAlign": "center",
        "verticalAlign": "middle",
        "display": "block"
    },
    "item row": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "item row col": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "boxsizingBorder": {
        "WebkitBoxSizing": "border-box",
        "MozBoxSizing": "border-box",
        "boxSizing": "border-box",
        "width": "100%"
    },
    "reputation": {
        "display": "inline-block",
        "fontSize": 12,
        "lineHeight": 18,
        "paddingTop": 0,
        "paddingRight": 3,
        "paddingBottom": 0,
        "paddingLeft": 3,
        "marginLeft": 2,
        "marginRight": 2,
        "backgroundColor": "#f8f8f8",
        "borderRadius": "50%",
        "border": "1px solid #dadada",
        "color": "#000!important"
    },
    "stitlerow": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "stitlerow col": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "item-myavatar > img:first-child": {
        "maxWidth": 90,
        "maxHeight": 90,
        "width": "100%",
        "background": "#387ef5",
        "height": "100%",
        "marginRight": "auto",
        "marginLeft": "auto",
        "borderRadius": "50%!important",
        "WebkitBorderRadius": "50%",
        "MozBorderRadius": "50%",
        "WebkitBoxShadow": "0 0 0 1px #fff, 0 0 0 1px #999, 0 1px 1px 1px rgba(0,0,0,.2)",
        "MozBoxShadow": "0 0 0 1px #fff, 0 0 0 1px #999, 0 1px 1px 1px rgba(0,0,0,.2)",
        "boxShadow": "0 0 0 1px #fff, 0 0 0 1px #999, 0 1px 1px 1px rgba(0,0,0,.2)"
    },
    "item-myavatar footprofileinfo": {
        "color": "white",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "font": "14px Sans-Serif",
        "lineHeight": "8pt"
    },
    "action-sheet-group": {
        "overflow": "scroll",
        "maxHeight": 400
    },
    "platform-android action-sheet-backdropactive": {
        "backgroundColor": "rgba(0, 0, 0, 0.1)"
    },
    "platform-android action-sheet": {
        "alignContent": "center",
        "marginTop": "auto",
        "marginRight": "auto",
        "marginBottom": "20px!important",
        "marginLeft": "auto",
        "maxWidth": 96 * vw,
        "borderRadius": 5
    },
    "action-sheet action-sheet-title": {
        "textAlign": "left",
        "paddingLeft": 16
    },
    "action-sheet button": {
        "textAlign": "left",
        "paddingLeft": 16
    },
    "platform-android action-sheet action-sheet-title": {
        "textAlign": "left",
        "fontSize": 14,
        "color": "#666",
        "paddingTop": 16,
        "paddingRight": 16,
        "paddingBottom": 16,
        "paddingLeft": 16
    },
    "platform-android action-sheet button": {
        "textAlign": "left",
        "fontSize": 16,
        "color": "rgb(21,126,201)",
        "borderColor": "#e2e2e2",
        "paddingLeft": 16
    },
    "platform-android action-sheet buttondestructive": {
        "color": "red"
    },
    "platform-android action-sheet buttonactive": {
        "background": "rgb(241,242,243)"
    },
    "platform-android action-sheet buttonactivated": {
        "background": "rgb(241,242,243)"
    },
    "platform-android action-sheet-group": {
        "borderRadius": 0,
        "backgroundColor": "#fafafa"
    },
    "platform-android action-sheet-cancel": {
        "display": "block!important"
    },
    "platform-android action-sheet-has-icons button": {
        "paddingLeft": 56
    },
    "rzslider": {
        "position": "relative",
        "display": "inline-block",
        "width": "100%",
        "height": 4,
        "marginTop": 35,
        "marginRight": 0,
        "marginBottom": 15,
        "marginLeft": 0,
        "verticalAlign": "middle",
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "MsUserSelect": "none",
        "userSelect": "none"
    },
    "rzsliderwith-legend": {
        "marginBottom": 40
    },
    "rzslider[disabled]": {
        "cursor": "not-allowed"
    },
    "rzslider[disabled] rz-pointer": {
        "cursor": "not-allowed",
        "backgroundColor": "#d8e0f3"
    },
    "rzslider span": {
        "position": "absolute",
        "display": "inline-block",
        "whiteSpace": "nowrap"
    },
    "rzslider rz-base": {
        "width": "100%",
        "height": "100%",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "rzslider rz-bar-wrapper": {
        "left": 0,
        "zIndex": 1,
        "width": "100%",
        "height": 32,
        "paddingTop": 16,
        "marginTop": -16,
        "boxSizing": "border-box"
    },
    "rzslider rz-bar-wrapperrz-draggable": {
        "cursor": "move"
    },
    "rzslider rz-bar": {
        "left": 0,
        "zIndex": 1,
        "width": "100%",
        "height": 4,
        "background": "#d8e0f3",
        "WebkitBorderRadius": 2,
        "MozBorderRadius": 2,
        "borderRadius": 2
    },
    "rzslider rz-barrz-selection": {
        "zIndex": 2,
        "background": "#0db9f0",
        "WebkitBorderRadius": 2,
        "MozBorderRadius": 2,
        "borderRadius": 2
    },
    "rzslider rz-pointer": {
        "top": -14,
        "zIndex": 3,
        "width": 32,
        "height": 32,
        "cursor": "pointer",
        "backgroundColor": "#0db9f0",
        "WebkitBorderRadius": 16,
        "MozBorderRadius": 16,
        "borderRadius": 16
    },
    "rzslider rz-pointer:after": {
        "position": "absolute",
        "top": 12,
        "left": 12,
        "width": 8,
        "height": 8,
        "background": "#ffffff",
        "WebkitBorderRadius": 4,
        "MozBorderRadius": 4,
        "borderRadius": 4,
        "content": "''"
    },
    "rzslider rz-pointer:hover:after": {
        "backgroundColor": "#ffffff"
    },
    "rzslider rz-pointerrz-active": {
        "zIndex": 4
    },
    "rzslider rz-pointerrz-active:after": {
        "backgroundColor": "#451aff"
    },
    "rzslider rz-bubble": {
        "bottom": 16,
        "paddingTop": 1,
        "paddingRight": 3,
        "paddingBottom": 1,
        "paddingLeft": 3,
        "color": "#55637d",
        "cursor": "default"
    },
    "rzslider rz-bubblerz-selection": {
        "top": 16
    },
    "rzslider rz-bubblerz-limit": {
        "color": "#55637d"
    },
    "rzslider rz-ticks": {
        "position": "absolute",
        "top": -3,
        "left": 0,
        "zIndex": 1,
        "display": "flex",
        "width": "100%",
        "height": 0,
        "paddingTop": 0,
        "paddingRight": 11,
        "paddingBottom": 0,
        "paddingLeft": 11,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "listStyle": "none",
        "boxSizing": "border-box",
        "WebkitJustifyContent": "space-between",
        "MsFlexPack": "justify",
        "justifyContent": "space-between"
    },
    "rzslider rz-ticks rz-tick": {
        "width": 10,
        "height": 10,
        "textAlign": "center",
        "cursor": "pointer",
        "background": "#d8e0f3",
        "borderRadius": "50%"
    },
    "rzslider rz-ticks rz-tickrz-selected": {
        "background": "#0db9f0"
    },
    "rzslider rz-ticks rz-tick rz-tick-value": {
        "position": "absolute",
        "top": -30,
        "transform": "translate(-50%, 0)"
    },
    "rzslider rz-ticks rz-tick rz-tick-legend": {
        "position": "absolute",
        "top": 24,
        "maxWidth": 50,
        "whiteSpace": "normal",
        "transform": "translate(-50%, 0)"
    },
    "rzslider rz-ticksrz-ticks-values-under rz-tick-value": {
        "top": "initial",
        "bottom": -40
    },
    "rzsliderrz-vertical": {
        "position": "relative",
        "width": 4,
        "height": "100%",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": 20,
        "marginBottom": 0,
        "marginLeft": 20,
        "verticalAlign": "baseline"
    },
    "rzsliderrz-vertical rz-base": {
        "width": "100%",
        "height": "100%",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "rzsliderrz-vertical rz-bar-wrapper": {
        "top": "auto",
        "left": 0,
        "width": 32,
        "height": "100%",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 16,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": -16
    },
    "rzsliderrz-vertical rz-bar": {
        "bottom": 0,
        "left": "auto",
        "width": 4,
        "height": "100%"
    },
    "rzsliderrz-vertical rz-pointer": {
        "top": "auto",
        "bottom": 0,
        "left": "-14px !important"
    },
    "rzsliderrz-vertical rz-bubble": {
        "bottom": 0,
        "left": "16px !important",
        "marginLeft": 3
    },
    "rzsliderrz-vertical rz-bubblerz-selection": {
        "top": "auto",
        "left": "16px !important"
    },
    "rzsliderrz-vertical rz-ticks": {
        "top": 0,
        "left": -3,
        "zIndex": 1,
        "width": 0,
        "height": "100%",
        "paddingTop": 11,
        "paddingRight": 0,
        "paddingBottom": 11,
        "paddingLeft": 0,
        "WebkitFlexDirection": "column-reverse",
        "MsFlexDirection": "column-reverse",
        "flexDirection": "column-reverse"
    },
    "rzsliderrz-vertical rz-ticks rz-tick": {
        "verticalAlign": "middle"
    },
    "rzsliderrz-vertical rz-ticks rz-tick rz-tick-value": {
        "top": "initial",
        "left": 22,
        "transform": "translate(0, -28%)"
    },
    "rzsliderrz-vertical rz-ticks rz-tick rz-tick-legend": {
        "top": "initial",
        "right": 24,
        "maxWidth": "none",
        "whiteSpace": "nowrap",
        "transform": "translate(0, -28%)"
    },
    "rzsliderrz-vertical rz-ticksrz-ticks-values-under rz-tick-value": {
        "right": 12,
        "bottom": "initial",
        "left": "initial"
    },
    "vcenter": {
        "top": "30%",
        "overflow": "auto"
    },
    "button-stretch": {
        "width": "100%"
    },
    "col-offset-15": {
        "marginLeft": "15%"
    },
    "settings i": {
        "fontSize": "18px!important"
    },
    "settings row slabel": {},
    "floating-button": {
        "bottom": 20,
        "position": "fixed",
        "right": 20,
        "zIndex": 9999,
        "width": 60,
        "height": 60,
        "lineHeight": 60,
        "listStyleType": "none",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "textAlign": "center",
        "color": "#000",
        "cursor": "pointer",
        "boxShadow": "0 2px 10px 0 rgba(0, 0, 0, 0.2), 0 2px 5px 0 rgba(0, 0, 0, 0.2)",
        "transform": "translate3d(0, 0, 0)",
        "backfaceVisibility": "hidden",
        "border": "none",
        "borderRadius": "50%"
    },
    "floating-buttoncenter": {
        "marginLeft": "auto !important",
        "marginRight": "auto !important",
        "left": "0 !important",
        "right": "0 !important"
    },
    "floating-button>li": {
        "position": "absolute",
        "left": 0,
        "top": 0,
        "width": "100%",
        "height": "100%",
        "backfaceVisibility": "hidden",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "border": "none",
        "borderRadius": "50%",
        "WebkitBorderRadius": "50%"
    },
    "floating-button a": {
        "width": 40,
        "height": 40,
        "display": "inline-block",
        "borderRadius": "50%",
        "WebkitBorderRadius": "50%",
        "textDecoration": "none",
        "fontSize": 0.8
    },
    "floating-button iconmenu-icon": {
        "fontSize": 20
    },
    "floating-button li spanlabel": {
        "marginRight": 2,
        "color": "gray",
        "backgroundColor": "white",
        "paddingTop": 6,
        "paddingRight": 6,
        "paddingBottom": 6,
        "paddingLeft": 6,
        "borderRadius": 6,
        "WebkitBorderRadius": 6,
        "boxShadow": "0.5px 2px 2px 0.5px rgba(0, 0, 0, 0.2)"
    },
    "floating-button li spanlabel-container": {
        "marginRight": 2,
        "position": "absolute",
        "display": "inline-block",
        "top": 0,
        "overflow": "hidden",
        "right": 75,
        "width": 400,
        "textAlign": "right",
        "fontSize": 15
    },
    "floating-menu": {
        "position": "fixed",
        "right": 20,
        "zIndex": 9999,
        "width": 60,
        "height": 60,
        "lineHeight": 60,
        "listStyleType": "none",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "textAlign": "center",
        "cursor": "pointer",
        "boxShadow": "0 2px 10px 0 rgba(0, 0, 0, 0.2), 0 2px 5px 0 rgba(0, 0, 0, 0.2)",
        "transform": "translate3d(0, 0, 0)",
        "backfaceVisibility": "hidden",
        "border": "none",
        "borderRadius": "50%"
    },
    "floating-menu center": {
        "marginLeft": "auto",
        "marginRight": "auto",
        "left": 0,
        "right": 0
    },
    "floating-menu iconmenu-icon": {
        "fontSize": 20
    },
    "floating-menu imgmenu-icon": {
        "fontSize": 20
    },
    "floating-menu li i": {
        "fontSize": 20,
        "left": 0,
        "top": 0
    },
    "floating-menu limenu-button": {
        "zIndex": 9999,
        "left": 0,
        "top": 0,
        "width": "100%",
        "height": "100%"
    },
    "floating-menu li": {
        "position": "absolute",
        "left": 0.5,
        "top": 0.5,
        "width": "98%",
        "height": "98%",
        "transform": "translate3d(0, 0, 0)",
        "backfaceVisibility": "hidden",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "border": "none",
        "borderRadius": "50%",
        "WebkitBorderRadius": "50%"
    },
    "floating-menu li spanlabel": {
        "marginRight": 2,
        "color": "gray",
        "backgroundColor": "white",
        "paddingTop": 6,
        "paddingRight": 6,
        "paddingBottom": 6,
        "paddingLeft": 6,
        "borderRadius": 6,
        "WebkitBorderRadius": 6,
        "boxShadow": "0.5px 2px 2px 0.5px rgba(0, 0, 0, 0.2)"
    },
    "floating-menu li spanlabel-container": {
        "marginRight": 2,
        "position": "absolute",
        "display": "inline-block",
        "visibility": "hidden",
        "top": 0,
        "overflow": "hidden",
        "right": 75,
        "width": 400,
        "textAlign": "right",
        "fontSize": 15
    },
    "floating-menuactive spanlabel-container": {
        "visibility": "visible"
    },
    "floating-menuactive li": {
        "boxShadow": "0 2px 10px 0 rgba(0, 0, 0, 0.2), 0 2px 5px 0 rgba(0, 0, 0, 0.2)",
        "top": 0
    },
    "floating-menu ion-floating-item > li": {
        "transition": "all .3s",
        "WebkitTransition": "all .3s",
        "MozTransition": ".3s"
    },
    "floating-menuactive ion-floating-item:nth-child(1) > li": {
        "transform": "translateY(-70px)",
        "transitionDelay": "0ms",
        "WebkitTransitionDelay": "0ms"
    },
    "floating-menuactive ion-floating-item:nth-child(2) > li": {
        "transform": "translateY(-140px)",
        "transitionDelay": "50ms",
        "WebkitTransitionDelay": "50ms"
    },
    "floating-menuactive ion-floating-item:nth-child(3) > li": {
        "transform": "translateY(-210px)",
        "transitionDelay": "100ms",
        "WebkitTransitionDelay": "100ms"
    },
    "floating-menuactive ion-floating-item:nth-child(4) > li": {
        "transform": "translateY(-280px)",
        "transitionDelay": "150ms",
        "WebkitTransitionDelay": "150ms"
    },
    "floating-menuactive ion-floating-item:nth-child(5) > li": {
        "transform": "translateY(-350px)",
        "transitionDelay": "160ms",
        "WebkitTransitionDelay": "160ms"
    },
    "floating-menuactive ion-floating-item:nth-child(6) > li": {
        "transform": "translateY(-420px)",
        "transitionDelay": "170ms",
        "WebkitTransitionDelay": "170ms"
    },
    "floating-menuactive ion-floating-item:nth-child(7) > li": {
        "transform": "translateY(-490px)",
        "transitionDelay": "180ms",
        "WebkitTransitionDelay": "180ms"
    },
    "barbar-subheadermynav": {
        "paddingTop": "0!important",
        "paddingRight": "0!important",
        "paddingBottom": "0!important",
        "paddingLeft": "0!important",
        "marginTop": "0!important",
        "marginRight": "0!important",
        "marginBottom": "0!important",
        "marginLeft": "0!important",
        "border": "0!important"
    },
    "mynav nav": {
        "background": "#387ef5 none repeat scroll 0 0",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "overflow": "hidden",
        "width": "100%"
    },
    "mynav nav ul": {
        "marginTop": 0,
        "marginRight": -999,
        "marginBottom": 2,
        "marginLeft": 0,
        "whiteSpace": "nowrap"
    },
    "mynav nav ul li": {
        "float": "left"
    },
    "mynav nav ul li a": {
        "background": "#387ef5 none repeat scroll 0 0",
        "color": "#fff",
        "cursor": "pointer",
        "display": "block",
        "paddingTop": 1,
        "paddingRight": 1,
        "paddingBottom": 1,
        "paddingLeft": 1,
        "textDecoration": "none",
        "transitionDuration": "0.3s"
    },
    "nav ul li span": {
        "background": "#387ef5 none repeat scroll 0 0",
        "color": "#fff",
        "cursor": "pointer",
        "display": "block",
        "paddingTop": 1,
        "paddingRight": 1,
        "paddingBottom": 1,
        "paddingLeft": 1,
        "textDecoration": "none",
        "transitionDuration": "0.3s"
    },
    "mynav nav ul li a:hover": {
        "background": "#11c1f3 none repeat scroll 0 0"
    },
    "nav ul li span:hover": {
        "background": "#11c1f3 none repeat scroll 0 0"
    },
    "mynav arrow": {
        "borderColor": "#387ef5 rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)",
        "borderStyle": "solid",
        "borderWidth": "10px 10px 0",
        "display": "none",
        "height": 0,
        "left": 0,
        "marginLeft": "auto",
        "marginRight": "auto",
        "position": "absolute",
        "right": 0,
        "width": 0
    },
    "mynav active arrow": {
        "display": "block"
    },
    "tabbed-slidebox slider": {
        "height": "auto"
    },
    "tabbed-slideboxbtm slider": {
        "marginBottom": -50
    },
    "tabbed-slidebox slider-slides": {
        "width": "100%"
    },
    "tabbed-slidebox slider-slide": {
        "paddingTop": 0,
        "color": "#000",
        "backgroundColor": "#fff",
        "fontWeight": "300"
    },
    "tabbed-slidebox tsb-icons": {
        "textAlign": "center",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "position": "relative",
        "backgroundColor": "#387ef5"
    },
    "tabbed-slidebox tsb-ic-wrp": {
        "display": "flex",
        "position": "relative",
        "WebkitTransition": "-webkit-transform 0.3s",
        "WebkitTransform": "translate3d(0,0,0)"
    },
    "tabbed-slidebox tsb-icons a": {
        "display": "inline-block",
        "width": 54,
        "paddingBottom": 5,
        "fontSize": "1.3em!important",
        "color": "rgba(255, 255, 255, 0.7)",
        "WebkitTransform": "translate3d(0,8px,0)"
    },
    "tabbed-slidebox tsb-icons aactive": {
        "color": "rgba(255, 255, 255, 1)",
        "fontSize": "1.8em!important",
        "WebkitTransform": "translate3d(0,0,0)"
    },
    "tabbed-slidebox tabbed-slidebox": {
        "position": "relative",
        "height": "100%",
        "overflow": "hidden"
    },
    "tabbed-slidebox tsb-icons:after": {
        "width": 0,
        "height": 0,
        "borderStyle": "solid",
        "borderWidth": "0 1.4em 1.4em 1.4em",
        "borderColor": "transparent transparent #0398dc transparent",
        "position": "absolute",
        "content": "",
        "display": "none",
        "bottom": -12,
        "left": "50%",
        "marginLeft": -14
    },
    "tsb-hscrollscroll-view": {
        "whiteSpace": "nowrap",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "tsb-hscrollscroll-view scroll-bar": {
        "visibility": "hidden"
    },
    "tsb-hscrollscroll-view scrollonscroll": {
        "WebkitTransition": "-webkit-transform 0.3s",
        "MozTransition": "-moz-transform 0.3s"
    },
    "tabbed-slidebox tsb-icons scroll a": {
        "width": "auto",
        "fontSize": "1.2em!important",
        "lineHeight": "1.6em!important",
        "textDecoration": "none",
        "marginTop": 0,
        "marginRight": 15,
        "marginBottom": 0,
        "marginLeft": 15,
        "borderBottom": "3px solid transparent"
    },
    "tabbed-slidebox tsb-icons scroll aactive": {
        "fontSize": "1.5em!important",
        "borderBottom": "3px solid #ccc"
    },
    "slider-slide h4": {
        "color": "#fff",
        "marginTop": 10
    },
    "menuPopover": {
        "height": "170px!important"
    },
    "menuPopoverLog": {
        "height": "120px!important"
    },
    "detailedPost": {
        "width": "80%!important"
    },
    "text-class": {
        "backgroundColor": "#000!important",
        "color": "#fff!important"
    },
    "width100": {
        "width": "100%"
    },
    "image-list-thumb": {
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2,
        "height": 150
    },
    "image-modal": {
        "width": "100% !important",
        "height": "100%",
        "top": "0 !important",
        "left": "0 !important"
    },
    "gallery-transparent": {
        "background": "rgba(0,0,0,0.7)"
    },
    "galler-slider": {
        "width": "100%",
        "height": "100%"
    },
    "gallery-image": {
        "width": "100%",
        "height": 600,
        "backgroundSize": "contain",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center, center"
    },
    "platform-iossr-on pane": {
        "position": "static"
    },
    "platform-iossr-on scroll-content": {
        "position": "static"
    },
    "platform-iossr-on scroll-contenthas-header > scroll": {
        "marginTop": 80
    },
    "divpull-right": {
        "float": "right",
        "paddingLeft": 1,
        "maxWidth": "50%"
    },
    "divpull-left": {
        "float": "left",
        "paddingRight": 1,
        "maxWidth": "50%"
    },
    "divtext-justify": {
        "textAlign": "justify"
    },
    "divtext-rtl": {
        "direction": "rtl"
    },
    "ppull-right": {
        "float": "right",
        "paddingLeft": 1,
        "maxWidth": "50%"
    },
    "ppull-left": {
        "float": "left",
        "paddingRight": 1,
        "maxWidth": "50%"
    },
    "ptext-justify": {
        "textAlign": "justify"
    },
    "ptext-rtl": {
        "direction": "rtl"
    },
    "divtext-center": {
        "marginLeft": "auto",
        "marginRight": "auto",
        "textAlign": "center",
        "verticalAlign": "middle",
        "display": "block"
    },
    "ptext-center": {
        "marginLeft": "auto",
        "marginRight": "auto",
        "textAlign": "center",
        "verticalAlign": "middle",
        "display": "block"
    },
    "ptext-left": {
        "marginLeft": "auto",
        "marginRight": "auto",
        "textAlign": "left",
        "display": "block"
    },
    "divtext-left": {
        "textAlign": "left"
    },
    "full-image": {},
    "masonry-layout": {
        "columnCount": 1,
        "columnGap": 0,
        "WebkitColumnCount": 1,
        "MozColumnCount": 1,
        "WebkitColumnGap": 0,
        "MozColumnGap": 0
    },
    "masonry-layout__panel": {
        "marginBottom": 0,
        "WebkitBreakInside": "avoid",
        "MozBreakInside": "avoid",
        "breakInside": "avoid"
    },
    "masonry-layout__panel-content": {
        "paddingTop": 1,
        "paddingRight": 1,
        "paddingBottom": 1,
        "paddingLeft": 1,
        "borderRadius": 5
    },
    "bodytext table": {
        "borderCollapse": "collapse",
        "width": "100%    max-width: 100%",
        "verticalAlign": "middle!important",
        "border": "1px solid #ddd"
    },
    "bodytext tr": {
        "display": "flex",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "width": "100%"
    },
    "bodytext td": {
        "WebkitBoxFlex": 1,
        "WebkitFlex": 1,
        "MozBoxFlex": 1,
        "MozFlex": 1,
        "MsFlex": 1,
        "flex": 1,
        "display": "block",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "width": "100%"
    },
    "bodytext tr:hover": {
        "backgroundColor": "#f5f5f5"
    },
    "bodytext tr:nth-child(even)": {
        "backgroundColor": "#f2f2f2"
    },
    "bodytext th": {
        "textAlign": "center",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "fontStyle": "bold",
        "height": 50
    },
    "posting input": {
        "border": "1px solid #ddd!important"
    },
    "posting textarea": {
        "border": "1px solid #ddd!important"
    },
    "posting buttonbutton": {
        "border": "1px solid #ddd!important"
    },
    "posting select": {
        "minHeight": 30,
        "fontSize": 12,
        "lineHeight": 26
    },
    "posting row": {
        "marginTop": "0!important",
        "marginRight": "0!important",
        "marginBottom": "0!important",
        "marginLeft": "0!important",
        "paddingTop": 5,
        "paddingRight": "0!important",
        "paddingBottom": 5,
        "paddingLeft": "0!important"
    },
    "posting col": {
        "marginTop": "0!important",
        "marginRight": "0!important",
        "marginBottom": "0!important",
        "marginLeft": "0!important",
        "paddingTop": 5,
        "paddingRight": "0!important",
        "paddingBottom": 5,
        "paddingLeft": "0!important"
    },
    "item-thumbnail-left > img:first-child": {
        "maxWidth": 80,
        "maxHeight": 80,
        "width": "100%",
        "height": "auto!important"
    },
    "item-thumbnail-left item-image": {
        "maxWidth": 80,
        "maxHeight": 80,
        "width": "100%",
        "height": "auto!important"
    },
    "item-thumbnail-left item-content > img:first-child": {
        "maxWidth": 80,
        "maxHeight": 80,
        "width": "100%",
        "height": "auto!important"
    },
    "rowprofile": {
        "paddingTop": 3,
        "paddingRight": 0,
        "paddingBottom": 3,
        "paddingLeft": 0
    },
    "rowtwrap": {
        "fontSize": "11pt"
    },
    "tags": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "overflow": "hidden!important",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": "100%"
    },
    "tags span": {
        "float": "left"
    },
    "tag": {
        "background": "#eee",
        "borderRadius": "3px 0 0 3px",
        "color": "#999",
        "display": "inline-block",
        "height": 26,
        "lineHeight": 26,
        "paddingTop": 0,
        "paddingRight": 20,
        "paddingBottom": 0,
        "paddingLeft": 23,
        "position": "relative",
        "marginTop": 0,
        "marginRight": 10,
        "marginBottom": 10,
        "marginLeft": 0,
        "textDecoration": "none",
        "WebkitTransition": "color 0.2s"
    },
    "tag::before": {
        "background": "#fff",
        "borderRadius": 10,
        "boxShadow": "inset 0 1px rgba(0, 0, 0, 0.25)",
        "content": "''",
        "height": 6,
        "left": 10,
        "position": "absolute",
        "width": 6,
        "top": 10
    },
    "tag::after": {
        "background": "#fff",
        "borderBottom": "13px solid transparent",
        "borderLeft": "10px solid #eee",
        "borderTop": "13px solid transparent",
        "content": "''",
        "position": "absolute",
        "right": 0,
        "top": 0
    },
    "tag:hover": {
        "backgroundColor": "crimson",
        "color": "white"
    },
    "tag:hover::after": {
        "borderLeftColor": "crimson"
    },
    "em": {
        "fontStyle": "italic"
    },
    "selectable": {
        "WebkitUserSelect": "auto",
        "KhtmlUserSelect": "auto",
        "MozUserSelect": "auto",
        "MsUserSelect": "auto",
        "OUserSelect": "auto",
        "userSelect": "auto"
    },
    "login button": {
        "border": "1px solid #eee!important"
    },
    "storybarbar-footer": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "height": "auto"
    },
    "rowpostdetails": {
        "fontSize": "10pt"
    },
    "drawer": {
        "height": 20 * vh,
        "textAlign": "center",
        "bottom": 0,
        "position": "absolute"
    },
    "drawer img": {}
});