/**
 * Tool to apply 3D stylization on a mesh
 */

import * as THREE from 'three';
import * as FILE from 'file-saver';

// Class Symbolizer

function Symbolizer(view, obj, edges, menu) {
    // Constructor
    this.obj = obj;
    this.edges = edges;
    this.view = view;
    this.menu = menu;
    this.menu.view = this.view;
    this.applyStyle();
}

Symbolizer.prototype.applyStyle = function applyStyle(style = null) {
    var i;
    if (style && style.styles) {
        // Apply given style to each child
        for (i = 0; i < this.obj.children.length; i++) {
            var name = this.obj.children[i].name;
            var j = 0;
            while (j < style.styles.length && style.styles[j].name != name) {
                j++;
            }
            this._changeOpacity(style.styles[j].opacity, i);
            this._changeColor(style.styles[j].color, i);
            this._changeEmissive(style.styles[j].emissive, i);
            this._changeSpecular(style.styles[j].specular, i);
            this._changeShininess(style.styles[j].shininess, i);
            this._changeColorEdge(style.styles[j].colorEdges, i);
            this._changeOpacityEdge(style.styles[j].opacityEdges, i);
        }
    }
    else if (style && style.style) {
        // Apply given style to all children
        for (i = 0; i < this.obj.children.length; i++) {
            this._changeOpacity(style.style.opacity, i);
            this._changeColor(style.style.color, i);
            this._changeEmissive(style.style.emissive, i);
            this._changeSpecular(style.style.specular, i);
            this._changeShininess(style.style.shininess, i);
            this._changeColorEdge(style.styles.colorEdges, i);
            this._changeOpacityEdge(style.style.opacityEdges, i);
        }
    }
    else {
        // Apply default style
        for (i = 0; i < this.obj.children.length; i++) {
            var color = getRandomColor();
            this._changeOpacity(1, i);
            this._changeColor(color, i);
            this._changeEmissive(color, i);
            this._changeSpecular(color, i);
            this._changeShininess(30, i);
            this._changeColorEdge('#000000', i);
            this._changeOpacityEdge(1, i);
        }
    }
};

// Callback functions (concrete stylization)

