/**
* Author: austynmahoney (https://github.com/austynmahoney)
*/
var selectedExportOptions = {};

var mipmap;

var androidExportOptions = [
    {
        name: "mdpi",
        scaleFactor: 1,
        type: "android"
    },
    {
        name: "hdpi",
        scaleFactor: 1.5,
        type: "android"
    },
    {
        name: "xhdpi",
        scaleFactor: 2,
        type: "android"
    },
    {
        name: "xxhdpi",
        scaleFactor: 3,
        type: "android"
    },
    {
        name: "xxxhdpi",
        scaleFactor: 4,
        type: "android"
    }
];

var iosExportOptions = [
    {
        name: "",
        scaleFactor: 1,
        type: "ios"
    },
    {
        name: "@2x",
        scaleFactor: 2,
        type: "ios"
    },
    {
        name: "@3x",
        scaleFactor: 3,
        type: "ios"
    }
];

var folder = Folder.selectDialog("Select export directory");
var document = app.activeDocument;

if (document && folder) {
    var dialog = new Window("dialog","Select export sizes");

    var widthGroup = dialog.add("group");
    widthGroup.add("statictext", undefined, "width:");
    var widthText = widthGroup.add ("edittext", undefined, "48");
    widthText.characters = 5;
    widthGroup.add("statictext", undefined, "dp");

    var heightGroup = dialog.add("group");
    heightGroup.add("statictext", undefined, "height:");
    var heightText = heightGroup.add("edittext", undefined, "48");
    heightText.characters = 5;
    heightGroup.add("statictext", undefined, "dp");


    var osGroup = dialog.add("group");

    var androidCheckboxes = createSelectionPanel("Android", androidExportOptions, osGroup);
    var iosCheckboxes = createSelectionPanel("iOS", iosExportOptions, osGroup);

    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "Export");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        var width = parseInt(widthText.text);
        if (isNaN(width) || width <= 0) {
            alert(widthText.text + " is not a valid width");
            return;
        }

        var height = parseInt(heightText.text);
        if (isNaN(height) || height <= 0) {
            alert(heightText.text + " is not a valid height");
            return;
        }

        for (var key in selectedExportOptions) {
            if (selectedExportOptions.hasOwnProperty(key)) {
                var item = selectedExportOptions[key];
                exportToFile(width, height, item.scaleFactor, item.name, item.type);
            }
        }
        this.parent.parent.close();
    };
    
    cancelButton.onClick = function () {
        this.parent.parent.close();
    };

    dialog.show();
}

function exportToFile(width, height, scaleFactor, resIdentifier, os) {
    var i, ab, file, options, expFolder;
    if (os === "android")
        expFolder = new Folder(folder.fsName + (mipmap ? "/mipmap-" : "/drawable-") + resIdentifier);
    else if (os === "ios")
        expFolder = new Folder(folder.fsName + "/iOS");

    if (!expFolder.exists) {
        expFolder.create();
    }

    for (i = document.artboards.length - 1; i >= 0; i--) {
        document.artboards.setActiveArtboardIndex(i);
        ab = document.artboards[i];

        if (os === "android")
            file = new File(expFolder.fsName + "/" + ab.name + ".png");
        else if (os === "ios")
            file = new File(expFolder.fsName + "/" + ab.name + resIdentifier + ".png");
            
            options = new ExportOptionsPNG24();
            options.transparency = true;
            options.artBoardClipping = true;
            options.antiAliasing = true;
            options.verticalScale = height * scaleFactor * 100 / Math.abs(ab.artboardRect[1] - ab.artboardRect[3]);
            options.horizontalScale = width * scaleFactor * 100 / Math.abs(ab.artboardRect[0] - ab.artboardRect[2]);

            document.exportFile(file, ExportType.PNG24, options);
    }
}

function createSelectionPanel(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    panel.alignChildren = "left";
    for (var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
        cb.onClick = function() {
            if (this.value) {
                selectedExportOptions[this.item.name] = this.item;
                //alert("added " + this.item.name);
            } else {
                delete selectedExportOptions[this.item.name];
                //alert("deleted " + this.item.name);
            }
        };
    }

    if (name === "Android") {
        var mmcb = panel.add("checkbox", undefined, "\u00A0mipmap");
        mmcb.onClick = function() {
            mipmap = this.value;
        };
    }

    var button = panel.add("button", undefined, "All");
    button.onClick = function() {
        var children = this.parent.children;
        var child;
        for (var i = 0; i < children.length; i++) {
            child = children[i];
            if (child instanceof Checkbox) {
                child.value = true;
                mipmap = true;
                selectedExportOptions[child.item.name] = child.item;
            }
        }
    }
}