Symbolizer.prototype._changeOpacity = function changeOpacity(value, index) {
    this.obj.children[index].material.opacity = value;
    this.obj.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeOpacityEdge = function changeOpacityEdge(value, index) {
    this.edges.children[index].material.opacity = value;
    this.edges.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeColor = function changeColor(value, index) {
    this.obj.children[index].material.color = new THREE.Color(value);
    this.obj.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeColorEdge = function changeColorEdge(value, index) {
    this.edges.children[index].material.color = new THREE.Color(value);
    this.edges.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeEmissive = function changeEmissive(value, index) {
    this.obj.children[index].material.emissive = new THREE.Color(value);
    this.obj.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeSpecular = function changeSpecular(value, index) {
    this.obj.children[index].material.specular = new THREE.Color(value);
    this.obj.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeShininess = function changeShininess(value, index) {
    this.obj.children[index].material.shininess = value;
    this.obj.children[index].material.needsUpdate = true;
    this.view.notifyChange(true);
};

Symbolizer.prototype._changeTexture = function changeTexture(data, index) {
    var texture = new THREE.TextureLoader().load(data);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.obj.children[index].material = new THREE.MeshPhongMaterial({ map: texture });
    this.view.notifyChange(true);
};
// More parameters...

Symbolizer.prototype._saveVibes = function saveVibes() {
    var vibes = { styles: [] };
    for (var i = 0; i < this.obj.children.length; i++) {
        vibes.styles.push({
            name: this.obj.children[i].name,
            opacity: this.obj.children[i].material.opacity,
            color: this.obj.children[i].material.color.getHex(),
            emissive: this.obj.children[i].material.emissive.getHex(),
            specular: this.obj.children[i].material.specular.getHex(),
            shininess: this.obj.children[i].material.shininess,
            colorEdges: this.edges.children[i].material.color,
            opacityEdges: this.edges.children[i].material.opacity,
        });
    }
    var blob = new Blob([JSON.stringify(vibes)], { type: 'text/plain;charset=utf-8' });
    FILE.saveAs(blob, this.obj.materialLibraries[0].substring(0, this.obj.materialLibraries[0].length - 4).concat('.vibes'));
};

Symbolizer.prototype._readVibes = function readVibes(file) {
    var reader = new FileReader();
    reader.addEventListener('load', () => this.applyStyle(JSON.parse(reader.result)), false);
    reader.readAsText(file);
};

Symbolizer.prototype._readTexture = function readTexture(file, index) {
    var reader = new FileReader();
    reader.addEventListener('load', () => this._changeTexture(reader.result, index), false);
    reader.readAsDataURL(file);
};

// Menu management

Symbolizer.prototype._addOpacity = function addOpacity(folder, index) {
    var initialOpacity = this.obj.children[index].material.opacity;
    folder.add({ opacity: initialOpacity }, 'opacity', 0, 1).name('opacity').onChange(value => this._changeOpacity(value, index));
};

Symbolizer.prototype._addColor = function addColor(folder, index) {
    var initialColor = '#'.concat(this.obj.children[index].material.color.getHexString());
    folder.addColor({ color: initialColor }, 'color').name('color').onChange(value => this._changeColor(value, index));
};

Symbolizer.prototype._addEmissive = function addEmissive(folder, index) {
    var initialEmissive = '#'.concat(this.obj.children[index].material.emissive.getHexString());
    folder.addColor({ emissive: initialEmissive }, 'emissive').name('emissive').onChange(value => this._changeEmissive(value, index));
};


Symbolizer.prototype._addSpecular = function addSpecular(folder, index) {
    var initialSpecular = '#'.concat(this.obj.children[index].material.specular.getHexString());
    folder.addColor({ specular: initialSpecular }, 'specular').name('specular').onChange(value => this._changeSpecular(value, index));
};

Symbolizer.prototype._addShininess = function addShininess(folder, index) {
    var initialShininess = this.obj.children[index].material.shininess;
    folder.add({ shininess: initialShininess }, 'shininess', 0, 100).name('shininess').onChange(value => this._changeShininess(value, index));
};

Symbolizer.prototype._addTexture = function addTexture(folder, index) {
    folder.add({ loadTexture: () => {
        var button = document.createElement('input');
        button.setAttribute('type', 'file');
        button.addEventListener('change', () => this._readTexture(button.files[0], index), false);
        button.click();
    } }, 'loadTexture');
};

// More parameters...

Symbolizer.prototype._addSave = function addSave(folder) {
    folder.add({ save: () => this._saveVibes() }, 'save');
};

Symbolizer.prototype._addLoad = function addLoad(folder) {
    folder.add({ load: () => {
        var button = document.createElement('input');
        button.setAttribute('type', 'file');
        button.addEventListener('change', () => this._readVibes(button.files[0]), false);
        button.click();
    } }, 'load');
};

Symbolizer.prototype.initGui = function addToGUI() {
    var parentFolder = this.menu.gui.addFolder(this.obj.materialLibraries[0].substring(0, this.obj.materialLibraries[0].length - 4));
    this._addSave(parentFolder);
    this._addLoad(parentFolder);
    this._addColorEdgeAll(parentFolder);
    this._addOpacityEdgeAll(parentFolder);
    for (var i = 0; i < this.obj.children.length; i++) {
        var folder = parentFolder.addFolder(this.obj.children[i].name);
        this._addOpacity(folder, i);
        this._addColor(folder, i);
        this._addEmissive(folder, i);
        this._addSpecular(folder, i);
        this._addShininess(folder, i);
        this._addTexture(folder, i);
    }
};

Symbolizer.prototype._addOpacityAll = function addOpacityAll(folder) {
    var initialOpacity = this.obj.children[0].material.opacity;
    folder.add({ opacity: initialOpacity }, 'opacity', 0, 1).name('opacity').onChange((value) => {
        for (var index = 0; index < this.obj.children.length; index++) {
            this._changeOpacity(value, index);
        }
    });
};

Symbolizer.prototype._addOpacityEdgeAll = function addOpacityEdgeAll(folder) {
    var initialOpacity = this.edges.children[0].material.opacity;
    folder.add({ opacity: initialOpacity }, 'opacity', 0, 1).name('Edges opacity').onChange((value) => {
        for (var index = 0; index < this.edges.children.length; index++) {
            this._changeOpacityEdge(value, index);
        }
    });
};

Symbolizer.prototype._addColorAll = function addColorAll(folder) {
    var initialColor = '#'.concat(this.obj.children[0].material.color.getHexString());
    folder.addColor({ color: initialColor }, 'color').name('color').onChange((value) => {
        for (var index = 0; index < this.obj.children.length; index++) {
            this._changeColor(value, index);
        }
    });
};

Symbolizer.prototype._addColorEdgeAll = function addColorEdgeAll(folder) {
    var initialColor = '#'.concat(this.edges.children[0].material.color.getHexString());
    folder.addColor({ color: initialColor }, 'color').name('Edges color').onChange((value) => {
        for (var index = 0; index < this.edges.children.length; index++) {
            this._changeColorEdge(value, index);
        }
    });
};

Symbolizer.prototype._addEmissiveAll = function addEmissiveAll(folder) {
    var initialEmissive = '#'.concat(this.obj.children[0].material.emissive.getHexString());
    folder.addColor({ emissive: initialEmissive }, 'emissive').name('emissive').onChange((value) => {
        for (var index = 0; index < this.obj.children.length; index++) {
            this._changeEmissive(value, index);
        }
    });
};


Symbolizer.prototype._addSpecularAll = function addSpecularAll(folder) {
    var initialSpecular = '#'.concat(this.obj.children[0].material.specular.getHexString());
    folder.addColor({ specular: initialSpecular }, 'specular').name('specular').onChange((value) => {
        for (var index = 0; index < this.obj.children.length; index++) {
            this._changeSpecular(value, index);
        }
    });
};

Symbolizer.prototype._addShininessAll = function addShininessAll(folder) {
    var initialShininess = this.obj.children[0].material.shininess;
    folder.add({ shininess: initialShininess }, 'shininess', 0, 100).name('shininess').onChange((value) => {
        for (var index = 0; index < this.obj.children.length; index++) {
            this._changeShininess(value, index);
        }
    });
};

Symbolizer.prototype._readTextureAll = function readTextureAll(file, index) {
    var reader = new FileReader();
    reader.addEventListener('load', () => {
        for (var i = 0; i < this.obj.children.length; i++) {
            this._changeTexture(reader.result, i);
        }
    }, false);
    reader.readAsDataURL(file);
};

Symbolizer.prototype._addTextureAll = function addTextureAll(folder) {
    folder.add({ loadTexture: () => {
        var button = document.createElement('input');
        button.setAttribute('type', 'file');
        button.addEventListener('change', () => this._readTextureAll(button.files[0]), false);
        button.click();
    } }, 'loadTexture');
};

Symbolizer.prototype.initGuiAll = function addToGUI() {
    var folder = this.menu.gui.addFolder(this.obj.materialLibraries[0].substring(0, this.obj.materialLibraries[0].length - 4));
    this._addSave(folder);
    this._addLoad(folder);
    this._addTextureAll(folder);
    this._addOpacityAll(folder);
    this._addColorAll(folder);
    this._addEmissiveAll(folder);
    this._addSpecularAll(folder);
    this._addShininessAll(folder);
    this._addColorEdgeAll(folder);
    this._addOpacityEdgeAll(folder);
};


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export default Symbolizer;